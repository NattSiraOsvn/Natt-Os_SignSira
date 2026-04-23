#!/usr/bin/env bash
#
# sweep-spec-md-to-na.sh v2 — Sweep TIER 1 spec files .md → .na + cross-ref patch
#
# v2 FIX (SCAR-20260425-GIT-GREP-QUOTE-UNICODE-NFD):
#   v1 dùng pipeline `echo "$ref_files" | while read ref_file` — FAIL với
#   filename có space + Unicode NFD (macOS HFS/APFS) vì git grep -l wrap
#   filename trong "..." khi gặp special char. v2 dùng git grep -z
#   null-separator + bash read -d '' để raw bytes filename truyền đúng vào sed.
#
# Scope: docs/specs/ canonical spec files (16 files TIER 1 chốt phiên 20260425).
# Rule: rename + cross-reference patch phải đi cùng 1 commit (Commit 2B).
# Bash 3.2 compat (macOS default).
#
# Usage:
#   ./scripts/sweep-spec-md-to-na.sh --dry-run      # (default) preflight + plan + scan
#   ./scripts/sweep-spec-md-to-na.sh --scan-refs    # cross-ref scan only
#   ./scripts/sweep-spec-md-to-na.sh --execute      # rename + patch + verify
#
# Derived from directives:
#   - Anh Natt + anh Thiên Lớn 20260425 (Path A Commit 2A/2B)
#   - KHAI-20260425-02 extension by genre + phase
#   - KHAI-20260425-03 convention đang thắng, không invent
#   - KHAI-20260425-04 defer file-phase ≠ defer reference integrity
#   - SCAR-20260425-GIT-GREP-QUOTE-UNICODE-NFD (v1 fail → v2 remedy)
#   - SCAR-20260424-RUNTIME-MISMATCH-BASH3.2 (bash 3.2 compat)
#   - SCAR-20260424-LAYER-DRIFT-03 (pre-flight git ls-files)

set -euo pipefail

# ============================================================================
# TIER 1 hardcoded list — chốt phiên 20260425 (16 file)
# ============================================================================
TIER1_FILES=(
  "docs/specs/0-BOOT-FAMILY-MAP.na"
  "docs/specs/COLOR_SIRASIGN.na"
  "docs/specs/NATT-OS_SATELLITE_COLONY_SPEC.na"
  "docs/specs/NATT_OS_FILE_EXTENSIONS_SPEC_v0.1.na"
  "docs/specs/QIINT-DINH-NGHIA-CHINH-THUC.na"
  "docs/specs/SPEC_DUOI_FILE_v0.2_4TANG.na"
  "docs/specs/SPEC_DUOI_FILE_v0.3_FINAL.na"
  "docs/specs/SPEC_NATT_FORMAT_v0.3_FINAL.na"
  "docs/specs/SPEC_NEN_v1.1_TONG_HOP_20260418.na"
  "docs/specs/SPEC_Nauion_Render_Stack_v0.1.na"
  "docs/specs/SPEC_ONG_MAU_v0.1.na"
  "docs/specs/THIENBANG_MAPPING_v1_canonical_answers.na"
  "docs/specs/phase5-resonance-protocol.na"
  "docs/specs/uei_architecture_spec_20260309.na"
  "docs/specs/uei_runtime_spec_20260309.na"
  "docs/specs/Vision/VISION_ENGINE_SPEC_FINAL.na"
)

# Pathspec exclude — historical / vết hằn / archived
EXCLUDE_PATHS=(
  ':!*_deprecated/*'
  ':!src/governance/memory/*'
  ':!*.obitan'
)

MODE="${1:---dry-run}"

# ============================================================================
# Pre-flight: verify each TIER 1 file tracked + present + target clear
# ============================================================================
preflight() {
  echo "=== PRE-FLIGHT CHECK ==="
  local errors=0
  local i=0
  while [ $i -lt ${#TIER1_FILES[@]} ]; do
    local f="${TIER1_FILES[$i]}"
    local target="${f%.md}.na"

    if ! git ls-files --error-unmatch "$f" > /dev/null 2>&1; then
      echo "  FAIL  $f (not tracked by git)"
      errors=$((errors+1))
    elif [ ! -f "$f" ]; then
      echo "  FAIL  $f (tracked but missing on disk)"
      errors=$((errors+1))
    elif [ -e "$target" ]; then
      echo "  FAIL  $target (target already exists — collision)"
      errors=$((errors+1))
    else
      echo "  OK    $f"
    fi
    i=$((i+1))
  done

  if [ $errors -gt 0 ]; then
    echo ""
    echo "STOP: $errors pre-flight error(s). Aborting."
    exit 1
  fi
  echo ""
  echo "Pre-flight PASS: ${#TIER1_FILES[@]} files tracked, present, target clear."
}

# ============================================================================
# Rename plan
# ============================================================================
plan() {
  echo ""
  echo "=== RENAME PLAN (${#TIER1_FILES[@]} files) ==="
  local i=0
  while [ $i -lt ${#TIER1_FILES[@]} ]; do
    local f="${TIER1_FILES[$i]}"
    local new="${f%.md}.na"
    echo "  git mv $f $new"
    i=$((i+1))
  done
}

# ============================================================================
# Cross-reference scan — display-only (filename w/ unicode may show escaped)
# ============================================================================
scan_refs() {
  echo ""
  echo "=== CROSS-REFERENCE SCAN ==="
  echo "Searching tracked files for references to TIER 1 .md basenames."
  echo "Excluded: _deprecated/ · src/governance/memory/ · *.obitan"
  echo ""

  local total=0
  local files_with_refs=0
  local i=0
  while [ $i -lt ${#TIER1_FILES[@]} ]; do
    local f="${TIER1_FILES[$i]}"
    local basename_md
    basename_md=$(basename "$f")

    local hits
    hits=$(git grep -Fn "$basename_md" -- "${EXCLUDE_PATHS[@]}" 2>/dev/null | grep -v "^$f:" || true)

    if [ -n "$hits" ]; then
      local count
      count=$(printf '%s\n' "$hits" | wc -l | tr -d ' ')
      echo "--- $basename_md ($count external ref(s)) ---"
      printf '%s\n' "$hits"
      echo ""
      total=$((total + count))
      files_with_refs=$((files_with_refs+1))
    fi
    i=$((i+1))
  done

  echo "=== SCAN SUMMARY ==="
  echo "  TIER 1 files with external refs: $files_with_refs / ${#TIER1_FILES[@]}"
  echo "  Total external references:      $total"
  if [ $total -eq 0 ]; then
    echo "  No external refs."
  else
    echo "  External refs present — Commit 2B MUST include ref patches."
  fi
}

# ============================================================================
# Execute: rename + ref patch (v2 NUL-safe via -z + read -d '')
# ============================================================================
execute() {
  echo ""
  echo "=== EXECUTE RENAME ==="
  local i=0
  while [ $i -lt ${#TIER1_FILES[@]} ]; do
    local f="${TIER1_FILES[$i]}"
    local new="${f%.md}.na"
    git mv "$f" "$new"
    echo "  $f -> $new"
    i=$((i+1))
  done

  echo ""
  echo "=== EXECUTE REF PATCH (NUL-safe) ==="
  i=0
  while [ $i -lt ${#TIER1_FILES[@]} ]; do
    local f="${TIER1_FILES[$i]}"
    local old_basename
    old_basename=$(basename "$f")
    local new_basename="${old_basename%.md}.na"

    # Escape dots for sed BRE
    local old_escaped
    old_escaped=$(printf '%s' "$old_basename" | sed 's|\.|\\.|g')

    # v2 FIX: git grep -z = NUL-terminated filename output (raw bytes, no quote).
    # bash 3.2 supports read -d '' to split on NUL.
    # Process substitution < <(...) keeps counter variable in parent scope.
    local patched_count=0
    while IFS= read -r -d '' ref_file; do
      [ -z "$ref_file" ] && continue
      sed -i '' "s|${old_escaped}|${new_basename}|g" "$ref_file"
      echo "  patched: $ref_file  ($old_basename -> $new_basename)"
      patched_count=$((patched_count+1))
    done < <(git grep -z -Fl "$old_basename" -- "${EXCLUDE_PATHS[@]}" 2>/dev/null || true)

    if [ $patched_count -eq 0 ]; then
      echo "  (no refs: $old_basename)"
    fi
    i=$((i+1))
  done

  echo ""
  echo "=== POST-EXECUTE GIT STATUS ==="
  git status --short

  echo ""
  echo "=== VERIFY NO STALE REFS ==="
  local remaining=0
  i=0
  while [ $i -lt ${#TIER1_FILES[@]} ]; do
    local f="${TIER1_FILES[$i]}"
    local old_basename
    old_basename=$(basename "$f")

    local hit_count=0
    while IFS= read -r -d '' _h; do
      hit_count=$((hit_count+1))
    done < <(git grep -z -Fl "$old_basename" -- "${EXCLUDE_PATHS[@]}" 2>/dev/null || true)

    if [ $hit_count -gt 0 ]; then
      echo "  STILL REFERENCED: $old_basename ($hit_count file(s))"
      remaining=$((remaining+1))
    fi
    i=$((i+1))
  done

  if [ $remaining -eq 0 ]; then
    echo "  Clean — no stale refs to old .md basenames."
  else
    echo ""
    echo "WARNING: $remaining TIER 1 basename(s) still referenced. Review before commit."
  fi
}

# ============================================================================
# Dispatch
# ============================================================================
case "$MODE" in
  --dry-run)
    preflight
    plan
    scan_refs
    echo ""
    echo "=== DRY RUN COMPLETE ==="
    echo "No changes made. To execute sweep: $0 --execute"
    ;;
  --scan-refs)
    preflight
    scan_refs
    ;;
  --execute)
    preflight
    plan
    scan_refs
    echo ""
    echo "=== PROCEEDING TO EXECUTE ==="
    execute
    echo ""
    echo "=== EXECUTE COMPLETE ==="
    echo "Review 'git status --short' above. If clean → commit 2B."
    ;;
  *)
    echo "Usage: $0 [--dry-run|--scan-refs|--execute]" >&2
    exit 1
    ;;
esac
