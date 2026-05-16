import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AppNav } from '@/components/app-nav';
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

  const sub = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionStatus: true },
  });
  if (sub?.subscriptionStatus !== 'active') {
    redirect('/subscribe');
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
    <div className="flex min-h-screen flex-col">
      <AppNav email={session.user.email} activePath="/generate" />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-wider text-brand">
            Proposal generator
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Paste a job post. Get a proposal.
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-muted">
            Drop the full job description in. Add optional context about your skills, rate, and
            tone for a sharper draft. Edit before you send.
          </p>

          {initialJobDescription && (
            <p className="mt-4 rounded-md border border-brand/30 bg-brand/5 px-3 py-2 text-xs text-brand">
              Reusing job description from a past proposal. Edit and re-generate as needed.
            </p>
          )}
        </div>

        <GeneratorForm initialJobDescription={initialJobDescription} />
      </main>
    </div>
  );
}
