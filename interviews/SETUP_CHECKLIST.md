# CEO Setup Checklist — Discovery Interview Tooling

**Time required:** ~25 minutes. Do this in one sitting; the integrations are easier to wire when each tool is open in an adjacent tab.

**Deadline:** 2026-05-25 EOD (one day before the 2026-05-26 dry-run).

---

## 1. Zoom Pro (5 min)

1. Go to https://zoom.us/pricing → **Pro plan, $14.99/mo**, monthly (not annual).
2. Sign up with the same Gmail address that holds your primary Google Calendar.
3. After checkout, open **Settings → Recording**:
   - Turn ON: *Cloud recording*.
   - Turn ON: *Record audio-only file*.
   - Turn ON: *Audio transcript* (Zoom's built-in — we use this as a backup; Otter is primary).
   - Turn ON: *Display participants' names in the recording*.
   - Turn ON: *Require my permission to record* (so the consent prompt fires).
4. Open **Settings → Meeting → Recording disclaimer** → enable the disclaimer. Paste the text from [CONSENT_SCRIPT.md](./CONSENT_SCRIPT.md) §1 ("Recording disclaimer").
5. Set a calendar reminder for **2026-06-08** to cancel the Pro subscription.

## 2. Otter.ai Basic (5 min)

1. Go to https://otter.ai → **Sign up free** with the same Gmail as Zoom.
2. Open **Account → Apps → Zoom** → click Connect → grant the OAuth scopes.
3. Open **Account → Meeting Settings** → enable *Auto-join Zoom meetings I host*.
4. Confirm under **Account → Plan** that you are on the **Basic (free)** tier. You have 300 transcription minutes/month — 5×30-min interviews = 150 min, leaving 150 min headroom.

## 3. Calendly free tier (10 min)

1. Go to https://calendly.com → **Sign up free** with the same Gmail.
2. **Calendar integrations** → connect your Google Calendar (the one with your real availability).
3. **Conferencing integrations** → connect Zoom.
4. Create **one event type**, exactly named **"Avi Discovery Interview — 30 min"**:
   - Duration: 30 min.
   - Location: Zoom (auto-generated meeting per booking).
   - Booking window: **2026-05-28 through 2026-06-01** only (set explicit start/end date in the date range option, not rolling).
   - Availability:
     - Mon–Fri, **09:00–18:00 America/Los_Angeles**.
     - Mon–Fri, **18:00–21:00 America/Los_Angeles**.
   - Buffers: 15 min before, 15 min after (gives you space between back-to-backs).
   - Maximum bookings per day: 4 (so you cap incoming load).
5. **Questions on the booking form** — add these (use the text from [CONSENT_SCRIPT.md](./CONSENT_SCRIPT.md) §2):
   - "What's your freelancing focus area? (e.g., copywriter, designer, dev, etc.)" — required, short answer.
   - "Roughly how many hours/week do you currently spend writing proposals?" — required, short answer.
   - "Is it OK to record this call for our internal notes? Recording is deleted after we write up the interview summary." — required, yes/no.
6. **Confirmation page** → set the redirect message to: "Thanks — you'll get a Zoom link in your inbox. Looking forward to the conversation."
7. Copy the public event URL. Paste it as a comment on [AVI-21](/AVI/issues/AVI-21) so the CTO can run the dry-run booking.

## 4. Recording storage destination (2 min)

Default is Zoom cloud (kept ~30 days on Pro plan, plenty for our window). After each interview:

1. Open Zoom → **Recordings → Cloud Recordings**.
2. Download the MP4 + the Otter transcript (Otter → My Conversations → the interview → Export → Plain text with speaker labels).
3. Save both into a folder named `interviews/raw/2026-05-XX-participant-N/` (in this repo, gitignored — never commit raw recordings or unredacted transcripts; see [.gitignore](../.gitignore)).
4. Run the anonymizer (see [README.md](./README.md) → anonymize_transcript.py).
5. The anonymized `.txt` is the only artifact that may be attached to [AVI-18#discovery-report](/AVI/issues/AVI-18#document-discovery-report).

## 5. Smoke test (3 min)

Before logging off:

1. From your phone (or a second browser in incognito), open your Calendly link and book a slot 10 min in the future. Use a throwaway name.
2. Confirm the Zoom invite landed in your email.
3. Cancel the booking (so you don't actually have to join).
4. ✅ If steps 1–3 worked, the wiring is correct.

## 6. Hand back to CTO

Comment on [AVI-21](/AVI/issues/AVI-21) with:

- Calendly share link.
- Confirmation that the smoke test passed.
- A 5-min slot on **2026-05-26** for the dry-run.
