'use client';

import { useState } from 'react';

type Tone = 'professional' | 'friendly' | 'assertive';

export interface ProfileValues {
  name: string;
  tagline: string;
  skills: string;
  hourlyRate: string;
  tone: Tone;
  bio: string;
}

type Status = 'idle' | 'saving' | 'saved' | 'error';

export function ProfileForm({ initial }: { initial: ProfileValues }) {
  const [values, setValues] = useState<ProfileValues>(initial);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof ProfileValues>(key: K, value: ProfileValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    if (status === 'saved' || status === 'error') setStatus('idle');
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('saving');
    setError(null);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        let msg = `Save failed (${res.status})`;
        try {
          const data = await res.json();
          if (data?.error && typeof data.error === 'string') msg = data.error;
        } catch {}
        throw new Error(msg);
      }
      setStatus('saved');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
      setStatus('error');
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="block text-sm font-medium">
            Name
          </label>
          <input
            id="name"
            type="text"
            value={values.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="e.g. Ada Lovelace"
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>
        <div>
          <label htmlFor="tagline" className="block text-sm font-medium">
            Tagline
          </label>
          <input
            id="tagline"
            type="text"
            value={values.tagline}
            onChange={(e) => update('tagline', e.target.value)}
            placeholder="e.g. Senior full-stack engineer (Next.js + Postgres)"
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>
      </div>

      <div>
        <label htmlFor="skills" className="block text-sm font-medium">
          Skills
        </label>
        <textarea
          id="skills"
          rows={3}
          value={values.skills}
          onChange={(e) => update('skills', e.target.value)}
          placeholder="Comma-separated or free-form. e.g. Next.js, TypeScript, Stripe billing, Postgres, AWS"
          className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="hourlyRate" className="block text-sm font-medium">
            Hourly rate
          </label>
          <input
            id="hourlyRate"
            type="text"
            value={values.hourlyRate}
            onChange={(e) => update('hourlyRate', e.target.value)}
            placeholder="e.g. $95/hr"
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>
        <div>
          <label htmlFor="tone" className="block text-sm font-medium">
            Tone preference
          </label>
          <select
            id="tone"
            value={values.tone}
            onChange={(e) => update('tone', e.target.value as Tone)}
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          >
            <option value="professional">Professional</option>
            <option value="friendly">Friendly</option>
            <option value="assertive">Assertive</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="bio" className="block text-sm font-medium">
          Short bio
        </label>
        <textarea
          id="bio"
          rows={4}
          value={values.bio}
          onChange={(e) => update('bio', e.target.value)}
          placeholder="A few sentences the AI can use to ground the proposal. Past wins, focus areas, why you."
          className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={status === 'saving'}
          className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === 'saving' ? 'Saving…' : 'Save profile'}
        </button>
        {status === 'saved' && (
          <span className="text-sm text-emerald-700">Saved.</span>
        )}
      </div>

      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </form>
  );
}
