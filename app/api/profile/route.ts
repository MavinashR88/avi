import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TONE_VALUES = ['professional', 'friendly', 'assertive'] as const;

const ProfileSchema = z.object({
  name: z.string().max(120).default(''),
  tagline: z.string().max(200).default(''),
  skills: z.string().max(2000).default(''),
  hourlyRate: z.string().max(60).default(''),
  tone: z.enum(TONE_VALUES).default('professional'),
  bio: z.string().max(2000).default(''),
});

function emptyProfile() {
  return {
    name: '',
    tagline: '',
    skills: '',
    hourlyRate: '',
    tone: 'professional' as const,
    bio: '',
  };
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id ?? null;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const profile = await prisma.profile.findUnique({ where: { userId } });
  if (!profile) return NextResponse.json({ profile: emptyProfile() });

  return NextResponse.json({
    profile: {
      name: profile.name,
      tagline: profile.tagline,
      skills: profile.skills,
      hourlyRate: profile.hourlyRate,
      tone: profile.tone,
      bio: profile.bio,
    },
  });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id ?? null;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = ProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const data = parsed.data;
  const saved = await prisma.profile.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  });

  return NextResponse.json({
    profile: {
      name: saved.name,
      tagline: saved.tagline,
      skills: saved.skills,
      hourlyRate: saved.hourlyRate,
      tone: saved.tone,
      bio: saved.bio,
    },
  });
}
