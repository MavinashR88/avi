'use client';

import { useState } from 'react';

type Status = 'idle' | 'submitting' | 'ok' | 'error';

export function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState<string>('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus('submitting');
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setStatus('error');
        setMessage(data.error ?? 'Something went wrong. Try again?');
        return;
      }
      setStatus('ok');
      setMessage("You're on the list. We'll be in touch.");
      setEmail('');
    } catch {
      setStatus('error');
      setMessage('Network hiccup. Try again?');
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
      <label htmlFor="email" className="sr-only">
        Email
      </label>
      <input
        id="email"
        type="email"
        required
        placeholder="you@work.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={status === 'submitting'}
        className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm shadow-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={status === 'submitting'}
        className="rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-hover disabled:opacity-60"
      >
        {status === 'submitting' ? 'Joining…' : 'Join waitlist'}
      </button>
      {message && (
        <p
          role="status"
          className={`mt-1 text-sm sm:w-full ${status === 'error' ? 'text-red-600' : 'text-emerald-600'}`}
        >
          {message}
        </p>
      )}
    </form>
  );
}
