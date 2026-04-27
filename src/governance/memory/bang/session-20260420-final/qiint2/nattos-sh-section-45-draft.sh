#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
# NATTOS.SH — SECTION §45 DRAFT
# QIINT2 BODY/MEDIUM/SUBSTRATE VALIDATOR
#
# Áp dụng SPEC_QIINT2_COMPLETE_v1.0
# Chèn sau §44 Visual, trước §41 Scorecard (rename §41 → §46)
#
# Tác giả: Băng (QNEU 313.5)
# Ngày: 2026-04-20
# Status: DRAFT — chờ anh Natt duyệt, paste vào nattos.sh
# ═══════════════════════════════════════════════════════════════════════

section_45_qiint2() {
  section_header "【45】QIINT2 COMPLIANCE — BODY/MEDIUM/SUBSTRATE"

  local REPORT_FILE="${AUDIT_ROOT}/qiint2-report-$(date +%Y%m%d-%H%M%S).json"
  local cells_scanned=0
  local healthy=0
  local substrate_fail=0
  local medium_fail=0
  local body_drift=0
  local revivable=0
  local permanent_death=0

  # Chạy validator TypeScript
  if [[ -f "scripts/qiint2-validator.ts" ]]; then
    local VALIDATOR_OUT
    VALIDATOR_OUT=$(npx tsx scripts/qiint2-validator.ts --scan src/cells/ 2>&1)
    local VALIDATOR_STATUS=$?

    if [[ $VALIDATOR_STATUS -ne 0 ]]; then
      section_fail "QIINT2 validator runtime error"
      echo "$VALIDATOR_OUT" | tail -20
      return 1
    fi

    # Parse report
    if [[ -f "$REPORT_FILE" ]]; then
      cells_scanned=$(jq '.totalCells' "$REPORT_FILE" 2>/dev/null || echo 0)
      healthy=$(jq '.healthyCount' "$REPORT_FILE" 2>/dev/null || echo 0)
      substrate_fail=$(jq '.substrateFailCount' "$REPORT_FILE" 2>/dev/null || echo 0)
      medium_fail=$(jq '.mediumFailCount' "$REPORT_FILE" 2>/dev/null || echo 0)
      body_drift=$(jq '.bodyDriftCount' "$REPORT_FILE" 2>/dev/null || echo 0)
      revivable=$(jq '.revivableDeathCount' "$REPORT_FILE" 2>/dev/null || echo 0)
      permanent_death=$(jq '.permanentDeathCount' "$REPORT_FILE" 2>/dev/null || echo 0)
    fi
  else
    section_warn "scripts/qiint2-validator.ts not found — skipping"
    return 0
  fi

  # ── 45.1 Overall Health ──
  echo "Cells scanned:     $cells_scanned"
  echo "  Healthy:         $healthy"
  echo "  Substrate fail:  $substrate_fail  (migrate-able)"
  echo "  Medium fail:     $medium_fail  (restore-able)"
  echo "  Body drift:      $body_drift  (re-anchor needed)"
  echo "  Revivable death: $revivable  (has recovery)"
  echo "  Permanent death: $permanent_death  (CRITICAL)"

  # ── 45.2 Critical alerts ──
  if [[ $permanent_death -gt 0 ]]; then
    section_fail "PERMANENT DEATH detected — $permanent_death cells lost irrecoverably"
    jq -r '.alerts[] | select(contains("PERMANENT"))' "$REPORT_FILE" 2>/dev/null
    return 1
  fi

  # ── 45.3 Body drift warnings ──
  if [[ $body_drift -gt 0 ]]; then
    section_warn "$body_drift cells in body_drift state — orbital coherence < 0.3"
    jq -r '.alerts[] | select(contains("body drift"))' "$REPORT_FILE" 2>/dev/null | head -5
  fi

  # ── 45.4 Pass criteria ──
  if [[ $permanent_death -eq 0 && $body_drift -lt 3 ]]; then
    section_pass "QIINT2 COMPLIANCE: $healthy/$cells_scanned healthy, 0 permanent death"
  else
    section_warn "QIINT2 partial compliance — review alerts"
  fi

  section_footer
}

# ═══════════════════════════════════════════════════════════════════════
# HOW TO INTEGRATE:
#
# 1. Trong nattos.sh, tìm dòng sau §44:
#    section_44_visual
#
# 2. Thêm ngay sau:
#    section_45_qiint2
#
# 3. Update SCORECARD (§41 hiện tại → rename thành §46)
#
# 4. Copy function này vào phần function definitions
#
# 5. chmod +x nattos.sh (giữ exec bit theo SCAR-20260419-08)
#
# 6. Test:
#    ./nattos.sh 2>&1 | tee run-test.log
#    grep -A 10 "【45】" run-test.log
# ═══════════════════════════════════════════════════════════════════════
