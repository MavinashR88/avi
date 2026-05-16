import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { SignOutButton } from '@/components/sign-out-button';
import { GeneratorForm } from '@/components/generator-form';

export const dynamic = 'force-dynamic';

export default async function GeneratePage({
  searchParams,
}: {
  searchParams?: { reuse?: string };
}) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!session?.user || !userId) {
    redirect('/auth/login?callbackUrl=%2Fgenerate');
  }

  let initialJobDescription = '';
  const reuseId = searchParams?.reuse;
  if (reuseId) {
    const source = await prisma.proposal.findFirst({
      where: { id: reuseId, userId },
      select: { jobDescription: true },
    });
    if (source) initialJobDescription = source.jobDescription;
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
          <Link href="/proposals" className="hover:text-ink">
            History
          </Link>
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

        {initialJobDescription && (
          <p className="mt-4 rounded-md border border-brand/30 bg-brand/5 px-3 py-2 text-xs text-brand">
            Reusing job description from a past proposal. Edit and re-generate as needed.
          </p>
        )}

        <div className="mt-8">
          <GeneratorForm initialJobDescription={initialJobDescription} />
        </div>
      </section>
    </main>
  );
}
