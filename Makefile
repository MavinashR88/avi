# Stack-agnostic entrypoints. Replace the bodies once the application stack is locked.
# CI calls `make lint` and `make test` — keep these target names stable.

.PHONY: lint test format check ci

lint:
	@echo "[lint] no application stack picked yet — running doc-level checks only"
	@./scripts/check-foundation-doc.sh

test:
	@echo "[test] no application stack picked yet — placeholder passes"
	@echo "[test] when stack lands: replace this with the real test runner"

format:
	@echo "[format] placeholder — wire to formatter once stack is picked (prettier / ruff / gofmt / rustfmt)"

check: lint test

ci: check
	@echo "[ci] all stack-agnostic checks passed"
