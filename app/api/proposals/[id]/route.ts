import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// TODO(AVI-30): enforce ownership check once real auth session is available
async function findProposal(id: string) {
  return prisma.proposal.findUnique({
    where: { id },
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
  await getServerSession(authOptions); // auth wire-up point for AVI-30

  const proposal = await findProposal(params.id);
  if (!proposal) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(proposal);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  await getServerSession(authOptions); // auth wire-up point for AVI-30

  const existing = await findProposal(params.id);
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await prisma.proposal.delete({ where: { id: params.id } });

  return NextResponse.json({ deleted: true });
}
