import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getProposalModel } from '@/lib/gemini';
import { STRIPE_PLAN } from '@/lib/stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const BodySchema = z.object({
  jobDescription: z.string().min(20).max(20000),
  skills: z.string().max(2000).optional().default(''),
  rate: z.string().max(200).optional().default(''),
  tone: z.string().max(200).optional().default(''),
});

interface ProfileContext {
  name: string;
  tagline: string;
  skills: string;
  hourlyRate: string;
  tone: string;
  bio: string;
}

function buildPrompt(
  input: z.infer<typeof BodySchema>,
  profile: ProfileContext | null,
): string {
  const { jobDescription, skills, rate, tone } = input;

  // Per-request form values override saved profile fields so a user can
  // pitch a job with a different rate/tone without editing their profile.
  const effectiveSkills = skills.trim() || profile?.skills?.trim() || '';
  const effectiveRate = rate.trim() || profile?.hourlyRate?.trim() || '';
  const effectiveTone = tone.trim() || profile?.tone?.trim() || '';

  const context: string[] = [];
  if (profile?.name?.trim() || profile?.tagline?.trim()) {
    const parts = [profile?.name?.trim(), profile?.tagline?.trim()].filter(Boolean);
    context.push(`Freelancer: ${parts.join(' — ')}`);
  }
  if (profile?.bio?.trim()) {
    context.push(`Freelancer bio:\n${profile.bio.trim()}`);
  }
  if (effectiveSkills) context.push(`Freelancer skills/experience:\n${effectiveSkills}`);
  if (effectiveRate) context.push(`Target rate: ${effectiveRate}`);
  if (effectiveTone) context.push(`Desired tone: ${effectiveTone}`);
  const ctx = context.length ? `\n\n${context.join('\n\n')}\n` : '\n';

  return `You are an expert freelance proposal writer. Draft a tailored proposal for the job post below. Keep it under 220 words, direct, specific, and in the freelancer's voice. Avoid generic praise, avoid templates, avoid bullet-point lists unless they add real signal. Open with one concrete sentence that proves you read the job. When freelancer context is provided, weave their skills, rate, and tone naturally into the pitch — do not just list them.${ctx}
Job post:
"""
${jobDescription.trim()}
"""

Return ONLY the proposal text, no preamble, no headings, no markdown fences.`;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id ?? null;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      subscriptionStatus: true,
      proposalsThisMonth: true,
      proposalsResetAt: true,
    },
  });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  if (user.subscriptionStatus !== 'active') {
    return NextResponse.json(
      { error: 'Subscribe to generate proposals' },
      { status: 402 },
    );
  }

  const now = new Date();
  const resetDue = now.getTime() - user.proposalsResetAt.getTime() >= 30 * MS_PER_DAY;
  let used = user.proposalsThisMonth;
  if (resetDue) {
    used = 0;
  }
  if (used >= STRIPE_PLAN.monthlyProposalCap) {
    return NextResponse.json(
      {
        error: `Monthly limit reached (${used}/${STRIPE_PLAN.monthlyProposalCap})`,
      },
      { status: 429 },
    );
  }

  await prisma.user.update({
    where: { id: userId },
    data: resetDue
      ? { proposalsThisMonth: 1, proposalsResetAt: now }
      : { proposalsThisMonth: { increment: 1 } },
  });

  let model;
  try {
    model = getProposalModel();
  } catch (err) {
    return NextResponse.json(
      { error: 'Server is missing GEMINI_API_KEY' },
      { status: 503 },
    );
  }

  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: {
      name: true,
      tagline: true,
      skills: true,
      hourlyRate: true,
      tone: true,
      bio: true,
    },
  });

  const prompt = buildPrompt(parsed.data, profile);

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        const result = await model.generateContentStream({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: 800,
            // gemini-2.5-flash has built-in thinking; disable it so the
            // entire token budget is spent on the visible proposal text.
            thinkingConfig: { thinkingBudget: 0 },
          } as unknown as Record<string, unknown>,
        });

        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (text) {
            controller.enqueue(encoder.encode(text));
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Generation failed';
        controller.enqueue(encoder.encode(`\n\n[Error: ${msg}]`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
    },
  });
}
