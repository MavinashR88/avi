import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { SignOutButton } from '@/components/sign-out-button';

export const dynamic = 'force-dynamic';

export default async function AppPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/auth/login?callbackUrl=%2Fapp');
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col px-6 py-12">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-sm font-semibold text-white">
            A
          </span>
          <span className="text-lg font-semibold tracking-tight">Avista</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-ink-muted">
          <span>{session.user.email}</span>
          <SignOutButton />
        </div>
      </header>

      <section className="mt-16">
        <p className="text-xs font-medium uppercase tracking-wider text-brand">
          Proposal generator · live
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Ready when you are.
        </h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-ink-muted">
          Paste any Upwork-style job post and Avista will draft a tailored proposal in your
          voice. Edit inline before you send.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/generate"
            className="inline-flex items-center rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90"
          >
            Open the generator →
          </Link>
          <Link
            href="/proposals"
            className="inline-flex items-center rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-ink hover:bg-slate-50"
          >
            View past proposals
          </Link>
        </div>
      </section>
    </main>
  );
}
