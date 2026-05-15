# Sample Transcript Output

This is a synthetic example, not from a real interview. It shows the expected format coming out of Otter.ai → Export → "Plain text with timestamps and speaker labels", then run through `scripts/anonymize_transcript.py`.

## Raw transcript (as Otter exports it)

```
Sarah Chen 00:00:04
Hey, thanks for hopping on. I'll hit record now — Otter joined as a bot, you'll see it in the participants list.

John Smith 00:00:11
No problem. I'm based in Portland, doing copywriting for SaaS landing pages mostly. Fire away.

Sarah Chen 00:00:19
Walk me through the last proposal you wrote — start to finish.

John Smith 00:00:24
OK, so this was for @growthlabs on Twitter, they DM'd me about a website refresh. I spent about two hours on the proposal — pulled examples from my Notion swipe file, wrote three pricing tiers, mocked up a delivery timeline in Figma. The annoying part was matching their tone; they sound very "founder-y" on their site so I had to rewrite the boilerplate intro three times.

Sarah Chen 00:01:02
What part felt like the most wasted time?

John Smith 00:01:06
Honestly the pricing tier breakdown. I rewrite that for every client and 90% of it is the same — only the dollar amounts change. I've been meaning to template it but I never sit down to do it.
```

## Names mapping (`names.csv`)

```csv
original,replacement
Sarah Chen,Interviewer
John Smith,Participant 1
Portland,[city redacted]
@growthlabs,@[handle redacted]
Notion,[tool redacted]
Figma,[tool redacted]
```

Note: tool names like Notion/Figma are typically left in — they're useful signal for the discovery report. Redact only when the interviewee asked for the specific tool to stay off the record.

## Anonymized output (what gets attached to `discovery-report`)

```
Interviewer 00:00:04
Hey, thanks for hopping on. I'll hit record now — Otter joined as a bot, you'll see it in the participants list.

Participant 1 00:00:11
No problem. I'm based in [city redacted], doing copywriting for SaaS landing pages mostly. Fire away.

Interviewer 00:00:19
Walk me through the last proposal you wrote — start to finish.

Participant 1 00:00:24
OK, so this was for @[handle redacted] on Twitter, they DM'd me about a website refresh. I spent about two hours on the proposal — pulled examples from my [tool redacted] swipe file, wrote three pricing tiers, mocked up a delivery timeline in [tool redacted]. The annoying part was matching their tone; they sound very "founder-y" on their site so I had to rewrite the boilerplate intro three times.

Interviewer 00:01:02
What part felt like the most wasted time?

Participant 1 00:01:06
Honestly the pricing tier breakdown. I rewrite that for every client and 90% of it is the same — only the dollar amounts change. I've been meaning to template it but I never sit down to do it.
```

## What this proves

- Speaker labels survive anonymization (the script only swaps the name strings, not the label structure).
- Timestamps are preserved (the regex uses word boundaries, so `00:00:04` is never touched).
- Handles (`@growthlabs`) and city mentions are catchable as long as they're in the mapping.
- The output is plain text, easy to paste or attach as a document on [AVI-18](/AVI/issues/AVI-18#document-discovery-report).
