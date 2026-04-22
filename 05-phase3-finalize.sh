#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
# NATT-OS NAUION CLEANUP — PHASE 3 FINALIZE
# ─────────────────────────────────────────────────────────────────────────
# Scope Bang (authority refactor_technical_debt + fix_platform_issues):
#   A. Archive pre_wave3_dry_audit.py (Thiên Lớn — rule SUPERSEDED)
#   B. Fix stale export P3 — infrastructure/index.ts
#   C. Chuẩn bị audit reports + log commit
#
# KHÔNG làm:
#   - P5 neural-main-cell.cell.anc 0 bytes (Kim scope modify_kernel)
#   - P7 @ts-nocheck cleanup (plan riêng)
#   - git add / commit (anh Natt R06)
# ─────────────────────────────────────────────────────────────────────────
# CHẠY:
#   cd "/Users/thien/Desktop/Hồ Sơ SHTT/ natt-os_verANC"
#   bash 05-phase3-finalize.sh
# ═══════════════════════════════════════════════════════════════════════

REPO_ROOT="$(pwd)"
LOG="$REPO_ROOT/audit/reports/phase3-finalize-$(date +%Y%m%d-%H%M%S).log"
mkdir -p "$(dirname "$LOG")"

log() { echo "[$(date +%H:%M:%S)] $*" | tee -a "$LOG"; }

is_tracked() {
  git ls-files --error-unmatch "$1" >/dev/null 2>&1
}

log "═══ PHASE 3 FINALIZE ═══"
log "Branch: $(git branch --show-current) · HEAD: $(git rev-parse --short HEAD)"
log ""

# ───── A. Archive pre_wave3_dry_audit.py ─────
log "─── [A] ARCHIVE pre_wave3_dry_audit.py (Thiên Lớn script, rule SUPERSEDED) ───"

ARCH_DIR="src/governance/archive/directives/scripts"
mkdir -p "$ARCH_DIR"

SRC_SCRIPT="pre_wave3_dry_audit.py"
DEST_SCRIPT="$ARCH_DIR/2026-04-20_pre_wave3_dry_audit_SUPERSEDED_RULE.py"

if [[ ! -f "$SRC_SCRIPT" ]]; then
  log "  ℹ  Source not found: $SRC_SCRIPT (skip)"
elif [[ -f "$DEST_SCRIPT" ]]; then
  log "  ⚠  Already archived (skip)"
else
  # Prepend metadata block as Python comment (preserve original content)
  python3 - "$SRC_SCRIPT" "$DEST_SCRIPT" <<'PY' 2>&1 | tee -a "$LOG"
import sys
src, dst = sys.argv[1], sys.argv[2]
header = '''# ═══════════════════════════════════════════════════════════════════════
# ARCHIVED — SUPERSEDED RULE
# ─────────────────────────────────────────────────────────────────────────
# status: SUPERSEDED
# archived_at: 2026-04-20
# archived_by: Băng (QNEU 313.5) · authority refactor_technical_debt
# original_author: Thiên Lớn (architecture review)
# original_purpose: Dry audit repo theo bảng chỉ đạo Pre-Wave 3 (2026-02-11)
#
# supersede_reason: |
#   Script này audit theo rule của bảng Pre-Wave 3 đã SUPERSEDED
#   (xem: src/governance/archive/directives/2026-02-11_pre-wave3-cleanup-SUPERSEDED.md
#   · commit ca5c7e0).
#
#   Rule bảng yêu cầu warehouse-cell QUARANTINE. Nhưng Gatekeeper đã approve
#   UNQUARANTINE warehouse vào 2026-03-22 (evidence: comment trong
#   cells/business/warehouse-cell/QUARANTINE_GUARD.ts). Production flow 8/8
#   hiện đã wire qua warehouse.
#
#   Script output CÓ phát hiện đúng về fact (3 bug thật):
#     - P3: infrastructure/index.ts stale export warehouse-cell ✅ (Bang fix)
#     - P5: neural-main-cell.cell.anc = 0 bytes ✅ (Kim scope)
#     - P7: @ts-nocheck tech debt ✅ (plan riêng)
#
#   NHƯNG frame sai về state warehouse + shared-contracts-cell vì áp
#   rule SUPERSEDED, kết luận "sai trạng thái" là sai.
#
# do_not_execute: true
# replacement_audit: nattos.sh section 32-40 (canonical audit, checks 6-component
#   DNA thay vì 5-layer folder structure)
# feedback_for_author: src/governance/archive/directives/09-thienlon-audit-feedback.md
# gatekeeper_signature: (chờ anh Natt ký)
# ═══════════════════════════════════════════════════════════════════════

'''
with open(src, 'r', encoding='utf-8') as f:
    original = f.read()
with open(dst, 'w', encoding='utf-8') as f:
    f.write(header)
    f.write(original)
print(f"    Archived with metadata header → {dst}")
PY

  if [[ -f "$DEST_SCRIPT" ]]; then
    log "  ✅ Created: $DEST_SCRIPT"
    if is_tracked "$SRC_SCRIPT"; then
      git rm "$SRC_SCRIPT" 2>&1 | sed 's/^/    /' | tee -a "$LOG"
      log "  ✅ git rm (tracked): $SRC_SCRIPT"
    else
      rm "$SRC_SCRIPT" && log "  ✅ rm (untracked): $SRC_SCRIPT"
    fi
  else
    log "  ❌ Archive creation failed"
  fi
fi
log ""

# ───── B. Fix stale export P3 — infrastructure/index.ts ─────
log "─── [B] FIX P3: infrastructure/index.ts stale export ./warehouse-cell ───"

TARGET_FILE="src/cells/infrastructure/index.ts"

if [[ ! -f "$TARGET_FILE" ]]; then
  log "  ❌ $TARGET_FILE not found"
else
  # Verify stale: check export exists AND target folder missing
  if grep -q 'export \* from "./warehouse-cell"' "$TARGET_FILE"; then
    if [[ ! -d "src/cells/infrastructure/warehouse-cell" ]]; then
      log "  VERIFIED stale: line exists + folder missing"
      # Remove line (use sed, macOS compatible via -i '')
      sed -i '' '/export \* from "\.\/warehouse-cell";/d' "$TARGET_FILE"
      log "  ✅ Removed stale line"
      log ""
      log "  Content after fix:"
      cat "$TARGET_FILE" | sed 's/^/    /' | tee -a "$LOG"
    else
      log "  ⚠  Export exists AND folder exists — not stale, skip"
    fi
  else
    log "  ℹ  Stale export not found (already fixed?)"
  fi
fi
log ""

# ───── Summary ─────
log "═══ PHASE 3 FINALIZE COMPLETE ═══"
log ""
log "Git status:"
git status --short 2>&1 | tee -a "$LOG"
log ""
log "→ Changes cần commit (suggested grouping):"
log ""
log "  C3a — Thiên Lớn script archived + fix stale export:"
log "    git add src/governance/archive/directives/scripts/"
log "    git add src/cells/infrastructure/index.ts"
log "    git add -u pre_wave3_dry_audit.py  # nếu was tracked"
log "    git commit -m 'refactor(infra,archive): fix P3 stale export + archive Thiên Lớn pre_wave3 audit script'"
log ""
log "  C3b — audit reports + logs:"
log "    git add audit/reports/2026-04-20_19-07-17_auto.md"
log "    git add audit/reports/2026-04-20_19-39-29_auto.md"
log "    git add audit/reports/2026-04-20_20-06-35_auto.md"
log "    git add audit/reports/phase1-cleanup-v2-20260420-200414.log"
log "    git add audit/reports/phase3-finalize-*.log"
log "    git commit -m 'chore(audit): session 20260420 auto reports + phase 1+3 logs'"
log ""
log "→ Log: $LOG"
