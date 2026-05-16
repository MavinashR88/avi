import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { SignOutButton } from '@/components/sign-out-button';

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

      <section className="mt-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-brand">
              Proposal history
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Your past proposals
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-muted">
              Newest first. Click any proposal to open it, reuse the job description,
              or delete it.
            </p>
          </div>
          <Link
            href="/generate"
            className="shrink-0 rounded-md bg-brand px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90"
          >
            New proposal
          </Link>
        </div>

        <div className="mt-8">
          {proposals.length === 0 ? (
            <div className="rounded-md border border-dashed border-slate-300 bg-surface px-6 py-12 text-center">
              <p className="text-sm text-ink-muted">No proposals yet.</p>
              <Link
                href="/generate"
                className="mt-3 inline-block text-sm font-medium text-brand hover:underline"
              >
                Draft your first one →
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-slate-200 overflow-hidden rounded-md border border-slate-200 bg-white">
              {proposals.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/proposals/${p.id}`}
                    className="block px-5 py-4 transition hover:bg-slate-50"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm font-medium text-ink">
                        {truncate(p.jobDescription, 80)}
                      </p>
                      <time
                        dateTime={p.createdAt.toISOString()}
                        className="shrink-0 text-xs text-ink-muted"
                      >
                        {formatDate(p.createdAt)}
                      </time>
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                      {truncate(p.generatedText, 160)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
