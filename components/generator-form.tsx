'use client';

import { useRef, useState } from 'react';

type Status = 'idle' | 'streaming' | 'done' | 'error';
type FetchStatus = 'idle' | 'fetching' | 'error';
type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

const JOB_DESC_MIN = 20;
const JOB_DESC_MAX = 5000;

function Spinner({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export function GeneratorForm({
  initialJobDescription = '',
}: {
  initialJobDescription?: string;
} = {}) {
  const [jobUrl, setJobUrl] = useState('');
  const [fetchStatus, setFetchStatus] = useState<FetchStatus>('idle');
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [jobDescription, setJobDescription] = useState(initialJobDescription);
  const [skills, setSkills] = useState('');
  const [rate, setRate] = useState('');
  const [tone, setTone] = useState('');
  const [output, setOutput] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const generatedJobDescriptionRef = useRef<string>('');

  const charCount = jobDescription.length;
  const canSubmit = jobDescription.trim().length >= JOB_DESC_MIN && status !== 'streaming';

  async function onFetchUrl() {
    const trimmed = jobUrl.trim();
    if (!trimmed) return;
    setFetchError(null);
    setFetchStatus('fetching');
    try {
      const res = await fetch('/api/scrape-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFetchError(data?.error ?? `Request failed (${res.status})`);
        setFetchStatus('error');
        return;
      }
      if (data.description) {
        setJobDescription(
          data.title ? `${data.title}\n\n${data.description}` : data.description,
        );
      }
      setFetchStatus('idle');
    } catch {
      setFetchError('Failed to fetch job page — paste the description manually.');
      setFetchStatus('error');
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setOutput('');
    setError(null);
    setCopied(false);
    setSaveStatus('idle');
    setSaveError(null);
    setStatus('streaming');
    generatedJobDescriptionRef.current = jobDescription;

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

  async function onSave() {
    if (status !== 'done' || !output.trim() || saveStatus === 'saving') return;
    setSaveStatus('saving');
    setSaveError(null);
    try {
      const res = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobDescription: generatedJobDescriptionRef.current || jobDescription,
          generatedText: output,
        }),
      });
      if (!res.ok) {
        let msg = `Save failed (${res.status})`;
        try {
          const data = await res.json();
          if (typeof data?.error === 'string') msg = data.error;
        } catch {}
        throw new Error(msg);
      }
      setSaveStatus('saved');
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Save failed');
      setSaveStatus('error');
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label htmlFor="jobUrl" className="block text-sm font-medium">
          Paste Upwork job URL{' '}
          <span className="font-normal text-ink-muted">(optional)</span>
        </label>
        <div className="mt-1 flex gap-2">
          <input
            id="jobUrl"
            type="url"
            value={jobUrl}
            onChange={(e) => {
              setJobUrl(e.target.value);
              setFetchError(null);
            }}
            onPaste={(e) => {
              const pasted = e.clipboardData.getData('text').trim();
              if (pasted.includes('upwork.com')) {
                e.preventDefault();
                setJobUrl(pasted);
                setFetchError(null);
              }
            }}
            placeholder="https://www.upwork.com/jobs/~..."
            className="min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
          <button
            type="button"
            disabled={!jobUrl.trim() || fetchStatus === 'fetching'}
            onClick={onFetchUrl}
            className="shrink-0 rounded-md bg-slate-100 px-3 py-2 text-sm font-medium hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {fetchStatus === 'fetching' ? 'Fetching…' : 'Fetch'}
          </button>
        </div>
        {fetchError && (
          <p className="mt-1.5 text-xs text-red-600">{fetchError}</p>
        )}
      </div>

      <div>
        <div className="flex items-baseline justify-between">
          <label htmlFor="job" className="block text-sm font-medium">
            Job description
          </label>
          <span
            className={`text-xs tabular-nums ${
              charCount > JOB_DESC_MAX * 0.9 ? 'text-amber-600' : 'text-ink-muted'
            }`}
          >
            {charCount}/{JOB_DESC_MAX}
          </span>
        </div>
        <textarea
          id="job"
          required
          minLength={JOB_DESC_MIN}
          maxLength={JOB_DESC_MAX}
          rows={10}
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the full Upwork (or similar) job post here…"
          className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm leading-relaxed shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
        {charCount > 0 && charCount < JOB_DESC_MIN && (
          <p className="mt-1 text-xs text-ink-muted">
            {JOB_DESC_MIN - charCount} more character{JOB_DESC_MIN - charCount !== 1 ? 's' : ''} needed
          </p>
        )}
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
          className="inline-flex items-center gap-1.5 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-brand/30 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === 'streaming' && <Spinner className="-ml-0.5 h-4 w-4" />}
          {status === 'streaming' ? 'Generating…' : 'Generate proposal'}
        </button>
        {status === 'streaming' && (
          <button
            type="button"
            onClick={() => abortRef.current?.abort()}
            className="text-sm text-ink-muted underline-offset-2 hover:underline"
          >
            Cancel
          </button>
        )}
      </div>

      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {(output || status === 'streaming') && (
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold">
                {status === 'done' ? 'Draft proposal — edit before saving' : 'Draft proposal'}
              </h2>
              {status === 'streaming' && (
                <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand" />
                  Writing
                </span>
              )}
              {status === 'done' && saveStatus === 'saved' && (
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                  Saved
                </span>
              )}
              {status === 'done' && saveStatus !== 'saved' && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                  Unsaved
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={onCopy}
              disabled={!output || status === 'streaming'}
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold transition hover:bg-slate-50 active:scale-95 disabled:opacity-40"
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>

          {status === 'done' ? (
            <div className="px-4 py-4">
              <label htmlFor="proposalDraft" className="sr-only">
                Generated proposal (editable)
              </label>
              <textarea
                id="proposalDraft"
                aria-label="Generated proposal (editable)"
                rows={14}
                value={output}
                onChange={(e) => {
                  setOutput(e.target.value);
                  if (saveStatus === 'saved') setSaveStatus('idle');
                  if (saveStatus === 'error') {
                    setSaveStatus('idle');
                    setSaveError(null);
                  }
                }}
                className="w-full resize-y whitespace-pre-wrap rounded-md border border-slate-300 bg-white px-3 py-2 font-sans text-sm leading-relaxed text-ink shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={onSave}
                  disabled={
                    saveStatus === 'saving' || saveStatus === 'saved' || !output.trim()
                  }
                  className="inline-flex items-center gap-1.5 rounded-md bg-brand px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saveStatus === 'saving' && <Spinner className="-ml-0.5 h-3.5 w-3.5" />}
                  {saveStatus === 'saving'
                    ? 'Saving…'
                    : saveStatus === 'saved'
                      ? 'Saved'
                      : 'Save proposal'}
                </button>
                {saveStatus === 'saved' && (
                  <a
                    href="/proposals"
                    className="text-xs font-medium text-ink-muted underline-offset-2 hover:text-ink hover:underline"
                  >
                    View in history →
                  </a>
                )}
                {saveError && (
                  <span className="text-xs text-red-700">{saveError}</span>
                )}
              </div>
            </div>
          ) : (
            <pre className="whitespace-pre-wrap px-4 py-4 font-sans text-sm leading-relaxed text-ink">
              {output}
              {status === 'streaming' && <span className="animate-pulse text-brand">▌</span>}
            </pre>
          )}
        </div>
      )}
    </form>
  );
}
