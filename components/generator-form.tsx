'use client';

import { useRef, useState } from 'react';

type Status = 'idle' | 'streaming' | 'done' | 'error';

export function GeneratorForm({
  initialJobDescription = '',
}: {
  initialJobDescription?: string;
} = {}) {
  const [jobDescription, setJobDescription] = useState(initialJobDescription);
  const [skills, setSkills] = useState('');
  const [rate, setRate] = useState('');
  const [tone, setTone] = useState('');
  const [output, setOutput] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const canSubmit = jobDescription.trim().length >= 20 && status !== 'streaming';

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setOutput('');
    setError(null);
    setCopied(false);
    setStatus('streaming');

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription, skills, rate, tone }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        let msg = `Request failed (${res.status})`;
        try {
          const data = await res.json();
          if (data?.error) msg = typeof data.error === 'string' ? data.error : msg;
        } catch {}
        throw new Error(msg);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        setOutput(buf);
      }
      setStatus('done');
    } catch (err) {
      if ((err as { name?: string }).name === 'AbortError') {
        setStatus('idle');
        return;
      }
      setError(err instanceof Error ? err.message : 'Generation failed');
      setStatus('error');
    }
  }

  async function onCopy() {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setError('Could not copy to clipboard');
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label htmlFor="job" className="block text-sm font-medium">
          Job description
        </label>
        <textarea
          id="job"
          required
          minLength={20}
          rows={10}
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the full Upwork (or similar) job post here…"
          className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm leading-relaxed shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
      </div>

      <details className="rounded-md border border-slate-200 bg-surface px-4 py-3 text-sm">
        <summary className="cursor-pointer select-none font-medium">
          Optional context (skills, rate, tone)
        </summary>
        <div className="mt-3 space-y-3">
          <div>
            <label htmlFor="skills" className="block text-xs font-medium text-ink-muted">
              Your skills / past wins
            </label>
            <textarea
              id="skills"
              rows={3}
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g. 6 yrs Next.js, shipped Stripe billing for 3 SaaS companies…"
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="rate" className="block text-xs font-medium text-ink-muted">
                Target rate
              </label>
              <input
                id="rate"
                type="text"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                placeholder="e.g. $95/hr or $3.5k fixed"
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="tone" className="block text-xs font-medium text-ink-muted">
                Tone
              </label>
              <input
                id="tone"
                type="text"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                placeholder="e.g. direct, warm, no fluff"
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>
      </details>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === 'streaming' ? 'Generating…' : 'Generate proposal'}
        </button>
        {status === 'streaming' && (
          <button
            type="button"
            onClick={() => abortRef.current?.abort()}
            className="text-sm text-ink-muted hover:text-ink"
          >
            Stop
          </button>
        )}
      </div>

      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {(output || status === 'streaming') && (
        <div className="rounded-md border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium">Draft</h2>
            <button
              type="button"
              onClick={onCopy}
              disabled={!output}
              className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium hover:bg-slate-50 disabled:opacity-50"
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-relaxed text-ink">
            {output}
            {status === 'streaming' && <span className="animate-pulse">▌</span>}
          </pre>
          {status === 'done' && (
            <p className="mt-3 text-xs text-ink-muted">Saved to your account.</p>
          )}
        </div>
      )}
    </form>
  );
}
