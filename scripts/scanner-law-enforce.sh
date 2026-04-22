#!/usr/bin/env bash
# scanner-law-enforce.sh — Nauion LAW compliance scanner
#
# Scope: Băng (Chị Tư) · maintain_scanners authority
# Purpose: Enforce LAW-1..4 + §14.4 Fake Routing trong src/core/nauion/resonance/
# Target: `src/core/nauion/resonance/*.ts` (Kim implementation area)
# Usage:
#   ./scanner-law-enforce.sh [--path <dir>] [--strict] [--json]
# Exit codes:
#   0 = clean
#   1 = LAW violations found
#   2 = scanner error (missing tools, bad path)
#
# Ngày: 2026-04-22
# Causation: SCANNER-LAW-ENFORCE-v0.1
# Co-ship: SPEC_NAUION_RESONANCE_ENGINE_v0.1.md §9 Acceptance criteria

set -euo pipefail

# ─── Config ──────────────────────────────────────────────────────────
DEFAULT_PATH="src/core/nauion/resonance"
STRICT_MODE=0
JSON_OUTPUT=0
TARGET_PATH=""

# ─── Parse args ──────────────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case "$1" in
    --path)   TARGET_PATH="$2"; shift 2 ;;
    --strict) STRICT_MODE=1; shift ;;
    --json)   JSON_OUTPUT=1; shift ;;
    --help|-h)
      sed -n '2,14p' "$0"; exit 0 ;;
    *) echo "Unknown arg: $1" >&2; exit 2 ;;
  esac
done

TARGET_PATH="${TARGET_PATH:-$DEFAULT_PATH}"

if [[ ! -d "$TARGET_PATH" ]]; then
  echo "ERROR: target path not found: $TARGET_PATH" >&2
  exit 2
fi

# ─── Tooling check ───────────────────────────────────────────────────
for cmd in grep awk find wc; do
  command -v "$cmd" >/dev/null 2>&1 || {
    echo "ERROR: required tool missing: $cmd" >&2
    exit 2
  }
done

# ─── Violation accumulator ───────────────────────────────────────────
declare -a VIOLATIONS=()
VIOLATION_COUNT=0

record_violation() {
  local rule="$1"
  local file="$2"
  local line="$3"
  local snippet="$4"
  local severity="$5"  # BLOCK | WARN
  VIOLATIONS+=("${rule}|${severity}|${file}|${line}|${snippet}")
  ((VIOLATION_COUNT++)) || true
}

# ─── Rule definitions ────────────────────────────────────────────────
# Each rule is: a regex + a rule id + severity + description
# Rules derived from SPEC_NAUION_RESONANCE_ENGINE_v0.1 §0 LAW COMPLIANCE + §9

# LAW-2: No if/else routing on signal type/suffix/kind
check_law2_if_routing() {
  local rule="LAW-2-IF-ROUTE"
  local pattern='if[[:space:]]*\([^)]*signal\.(type|suffix|kind|category)[^)]*\)'
  while IFS=: read -r file line match; do
    record_violation "$rule" "$file" "$line" "$match" "BLOCK"
  done < <(grep -rEn "$pattern" "$TARGET_PATH" --include="*.ts" 2>/dev/null || true)
}

# LAW-2: No switch on signal type
check_law2_switch_routing() {
  local rule="LAW-2-SWITCH-ROUTE"
  local pattern='switch[[:space:]]*\([^)]*signal\.(type|suffix|kind|category)[^)]*\)'
  while IFS=: read -r file line match; do
    record_violation "$rule" "$file" "$line" "$match" "BLOCK"
  done < <(grep -rEn "$pattern" "$TARGET_PATH" --include="*.ts" 2>/dev/null || true)
}

# §14.4: No dispatch table literal (suffix → handler)
check_p144_dispatch_table() {
  local rule="P14.4-DISPATCH-TABLE"
  # Look for object literals that map string suffixes to functions/handlers
  # Heuristic: {".xxx": fn} or ["xxx"]: handler patterns
  local pattern='(routeTable|dispatchTable|handlerMap|suffixMap)[[:space:]]*[:=]'
  while IFS=: read -r file line match; do
    record_violation "$rule" "$file" "$line" "$match" "BLOCK"
  done < <(grep -rEn "$pattern" "$TARGET_PATH" --include="*.ts" 2>/dev/null || true)
}

# §14.4: No suffix-keyed literal maps
check_p144_suffix_literal() {
  local rule="P14.4-SUFFIX-LITERAL-MAP"
  # Matches: {".anc": ..., ".si": ...} style — quoted dotted keys in object
  local pattern='\{[[:space:]]*["'"'"']\.[a-z]+["'"'"'][[:space:]]*:'
  while IFS=: read -r file line match; do
    record_violation "$rule" "$file" "$line" "$match" "BLOCK"
  done < <(grep -rEn "$pattern" "$TARGET_PATH" --include="*.ts" 2>/dev/null || true)
}

# LAW-4: No hardcoded VALID_* / ALLOWED_* suffix lists
check_law4_whitelist() {
  local rule="LAW-4-HARDCODED-WHITELIST"
  local pattern='(VALID|ALLOWED|ACCEPTED|KNOWN)_(SUFFIXES|TYPES|KINDS)[[:space:]]*[:=]'
  while IFS=: read -r file line match; do
    record_violation "$rule" "$file" "$line" "$match" "BLOCK"
  done < <(grep -rEn "$pattern" "$TARGET_PATH" --include="*.ts" 2>/dev/null || true)
}

# LAW-3: No side effects in engine (heuristic — Date.now / Math.random / fs.)
check_law3_purity() {
  local rule="LAW-3-IMPURE-ENGINE"
  local engine_files
  engine_files=$(find "$TARGET_PATH" -name "resonance.engine.ts" -o -name "field-pull.ts" 2>/dev/null || true)
  [[ -z "$engine_files" ]] && return 0
  for file in $engine_files; do
    # Date.now / Math.random / fs.* inside pure engine = impurity
    while IFS=: read -r line match; do
      record_violation "$rule" "$file" "$line" "$match" "BLOCK"
    done < <(grep -En '(Date\.now|Math\.random|fs\.(read|write|stat))' "$file" 2>/dev/null || true)
  done
}

# Magic number check: numeric literals outside EngineConstants context
check_magic_numbers() {
  local rule="CONST-INJECTION"
  local engine_files
  engine_files=$(find "$TARGET_PATH" -name "*.ts" 2>/dev/null || true)
  [[ -z "$engine_files" ]] && return 0
  for file in $engine_files; do
    # Look for thresholds / coefficients as literals in expressions
    # Heuristic: comparisons against numeric literal > 0.01 that's not 0, 1, -1
    while IFS=: read -r line match; do
      # Skip if the match line contains "const" (named constant)
      # Skip if 0, 1, -1, or simple integers like indices
      if echo "$match" | grep -qE '(0\.[0-9]+|[2-9][0-9]*\.[0-9]+)' \
         && ! echo "$match" | grep -qE '(const|// ?test|test\()'; then
        record_violation "$rule" "$file" "$line" "$match" "WARN"
      fi
    done < <(grep -En '[<>=!]=?[[:space:]]*[0-9]+\.[0-9]+' "$file" 2>/dev/null || true)
  done
}

# TypeScript hygiene: no @ts-nocheck, no 'any' in resonance area
check_ts_hygiene() {
  local rule="TS-STRICT"
  while IFS=: read -r file line match; do
    record_violation "$rule" "$file" "$line" "$match" "BLOCK"
  done < <(grep -rEn '@ts-nocheck' "$TARGET_PATH" --include="*.ts" 2>/dev/null || true)
  while IFS=: read -r file line match; do
    record_violation "$rule" "$file" "$line" "$match" "WARN"
  done < <(grep -rEn ':[[:space:]]*any(\b|\[\])' "$TARGET_PATH" --include="*.ts" 2>/dev/null | grep -v '// *eslint-disable' || true)
}

# ─── Run checks ──────────────────────────────────────────────────────
echo "🔍 scanner-law-enforce.sh — target: $TARGET_PATH"
echo ""

check_law2_if_routing
check_law2_switch_routing
check_p144_dispatch_table
check_p144_suffix_literal
check_law4_whitelist
check_law3_purity
check_magic_numbers
check_ts_hygiene

# ─── Report ──────────────────────────────────────────────────────────
BLOCK_COUNT=0
WARN_COUNT=0
for v in "${VIOLATIONS[@]:-}"; do
  [[ -z "$v" ]] && continue
  IFS='|' read -r rule sev file line snippet <<< "$v"
  [[ "$sev" == "BLOCK" ]] && ((BLOCK_COUNT++)) || ((WARN_COUNT++))
done

if [[ "$JSON_OUTPUT" -eq 1 ]]; then
  # JSON output
  printf '{\n'
  printf '  "target": "%s",\n' "$TARGET_PATH"
  printf '  "total_violations": %d,\n' "$VIOLATION_COUNT"
  printf '  "block_count": %d,\n' "$BLOCK_COUNT"
  printf '  "warn_count": %d,\n' "$WARN_COUNT"
  printf '  "violations": [\n'
  first=1
  for v in "${VIOLATIONS[@]:-}"; do
    [[ -z "$v" ]] && continue
    IFS='|' read -r rule sev file line snippet <<< "$v"
    [[ "$first" -eq 1 ]] && first=0 || printf ',\n'
    # Escape quotes in snippet
    snippet_esc=$(printf '%s' "$snippet" | sed 's/\\/\\\\/g; s/"/\\"/g')
    printf '    {"rule":"%s","severity":"%s","file":"%s","line":"%s","snippet":"%s"}' \
      "$rule" "$sev" "$file" "$line" "$snippet_esc"
  done
  printf '\n  ]\n}\n'
else
  # Human-readable output
  if [[ "$VIOLATION_COUNT" -eq 0 ]]; then
    echo "✅ LAW compliance: CLEAN"
    echo "   No violations in $TARGET_PATH"
  else
    echo "🚨 LAW compliance: $VIOLATION_COUNT violation(s)"
    echo "   BLOCK: $BLOCK_COUNT  |  WARN: $WARN_COUNT"
    echo ""
    for v in "${VIOLATIONS[@]:-}"; do
      [[ -z "$v" ]] && continue
      IFS='|' read -r rule sev file line snippet <<< "$v"
      printf "  [%s] %s\n    %s:%s\n    > %s\n\n" \
        "$sev" "$rule" "$file" "$line" "$snippet"
    done
  fi
fi

# ─── Exit code logic ─────────────────────────────────────────────────
if [[ "$BLOCK_COUNT" -gt 0 ]]; then
  exit 1
fi

if [[ "$STRICT_MODE" -eq 1 ]] && [[ "$WARN_COUNT" -gt 0 ]]; then
  exit 1
fi

exit 0
