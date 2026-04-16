#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# ARCHIVE SCRIPTS.ZIP — TẤT TOÁN
# ═══════════════════════════════════════════════════════════════════════════
# Mục đích: Phân loại 45 script trong scripts.zip vào archive/ có trật tự
#
# Cách dùng:
#   bash archive_scripts.sh           → DRY RUN (chỉ in, không làm gì)
#   bash archive_scripts.sh --go      → EXECUTE THẬT
#
# Tạo bởi: Băng (Chị Tư)
# Ngày:    2026-04-16
# ═══════════════════════════════════════════════════════════════════════════

set -e

REPO_ROOT="/Users/thien/Desktop/Hồ Sơ SHTT/natt-os_ver2goldmaster"
cd "$REPO_ROOT"

DRY=true
if [ "$1" = "--go" ]; then
  DRY=false
  echo "⚠️  EXECUTE MODE — THẬT. Ctrl+C trong 5s để hủy..."
  sleep 5
fi

run() {
  if $DRY; then
    echo "   [DRY] $*"
  else
    eval "$@"
  fi
}

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  ARCHIVE SCRIPTS.ZIP — TẤT TOÁN"
echo "  Mode: $([ "$DRY" = true ] && echo 'DRY RUN (preview)' || echo 'EXECUTE')"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# ─────────────────────────────────────────────────────────────────────
# [0] EXTRACT ZIP vào thư mục tạm
# ─────────────────────────────────────────────────────────────────────
TMP_DIR="/tmp/natt_scripts_unpack_$$"
echo "[0] Extract scripts.zip → $TMP_DIR"
run "mkdir -p '$TMP_DIR'"
run "unzip -q -o scripts.zip -d '$TMP_DIR'"
run "rm -rf '$TMP_DIR/__MACOSX'"
SRC="$TMP_DIR/scripts"
echo ""

# ─────────────────────────────────────────────────────────────────────
# [1] TẠO FOLDER STRUCTURE
# ─────────────────────────────────────────────────────────────────────
echo "[1] Tạo folder structure"
for d in \
  "audit/shtt/seed-scripts" \
  "archive/scripts/seed" \
  "archive/scripts/migration" \
  "archive/scripts/audit-lineage" \
  "archive/scripts/one-shot" \
  "archive/scripts/constitution" \
  "archive/scripts/deploy" \
  "archive/scripts/build" \
  "archive/scripts/tools" \
  "archive/scripts/tests" \
  "archive/scripts/_source-zip"; do
  run "mkdir -p '$d'"
done
echo ""

# ─────────────────────────────────────────────────────────────────────
# [2] SHTT SEED — patent_upgrade.py (tách riêng vì là pháp lý)
# ─────────────────────────────────────────────────────────────────────
echo "[2] SHTT Seed (1 file)"
run "cp '$SRC/patent_upgrade.py' 'audit/shtt/seed-scripts/kim-patent-architecture-upgrade-v1.py'"
echo ""

# ─────────────────────────────────────────────────────────────────────
# [3] PRODUCTION SEED — deepseek_bash (seed 9 cells)
# ─────────────────────────────────────────────────────────────────────
echo "[3] Production Seed (1 file)"
run "cp '$SRC/deepseek_bash_20260312_3b845e.sh' 'archive/scripts/seed/kim-20260312-production-chain-seed.sh'"
echo ""

# ─────────────────────────────────────────────────────────────────────
# [4] ACTIVE — 4 file đã có trong scripts/ (chỉ verify)
# ─────────────────────────────────────────────────────────────────────
echo "[4] Active scripts (verify md5 với scripts/ hiện tại):"
for f in kernel_phase1_scan.mjs capability_scanner.js validate-manifests.js test-anti-fraud-full.ts; do
  if [ -f "scripts/$f" ]; then
    LIVE_MD5=$(md5 -q "scripts/$f" 2>/dev/null || md5sum "scripts/$f" 2>/dev/null | awk '{print $1}')
    ZIP_MD5=$(md5 -q "$SRC/$f" 2>/dev/null || md5sum "$SRC/$f" 2>/dev/null | awk '{print $1}')
    if [ "$LIVE_MD5" = "$ZIP_MD5" ]; then
      echo "   ✓ scripts/$f — md5 trùng, skip"
    else
      echo "   ⚠ scripts/$f — md5 KHÁC! live=$LIVE_MD5 zip=$ZIP_MD5"
    fi
  else
    echo "   ! scripts/$f — KHÔNG CÓ trong scripts/ hiện tại, copy từ zip"
    run "cp '$SRC/$f' 'scripts/$f'"
  fi
done
echo ""

# ─────────────────────────────────────────────────────────────────────
# [5] MIGRATION FIX — 10 file
# ─────────────────────────────────────────────────────────────────────
echo "[5] Migration fix scripts (10 file)"
for f in bang_fix.py fix_all_errors.py fix_part3.py fix_part4.py fix_part5.py fix_part6.py fix_part7.py fix_part8.py fix_remaining.py; do
  run "cp '$SRC/$f' 'archive/scripts/migration/'"
done
echo ""

# ─────────────────────────────────────────────────────────────────────
# [6] AUDIT LINEAGE — 5 file ancestor của nattos.sh
# ─────────────────────────────────────────────────────────────────────
echo "[6] Audit lineage (5 file — tổ tiên của nattos.sh v6.1)"
for f in nattos.v3.sh nattos.v4.sh natt-os-pre-wave3.sh natt_os_realtime_audit.sh anattos.sh; do
  run "cp '$SRC/$f' 'archive/scripts/audit-lineage/'"
done
echo ""

# ─────────────────────────────────────────────────────────────────────
# [7] ONE-SHOT DESTRUCTIVE — 6 file không bao giờ chạy lại
# ─────────────────────────────────────────────────────────────────────
echo "[7] One-shot destructive (6 file — ⚠️ không chạy lại)"
for f in supreme-purge-v8.1.sh purge-v6-1.sh emergency-rollback.sh ironclad-casing-v7.1.sh final-casing-round.sh fix-case-sensitivity.sh; do
  run "cp '$SRC/$f' 'archive/scripts/one-shot/'"
done
echo ""

# ─────────────────────────────────────────────────────────────────────
# [8] CONSTITUTION GOVERNANCE — 4 file
# ─────────────────────────────────────────────────────────────────────
echo "[8] Constitution / governance (4 file)"
for f in constitution-v4-deploy.sh kim-step3-lock-gatekeeper.sh sync-tree-from-constitution.sh NeuralMAINCell.sh; do
  run "cp '$SRC/$f' 'archive/scripts/constitution/'"
done
echo ""

# ─────────────────────────────────────────────────────────────────────
# [9] DEPLOY — 3 file
# ─────────────────────────────────────────────────────────────────────
echo "[9] Deploy (3 file)"
for f in deploy-nattos.sh deploy-production.sh validate-deployment.sh; do
  run "cp '$SRC/$f' 'archive/scripts/deploy/'"
done
echo ""

# ─────────────────────────────────────────────────────────────────────
# [10] BUILD — 3 file
# ─────────────────────────────────────────────────────────────────────
echo "[10] Build (3 file)"
for f in safe-build.sh safe-build-sprint2.sh build_cells.py; do
  run "cp '$SRC/$f' 'archive/scripts/build/'"
done
echo ""

# ─────────────────────────────────────────────────────────────────────
# [11] TOOLS — 4 file
# ─────────────────────────────────────────────────────────────────────
echo "[11] Tools (4 file)"
for f in move_components.sh restructure.sh smartlink_rebuild.py phase2_cleanup_and_lock.sh; do
  run "cp '$SRC/$f' 'archive/scripts/tools/'"
done
echo ""

# ─────────────────────────────────────────────────────────────────────
# [12] TESTS — 4 file
# ─────────────────────────────────────────────────────────────────────
echo "[12] Tests (4 file)"
for f in test-anti-fraud.ts test-bctc-runtime.ts buyback-check.ts cdkt-debug.ts; do
  run "cp '$SRC/$f' 'archive/scripts/tests/'"
done
echo ""

# ─────────────────────────────────────────────────────────────────────
# [13] TẠO README TRONG MỖI BUCKET
# ─────────────────────────────────────────────────────────────────────
echo "[13] Tạo README cho mỗi bucket"

if ! $DRY; then
cat > audit/shtt/seed-scripts/README.md << 'EOF'
# SHTT SEED SCRIPTS

⚖️ **ARTIFACT PHÁP LÝ** — Không sửa đổi, không xóa.

## Files

### `kim-patent-architecture-upgrade-v1.py`
- **Tác giả:** Kim (DeepSeek AI entity)
- **Hash:** patent_upgrade.py
- **Dòng:** 1057
- **Tạo ra:** 6 patent-critical modules cho hồ sơ SHTT
  1. EventEnvelopeFactory — Distributed causality chain
  2. DeterministicRouter — Priority + policy gating
  3. PolicySignatureEngine — Tamper-resistant governance
  4. CellHealthMonitor — Self-healing cell network
  5. ImmutableMemoryEngine — Append-only hash chain
  6. SnapshotEngine — Deterministic verified rollback

**Trạng thái:** ĐÃ CHẠY — output tồn tại tại `src/core/` + `src/governance/policy/`
**Link với hồ sơ NOIP:** Claims 1–6 trong 10 claims đã nộp.
EOF

cat > archive/scripts/README.md << 'EOF'
# ARCHIVE SCRIPTS

Nơi lưu các script một-lần / lịch sử. KHÔNG chạy lại trong repo hiện tại.

## Structure

| Folder | Purpose |
|---|---|
| `seed/` | Script khai sinh (chỉ chạy 1 lần trong đời repo) |
| `migration/` | Fix series — cleanup @ts-nocheck, case sensitivity |
| `audit-lineage/` | Tổ tiên của `nattos.sh` v6.1 hiện tại |
| `one-shot/` | Destructive: purge, rollback, casing fix |
| `constitution/` | Triển khai Hiến Pháp + Gatekeeper lock |
| `deploy/` | Deploy scripts (có thể vẫn dùng, đã archive snapshot) |
| `build/` | Build scripts |
| `tools/` | Utility: restructure, move components |
| `tests/` | Test scripts (ngoài test-anti-fraud-full đang active) |
| `_source-zip/` | Zip gốc — bảo vật "mỏ vàng" |

## Nguyên tắc

- Các script trong `seed/` và `one-shot/` **KHÔNG CHẠY LẠI**.
- Các script trong `deploy/` và `build/` có thể tham chiếu nhưng bản active nên di chuyển ra `scripts/`.
EOF

cat > archive/scripts/seed/README.md << 'EOF'
# SEED SCRIPTS — MOMENT ZERO

⚠️ **CHỈ CHẠY 1 LẦN TRONG ĐỜI REPO. KHÔNG BAO GIỜ CHẠY LẠI.**

## `kim-20260312-production-chain-seed.sh`

- **Tác giả:** Kim (DeepSeek AI)
- **Ngày:** 2026-03-12
- **Hash gốc:** 3b845e
- **Dòng:** 588

**Mục đích:** Khai sinh production chain Tâm Luxury từ 0.

**Tạo ra:**
- 9 cells business ban đầu: order, prdmaterials, casting, stone, finishing, polishing, inventory, tax, dust-recovery
- 3 satellites: port-forge, boundary-guard, trace-logger
- 12 event contracts domain kim hoàn: ORDER_CREATED, CASTING_REQUEST, WIP_PHOI, WIP_STONE, WIP_NGUOI (9 giai đoạn thợ), DUST_RETURNED, WIP_COMPLETED, DUST_RECOVERED, DUST_ALERT, CARRY_FORWARD_PROPOSAL/APPROVED, DUST_CLOSE_REPORT
- smartAudit.sh v1 (tổ tiên của nattos.sh v6.1)

**Repo hiện tại đã tiến hóa thành:** 37 cells, 86 event types, nattos.sh v6.1 2020 dòng.

🚨 **NẾU CHẠY LẠI:**
- Line 319-417: OVERWRITE 37 cells hiện có bằng stub trống
- Line 492-513: Ghi đè tsconfig.json
- Line 577-580: `git init && git add . && git commit` — PHÁ hoàn toàn git history

Giữ làm **moment zero** của Tâm Luxury NattOS.
EOF

cat > archive/scripts/one-shot/README.md << 'EOF'
# ONE-SHOT DESTRUCTIVE SCRIPTS

⚠️ **CÁC SCRIPT NÀY ĐÃ CHẠY XONG NHIỆM VỤ. CHẠY LẠI = PHÁ REPO.**

- `supreme-purge-v8.1.sh`, `purge-v6-1.sh` — xóa thư mục hàng loạt
- `emergency-rollback.sh` — rollback protocol
- `ironclad-casing-v7.1.sh`, `final-casing-round.sh`, `fix-case-sensitivity.sh` — fix case sensitivity trên macOS
EOF

cat > archive/scripts/migration/README.md << 'EOF'
# MIGRATION FIX SERIES

10 file Python sinh ra trong quá trình migrate @ts-nocheck, fix import errors.
Tổng ~150 KB. Lịch sử của cuộc chuyển đổi.
Đã chạy, đã xong. Giữ làm tham chiếu, không chạy lại.
EOF

cat > archive/scripts/audit-lineage/README.md << 'EOF'
# NATTOS.SH LINEAGE

Tổ tiên của `nattos.sh` v6.1 (2020 dòng, 96 KB) hiện tại.

| File | Size | Vai trò |
|---|---|---|
| `anattos.sh` | 12 KB | Biến thể sớm |
| `natt_os_realtime_audit.sh` | 33 KB | Realtime audit experiment |
| `nattos.v3.sh` | 58 KB | Phiên bản v3 |
| `natt-os-pre-wave3.sh` | 52 KB | Pre-wave-3 audit |
| `nattos.v4.sh` | 61 KB | Phiên bản v4 |

Đọc để hiểu evolution. Không chạy trực tiếp.
EOF
fi
echo ""

# ─────────────────────────────────────────────────────────────────────
# [14] DI CHUYỂN scripts.zip → _source-zip
# ─────────────────────────────────────────────────────────────────────
echo "[14] Move scripts.zip → archive/scripts/_source-zip/ (giữ mỏ vàng gốc)"
run "mv scripts.zip archive/scripts/_source-zip/scripts-2026-04-14-source.zip"
echo ""

# ─────────────────────────────────────────────────────────────────────
# [15] CLEANUP TMP
# ─────────────────────────────────────────────────────────────────────
echo "[15] Cleanup temp"
run "rm -rf '$TMP_DIR'"
echo ""

# ─────────────────────────────────────────────────────────────────────
# [16] SUMMARY
# ─────────────────────────────────────────────────────────────────────
echo "═══════════════════════════════════════════════════════════════"
if $DRY; then
  echo "  ✓ DRY RUN XONG — Chưa thay đổi gì."
  echo "  Chạy lại với '--go' để thực thi thật:"
  echo "    bash archive_scripts.sh --go"
else
  echo "  ✅ TẤT TOÁN XONG"
  echo ""
  echo "  Kiểm tra kết quả:"
  echo "    find audit/shtt archive/scripts -type f | sort"
fi
echo "═══════════════════════════════════════════════════════════════"
