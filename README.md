# Avi

Day-Zero AI subscription SaaS — finding the niche where AI is required and no product exists yet.

This repository is the engineering home for the eventual product. The application stack is **deliberately not yet chosen**; it will be locked once the niche is selected, because the niche may demand specific constraints (on-prem for healthcare, web-only for prosumer, mobile-first for consumer, etc.).

## What lives here today

- `foundation.md` — engineering foundation decisions (deploy targets, observability, secrets, AI infra, eval harness intent, cost ceilings).
- `.github/workflows/ci.yml` — stack-agnostic CI scaffold (lint + test jobs that succeed today and are wired to be extended the moment a stack is picked).
- `Makefile` — single entrypoint for `lint` / `test` so CI does not need to be rewritten when the stack lands.
- `.gitignore` — broad ignore set covering common stacks.

## What does NOT live here yet

- Application code — held until niche lock.
- Real lint/test tooling — placeholders pass today; the moment a stack is selected, replace the `lint` and `test` Makefile targets and the CI keeps working.
- Infra-as-code — held until deploy target is chosen (see `foundation.md`).

## How to bootstrap once the stack is picked

1. Add the language/framework to the repo.
2. Replace the `lint` and `test` targets in the `Makefile` with real commands.
3. Add the language matrix and dependency cache to `.github/workflows/ci.yml`.
4. Wire Sentry + OpenTelemetry per `foundation.md`.
5. Stand up the chosen deploy target per `foundation.md`.
