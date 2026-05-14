#!/usr/bin/env bash
# Stack-agnostic lint: assert the foundation contract is intact.
# This exists so CI has something real to fail on before any application code arrives.

set -euo pipefail

required_files=(
  "README.md"
  "foundation.md"
  "Makefile"
  ".gitignore"
  ".github/workflows/ci.yml"
)

missing=0
for f in "${required_files[@]}"; do
  if [[ ! -f "$f" ]]; then
    echo "missing required foundation file: $f" >&2
    missing=1
  fi
done

required_sections=(
  "## 1. Repo & version control"
  "## 2. CI baseline"
  "## 3. Deploy target"
  "## 4. Observability baseline"
  "## 5. Secrets management"
  "## 6. AI infrastructure"
)

if [[ -f foundation.md ]]; then
  for section in "${required_sections[@]}"; do
    if ! grep -qF "$section" foundation.md; then
      echo "foundation.md missing required section: $section" >&2
      missing=1
    fi
  done
fi

if [[ $missing -ne 0 ]]; then
  echo "foundation contract check FAILED" >&2
  exit 1
fi

echo "foundation contract check OK"
