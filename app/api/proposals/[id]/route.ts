import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function getUserId(session: unknown): string | null {
  const s = session as { user?: { id?: string } } | null;
  return s?.user?.id ?? null;
}

async function findOwnedProposal(id: string, userId: string) {
  return prisma.proposal.findFirst({
    where: { id, userId },
    select: {
      id: true,
      userId: true,
      jobDescription: true,
      generatedText: true,
      createdAt: true,
    },
  });
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  const userId = getUserId(session);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const proposal = await findOwnedProposal(params.id, userId);
  if (!proposal) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(proposal);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  const userId = getUserId(session);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const existing = await findOwnedProposal(params.id, userId);
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await prisma.proposal.delete({ where: { id: params.id } });

  return NextResponse.json({ deleted: true });
}
