#!/usr/bin/env bash
set -euo pipefail

file="${1:-}"
if [ -z "$file" ] || [ ! -f "$file" ]; then
  echo "usage: tools/sirasign_lineage.sh <file>" >&2
  exit 2
fi

sha="$(shasum -a 256 "$file" | awk '{print $1}')"
bytes="$(wc -c < "$file" | tr -d ' ')"
lines="$(wc -l < "$file" | tr -d ' ')"

echo "@sirasign-lineage v0.1"
echo "file: $file"
echo "sha256: $sha"
echo "bytes: $bytes"
echo "lines: $lines"
echo "state: measured"
