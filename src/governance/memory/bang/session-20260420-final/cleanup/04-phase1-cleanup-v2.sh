#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
# Natt-OS NAUION CLEANUP — PHASE 1 v2 (ROBUST, Bang scope only)
# ─────────────────────────────────────────────────────────────────────────
# v2 fix (từ feedback anh 2026-04-20):
#   - Detect tracked vs untracked file → dùng git rm/mv hoặc rm/mv
#   - Bỏ set -e toàn script → mỗi action độc lập, fail 1 không dừng cả chuỗi
#   - Embed content bảng Pre-Wave 3 trực tiếp (không cần file source)
#   - Preserve exec bit (SCAR-20260419-08)
# ─────────────────────────────────────────────────────────────────────────
# CHẠY:
#   cd "/Users/thien/Desktop/Hồ Sơ SHTT/ natt-os_verANC"
#   bash 04-phase1-cleanup-v2.sh
# ─────────────────────────────────────────────────────────────────────────

REPO_ROOT="$(pwd)"
LOG_DIR="$REPO_ROOT/audit/reports"
mkdir -p "$LOG_DIR"
LOG="$LOG_DIR/phase1-cleanup-v2-$(date +%Y%m%d-%H%M%S).log"

log() { echo "[$(date +%H:%M:%S)] $*" | tee -a "$LOG"; }

# ───── Helpers ─────
is_tracked() {
  git ls-files --error-unmatch "$1" >/dev/null 2>&1
}

smart_rm() {
  local target="$1"
  if [[ ! -e "$target" ]]; then
    log "  ℹ  Not found: $target (skip)"
    return 0
  fi
  if is_tracked "$target"; then
    git rm "$target" 2>&1 | sed 's/^/    /' | tee -a "$LOG"
    log "  ✅ git rm (tracked): $target"
  else
    rm "$target" && log "  ✅ rm (untracked): $target" || log "  ❌ rm failed: $target"
  fi
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
    log "  ✅ git mv (tracked): $src → $dst"
  else
    mv "$src" "$dst" && log "  ✅ mv (untracked): $src → $dst" || log "  ❌ mv failed"
  fi
}

log "═══ Natt-OS NAUION CLEANUP — PHASE 1 v2 ═══"
log "Repo: $REPO_ROOT"
log "Branch: $(git branch --show-current)"
log "HEAD: $(git rev-parse --short HEAD)"
log ""

# ───── ACTION 1/6: Xoá .bak rác ─────
log "─── [1/6] RM .bak (untracked expected) ───"
smart_rm "src/cells/kernel/audit-cell/scanner/file-extension-validator.ts.bak"
log ""

# ───── ACTION 2/6: Tạo archive structure ─────
log "─── [2/6] CREATE archive structure ───"
mkdir -p src/governance/archive/directives
mkdir -p src/governance/memory/bang/session-20260420-final/qiint2/archive
mkdir -p src/governance/memory/bang/session-20260413/archive
log "  ✅ Directories ready"
log ""

# ───── ACTION 3/6: Archive bảng Pre-Wave 3 (embed content) ─────
log "─── [3/6] CREATE archive Pre-Wave 3 SUPERSEDED directive ───"
PRE_WAVE3_DEST="src/governance/archive/directives/2026-02-11_pre-wave3-cleanup-SUPERSEDED.md"

if [[ -f "$PRE_WAVE3_DEST" ]]; then
  log "  ⚠  Already exists: $PRE_WAVE3_DEST (skip)"
else
  # Write metadata header + embedded content
  cat > "$PRE_WAVE3_DEST" <<'EOF_PREWAVE3'
---
status: SUPERSEDED
archived_at: 2026-04-20
archived_by: Băng (QNEU 313.5) · authority refactor_technical_debt
state_anchor: 2026-02-11 (warehouse QUARANTINE, Wave 3 pending, 4 cells chưa 6/6)
current_state: 2026-04-20 (warehouse LIVE 6/6 WIRED, 37/37 business cells live)
supersede_reason: |
  State gap 2+ tháng. Bảng chỉ đạo anchor vào snapshot 2026-02-11 không còn
  phản ánh repo hiện tại:
    - warehouse-cell đã unquarantine, LIVE 6/6, wire vào Production flow 8/8
      (evidence: QUARANTINE_GUARD.ts dòng 3: "Wave B production flow complete.
      Cell đã đủ 6 components Điều 9.")
    - 4 cells được liệt "legacy" (hr/sales/showroom/constants) đều LIVE 6/6:
      - hr-cell 25 files 6/6 WIRED
      - sales-cell 23 files 6/6 WIRED (BCTC flow chính)
      - showroom-cell 15 files 6/6 WIRED
      - constants-cell 10 files 6/6 WIRED
    - event-cell trong bảng KHÔNG tồn tại trong repo hiện tại
    - shared-contracts-cell đã dual-tier intentional (business + infrastructure)
    - Nếu script dựa bảng này chạy: 4 live cells vào _legacy/, BCTC + Production
      flow vỡ đồng thời.
  Chữ ký "Băng: ✅ Đồng ý" trong bảng: Băng session 20260420 KHÔNG chốt.
  Có thể là Băng phiên cũ (5.9.0 tháng 3) đã đồng ý với Wave 3 approach gốc
  khi warehouse thật sự đang quarantine — bây giờ state đã khác.
do_not_execute: true
evidence_audit: audit/reports/2026-04-20_19-07-17_auto.md
gatekeeper_signature: (chờ anh Natt ký nếu duyệt archive path này)
---

# BẢNG TỔNG HỢP CHỈ ĐẠO CHÍNH THỨC (PRE-WAVE 3) — SUPERSEDED

**Mục tiêu gốc:** Cung cấp cho **Bối Bối** một bảng chỉ đạo duy nhất, rõ ràng, không mâu thuẫn, để **viết code chi tiết** và **triển khai script 1-lệnh Phase A-B-C** cho Natt-OS Pre-Wave 3.

---

## I. NGUYÊN TẮC BẤT DI BẤT DỊCH (Áp dụng cho toàn bộ code)

| STT | Nguyên tắc | Nội dung bắt buộc | Người xác nhận |
|---|---|---|---|
| 1 | FILESYSTEM > MEMORY | Mọi kết luận phải dựa trên cây thư mục + git history, không dựa suy đoán | Thiên Lớn |
| 2 | Correct > Fast | Ưu tiên đúng Hiến pháp, chậm cũng được | Kim |
| 3 | Standardize → Automate → Monitor → Improve | Phase A-B là chuẩn hoá, Phase C mới hash & monitor | Băng |
| 4 | Separation of Powers | Script không tự ý quyết định nghiệp vụ | Thiên Lớn |
| 5 | No Silent Fix | Mọi thay đổi phải có log, audit, commit | Kim |

## II. QUY ƯỚC KIẾN TRÚC

| Hạng mục | Quy ước chính thức | Người chốt |
|---|---|---|
| 5-layer folder | domain / application / interface / infrastructure / ports | Băng |
| 7 lớp ADN | Identity, Capability, Boundary, Trace, Confidence, SmartLink, Lifecycle | Thiên Lớn |
| Quan hệ 5-layer ↔ 7-ADN | 5-layer = implementation anatomy, 7-ADN = metadata (manifest) | Thiên Lớn |
| Vị trí 7-ADN | CHỈ nằm trong `neural-main-cell.cell.anc`, KHÔNG tạo folder | Kim |

## III. PHASE A — CLEANUP & CHUẨN HOÁ (SUPERSEDED — DO NOT EXECUTE)

| Việc | Mô tả | ⚠ State hiện tại 2026-04-20 |
|---|---|---|
| Xoá legacy ./cells/ | Canonical root | ℹ Đã xong trước đó |
| Legacy cells → `_legacy/` | hr/event/sales/showroom/constants | ❌ **CẢ 4 ĐỀU LIVE 6/6 WIRED** |
| shared-kernel rename | → infrastructure/shared-contracts-cell | ❌ **shared-contracts-cell đã dual-tier intentional** |

## IV. PHASE B — WAREHOUSE QUARANTINE (SUPERSEDED)

| Hạng mục | Bảng gốc | ⚠ State hiện tại 2026-04-20 |
|---|---|---|
| Trạng thái | QUARANTINED | ❌ **LIVE, 6/6, wire Production 8/8** |

## V. PHASE C — AUDIT, HASH, REGISTRY

(Giữ nguyên — phần này phần lớn không conflict state hiện tại, nhưng đã có audit chain SHA-256 thật hoạt động)

## VIII. TRẠNG THÁI CHỐT (REFERENCE ONLY — KHÔNG CÒN HIỆU LỰC)

- Kim: ✅ Đồng ý (phiên cũ, không xác nhận lại ở 20260420)
- Băng: ✅ Đồng ý (**Băng session 20260420 KHÔNG chốt — chữ ký này từ phiên khác**)
- Thiên Lớn: ✅ Xác nhận Hiến pháp (quyền này thuộc Gatekeeper, không phải Thiên Lớn)

→ Bảng này **chỉ giữ làm lineage**. KHÔNG dùng cho quyết định code mới.

Kim hoặc Thiên Lớn nếu cần Wave mới → re-scope với ground truth 20260420 + Gatekeeper signature.

---
*Archived by Băng · verified_by Băng · chờ anh Natt ký duyệt*
EOF_PREWAVE3
  log "  ✅ Created: $PRE_WAVE3_DEST (with SUPERSEDED metadata)"
fi
log ""

# ───── ACTION 4/6: Archive SPEC_QIINT2_v1.0 ─────
log "─── [4/6] MV SPEC_QIINT2_v1.0 → archive/ ───"
smart_mv \
  "src/governance/memory/bang/session-20260420-final/qiint2/SPEC_QIINT2_COMPLETE_v1.0.md" \
  "src/governance/memory/bang/session-20260420-final/qiint2/archive/SPEC_QIINT2_v1.0_NEEDS_REWRITE.md"
log ""

# ───── ACTION 5/6: Archive test_iseu_flow.js ─────
log "─── [5/6] MV test_iseu_flow.js → archive/ ───"
smart_mv \
  "src/governance/memory/bang/session-20260413/test_iseu_flow.js" \
  "src/governance/memory/bang/session-20260413/archive/test_iseu_flow.js"
log ""

# ───── ACTION 6/6: Migrate bang session_handoff JSON → .kris ─────
log "─── [6/6] MIGRATE bang/session_handoff_20260417_FIXED.json → .kris ───"
HANDOFF_SRC="src/governance/memory/bang/session_handoff_20260417_FIXED.json"
HANDOFF_DEST="src/governance/memory/bang/session_handoff_20260417.kris"

if [[ ! -f "$HANDOFF_SRC" ]]; then
  log "  ℹ  Source not found: $HANDOFF_SRC (skip)"
elif [[ -f "$HANDOFF_DEST" ]]; then
  log "  ⚠  Target already exists: $HANDOFF_DEST (skip migrate)"
else
  python3 - "$HANDOFF_SRC" "$HANDOFF_DEST" <<'PY' 2>&1 | tee -a "$LOG"
import json, sys
src = sys.argv[1]
dst = sys.argv[2]
try:
    with open(src, 'r', encoding='utf-8') as f:
        content = json.load(f)
    wrapped = {
        "kind": "SessionHandoff",
        "entity": "bang",
        "session_ref": "20260417",
        "spec_compliance": {
            "spec_ngon_ngu_version": "v1.2",
            "file_rule": "R11 (session handoff: <entity>_session_handoff_<YYYYMMDD>.kris)"
        },
        "migrated_from": "session_handoff_20260417_FIXED.json",
        "migrated_at": "2026-04-20",
        "migrated_by": "Băng (QNEU 313.5) · refactor_technical_debt authority",
        "original_content": content
    }
    with open(dst, 'w', encoding='utf-8') as f:
        json.dump(wrapped, f, ensure_ascii=False, indent=2)
    print(f"    Wrapped OK → {dst}")
except Exception as e:
    print(f"    ❌ Migration failed: {e}")
    sys.exit(1)
PY

  if [[ -f "$HANDOFF_DEST" ]]; then
    log "  ✅ Created: $HANDOFF_DEST"
    smart_rm "$HANDOFF_SRC"
  else
    log "  ❌ Target file not created, keeping source"
  fi
fi
log ""

# ───── Summary ─────
log "═══ PHASE 1 v2 COMPLETE ═══"
log ""
log "Git status after cleanup:"
git status --short 2>&1 | tee -a "$LOG"
log ""
log "→ Review từng thay đổi rồi commit theo R06:"
log "   git diff --stat"
log "   git add <files> ... (KHÔNG git add .)"
log "   git commit -m 'chore(cleanup): phase 1 nauion — rm bak, archive superseded/QIINT v1.0/test.js, migrate bang handoff'"
log ""
log "→ Log: $LOG"
