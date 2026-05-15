# Single entrypoint for lint / test / build. CI calls `make lint` and `make test`.
# The Next.js app is the canonical stack as of AVI-27.

.PHONY: install lint typecheck build test format check ci foundation-check

install:
	npm ci

# Lint runs both the foundation-doc contract check (still required) and the
# Next.js / ESLint pass on the application code.
lint: foundation-check
	@echo "[lint] running next lint"
	@npm run lint

foundation-check:
	@echo "[lint] foundation contract check"
	@./scripts/check-foundation-doc.sh

typecheck:
	@echo "[typecheck] tsc --noEmit"
	@npm run typecheck

# CI's `test` step runs the build (real smoke) plus the placeholder test runner.
# Replace the placeholder with a real runner (vitest / jest / playwright) when
# we have user-facing logic worth testing.
test:
	@echo "[test] next build (smoke)"
	@npm run build
	@npm test

format:
	@echo "[format] (no formatter wired yet — prettier optional, defer until needed)"

check: lint typecheck test

ci: check
	@echo "[ci] all checks passed"
