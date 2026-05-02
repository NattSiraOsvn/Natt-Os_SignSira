#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# nauion_commit.sh
# Commit migration ss20260430 theo SiraWat convention v0.1
# Drafter: Băng — Chị Tư · Obikeeper
#
# CÁCH CHẠY: bash nauion_commit.sh   (sau khi nauion_apply.sh xong)
# ═══════════════════════════════════════════════════════════════

set -e

# Pre-flight
[[ ! -f "tsconfig.json" ]] && { echo "❌ Không phải root repo"; exit 1; }
[[ ! -d "src/ui-app/nauion/components" ]] && { echo "❌ Chưa apply — chạy nauion_apply.sh trước"; exit 1; }

# Add
git add src/ui-app/nauion/components/ src/ui-app/nauion/engines/

# Verify staged count
STAGED=$(git diff --cached --name-only | wc -l | tr -d ' ')
echo "▸ Staged: ${STAGED} file"

if [[ "${STAGED}" -lt 187 ]]; then
  echo "❌ Staged ít hơn 187 (110+77). DỪNG."
  echo "   anh chạy: git diff --cached --stat"
  exit 1
fi

# Commit
git commit -F - <<'COMMIT_MSG'
ui(nauion): migrate 110 tsx + sinh 77 engine skeleton — close lưới đánh cá

Sirawat-From: bang-chi-tu-obikeeper
Sirawat-To: kim-chief-system-builder
Scope: src/ui-app/nauion/{components,engines}
Ground-Truth:
  - migration_output_ss20260430/REPORT.md
  - migration_output_ss20260430/rejected_jsx_in_ts/ (69 file evidence)
  - migration_output_ss20260430/rejected_orphan/ (2 file evidence)
Next-Signal: kim fill engine skeleton + wire HeyNa SSE per memory #18

Boundary: KHONG dong nattos-server/ (server khach Tam Luxury).
Do-Not: commit rejected_*/ — do la Thien rename .tsx->.ts ma khong refactor,
  TSC poison neu commit (69 file chua import React + JSX trong .ts).
Decision: tach 2 thanh phan THIEN_NEW — giu 403 backbone Nauion legit
  (da co repo, khong duplicate), reject 69 jsx-in-ts.

Refs:
  - memory #18 NHA_MINH_VS_KHACH ss20260427
  - memory #19 ARCHITECTURE_CANONICAL ss20260426
  - obikeeper rule #1 (ss20260427): dictionary first
  - sirawat commit convention v0.1 (ratify ss20260429)
COMMIT_MSG

echo ""
echo "✅ COMMIT DONE"
echo ""
git log -1 --stat
