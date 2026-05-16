import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { AppNav } from '@/components/app-nav';

export const dynamic = 'force-dynamic';

export default async function AppPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/auth/login?callbackUrl=%2Fapp');
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppNav email={session.user.email} />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 sm:py-16">
        <p className="text-xs font-medium uppercase tracking-wider text-brand">Dashboard</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-4xl">
          Ready when you are.
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-muted sm:text-base">
          Paste any Upwork-style job post and Avista drafts a tailored proposal in your voice.
          Edit before you send.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/generate"
            className="inline-flex items-center rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-brand/30"
          >
            Generate a proposal →
          </Link>
          <Link
            href="/proposals"
            className="inline-flex items-center rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-ink transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300"
          >
            View past proposals
          </Link>
        </div>
      </main>
    </div>
  );
}
