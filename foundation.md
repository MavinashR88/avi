# Engineering Foundation

> Status: **draft** — decisions made pre-niche-lock. Revisit after niche selection; some choices may shift based on stack or regulatory constraints.

---

## 1. Repo & version control

- **Hosting:** GitHub (`MavinashR88/avi`) — chosen for Actions CI, free private repos, GitHub Copilot integration, and familiarity.
- **Default branch:** `main`.
- **Strategy:** trunk-based development with short-lived feature branches; no long-lived dev branches.
- **Tagging:** semver (`v0.x.y`) once the MVP ships; pre-MVP commits are untagged.

---

## 2. CI baseline

- **Platform:** GitHub Actions (free tier for public; ~2,000 min/month for private).
- **Workflow file:** `.github/workflows/ci.yml`
- **Jobs today:**
  - `lint` — runs `make lint` (foundation contract check; asserts required files and sections exist).
  - `test` — runs `make test` (placeholder that exits 0; replace with real runner when stack is locked).
- **Extending:** when the stack is chosen, add the language setup step + cache layer to the workflow and replace the `lint`/`test` Makefile targets. The workflow trigger and job structure do not change.

---

## 3. Deploy target

### Shortlist comparison

| Platform | Free tier / cost | Ops burden | AI-workload fit | Notes |
|----------|-----------------|-----------|-----------------|-------|
| **Fly.io** | ~$3/mo for a micro VM; pay-per-use | Low — managed VMs, simple `fly deploy` | Good — persistent processes, GPU add-ons via fly-gpu, long-lived connections for streaming LLM responses | Strong default for AI SaaS: handles SSE/streaming natively, easy secrets, built-in metrics |
| **Railway** | $5 credit/mo free; $0.000463/vCPU-s after | Very low — zero infra config | Good — supports any Dockerfile, easy env vars, built-in Postgres | Excellent DX; not ideal if we need bespoke GPU or >$50/mo sustained compute |
| **Vercel** | Generous free for frontends; serverless functions on Pro | Minimal for pure frontend | Poor for long-running LLM calls — 60 s function timeout on Pro, no persistent processes | Keep as a CDN/frontend layer only if we split frontend from backend |
| **AWS (ECS + Fargate)** | No free tier after 12 months; ~$30–100/mo for a modest setup | High — IAM, VPCs, ALB, ECR, task definitions | Best — unlimited config, GPU instances, SageMaker | Overkill pre-product; re-evaluate post-Series A or if niche demands on-prem / HIPAA BAA |

### Decision

**Default: Vercel** (pivoted 2026-05-15 from the original Fly.io plan).  
Rationale: at MVP stage the app is a Next.js 14 landing + waitlist + lightweight serverless endpoints — no long-running processes yet, no streaming LLM calls in the live deploy path. Vercel's Hobby tier is free, has no credit-card requirement, and deploys Next.js natively with zero config. Live as of 2026-05-15: https://avista-psi.vercel.app.

**Migration trigger back to Fly.io (or alternative):** the moment we need any of the following, revisit:
- A long-running process (background worker, queue consumer, websocket server).
- Streaming LLM responses that exceed Vercel's 60-second serverless function timeout (Hobby) / 5-minute timeout (Pro).
- Persistent disk or a long-lived connection (DB pool to a non-managed Postgres, etc.).

Until then, Vercel + Next.js API routes is sufficient and free. The provider abstraction in §6 means swapping deploy targets does not touch product code.

---

## 4. Observability baseline

### Error tracking

**Sentry** — chosen because:
- Free tier covers 5 k errors/month and 10 k performance transactions.
- First-class SDKs for every likely stack (Node, Python, Go, Next.js).
- Integrates with GitHub for commit-linked alerts.
- No infra to run.

### Structured logging

**OpenTelemetry (OTel) SDK → stdout → Vercel Log Drains** in early MVP.  
Long-term: route OTLP to a managed backend (Grafana Cloud free tier or BetterStack) once log volume justifies it.

### Stack-lock action

When the app stack is chosen:
1. Add Sentry SDK + DSN secret (see §5).
2. Add OTel instrumentation package.
3. Wire `SENTRY_DSN` and `OTEL_EXPORTER_OTLP_ENDPOINT` in the deploy config.
4. Do NOT self-host Sentry or an OTel collector until traffic warrants it.

---

## 5. Secrets management

### Model

| Environment | Secret storage | How it reaches the app |
|-------------|---------------|----------------------|
| Local dev | `.env` file (git-ignored) | Loaded by the app or a dotenv loader |
| CI | GitHub Actions encrypted secrets | Injected as env vars via `env:` in the workflow |
| Production (Vercel) | `vercel env add KEY production` or the Vercel dashboard (encrypted at rest) | Injected as env vars at runtime |

### Rules

1. **Never commit secrets.** `.env` is in `.gitignore`; `.env.example` with placeholder values is committed.
2. **One source of truth per environment.** Dev: `.env`; CI: GitHub secrets; prod: Fly secrets. No cross-env leakage.
3. **Rotation:** rotate API keys via `vercel env rm KEY production && vercel env add KEY production` (or the dashboard) or GitHub secrets UI. Deploy GH Action secrets (`VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`) are stored in GitHub repo secrets.
4. **Key naming convention:** `SCREAMING_SNAKE_CASE`, prefixed by service — e.g., `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `SENTRY_DSN`, `DATABASE_URL`.
5. **Secret scanning:** enable GitHub secret scanning on the repo to catch accidental commits.

---

## 6. AI infrastructure

### LLM provider choice

**Primary: Anthropic Claude (claude-sonnet-4-x series).**  
Rationale: best reasoning-to-cost ratio for knowledge-work automation; strong function-calling and structured output; supports prompt caching (reduces cost 5–10× on repeated context). This is the default for all LLM calls.

**Secondary / fallback: OpenAI GPT-4o.**  
Kept available for:
- Multimodal inputs (vision) where Claude's offering lags.
- A/B evals if Anthropic latency degrades.
- Specific niches that may contractually require OpenAI (enterprise deals).

**Open-source fallback: none at MVP.**  
Self-hosting Llama or Mistral requires GPU ops overhead that is not justified pre-revenue. Revisit if the niche demands on-prem (healthcare, government).

### Provider abstraction

All LLM calls go through a thin internal `llm.call(model, messages, options)` wrapper. This lets us swap providers or add routing logic without touching product code. Do not call provider SDKs directly from feature code.

### Eval harness intent

- **Unit evals:** per-prompt golden-set tests (input → expected output structure) run in CI. Framework: `promptfoo` (YAML-driven, runs anywhere, free).
- **Regression evals:** run on every PR against a fixed prompt version; block merge if accuracy drops >5%.
- **Cost tracking:** log `usage.input_tokens` and `usage.output_tokens` per call to structured logs (OTel span attribute `llm.usage.*`).
- Implementation deferred until a stack is picked (eval runner needs a runtime to execute the app prompts).

### Cost ceiling logic

| Trigger | Action |
|---------|--------|
| Single request exceeds 50 k input tokens | Reject with HTTP 400 before calling the LLM |
| Daily spend > $20 (tracked via Anthropic usage dashboard or LangFuse) | Alert CTO via Sentry alert or Slack webhook |
| Monthly spend > $200 | Auto-pause new signups and alert; investigate before re-enabling |

These ceilings are conservative for pre-launch; revisit once we have paying users and a known cost-per-user ratio.
