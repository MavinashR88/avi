import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// TODO(AVI-30): replace stub userId with enforced real session once auth lands
function getUserId(session: unknown): string | null {
  const s = session as { user?: { id?: string } } | null;
  return s?.user?.id ?? null;
}

const CreateSchema = z.object({
  jobDescription: z.string().min(1),
  generatedText: z.string().min(1),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = getUserId(session);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const proposal = await prisma.proposal.create({
    data: {
      userId,
      jobDescription: parsed.data.jobDescription,
      generatedText: parsed.data.generatedText,
    },
    select: {
      id: true,
      userId: true,
      jobDescription: true,
      generatedText: true,
      createdAt: true,
    },
  });

  return NextResponse.json(proposal, { status: 201 });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = getUserId(session);

  // TODO(AVI-30): enforce userId filter once auth is real; unauthenticated returns empty
  const proposals = await prisma.proposal.findMany({
    where: userId ? { userId } : { userId: null },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      userId: true,
      jobDescription: true,
      generatedText: true,
      createdAt: true,
    },
  });

  return NextResponse.json(proposals);
}
