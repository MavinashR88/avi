import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { SignOutButton } from '@/components/sign-out-button';
import { CopyButton, ProposalActions } from '@/components/proposal-actions';

export const dynamic = 'force-dynamic';

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
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
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col px-6 py-10">
      <header className="flex items-center justify-between">
        <Link href="/app" className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-sm font-semibold text-white">
            A
          </span>
          <span className="text-lg font-semibold tracking-tight">Avista</span>
        </Link>
        <div className="flex items-center gap-3 text-sm text-ink-muted">
          <span>{session.user.email}</span>
          <SignOutButton />
        </div>
      </header>

      <nav className="mt-8 text-sm text-ink-muted">
        <Link href="/proposals" className="hover:text-ink">
          ← All proposals
        </Link>
      </nav>

      <section className="mt-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-brand">
              Proposal
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              Saved {formatDate(proposal.createdAt)}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={reuseHref}
              className="rounded-md bg-brand px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:opacity-90"
            >
              Reuse job description
            </Link>
            <ProposalActions id={proposal.id} />
          </div>
        </div>

        <article className="mt-8 space-y-6">
          <div className="rounded-md border border-slate-200 bg-surface p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Job description</h2>
              <CopyButton text={proposal.jobDescription} />
            </div>
            <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-relaxed text-ink-muted">
              {proposal.jobDescription}
            </pre>
          </div>

          <div className="rounded-md border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Generated proposal</h2>
              <CopyButton text={proposal.generatedText} />
            </div>
            <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-relaxed text-ink">
              {proposal.generatedText}
            </pre>
          </div>
        </article>
      </section>
    </main>
  );
}
