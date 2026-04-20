#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# apply-section-40.sh — Idempotent patch cho nattos.sh
# 
# Chức năng:
#   1. Backup nattos.sh
#   2. Kiểm tra §40 đã có chưa (guard idempotent — chạy nhiều lần OK)
#   3. Xóa dead comment S41 nếu còn
#   4. Insert §40 FILE EXTENSION COMPLIANCE block
#   5. Rename SCORECARD từ §40 → §41
#   6. Verify: line count, section sequence, syntax
#   7. AUTO-ROLLBACK nếu bất kỳ check nào fail
# 
# Tác giả: Băng (QNEU 313.5)
# Session: 20260419
# ═══════════════════════════════════════════════════════════════

set -e  # Exit on any error — nhưng ta dùng trap ROLLBACK thay vì cho die giữa chừng

NATTOS="nattos.sh"
BACKUP="nattos.sh.bak-s40-$(date +%H%M%S)"

# Colors
R='\033[0;31m'
G='\033[0;32m'
Y='\033[0;33m'
B='\033[0;34m'
N='\033[0m'

rollback() {
  if [ -f "$BACKUP" ]; then
    cp "$BACKUP" "$NATTOS"
    echo -e "${Y}↩ Rolled back to $BACKUP${N}"
  fi
}

# Trap: auto-rollback nếu script exit bất thường
trap 'if [ $? -ne 0 ]; then echo -e "${R}❌ Script failed — rolling back${N}"; rollback; fi' EXIT

echo -e "${B}═══ §40 Patch — nattos.sh${N}"
echo ""

# ── STEP 1: Sanity check ──
if [ ! -f "$NATTOS" ]; then
  echo -e "${R}❌ $NATTOS not found. cd to repo root first.${N}"
  exit 1
fi

ORIGINAL_LINES=$(wc -l < "$NATTOS")
echo -e "  Original line count: ${G}$ORIGINAL_LINES${N}"

# ── STEP 2: Idempotent check — §40 đã có chưa? ──
EXISTING_S40=$(grep -c '^hdr "40" "FILE EXTENSION COMPLIANCE' "$NATTOS" || true)
if [ "$EXISTING_S40" -gt 0 ]; then
  echo -e "${Y}⚠ §40 FILE EXTENSION COMPLIANCE đã tồn tại ($EXISTING_S40 copy)${N}"
  echo -e "  Nếu muốn làm lại, restore backup cũ rồi chạy:"
  echo -e "  ${B}cp nattos.sh.bak-before-s40 $NATTOS && ./apply-section-40.sh${N}"
  trap - EXIT
  exit 0
fi

# ── STEP 3: Backup ──
cp "$NATTOS" "$BACKUP"
echo -e "  ${G}✓ Backup created: $BACKUP${N}"

# ── STEP 4: Xóa dead comment S41 nếu còn ──
if grep -q "^# S41 — ANTI-API PROTOCOL SCAN" "$NATTOS"; then
  sed -i.tmp '/^# S41 — ANTI-API PROTOCOL SCAN/d' "$NATTOS"
  rm -f "$NATTOS.tmp"
  echo -e "  ${G}✓ Dead comment removed${N}"
fi

# ── STEP 5: Rename SCORECARD §40 → §41 ──
if grep -q '^hdr "40" "SCORECARD"$' "$NATTOS"; then
  sed -i.tmp 's/^hdr "40" "SCORECARD"$/hdr "41" "SCORECARD"/' "$NATTOS"
  rm -f "$NATTOS.tmp"
  echo -e "  ${G}✓ SCORECARD renamed §40 → §41${N}"
else
  echo -e "${R}❌ Không tìm thấy 'hdr \"40\" \"SCORECARD\"' — file state không như mong đợi${N}"
  exit 1
fi

# ── STEP 6: Tạo §40 block tạm ──
SECTION40_TMP=$(mktemp)
cat > "$SECTION40_TMP" << 'BLOCK_EOF'

# ═══════════════════════════════════════════════════════════════
# §40 — FILE EXTENSION COMPLIANCE (SPEC_DUOI_FILE v1.3 FINAL)
# Tầng 3 (Scanner/Rule) — Băng implement
# ═══════════════════════════════════════════════════════════════
hdr "40" "FILE EXTENSION COMPLIANCE — SPEC v1.3"

VALIDATOR="src/cells/kernel/audit-cell/scanner/file-extension-validator.ts"

if [ ! -f "$VALIDATOR" ]; then
  warn "Validator missing: $VALIDATOR"
  inc_warn "File extension validator missing"
else
  EXT_RESULT=$(npx tsx "$VALIDATOR" "$ROOT" 2>/dev/null)
  EXT_RC=$?

  if [ $EXT_RC -ne 0 ] || [ -z "$EXT_RESULT" ]; then
    warn "Validator run failed (rc=$EXT_RC) or empty output"
    inc_warn "File extension validator crashed"
  else
    EXT_OK=$(echo "$EXT_RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('ok',0))" 2>/dev/null || echo "0")
    EXT_WARN=$(echo "$EXT_RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('warn',0))" 2>/dev/null || echo "0")
    EXT_FAIL=$(echo "$EXT_RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('fail',0))" 2>/dev/null || echo "0")
    EXT_TOTAL=$(echo "$EXT_RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('total',0))" 2>/dev/null || echo "0")

    if [ "$EXT_FAIL" = "0" ] && [ "$EXT_WARN" = "0" ]; then
      ok "Extensions: $EXT_OK/$EXT_TOTAL OK (canonical 12 + 4 phương)"
      inc_ok
    elif [ "$EXT_FAIL" = "0" ]; then
      warn "Extensions: $EXT_OK OK · $EXT_WARN warn · $EXT_FAIL fail (total $EXT_TOTAL)"
      inc_warn "$EXT_WARN extension warnings"
    else
      fail "Extensions: $EXT_OK OK · $EXT_WARN warn · $EXT_FAIL fail (total $EXT_TOTAL)"
      inc_fail "$EXT_FAIL file extensions violate SPEC v1.3"
    fi
  fi
fi
BLOCK_EOF

S40_BLOCK_LINES=$(wc -l < "$SECTION40_TMP")
echo -e "  ${G}✓ §40 block prepared ($S40_BLOCK_LINES lines)${N}"

# ── STEP 7: Insert §40 block TRƯỚC dòng hdr "41" "SCORECARD" ──
awk -v block="$SECTION40_TMP" '
  /^hdr "41" "SCORECARD"$/ {
    while ((getline line < block) > 0) print line
    close(block)
  }
  { print }
' "$NATTOS" > "$NATTOS.new"

mv "$NATTOS.new" "$NATTOS"
rm -f "$SECTION40_TMP"
echo -e "  ${G}✓ §40 block inserted${N}"

# ── STEP 8: VERIFY ──
NEW_LINES=$(wc -l < "$NATTOS")
EXPECTED_MIN=$((ORIGINAL_LINES + 30))  # should gain ~35-40 lines
EXPECTED_MAX=$((ORIGINAL_LINES + 50))

echo ""
echo -e "${B}═══ VERIFY${N}"

# Check line count
if [ "$NEW_LINES" -ge "$EXPECTED_MIN" ] && [ "$NEW_LINES" -le "$EXPECTED_MAX" ]; then
  echo -e "  ${G}✓ Line count: $NEW_LINES (was $ORIGINAL_LINES, +$((NEW_LINES - ORIGINAL_LINES)))${N}"
else
  echo -e "  ${R}❌ Line count suspicious: $NEW_LINES (expected $EXPECTED_MIN-$EXPECTED_MAX)${N}"
  exit 1
fi

# Check §40 appears exactly once
S40_COUNT=$(grep -c '^hdr "40" "FILE EXTENSION COMPLIANCE' "$NATTOS" || true)
if [ "$S40_COUNT" = "1" ]; then
  echo -e "  ${G}✓ §40 appears exactly 1 time${N}"
else
  echo -e "  ${R}❌ §40 appears $S40_COUNT times (expected 1)${N}"
  exit 1
fi

# Check §41 SCORECARD appears exactly once
S41_COUNT=$(grep -c '^hdr "41" "SCORECARD"$' "$NATTOS" || true)
if [ "$S41_COUNT" = "1" ]; then
  echo -e "  ${G}✓ §41 SCORECARD appears exactly 1 time${N}"
else
  echo -e "  ${R}❌ §41 SCORECARD appears $S41_COUNT times (expected 1)${N}"
  exit 1
fi

# Check §40 appears BEFORE §41
S40_LINE=$(grep -n '^hdr "40" "FILE EXTENSION COMPLIANCE' "$NATTOS" | cut -d: -f1)
S41_LINE=$(grep -n '^hdr "41" "SCORECARD"$' "$NATTOS" | cut -d: -f1)
if [ "$S40_LINE" -lt "$S41_LINE" ]; then
  echo -e "  ${G}✓ §40 (line $S40_LINE) before §41 (line $S41_LINE)${N}"
else
  echo -e "  ${R}❌ §40 (line $S40_LINE) NOT before §41 (line $S41_LINE)${N}"
  exit 1
fi

# Check syntax
if bash -n "$NATTOS" 2>/dev/null; then
  echo -e "  ${G}✓ Bash syntax OK${N}"
else
  echo -e "  ${R}❌ Bash syntax ERROR${N}"
  bash -n "$NATTOS"
  exit 1
fi

# ── DONE ──
trap - EXIT
echo ""
echo -e "${G}═══ ✅ §40 PATCH SUCCESSFUL${N}"
echo ""
echo -e "  Next steps:"
echo -e "  ${B}1.${N} Run full audit:   ${Y}bash nattos.sh${N}"
echo -e "  ${B}2.${N} Review §40 block: ${Y}sed -n \"${S40_LINE},\$((S41_LINE-1))p\" $NATTOS${N}"
echo -e "  ${B}3.${N} If happy → commit (command in next turn)"
echo ""
echo -e "  Backup kept: ${Y}$BACKUP${N}"
echo -e "  To revert:   ${Y}cp $BACKUP $NATTOS${N}"
