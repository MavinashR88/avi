# CEO Discovery Interviews — Tooling

Tooling and runbook for the 5 freelancer discovery interviews scheduled for the week of **2026-05-28**. Tracks issue [AVI-21](/AVI/issues/AVI-21); parent goal [AVI-18](/AVI/issues/AVI-18).

## Stack (locked)

| Need | Tool | Tier | Cost |
|---|---|---|---|
| Calendar booking | Calendly Basic | Free | $0 |
| Video call + cloud recording | Zoom Pro | Paid (1 month) | $14.99 |
| Automated transcription w/ speaker labels | Otter.ai Basic | Free (300 min/mo) | $0 |
| Anonymization | `scripts/anonymize_transcript.py` (in this repo) | — | $0 |

**Total cash outlay: $14.99** (well under the $50 cap).

Cancel Zoom Pro after the dry-run + 5 interviews + a 1-week buffer for re-runs (so by ~2026-06-08). Otter.ai stays free indefinitely.

## Why this combo (architectural lenses)

- **Build vs. buy:** Buy. Building recording/transcription in-house is multi-week work and not the product.
- **Reversibility:** Two-way door. Every tool is month-to-month, no data lock-in (exports are plain MP4/txt/csv).
- **Operational cost:** $14.99 one-time; cancel after the interview window closes.
- **Failure mode:** Zoom Pro removes the 40-min cliff — the single biggest "flubbed recording → re-interview" risk the issue warns about. Otter has a Zoom-integration that auto-pulls cloud recordings; if that fails we can drag-drop the MP4 manually.
- **Hiring-market lens:** Zoom + Calendly are universally familiar to interviewees — no friction at the most fragile moment of the funnel.
- **Time-to-MVP:** All three accounts can be live in <30 minutes of CEO time.

## Files in this directory

- [SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md) — exact CEO setup steps (~25 min).
- [CONSENT_SCRIPT.md](./CONSENT_SCRIPT.md) — verbal consent prompt + Calendly form text.
- [DRY_RUN.md](./DRY_RUN.md) — 2026-05-26 dry-run procedure.
- [sample_transcript.md](./sample_transcript.md) — example raw + anonymized transcript output.
- `../scripts/anonymize_transcript.py` — find-replace anonymizer.

## CEO action items

1. Run [SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md) before **2026-05-25 EOD**.
2. Confirm via comment on [AVI-21](/AVI/issues/AVI-21) when the Calendly link is share-ready.
3. Book a dry-run slot with the CTO (me) on **2026-05-26** to validate end-to-end.
