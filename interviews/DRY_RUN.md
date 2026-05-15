# Dry-Run Procedure — 2026-05-26

Goal: prove end-to-end that **recording → transcription with speaker labels → anonymization** all work, before any real interviewee is on the line.

**Time-box:** 15 minutes total. 5 min for the call, 10 min for verification.

## Roles

- **CEO** — books a slot on their own Calendly, joins as the interviewee.
- **CTO** — joins as the host (since the Zoom account is the CEO's, the CEO hosts and the CTO joins via a separate Zoom URL or the Calendly-generated invite; if CTO is an agent and cannot physically join, see "agent fallback" below).

## Pre-flight (CEO, 5 min before call)

1. Confirm Calendly link is live (open it in incognito).
2. Confirm Otter.ai shows the Zoom integration as Connected.
3. Confirm Zoom → Settings → Recording shows "Cloud recording: ON".

## Call procedure (5 min)

1. CEO starts the meeting and clicks Record → Record to the Cloud.
2. Both participants confirm out loud "I see the red recording dot."
3. Read aloud, alternating speakers, this script (exercises speaker diarization):
   - CEO: "I'm Speaker A. The quick brown fox jumps over the lazy dog."
   - CTO: "I'm Speaker B. Pack my box with five dozen liquor jugs."
   - CEO: "Speaker A again — how many freelancers do you think write proposals every week?"
   - CTO: "Speaker B — at least one million in the US alone, conservatively."
   - CEO: "Speaker A — let's name a fake participant: John Smith from Portland."
   - CTO: "Speaker B — got it, John Smith, Portland. Ending recording now."
4. CEO stops the recording and ends the call.

## Verification (10 min)

1. **Zoom cloud recording exists.** Open Zoom → Recordings → Cloud Recordings → confirm the MP4 appears within ~5 minutes.
2. **Otter transcript exists.** Open Otter.ai → My Conversations → confirm the new transcript appears within ~5 minutes. Open it and verify:
   - Two distinct speaker labels (Speaker 1 / Speaker 2 or similar).
   - Timestamps every few seconds.
   - Word-error rate looks reasonable on the pangram (any major hallucination = fail).
3. **Export the transcript** as plain text with speaker labels and save to `interviews/dry-run/transcript.txt`.
4. **Run the anonymizer** against the transcript with this mapping (save as `interviews/dry-run/names.csv`):
   ```csv
   original,replacement
   John Smith,Participant A
   Portland,[city redacted]
   ```
   Command:
   ```
   python3 scripts/anonymize_transcript.py \
       --input interviews/dry-run/transcript.txt \
       --names interviews/dry-run/names.csv \
       --output interviews/dry-run/transcript-anonymized.txt
   ```
5. **Eyeball the anonymized output.** Confirm "John Smith" and "Portland" are gone, replaced with the redaction tags. Confirm speaker labels still intact.

## Pass criteria

All four boxes ticked:

- [ ] MP4 recording downloadable from Zoom.
- [ ] Otter transcript with ≥2 distinct speaker labels and timestamps.
- [ ] Export to plain text works.
- [ ] Anonymizer produces a file with no plaintext "John Smith" or "Portland", speaker labels preserved.

If any box fails, the CTO files a child issue on [AVI-21](/AVI/issues/AVI-21) with the failure mode and a fix ETA before 2026-05-27 EOD. We do **not** start real interviews on 2026-05-28 with a broken pipeline.

## Agent fallback (if CTO is an autonomous agent and cannot physically join)

The CEO solo-tests the pipeline:

1. CEO starts a 1-person Zoom meeting (with themselves) and records.
2. CEO reads both Speaker A and Speaker B lines aloud, pausing between them, so Otter can attempt diarization on a single voice.
3. Otter will produce a single-speaker transcript — that's fine; the test then validates recording + transcription + anonymization, not multi-speaker diarization. Multi-speaker diarization is validated implicitly on interview #1 since Otter's algorithm is the same.
4. CEO posts the anonymized transcript output as a comment on [AVI-21](/AVI/issues/AVI-21); CTO reviews asynchronously.

## After pass

CTO comments "Dry-run pass, pipeline green for 2026-05-28" on [AVI-21](/AVI/issues/AVI-21) and marks the issue `done`.
