#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# §45 FILE EXTENSION COMPLIANCE — SPEC v1.3 FINAL
# Tầng 3 (Scanner/Rule) — Băng implement
# 
# Paste đoạn này vào nattos.sh trước section SCORECARD
# ═══════════════════════════════════════════════════════════════

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "【45】FILE EXTENSION COMPLIANCE — SPEC v1.3"

VALIDATOR="src/cells/kernel/audit-cell/scanner/file-extension-validator.ts"

if [ -f "$VALIDATOR" ]; then
  RESULT=$(npx tsx "$VALIDATOR" "$ROOT" 2>/dev/null)
  
  if [ $? -eq 0 ] && [ -n "$RESULT" ]; then
    EXT_OK=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['ok'])" 2>/dev/null)
    EXT_warn=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['warn'])" 2>/dev/null)
    EXT_fail=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['fail'])" 2>/dev/null)
    EXT_TOTAL=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['total'])" 2>/dev/null)
    
    if [ "$EXT_fail" = "0" ]; then
      echo "  ✅ Extensions: $EXT_OK OK / $EXT_warn warn / $EXT_fail fail (total: $EXT_TOTAL)"
      INC_OK
    else
      echo "  ❌ Extensions: $EXT_OK OK / $EXT_warn warn / $EXT_fail fail (total: $EXT_TOTAL)"
      INC_fail
      
      # Show errors (max 10)
      echo "$RESULT" | python3 -c "
import sys, json
d = json.load(sys.stdin)
for e in d['errors'][:10]:
    sug = f\" → {e['suggestion']}\" if e.get('suggestion') else ''
    print(f\"    🔴 {e['file']}: {e['message']}{sug}\")
if len(d['errors']) > 10:
    print(f\"    ... và {len(d['errors'])-10} lỗi khác\")
" 2>/dev/null
    fi
    
    # Show warnings (max 5)
    if [ "$EXT_warn" != "0" ]; then
      echo "$RESULT" | python3 -c "
import sys, json
d = json.load(sys.stdin)
for w in d['warnings'][:5]:
    print(f\"    ⚠️  {w['file']}: {w['message']}\")
if len(d['warnings']) > 5:
    print(f\"    ... và {len(d['warnings'])-5} cảnh báo khác\")
" 2>/dev/null
    fi
    
  else
    echo "  ⚠️  Validator chạy nhưng không có output"
    INC_warn
  fi
else
  echo "  ⚠️  Validator chưa có: $VALIDATOR"
  INC_warn
fi
