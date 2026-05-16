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
          Proposal generator · coming soon
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          You&apos;re in. The generator lands next.
        </h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-ink-muted">
          We&apos;re wiring the Upwork job-post → tailored proposal flow now (tracked in
          AVI-29). When it ships, you&apos;ll paste a job post, pick your voice, and Avista will
          draft a proposal you can edit inline before sending.
        </p>

        <div className="mt-10 rounded-xl border border-dashed border-slate-300 bg-surface p-6">
          <p className="text-sm text-ink-muted">
            Your account is active. Sessions persist across refreshes. Hit{' '}
            <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">/app</code> directly any
            time — unauthenticated visitors get bounced to the login page.
          </p>
        </div>
      </section>
    </main>
  );
}
