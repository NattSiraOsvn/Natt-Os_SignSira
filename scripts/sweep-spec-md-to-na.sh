#!/usr/bin/env bash
#
# sweep-spec-md-to-na.sh — Sweep TIER 1 spec files .md → .na + cross-ref patch
#
# Scope: docs/specs/ canonical spec files (16 files TIER 1 chốt phiên 20260425).
# Rule: rename + cross-reference patch phải đi cùng 1 commit (Commit 2B).
# Bash 3.2 compat (macOS default).
#
# Usage:
#   ./scripts/sweep-spec-md-to-na.sh --dry-run      # (default) preflight + plan + scan, no changes
#   ./scripts/sweep-spec-md-to-na.sh --scan-refs    # cross-ref scan only
#   ./scripts/sweep-spec-md-to-na.sh --execute      # preflight + rename + ref patch + verify
#
# Derived from directives:
#   - Anh Natt + anh Thiên Lớn 20260425 (Path A Commit 2A/2B)
#   - KHAI-20260425-02 extension by genre + phase
#   - KHAI-20260425-03 convention đang thắng, không invent
#   - SCAR-20260424-RUNTIME-MISMATCH-BASH3.2 (bash 3.2 compat, no mapfile)
#   - SCAR-20260424-LAYER-DRIFT-03 (pre-flight git ls-files check)
#   - SCAR-20260424-EP-07 (macOS NFC/NFD awareness)
#   - Scanner output rule 20260423 (stdout only, no file writes to repo)
#
# Output: stdout only. No temp files. No repo artifacts written by this script.

set -euo pipefail

# ============================================================================
# TIER 1 hardcoded list — chốt phiên 20260425 Thiên Lớn + Natt (16 file)
#
# EXCLUDED from this sweep (defer to future phases):
#   - 5 nauion/SPEC-Nauion_main_v2.1..v2.5.md (vocab_cleanup_followup defer)
#   - 2 awkward: SPEC_NGON_NGU_NATT-OS_v1.2_NA.md, satellite/satellite-colony.spec.md
#   - MACH_HEYNA_FULL_20260416.md (migration evidence/history)
#   - 4 risk-high (SHTT, Session_Handoff, TamLuxury_CellRegistry, GROUND-TRUTH-REPORT)
#   - 3 message/brief (BRIEF, MESSAGE_TO_KIM, REPLY_TO_KIM)
#   - 6 roadloading/*.md (defer TASK-I phase)
#   - 3 finance/governance (domain scope)
#   - 2 business/inventory-cell/*.md (domain scope)
# ============================================================================
TIER1_FILES=(
  "docs/specs/0-BOOT-FAMILY-MAP.md"
  "docs/specs/COLOR_SIRASIGN.md"
  "docs/specs/NATT-OS_SATELLITE_COLONY_SPEC.md"
  "docs/specs/NATT_OS_FILE_EXTENSIONS_SPEC_v0.1.md"
  "docs/specs/QIINT-DINH-NGHIA-CHINH-THUC.md"
  "docs/specs/SPEC_DUOI_FILE_v0.2_4TANG.md"
  "docs/specs/SPEC_DUOI_FILE_v0.3_FINAL.md"
  "docs/specs/SPEC_NATT_FORMAT_v0.3_FINAL.md"
  "docs/specs/SPEC_NEN_v1.1_TONG_HOP_20260418.md"
  "docs/specs/SPEC_Nauion_Render_Stack_v0.1.md"
  "docs/specs/SPEC_ONG_MAU_v0.1.md"
  "docs/specs/THIENBANG_MAPPING_v1_canonical_answers.md"
  "docs/specs/phase5-resonance-protocol.md"
  "docs/specs/uei_architecture_spec_20260309.md"
  "docs/specs/uei_runtime_spec_20260309.md"
  "docs/specs/Vision/VISION_ENGINE_SPEC_FINAL.md"
)

# Pathspec exclude — historical / vết hằn / archived (không mutate)
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
# Rename plan: print proposed git mv operations
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
# Cross-reference scan — stdout report only, no changes
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

    # git grep -F fixed string, -n line numbers
    # Exclude self-file to avoid noise (self-ref is patched automatically on rename)
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
    echo "  No external refs. Rename-only commit safe."
  else
    echo "  External refs present — Commit 2B MUST include ref patches."
  fi
}

# ============================================================================
# Execute: rename + ref patch (all in one sweep, ready for Commit 2B)
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
  echo "=== EXECUTE REF PATCH ==="
  i=0
  while [ $i -lt ${#TIER1_FILES[@]} ]; do
    local f="${TIER1_FILES[$i]}"
    local old_basename
    old_basename=$(basename "$f")
    local new_basename="${old_basename%.md}.na"

    # Escape dots in basename for sed pattern (basic regex metachar)
    local old_escaped
    old_escaped=$(printf '%s' "$old_basename" | sed 's|\.|\\.|g')

    # Find all tracked files still containing the old basename (after rename)
    # This picks up self-refs inside the just-renamed file too (correct behavior).
    local ref_files
    ref_files=$(git grep -Fl "$old_basename" -- "${EXCLUDE_PATHS[@]}" 2>/dev/null || true)

    if [ -n "$ref_files" ]; then
      printf '%s\n' "$ref_files" | while IFS= read -r ref_file; do
        [ -z "$ref_file" ] && continue
        sed -i '' "s|${old_escaped}|${new_basename}|g" "$ref_file"
        echo "  patched: $ref_file  ($old_basename -> $new_basename)"
      done
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
    local hits
    hits=$(git grep -Fl "$old_basename" -- "${EXCLUDE_PATHS[@]}" 2>/dev/null || true)
    if [ -n "$hits" ]; then
      echo "  STILL REFERENCED: $old_basename in:"
      printf '%s\n' "$hits" | sed 's|^|    |'
      remaining=$((remaining+1))
    fi
    i=$((i+1))
  done

  if [ $remaining -eq 0 ]; then
    echo "  Clean — no stale refs to old .md basenames."
  else
    echo ""
    echo "WARNING: $remaining TIER 1 basename(s) still referenced somewhere."
    echo "Likely in excluded paths (_deprecated / memory / obitan). Review before commit."
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
    echo "" >&2
    echo "  --dry-run    (default) preflight + plan + ref scan, no changes" >&2
    echo "  --scan-refs  cross-reference scan only" >&2
    echo "  --execute    preflight + rename + ref patch + verify" >&2
    exit 1
    ;;
esac
