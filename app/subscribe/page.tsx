import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { SignOutButton } from '@/components/sign-out-button';
import { SubscribeButton } from '@/components/subscribe-button';

export const dynamic = 'force-dynamic';

export default async function SubscribePage({
  searchParams,
}: {
  searchParams?: { cancelled?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/auth/login?callbackUrl=%2Fsubscribe');
  }
  const userId = (session.user as { id?: string }).id;
  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionStatus: true },
    });
    if (user?.subscriptionStatus === 'active') {
      redirect('/app');
    }
  }

  const cancelled = searchParams?.cancelled === '1';

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-sm font-bold text-white shadow-sm">
              A
            </span>
            <span className="text-base font-semibold tracking-tight">Avista</span>
          </div>
          <div className="flex items-center gap-3">
            {session.user.email && (
              <span className="hidden max-w-[160px] truncate text-xs text-ink-muted sm:block">
                {session.user.email}
              </span>
            )}
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-12 sm:px-6 sm:py-16">
        <p className="text-xs font-medium uppercase tracking-wider text-brand">Subscribe</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
          One plan. Everything you need to win Upwork jobs.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          A subscription unlocks the proposal generator and your history.
        </p>

        {cancelled && (
          <p className="mt-6 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Checkout was cancelled. You can try again whenever you&apos;re ready.
          </p>
        )}

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold tracking-tight">$15</span>
            <span className="text-sm text-ink-muted">/ month</span>
          </div>
          <ul className="mt-5 space-y-2 text-sm text-ink">
            <li>· Up to 30 AI proposals every month</li>
            <li>· Tailored to each Upwork job post</li>
            <li>· Your past proposals saved and reusable</li>
            <li>· Cancel anytime from the Stripe portal</li>
          </ul>
          <div className="mt-6">
            <SubscribeButton />
          </div>
          <p className="mt-3 text-xs text-ink-muted">
            Secure payment by Stripe. No card details touch our servers.
          </p>
        </div>
      </main>
    </div>
  );
}
