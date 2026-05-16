import Link from 'next/link';
import { WaitlistForm } from '@/components/waitlist-form';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Top nav */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-sm font-bold text-white shadow-sm">
              A
            </span>
            <span className="text-base font-semibold tracking-tight">Avista</span>
          </div>
          <nav className="flex items-center gap-3 sm:gap-5">
            <Link href="/auth/login" className="text-sm font-medium text-ink-muted hover:text-ink">
              Log in
            </Link>
            <Link
              href="/auth/signup"
              className="rounded-lg bg-brand px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-brand/30"
            >
              Sign up free
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-5xl px-4 pt-16 pb-12 sm:px-6 sm:pt-24 sm:pb-16">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">
            Early access · pre-launch
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-ink sm:text-5xl lg:text-6xl">
            Proposals that sound like{' '}
            <span className="text-brand">you</span> wrote them.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-muted">
            Paste an Upwork job post. Avista drafts a tailored proposal grounded in your voice and
            past work — in seconds. $15/month, capped at 30 proposals so quality beats volume.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/auth/signup"
              className="inline-flex items-center rounded-lg bg-brand px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-brand/30"
            >
              Get early access →
            </Link>
            <Link
              href="/auth/login"
              className="text-sm font-medium text-ink-muted underline-offset-2 hover:underline"
            >
              Already have an account? Log in
            </Link>
          </div>
        </section>

        {/* Feature cards */}
        <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <FeatureCard
              icon="🎙️"
              title="Voice-grounded"
              body="Paste 2–3 past proposals. Avista mirrors your sentence rhythm and tone so it reads like you after a good night's sleep."
            />
            <FeatureCard
              icon="🔢"
              title="Hard-capped at 30"
              body="Thirty proposals a month, maximum. Quality over volume — fewer that actually land beats hundreds of copy-paste blasts."
            />
            <FeatureCard
              icon="✏️"
              title="Edit, don't just accept"
              body="Every draft is yours to shape. Avista opens the door; you walk through it on your own terms."
            />
          </div>
        </section>

        {/* Waitlist section */}
        <section className="border-t border-slate-200 bg-slate-50 px-4 py-16 sm:px-6">
          <div className="mx-auto max-w-md text-center">
            <h2 className="text-2xl font-semibold tracking-tight">Join the waitlist</h2>
            <p className="mt-2 text-sm text-ink-muted">
              We&apos;ll email you the moment the closed beta opens. No spam, ever.
            </p>
            <div className="mt-6">
              <WaitlistForm />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white px-4 py-6 sm:px-6">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 text-xs text-ink-muted">
          <span>© Avista 2026</span>
          <span>
            Built with Next.js ·{' '}
            <a className="underline hover:text-ink" href="/api/health">
              status
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-3 text-2xl">{icon}</div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">{body}</p>
    </div>
  );
}
