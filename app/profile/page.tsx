import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AppNav } from '@/components/app-nav';
import { ProfileForm, type ProfileValues } from '@/components/profile-form';

export const dynamic = 'force-dynamic';

function normalizeTone(value: string): ProfileValues['tone'] {
  return value === 'friendly' || value === 'assertive' ? value : 'professional';
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!session?.user || !userId) {
    redirect('/auth/login?callbackUrl=%2Fprofile');
  }

  const row = await prisma.profile.findUnique({ where: { userId } });
  const initial: ProfileValues = {
    name: row?.name ?? '',
    tagline: row?.tagline ?? '',
    skills: row?.skills ?? '',
    hourlyRate: row?.hourlyRate ?? '',
    tone: normalizeTone(row?.tone ?? 'professional'),
    bio: row?.bio ?? '',
  };

  return (
    <div className="flex min-h-screen flex-col">
      <AppNav email={session.user.email} activePath="/profile" />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-wider text-brand">
            Your profile
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Tell Avista about you.
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-muted">
            Saved profile fields are merged into every proposal automatically. You can still
            override them per-proposal in the generator if you want a different rate or tone
            for a specific job.
          </p>
        </div>

        <ProfileForm initial={initial} />
      </main>
    </div>
  );
}
