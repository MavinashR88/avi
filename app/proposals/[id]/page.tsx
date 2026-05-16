import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AppNav } from '@/components/app-nav';
import { CopyButton, ProposalActions } from '@/components/proposal-actions';

export const dynamic = 'force-dynamic';

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(d);
}

export default async function ProposalDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!session?.user || !userId) {
    redirect(`/auth/login?callbackUrl=%2Fproposals%2F${params.id}`);
  }

  const proposal = await prisma.proposal.findFirst({
    where: { id: params.id, userId },
    select: {
      id: true,
      jobDescription: true,
      generatedText: true,
      createdAt: true,
    },
  });

  if (!proposal) {
    notFound();
  }

  const reuseHref = `/generate?reuse=${proposal.id}`;

  return (
    <div className="flex min-h-screen flex-col">
      <AppNav email={session.user.email} activePath="/proposals" />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        {/* Back + meta row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/proposals"
            className="inline-flex items-center gap-1 text-sm text-ink-muted transition hover:text-ink"
          >
            ← All proposals
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={reuseHref}
              className="rounded-md border border-brand/40 bg-brand/5 px-3 py-1.5 text-xs font-semibold text-brand transition hover:bg-brand/10 focus:outline-none focus:ring-2 focus:ring-brand/30"
            >
              Reuse job description
            </Link>
            <ProposalActions id={proposal.id} />
          </div>
        </div>

        {/* Title */}
        <div className="mt-6">
          <p className="text-xs font-medium uppercase tracking-wider text-brand">Proposal</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            Saved {formatDate(proposal.createdAt)}
          </h1>
        </div>

        {/* Content cards */}
        <div className="mt-8 space-y-5">
          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
              <h2 className="text-sm font-semibold">Job description</h2>
              <CopyButton text={proposal.jobDescription} label="Copy" />
            </div>
            <pre className="px-5 py-4 whitespace-pre-wrap font-sans text-sm leading-relaxed text-ink-muted">
              {proposal.jobDescription}
            </pre>
          </section>

          <section className="rounded-xl border border-brand/20 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-brand/10 bg-brand/5 px-5 py-3">
              <h2 className="text-sm font-semibold text-brand">Generated proposal</h2>
              <CopyButton text={proposal.generatedText} label="Copy proposal" />
            </div>
            <pre className="px-5 py-5 whitespace-pre-wrap font-sans text-sm leading-relaxed text-ink">
              {proposal.generatedText}
            </pre>
          </section>
        </div>
      </main>
    </div>
  );
}
