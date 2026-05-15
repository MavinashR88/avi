import Link from 'next/link';
import { WaitlistForm } from '@/components/waitlist-form';

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-12 sm:py-20">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-sm font-semibold text-white">
            A
          </span>
          <span className="text-lg font-semibold tracking-tight">Avista</span>
        </div>
        <nav className="flex items-center gap-6 text-sm text-ink-muted">
          <Link href="/preview" className="hover:text-ink">
            Preview
          </Link>
          <a href="https://github.com/MavinashR88/avi" className="hover:text-ink">
            GitHub
          </a>
        </nav>
      </header>

      <section className="mt-16 sm:mt-24">
        <p className="text-xs font-medium uppercase tracking-wider text-brand">
          Early access · pre-launch
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
          AI proposals that read like <span className="text-brand">you</span> wrote them.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-muted">
          Avista turns an Upwork job post into a tailored proposal in your voice — grounded
          in your past work, capped so it never feels spammy. $15/month, 30 proposals max.
        </p>

        <div className="mt-8 max-w-md">
          <WaitlistForm />
        </div>

        <p className="mt-4 text-sm text-ink-muted">
          We&apos;ll email you when the closed beta opens. No spam, ever.
        </p>
      </section>

      <section className="mt-20 grid gap-8 sm:grid-cols-3">
        <Feature
          title="Voice-grounded"
          body="Paste 2–3 past proposals. Avista mirrors your sentence rhythm and tone."
        />
        <Feature
          title="Hard-capped"
          body="30 proposals a month. Quality over volume — fewer that actually land."
        />
        <Feature
          title="Edit, don&apos;t accept"
          body="Every draft is editable inline. You ship; Avista just opens the door."
        />
      </section>

      <footer className="mt-auto pt-20 text-sm text-ink-muted">
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-6">
          <span>© Avista 2026</span>
          <span>
            Built with Next.js · deployed on Fly.io ·{' '}
            <a className="underline hover:text-ink" href="/api/health">
              status
            </a>
          </span>
        </div>
      </footer>
    </main>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-surface p-5">
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">{body}</p>
    </div>
  );
}
