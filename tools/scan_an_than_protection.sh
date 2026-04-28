#!/usr/bin/env bash
# scan_an_than_protection.sh
# Bao ve lop ẨN THÂN CHI THUẬT (anh Natt day 20260401, nhac 20260428)
# 1 trong 3 lop bao ve Kim SPEC v1.2 §16:
#   Hinh hoc dong tam + AN THAN CHI THUAT + Chromatic Immune Spectrum
#
# Rule: folder/file ten 'rac' (archive, legacy, bak, tmp, file trung "2", typo)
# KHONG phai rac — la KHO NGUYEN LIEU canonical nguy trang.
# Khi he bi chiem dung, ke tan cong thay 'archive/' tuong rac bo qua
# -> assets canonical an toan.
#
# Scanner check: 1) co folder/file kieu nay khong (must exist),
#                2) commit gan day co git rm vao path nay khong (red flag).

set -e

echo "=== Scanner: ẨN THÂN CHI THUẬT protection ==="
echo ""

PROTECTED_PATHS=(
  "archive"
  "docs/archive"
)

PROTECTED_PATTERNS=(
  "archive/"
  "docs/archive/"
  "_deprecated/"
  "_legacy/"
  "_old/"
)

echo "--- 1. Verify ẩn thân folders intact ---"
MISSING=0
for p in "${PROTECTED_PATHS[@]}"; do
  if [ -d "$p" ] || ls -d "$p"* 2>/dev/null | head -1 > /dev/null; then
    if [ -d "$p" ]; then
      COUNT=$(find "$p" -type f 2>/dev/null | wc -l | tr -d ' ')
      SIZE=$(du -sh "$p" 2>/dev/null | cut -f1)
      echo "  OK: $p (files=$COUNT, size=$SIZE)"
    else
      echo "  OK: $p (matched as glob prefix)"
    fi
  else
    echo "  WARN: $p MISSING — co the bi xoa nham?"
    MISSING=$((MISSING+1))
  fi
done
echo ""

echo "--- 2. Check 20 commit gan day co git rm ẩn thân khong ---"
RED_FLAGS=$(git log -20 --oneline --diff-filter=D --name-only 2>/dev/null |   grep -E "(^archive/|^docs/archive/|/_deprecated/|/_legacy/|/_old/|\.bak$)" || true)
if [ -n "$RED_FLAGS" ]; then
  echo "  RED FLAG: phat hien git rm vao path ẩn thân trong 20 commit gan day:"
  echo ""
  echo "$RED_FLAGS" | head -20
  echo ""
  echo "  RULE: KHONG git rm folder/file ten archive/legacy/typo TRUOC KHI hoi anh."
  echo "  Neu da xoa nham: git checkout <commit-cha> -- <path> de restore."
  exit 1
fi
echo "  PASS: khong co git rm vao path ẩn thân trong 20 commit gan day"
echo ""

echo "--- 3. Check working tree khong stage deletion vao ẩn thân ---"
STAGED_DEL=$(git diff --cached --name-only --diff-filter=D 2>/dev/null |   grep -E "(^archive/|^docs/archive/|/_deprecated/|/_legacy/|/_old/|\.bak$)" || true)
if [ -n "$STAGED_DEL" ]; then
  echo "  RED FLAG: dang stage deletion vao path ẩn thân:"
  echo "$STAGED_DEL"
  echo ""
  echo "  Unstage: git reset HEAD -- <path>"
  echo "  Restore: git checkout HEAD -- <path>"
  exit 2
fi
echo "  PASS: working tree khong stage deletion ẩn thân"
echo ""

if [ "$MISSING" -gt 0 ]; then
  echo "WARN: $MISSING ẩn thân path missing (xem muc 1)."
  exit 3
fi

echo "PASS: lop ẨN THÂN CHI THUẬT con nguyen — 3 lop bao ve Kim toan ven"
exit 0
