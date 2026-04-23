#!/bin/bash
# run_baseline_scanners.sh
#
# Gatekeeper run script — capture W0 baseline stdout từ 2 scanners em vừa ship.
# Output stdout-only per SCANNER OUTPUT RULE (không ghi file repo).
#
# Drafter: Băng (Chị Tư)
# Session: 20260423
# Scope: W1 exit criteria baseline — verify repo state trước promote W1
#
# USAGE:
#   cd <repo_root>
#   bash run_baseline_scanners.sh
#
# Nếu anh muốn save output: copy-paste từ terminal, KHÔNG redirect vào repo file
# (per SCANNER OUTPUT RULE 20260423).

set +e  # scanners return non-zero khi fail — em muốn chạy cả 2

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null)" || {
  echo "[FAIL] Không trong git repo."
  exit 1
}

cd "$REPO_ROOT"

SCANNER1="scripts/validate-state-labels.py"
SCANNER2="scripts/validate-extension-precedence.py"

# Verify scanners exist
for s in "$SCANNER1" "$SCANNER2"; do
  if [ ! -x "$s" ]; then
    if [ -f "$s" ]; then
      echo "[INFO] chmod +x $s"
      chmod +x "$s"
    else
      echo "[FAIL] Scanner missing: $s"
      exit 1
    fi
  fi
done

echo "########################################"
echo "# W0 BASELINE SCANNER RUN"
echo "# Session: 20260423"
echo "# Repo HEAD: $(git rev-parse --short HEAD)"
echo "# Branch: $(git rev-parse --abbrev-ref HEAD)"
echo "# Date: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "########################################"
echo ""

echo "========================================"
echo "SCANNER 1: validate-state-labels.py"
echo "Binding: Kim SPEC_CUTOVER_STATES v1.0 §3"
echo "========================================"
python3 "$SCANNER1"
EXIT1=$?
echo ""
echo "[Scanner 1 exit code: $EXIT1]"
echo ""

echo "========================================"
echo "SCANNER 2: validate-extension-precedence.py"
echo "Binding: Kim SPEC_EXTENSION_PRECEDENCE v1.0"
echo "========================================"
python3 "$SCANNER2"
EXIT2=$?
echo ""
echo "[Scanner 2 exit code: $EXIT2]"
echo ""

echo "########################################"
echo "# BASELINE SUMMARY"
echo "########################################"
echo "Scanner 1 (state-labels):        exit $EXIT1"
echo "Scanner 2 (extension-precedence): exit $EXIT2"
echo ""

if [ $EXIT1 -eq 0 ] && [ $EXIT2 -eq 0 ]; then
  echo "STATUS: PASS — cả 2 scanner clean"
  echo "W1 exit criteria gate: READY (state + precedence compliance)"
  exit 0
else
  echo "STATUS: FAIL — có issues"
  echo ""
  echo "Expected W0 baseline issues (per README_BANG_SCANNERS_W1.md §3):"
  echo "  - S1 cells (observation + quantum-defense) thiếu .khai canonical"
  echo "  - S2 pairs audit-cell + khai-cell chưa apply @headers"
  echo "  - nattos.sh §40 bypass (file-extension-validator.ts direct tsx call)"
  echo ""
  echo "Next: apply PILOT_BRIDGE_MAP v0.1 cell-by-cell (assignee TBD)"
  exit 1
fi
