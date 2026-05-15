#!/usr/bin/env python3
"""Anonymize interview transcripts via a CSV find/replace mapping.

Usage:
    python3 scripts/anonymize_transcript.py \
        --input  interviews/raw/2026-05-28-p1/transcript.txt \
        --names  interviews/raw/2026-05-28-p1/names.csv \
        --output interviews/redacted/2026-05-28-p1.txt

The names file is a 2-column CSV (header row required):

    original,replacement
    John Smith,Participant A
    @jsmith,@redacted
    acme.com,[company redacted]

Matching rules:
- Whole-word matches only (no mid-word substring hits, so "John" won't redact
  "Johnson"). Word-boundary regex uses \\b on both sides.
- Case-insensitive by default; pass --case-sensitive to disable.
- Longer originals are replaced first so "John Smith" wins over "John" when
  both are in the mapping.
- Replacement is literal text (no regex special-char interpretation).

Failure modes:
- Empty original column -> the row is skipped with a stderr warning.
- A redaction term that never matches -> stderr warning with the count.
  (Lets you catch typos in the names.csv before attaching to the report.)
"""
from __future__ import annotations

import argparse
import csv
import re
import sys
from pathlib import Path


def load_mapping(names_path: Path) -> list[tuple[str, str]]:
    pairs: list[tuple[str, str]] = []
    with names_path.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        if reader.fieldnames is None or "original" not in reader.fieldnames or "replacement" not in reader.fieldnames:
            sys.exit(f"error: {names_path} must have header columns 'original,replacement'")
        for row_idx, row in enumerate(reader, start=2):
            original = (row.get("original") or "").strip()
            replacement = (row.get("replacement") or "").strip()
            if not original:
                print(f"warn: row {row_idx} has empty 'original' — skipped", file=sys.stderr)
                continue
            pairs.append((original, replacement))
    pairs.sort(key=lambda p: len(p[0]), reverse=True)
    return pairs


def anonymize(text: str, mapping: list[tuple[str, str]], case_sensitive: bool) -> tuple[str, dict[str, int]]:
    counts: dict[str, int] = {}
    flags = 0 if case_sensitive else re.IGNORECASE
    for original, replacement in mapping:
        pattern = r"(?<!\w)" + re.escape(original) + r"(?!\w)"
        new_text, n = re.subn(pattern, lambda _m, r=replacement: r, text, flags=flags)
        counts[original] = n
        text = new_text
    return text, counts


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Redact names/handles from interview transcripts.")
    parser.add_argument("--input", required=True, type=Path, help="Path to raw transcript (.txt).")
    parser.add_argument("--names", required=True, type=Path, help="Path to names.csv (original,replacement).")
    parser.add_argument("--output", required=True, type=Path, help="Path to write anonymized transcript.")
    parser.add_argument("--case-sensitive", action="store_true", help="Match exactly (default: case-insensitive).")
    args = parser.parse_args(argv)

    if not args.input.exists():
        sys.exit(f"error: input not found: {args.input}")
    if not args.names.exists():
        sys.exit(f"error: names file not found: {args.names}")

    mapping = load_mapping(args.names)
    if not mapping:
        sys.exit("error: names.csv contained no usable rows")

    text = args.input.read_text(encoding="utf-8")
    redacted, counts = anonymize(text, mapping, args.case_sensitive)

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(redacted, encoding="utf-8")

    total = sum(counts.values())
    print(f"wrote {args.output} — {total} replacements across {len(mapping)} terms")
    misses = [orig for orig, n in counts.items() if n == 0]
    if misses:
        print(f"warn: {len(misses)} term(s) never matched: {', '.join(misses)}", file=sys.stderr)
        print("      (typo in names.csv? case mismatch? wrong source file?)", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
