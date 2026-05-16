'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function ProposalActions({ id }: { id: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onDelete() {
    if (deleting) return;
    if (!window.confirm('Delete this proposal? This cannot be undone.')) return;

    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/proposals/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          typeof data.error === 'string' ? data.error : `Delete failed (${res.status})`,
        );
      }
      router.replace('/proposals');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
      setDeleting(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onDelete}
        disabled={deleting}
        className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {deleting ? 'Deleting…' : 'Delete'}
      </button>
      {error && (
        <span className="text-xs text-red-700">{error}</span>
      )}
    </div>
  );
}

export function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onCopy() {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setError(null);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setError('Copy failed');
    }
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium hover:bg-slate-50"
    >
      {error ? error : copied ? 'Copied' : label}
    </button>
  );
}
