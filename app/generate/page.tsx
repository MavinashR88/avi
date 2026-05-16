import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { SignOutButton } from '@/components/sign-out-button';
import { GeneratorForm } from '@/components/generator-form';

export const dynamic = 'force-dynamic';

export default async function GeneratePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/auth/login?callbackUrl=%2Fgenerate');
  }

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
        <p className="text-xs font-medium uppercase tracking-wider text-brand">
          Proposal generator
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Paste a job post. Get a proposal.
        </h1>
        <p className="mt-3 max-w-xl leading-relaxed text-ink-muted">
          Drop the full job description in. Add a few notes about your skills, rate, and tone if
          you want a sharper draft. Edit before you send — Avista just opens the door.
        </p>

        <div className="mt-8">
          <GeneratorForm />
        </div>
      </section>
    </main>
  );
}
