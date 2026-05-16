import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getProposalModel } from '@/lib/gemini';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const BodySchema = z.object({
  jobDescription: z.string().min(20).max(20000),
  skills: z.string().max(2000).optional().default(''),
  rate: z.string().max(200).optional().default(''),
  tone: z.string().max(200).optional().default(''),
});

function buildPrompt(input: z.infer<typeof BodySchema>): string {
  const { jobDescription, skills, rate, tone } = input;
  const context: string[] = [];
  if (skills.trim()) context.push(`Freelancer skills/experience:\n${skills.trim()}`);
  if (rate.trim()) context.push(`Target rate: ${rate.trim()}`);
  if (tone.trim()) context.push(`Desired tone: ${tone.trim()}`);
  const ctx = context.length ? `\n\n${context.join('\n\n')}\n` : '\n';

  return `You are an expert freelance proposal writer. Draft a tailored proposal for the job post below. Keep it under 220 words, direct, specific, and in the freelancer's voice. Avoid generic praise, avoid templates, avoid bullet-point lists unless they add real signal. Open with one concrete sentence that proves you read the job.${ctx}
Job post:
"""
${jobDescription.trim()}
"""

Return ONLY the proposal text, no preamble, no headings, no markdown fences.`;
}

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

  let model;
  try {
    model = getProposalModel();
  } catch (err) {
    return NextResponse.json(
      { error: 'Server is missing GEMINI_API_KEY' },
      { status: 503 },
    );
  }

  const prompt = buildPrompt(parsed.data);
  const jobDescription = parsed.data.jobDescription;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();
      let assembled = '';
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
            assembled += text;
            controller.enqueue(encoder.encode(text));
          }
        }

        if (assembled.trim()) {
          await prisma.proposal.create({
            data: {
              userId,
              jobDescription,
              generatedText: assembled.trim(),
            },
          });
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
