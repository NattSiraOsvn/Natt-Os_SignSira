# ═══════════════════════════════════════════════════════════════
# §40 — FILE EXTENSION COMPLIANCE (SPEC_DUOI_FILE v1.3 FINAL)
# Tầng 3 (Scanner/Rule) — Băng implement
# Phê duyệt: Gatekeeper · Authority Lock: Băng maintain_validators
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

      echo "$EXT_RESULT" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    for w in d.get('warnings', [])[:5]:
        print(f\"    ⚠️  {w.get('file','?')}: {w.get('message','?')}\")
    extra = len(d.get('warnings', [])) - 5
    if extra > 0:
        print(f\"    ... và {extra} cảnh báo khác\")
except: pass
" 2>/dev/null
    else
      fail "Extensions: $EXT_OK OK · $EXT_WARN warn · $EXT_FAIL fail (total $EXT_TOTAL)"
      inc_fail "$EXT_FAIL file extensions violate SPEC v1.3"

      echo "$EXT_RESULT" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    for e in d.get('errors', [])[:10]:
        sug = f\" → {e['suggestion']}\" if e.get('suggestion') else ''
        print(f\"    🔴 {e.get('file','?')}: {e.get('message','?')}{sug}\")
    extra = len(d.get('errors', [])) - 10
    if extra > 0:
        print(f\"    ... và {extra} lỗi khác\")
except: pass
" 2>/dev/null
    fi
  fi
fi

