'use client';

import { useState } from 'react';

export function SubscribeButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error || `Checkout failed (${res.status})`);
      }
      const j = (await res.json()) as { url?: string };
      if (!j.url) throw new Error('Stripe did not return a checkout URL');
      window.location.href = j.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Checkout failed');
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={start}
        disabled={loading}
        className="inline-flex items-center rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-brand/30 disabled:opacity-60"
      >
        {loading ? 'Redirecting…' : 'Subscribe — $15/month'}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
