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

# @deferred: bypass flagged by validate-extension-precedence.py Rule 4 (variable-aware).
# Intentional S2 wrapper mode per Kim SPEC_CUTOVER_STATES — .ts execute hợp pháp
# khi canonical .khai chưa có Nauion Host loader.
# Real route-swap pending W1: `npx tsx "$VALIDATOR"` → `$NAUION_HOST "$CANONICAL"`
# where $CANONICAL="...file-extension-validator.khai" + Host resolve substrate qua @substrate header.
# Track: SPEC_HOST_FIRST_RUNTIME_v1.0 §4 W1 + PILOT_BRIDGE_MAP audit-cell/file-extension-validator
VALIDATOR="src/cells/kernel/audit-cell/scanner/file-extension-validator.ts"

if [ -f "$VALIDATOR" ]; then
  RESULT=$(npx tsx "$VALIDATOR" "$ROOT" 2>/dev/null)
  
  if [ $? -eq 0 ] && [ -n "$RESULT" ]; then
    EXT_OK=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['ok'])" 2>/dev/null)
    EXT_WARN=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['warn'])" 2>/dev/null)
    EXT_FAIL=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['fail'])" 2>/dev/null)
    EXT_TOTAL=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['total'])" 2>/dev/null)
    
    if [ "$EXT_FAIL" = "0" ]; then
      echo "  ✅ Extensions: $EXT_OK OK / $EXT_WARN warn / $EXT_FAIL fail (total: $EXT_TOTAL)"
      INC_OK
    else
      echo "  ❌ Extensions: $EXT_OK OK / $EXT_WARN warn / $EXT_FAIL fail (total: $EXT_TOTAL)"
      INC_FAIL
      
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
    if [ "$EXT_WARN" != "0" ]; then
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
    INC_WARN
  fi
else
  echo "  ⚠️  Validator chưa có: $VALIDATOR"
  INC_WARN
fi
