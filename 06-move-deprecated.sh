#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
# NATT-OS — MOVE 3 SUPERSEDED FILES OUT OF src/ → _deprecated/ ROOT
# ─────────────────────────────────────────────────────────────────────────
# Lý do (từ anh Natt 2026-04-20 evening): "a ko bị nhầm"
# 3 file ở trong src/ → anh scan tree có thể mở nhầm vì tưởng active.
# Move ra _deprecated/ root (ngoài src/) + README cảnh báo.
# ─────────────────────────────────────────────────────────────────────────
# KHÔNG XOÁ — giữ lineage cho Thiên Lớn resurrect, Kim review state history.
# Scope Băng: refactor_technical_debt + fix_platform_issues.
# ─────────────────────────────────────────────────────────────────────────
# CHẠY:
#   cd "/Users/thien/Desktop/Hồ Sơ SHTT/ natt-os_verANC"
#   bash 06-move-deprecated.sh
# ═══════════════════════════════════════════════════════════════════════

REPO_ROOT="$(pwd)"
LOG="$REPO_ROOT/audit/reports/move-deprecated-$(date +%Y%m%d-%H%M%S).log"
mkdir -p "$(dirname "$LOG")"

log() { echo "[$(date +%H:%M:%S)] $*" | tee -a "$LOG"; }

is_tracked() {
  git ls-files --error-unmatch "$1" >/dev/null 2>&1
}

smart_mv() {
  local src="$1"
  local dst="$2"
  if [[ ! -e "$src" ]]; then
    log "  ℹ  Source not found: $src (skip)"
    return 0
  fi
  mkdir -p "$(dirname "$dst")"
  if is_tracked "$src"; then
    git mv "$src" "$dst" 2>&1 | sed 's/^/    /' | tee -a "$LOG"
    log "  ✅ git mv: $src → $dst"
  else
    mv "$src" "$dst" && log "  ✅ mv (untracked): $src → $dst"
  fi
}

log "═══ MOVE 3 DEPRECATED FILES → _deprecated/ ═══"
log "Branch: $(git branch --show-current) · HEAD: $(git rev-parse --short HEAD)"
log ""

# ───── 0. Check .gitignore — nếu _deprecated/ bị ignore sẽ fail ─────
if grep -qE "^_deprecated/?" .gitignore 2>/dev/null; then
  log "  ❌ .gitignore đang ignore _deprecated/ — không track được"
  log "     Cần anh Natt quyết: remove rule hoặc chọn folder name khác"
  exit 1
fi

# ───── 1. Tạo _deprecated/ + README cảnh báo ─────
log "─── [1/5] CREATE _deprecated/ folder + README ───"
mkdir -p _deprecated

if [[ ! -f _deprecated/README.md ]]; then
  cat > _deprecated/README.md <<'EOF_README'
# _deprecated/

**Folder này chứa artifact đã SUPERSEDED / NEEDS_REWRITE — KHÔNG dùng làm rule hoặc spec hiện hành.**

Giữ làm **lineage** (ref cho Thiên Lớn resurrect, Kim/Can review state history). Không đưa vào active zone `src/` để tránh persona khác hoặc scanner load nhầm.

---

## Convention

- Tên file giữ nguyên kèm suffix/prefix giải thích status (SUPERSEDED / NEEDS_REWRITE / SUPERSEDED_RULE)
- Không có file nào trong đây được reference bởi active spec, code, hoặc runtime
- Scanner `nattos.sh` KHÔNG quét folder này
- Nếu cần reference context historical → dùng git log hoặc đọc file với ý thức "đây là state cũ"

---

## Nội dung hiện tại (2026-04-20)

| File | Status | Supersede date | Canonical replacement |
|---|---|---|---|
| `2026-02-11_pre-wave3-cleanup-SUPERSEDED.md` | SUPERSEDED | 2026-03-22 | Gatekeeper unquarantine decision 2026-03-22 (xem `cells/business/warehouse-cell/QUARANTINE_GUARD.ts`) |
| `SPEC_QIINT2_v1.0_NEEDS_REWRITE.md` | NEEDS_REWRITE | 2026-04-20 | SPEC_QIINT2_v2.0 (task B1 pending Băng) + `sim_v2_thienbang.py` hiện dùng paradigm đúng |
| `2026-04-20_pre_wave3_dry_audit_SUPERSEDED_RULE.py` | SUPERSEDED_RULE | 2026-04-20 | `nattos.sh` section 32-40 (canonical audit 6-component DNA) |

---

## KHÔNG LÀM GÌ TRONG FOLDER NÀY

- ❌ Chạy script `.py`/`.sh` trong đây
- ❌ Dùng làm spec reference cho code mới
- ❌ Copy nội dung vào session memory hiện tại
- ❌ Forward như "best practice"
- ❌ Tin chữ ký `✅ Đồng ý` trong metadata file cũ (có thể là persona phiên khác)

---

## LÀM GÌ ĐƯỢC

- ✅ Đọc context historical (hiểu tại sao state hiện tại là state đúng)
- ✅ Ref trong commit message / documentation khi cần giải thích lineage
- ✅ Thiên Lớn resurrect: đọc để update cached rule

---

*Folder maintain: Băng (Ground Truth Validator, authority refactor_technical_debt)*
*Policy: `do_not_execute: true` cho mọi file trong đây*
*Gatekeeper: anh Natt*
EOF_README
  log "  ✅ Created: _deprecated/README.md"
else
  log "  ℹ  README.md already exists (skip)"
fi
log ""

# ───── 2. Move bảng Pre-Wave 3 ─────
log "─── [2/5] MOVE bảng Pre-Wave 3 ───"
smart_mv \
  "src/governance/archive/directives/2026-02-11_pre-wave3-cleanup-SUPERSEDED.md" \
  "_deprecated/2026-02-11_pre-wave3-cleanup-SUPERSEDED.md"
log ""

# ───── 3. Move Thiên Lớn script ─────
log "─── [3/5] MOVE Thiên Lớn pre_wave3_dry_audit script ───"
smart_mv \
  "src/governance/archive/directives/scripts/2026-04-20_pre_wave3_dry_audit_SUPERSEDED_RULE.py" \
  "_deprecated/2026-04-20_pre_wave3_dry_audit_SUPERSEDED_RULE.py"
log ""

# ───── 4. Move SPEC QIINT2 v1.0 ─────
log "─── [4/5] MOVE SPEC_QIINT2_v1.0 NEEDS_REWRITE ───"
smart_mv \
  "src/governance/memory/bang/session-20260420-final/qiint2/archive/SPEC_QIINT2_v1.0_NEEDS_REWRITE.md" \
  "_deprecated/SPEC_QIINT2_v1.0_NEEDS_REWRITE.md"
log ""

# ───── 5. Cleanup empty dirs (now empty after moves) ─────
log "─── [5/5] CLEANUP empty dirs ───"

# src/governance/archive/directives/scripts/ — should be empty now
if [[ -d "src/governance/archive/directives/scripts" ]]; then
  if [[ -z "$(ls -A src/governance/archive/directives/scripts 2>/dev/null)" ]]; then
    rmdir src/governance/archive/directives/scripts && log "  ✅ rmdir: src/governance/archive/directives/scripts"
  else
    log "  ⚠  src/governance/archive/directives/scripts not empty, leaving alone"
  fi
fi

# src/governance/archive/directives/ — should be empty
if [[ -d "src/governance/archive/directives" ]]; then
  if [[ -z "$(ls -A src/governance/archive/directives 2>/dev/null)" ]]; then
    rmdir src/governance/archive/directives && log "  ✅ rmdir: src/governance/archive/directives"
  else
    log "  ⚠  src/governance/archive/directives not empty"
  fi
fi

# session-20260420-final/qiint2/archive/ — should be empty
if [[ -d "src/governance/memory/bang/session-20260420-final/qiint2/archive" ]]; then
  if [[ -z "$(ls -A src/governance/memory/bang/session-20260420-final/qiint2/archive 2>/dev/null)" ]]; then
    rmdir src/governance/memory/bang/session-20260420-final/qiint2/archive && log "  ✅ rmdir: qiint2/archive"
  fi
fi

# NOTE: src/governance/archive/ itself vẫn giữ — có HIEN-PHAP-NATT-OS-v4.0.anc bên trong (canonical lineage, khác scope)
log ""

# ───── Summary ─────
log "═══ MOVE COMPLETE ═══"
log ""
log "_deprecated/ contents:"
ls -la _deprecated/ 2>&1 | tee -a "$LOG"
log ""
log "src/governance/archive/ contents (should only have HIEN-PHAP v4):"
ls -la src/governance/archive/ 2>&1 | tee -a "$LOG"
log ""
log "Git status:"
git status --short 2>&1 | tee -a "$LOG"
log ""
log "→ Commit suggested:"
log "   git add _deprecated/"
log "   git add -u"
log "   git commit -m 'refactor: move 3 SUPERSEDED artifacts src/ → _deprecated/ root — anh Natt không nhầm'"
log ""
log "→ Log: $LOG"
