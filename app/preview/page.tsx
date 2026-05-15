import Link from 'next/link';

const screens = [
  { href: '/prototype/01-onboarding-proposals.html', title: '1. Onboarding', desc: 'Capture 2–3 past proposals for voice grounding.' },
  { href: '/prototype/02-trust-moment.html', title: '2. Trust moment', desc: 'Show what we learned from the upload.' },
  { href: '/prototype/03-new-proposal.html', title: '3. New proposal', desc: 'Paste a job post, generate a draft.' },
  { href: '/prototype/04-chat-edit.html', title: '4. Inline edit', desc: 'Refine the draft in a chat-style editor.' },
  { href: '/prototype/05-upwork-send.html', title: '5. Copy & send', desc: 'Assisted copy back into Upwork.' },
  { href: '/prototype/06-email-sent.html', title: '6. Confirmation', desc: 'Sent state with the option to log outcome.' },
];

export default function PreviewIndex() {
  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-12">
      <Link href="/" className="text-sm text-ink-muted hover:text-ink">
        ← Back home
      </Link>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">Prototype walk-through</h1>
      <p className="mt-2 max-w-2xl text-ink-muted">
        These are the static HTML mockups produced before the MVP code. They show the
        end-to-end flow we&apos;re building toward.
      </p>

      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {screens.map((s) => (
          <li key={s.href}>
            <a
              href={s.href}
              className="block rounded-xl border border-slate-200 bg-surface p-4 transition hover:border-brand"
            >
              <p className="text-sm font-semibold">{s.title}</p>
              <p className="mt-1 text-sm text-ink-muted">{s.desc}</p>
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}
