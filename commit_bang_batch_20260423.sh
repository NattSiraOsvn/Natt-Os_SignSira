#!/bin/bash
# commit_bang_batch_20260423.sh
#
# Gatekeeper run script — commit 5 files batch W1 init (SPEC v1.0 + MAP + scanners + README)
#
# Drafter: Băng (Chị Tư)
# Session: 20260423
# Discipline: Băng draft, Gatekeeper execute (memory #20 re-emphasized 20260427)
#
# PRE-REQUISITE: Gatekeeper đã tải 5 files từ /mnt/user-data/outputs/ về repo:
#   docs/specs/spec_host_first_runtime_v1_0.na
#   docs/specs/pilot_bridge_map_v0_1.na
#   docs/specs/README_BANG_SCANNERS_W1.md
#   scripts/validate-state-labels.py
#   scripts/validate-extension-precedence.py
#
# USAGE:
#   cd <repo_root>
#   bash commit_bang_batch_20260423.sh
#
# Script KHÔNG auto-push. Anh decide push timing.

set -e

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null)" || {
  echo "[FAIL] Không trong git repo. cd <repo_root> trước khi chạy."
  exit 1
}

echo "=== commit_bang_batch_20260423.sh ==="
echo "Repo root: $REPO_ROOT"
echo ""

# Files expected (relative to repo root)
FILES=(
  "docs/specs/spec_host_first_runtime_v1_0.na"
  "docs/specs/pilot_bridge_map_v0_1.na"
  "docs/specs/README_BANG_SCANNERS_W1.md"
  "scripts/validate-state-labels.py"
  "scripts/validate-extension-precedence.py"
)

# Step 1: Verify files exist
echo "[Step 1] Verify files exist..."
missing=0
for f in "${FILES[@]}"; do
  if [ ! -f "$REPO_ROOT/$f" ]; then
    echo "  [MISSING] $f"
    missing=$((missing+1))
  else
    echo "  [OK] $f ($(wc -l < "$REPO_ROOT/$f") lines)"
  fi
done

if [ $missing -gt 0 ]; then
  echo ""
  echo "[FAIL] $missing file(s) missing. Tải từ /mnt/user-data/outputs/ về đúng path trước."
  exit 1
fi
echo ""

# Step 2: Pre-check gitignore (memory rule — always check before git add)
echo "[Step 2] git check-ignore pre-check..."
for f in "${FILES[@]}"; do
  ignored=$(cd "$REPO_ROOT" && git check-ignore -v "$f" 2>/dev/null) || true
  if [ -n "$ignored" ]; then
    echo "  [WARN] $f ignored by: $ignored"
    echo "         Anh decide: add -f hay update .gitignore"
  fi
done
echo ""

# Step 3: Make scanners executable
echo "[Step 3] chmod +x cho scanners..."
chmod +x "$REPO_ROOT/scripts/validate-state-labels.py"
chmod +x "$REPO_ROOT/scripts/validate-extension-precedence.py"
echo "  [OK] executable bit set"
echo ""

# Step 4: git add specific files (R06 — never git add .)
echo "[Step 4] git add specific files..."
cd "$REPO_ROOT"
for f in "${FILES[@]}"; do
  git add "$f"
  echo "  [ADDED] $f"
done
echo ""

# Step 5: git status show staged
echo "[Step 5] git status:"
git status --short
echo ""

# Step 6: Commit with message
echo "[Step 6] git commit..."
COMMIT_MSG=$(cat <<'EOF'
feat(wave1): SPEC_HOST_FIRST_RUNTIME v1.0 + PILOT_BRIDGE_MAP + W1 scanners

SPEC_HOST_FIRST_RUNTIME v1.0 — Host-first runtime map, 5 mốc W0-W4 cutover.
Aligned với 3 SPEC Kim đã lock (sira_authority_bootstrap + cutover_states +
extension_precedence) + BOI_SURFACE_DELTA v1.0 + RUNTIME_DEPENDENCY_CENSUS.
Incorporates Thiên Lớn redline (4 điểm sửa + 7 D locks hard-set).

PILOT_BRIDGE_MAP v0.1 — 4 kernel cells W3 scope provisional order:
  1. audit-cell/file-extension-validator (S2 → S3)
  2. khai-cell/file-persister (S2 → S3, blocked K2 Điều 7)
  3. observation-cell (S1 → S2)
  4. quantum-defense-cell (S1 → S2)
Business cells KHÔNG mở ở v0.1.

2 scanners W1 exit criteria:
  - validate-state-labels.py: Kim SPEC_CUTOVER_STATES §3 header compliance
  - validate-extension-precedence.py: Kim SPEC_EXTENSION_PRECEDENCE rules

Implementation assignee (Rust nauion-host scaffold) TBD per SPEC §6,
Gatekeeper/Thiên Lớn chốt.

Drafter: Băng · Chị Tư · session 20260423
Reviewer: Thiên Lớn (architecture review, redline incorporated)
Gatekeeper: Phan Thanh Thương
EOF
)

git commit -m "$COMMIT_MSG"
COMMIT_HASH=$(git rev-parse HEAD)
echo ""
echo "  [COMMITTED] $COMMIT_HASH"
echo ""

# Step 7: Show log
echo "[Step 7] git log recent:"
git log --oneline -5
echo ""

echo "=== DONE ==="
echo ""
echo "Next steps (Gatekeeper decide):"
echo "  1. bash run_baseline_scanners.sh  # capture W0 baseline stdout"
echo "  2. git push origin feat/p1.3-file-extension-validator  # khi ready"
echo "  3. Thiên Lớn chốt implementation assignee cho runtime/nauion-host/ scaffold"
