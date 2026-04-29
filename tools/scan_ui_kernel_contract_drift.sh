#!/bin/bash
# @nauion-scanner v1
# @state runtime-policy active
# @name sovereign @nauion scan_ui_kernel_contract_drift v0.1
# @scope sovereign-scanner-ui-kernel-drift
# @runtime_scope active
# @owner natt sirawat / phan thanh thương
# @anc băng sirawat
# @tool scan_ui_kernel_contract_drift
# @session ss20260429
# @created_at natthome
#
# Scanner detect drift contract UI ↔ Kernel.
# Source: docs/specs/ui-kernel-contract.sira
# Boundary: thienbang.si UI_KERNEL_CONTRACT cluster (13 entries)
# MATERIALIZATION_ORDER bước 2/4

set -uo pipefail

UI_SCOPE="NaUion-Server/nauion/nauion-v10"
EXIT_CODE=0
VIOLATIONS=0

echo "════════════════════════════════════════════════════════════════════"
echo " UI_KERNEL_CONTRACT_DRIFT_SCANNER v0.1"
echo " Scope: $UI_SCOPE"
echo " Boundary source: docs/specs/ui-kernel-contract.sira"
echo "════════════════════════════════════════════════════════════════════"

if [ ! -d "$UI_SCOPE" ]; then
  echo "✗ FATAL: Scope folder không tồn tại — $UI_SCOPE"
  exit 1
fi

# CHECK 1: Mock outcome sống (FALL/DISSIPATE/OSCILLATE) trong code
echo ""
echo "═══ CHECK 1: Mock outcome sống (forbidden) ═══"
HITS=$(grep -rn -E "(['\"\`])\s*(FALL|DISSIPATE|OSCILLATE)\s*\1" "$UI_SCOPE" 2>/dev/null | grep -v "comment\|KHÔNG\|forbidden\|allowed_mock\|MOCKING_POLICY\|^#\|//\s" | head -10)
if [ -n "$HITS" ]; then
  echo "✗ DRIFT — outcome sống bị hardcode/mock:"
  echo "$HITS" | sed 's/^/  /'
  VIOLATIONS=$((VIOLATIONS + 1))
  EXIT_CODE=1
else
  echo "✓ Clean — không hardcode FALL/DISSIPATE/OSCILLATE"
fi

# CHECK 2: pressure_value ngoài range 0.0-1.0
echo ""
echo "═══ CHECK 2: pressure_value range 0.0-1.0 ═══"
HITS=$(grep -rn -E "pressure_value\s*[:=]\s*[0-9]+\.?[0-9]*" "$UI_SCOPE" 2>/dev/null | head -10)
DRIFT=""
while IFS= read -r line; do
  [ -z "$line" ] && continue
  VAL=$(echo "$line" | grep -oE "[0-9]+\.?[0-9]*" | tail -1)
  if [ -n "$VAL" ]; then
    OUT_OF_RANGE=$(awk -v v="$VAL" 'BEGIN { exit !(v < 0 || v > 1) }' && echo "yes" || echo "no")
    if [ "$OUT_OF_RANGE" = "yes" ]; then
      DRIFT="$DRIFT$line\n"
    fi
  fi
done <<< "$HITS"
if [ -n "$DRIFT" ]; then
  echo "✗ DRIFT — pressure_value ngoài range:"
  printf "$DRIFT" | sed 's/^/  /'
  VIOLATIONS=$((VIOLATIONS + 1))
  EXIT_CODE=1
else
  echo "✓ Clean — pressure_value hợp lệ (hoặc chưa có trong code)"
fi

# CHECK 3: NauionEvent thiếu causation_id
echo ""
echo "═══ CHECK 3: causation_id field bắt buộc ═══"
EVENT_FILES=$(grep -rln "NauionEvent\|interface.*Event\|type.*Event" "$UI_SCOPE" 2>/dev/null)
DRIFT=""
for f in $EVENT_FILES; do
  if grep -q "interface.*Event\|type.*Event" "$f" 2>/dev/null; then
    if ! grep -q "causation_id" "$f" 2>/dev/null; then
      DRIFT="$DRIFT$f\n"
    fi
  fi
done
if [ -n "$DRIFT" ]; then
  echo "✗ DRIFT — interface Event thiếu causation_id:"
  printf "$DRIFT" | sed 's/^/  /'
  VIOLATIONS=$((VIOLATIONS + 1))
  EXIT_CODE=1
else
  echo "✓ Clean — causation_id present trong mọi Event interface"
fi

# CHECK 4: event_type không match enum
echo ""
echo "═══ CHECK 4: event_type chỉ heyna.pulse | cell.metric ═══"
HITS=$(grep -rn -E "event_type\s*[:=]\s*['\"]([^'\"]+)['\"]" "$UI_SCOPE" 2>/dev/null \
  | grep -vE "(heyna\.pulse|cell\.metric|event_type:|event_type =|interface |//\s|^#)" \
  | head -10)
if [ -n "$HITS" ]; then
  echo "✗ DRIFT — event_type không match enum:"
  echo "$HITS" | sed 's/^/  /'
  VIOLATIONS=$((VIOLATIONS + 1))
  EXIT_CODE=1
else
  echo "✓ Clean — event_type tuân enum"
fi

# CHECK 5: MOCKING_POLICY constant tồn tại + giá trị strict
echo ""
echo "═══ CHECK 5: MOCKING_POLICY enforce ═══"
POLICY_HIT=$(grep -rn "MOCKING_POLICY" "$UI_SCOPE" 2>/dev/null | head -3)
if [ -z "$POLICY_HIT" ]; then
  echo "⚠️  WARNING — MOCKING_POLICY constant chưa có (Bối nên codify)"
elif echo "$POLICY_HIT" | grep -q "STRICT_NO_OUTCOME_MOCKING"; then
  echo "✓ Clean — MOCKING_POLICY = STRICT_NO_OUTCOME_MOCKING"
else
  echo "✗ DRIFT — MOCKING_POLICY không strict:"
  echo "$POLICY_HIT" | sed 's/^/  /'
  VIOLATIONS=$((VIOLATIONS + 1))
  EXIT_CODE=1
fi

# CHECK 6: forbidden_mock matrix consistency với spec
echo ""
echo "═══ CHECK 6: forbidden_mock matrix ═══"
SPEC_FILE="$UI_SCOPE/ui-spec-v10.na"
if [ -f "$SPEC_FILE" ]; then
  if grep -q "forbidden_mock" "$SPEC_FILE" && \
     grep -q "FALL" "$SPEC_FILE" && \
     grep -q "DISSIPATE" "$SPEC_FILE" && \
     grep -q "OSCILLATE" "$SPEC_FILE" && \
     grep -q "pressure_type" "$SPEC_FILE" && \
     grep -q "pressure_value" "$SPEC_FILE"; then
    echo "✓ Clean — forbidden_mock matrix đầy đủ trong $SPEC_FILE"
  else
    echo "✗ DRIFT — forbidden_mock matrix thiếu element trong $SPEC_FILE"
    VIOLATIONS=$((VIOLATIONS + 1))
    EXIT_CODE=1
  fi
else
  echo "⚠️  WARNING — $SPEC_FILE chưa có"
fi

echo ""
echo "════════════════════════════════════════════════════════════════════"
if [ $VIOLATIONS -eq 0 ]; then
  echo " ✓ SCANNER PASS — UI_KERNEL_CONTRACT clean, KHÔNG drift"
  echo " Cluster: e27daff (Bối) → a9b3cd9 (Kim) → 7b91b2a (anh) → b39a7e0 (Băng)"
else
  echo " ✗ SCANNER FAIL — $VIOLATIONS violation(s)"
  echo " Forward: review từng item, fix trước commit kế"
fi
echo "════════════════════════════════════════════════════════════════════"

exit $EXIT_CODE
