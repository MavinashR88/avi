import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AppNav } from '@/components/app-nav';

export const dynamic = 'force-dynamic';

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(d);
}

function formatTime(d: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(d);
}

function truncate(s: string, n: number): string {
  const trimmed = s.replace(/\s+/g, ' ').trim();
  return trimmed.length > n ? `${trimmed.slice(0, n)}…` : trimmed;
}

export default async function ProposalsPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!session?.user || !userId) {
    redirect('/auth/login?callbackUrl=%2Fproposals');
  }

  const proposals = await prisma.proposal.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      jobDescription: true,
      generatedText: true,
      createdAt: true,
    },
  });

  return (
    <div className="flex min-h-screen flex-col">
      <AppNav email={session.user.email} activePath="/proposals" />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-brand">
              Proposal history
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Your proposals
            </h1>
            <p className="mt-1 text-sm text-ink-muted">
              {proposals.length > 0
                ? `${proposals.length} proposal${proposals.length !== 1 ? 's' : ''} saved`
                : 'No proposals yet'}
            </p>
          </div>
          <Link
            href="/generate"
            className="shrink-0 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-brand/30"
          >
            + New proposal
          </Link>
        </div>

        <div className="mt-8">
          {proposals.length === 0 ? (
            <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-2xl">
                📄
              </div>
              <p className="font-medium text-ink">No proposals yet</p>
              <p className="mt-1 text-sm text-ink-muted">
                Generate your first Upwork proposal in seconds.
              </p>
              <Link
                href="/generate"
                className="mt-5 inline-flex items-center rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90"
              >
                Draft your first one →
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {proposals.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/proposals/${p.id}`}
                    className="group block rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand/40 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="line-clamp-1 text-sm font-semibold text-ink group-hover:text-brand">
                        {truncate(p.jobDescription, 90)}
                      </p>
                      <div className="shrink-0 text-right">
                        <p className="text-xs font-medium text-ink-muted">{formatDate(p.createdAt)}</p>
                        <p className="text-xs text-ink-muted/60">{formatTime(p.createdAt)}</p>
                      </div>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-muted">
                      {truncate(p.generatedText, 180)}
                    </p>
                    <p className="mt-3 text-xs font-medium text-brand opacity-0 transition group-hover:opacity-100">
                      View proposal →
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
