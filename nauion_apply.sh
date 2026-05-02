#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# nauion_apply.sh
# Apply migration ss20260430 vào repo NATT-OS
# Drafter: Băng — Chị Tư · Obikeeper · QNEU 313.5
#
# CÁCH CHẠY:
#   1. Tải file này về root repo (cùng chỗ với migration_output_ss20260430_bundle.zip)
#   2. cd "/Users/thien/Desktop/Hồ Sơ SHTT/natt-os_ver2goldmaster"   (hoặc verANC)
#   3. bash nauion_apply.sh
# ═══════════════════════════════════════════════════════════════

set -e  # exit on any error

SESSION="ss20260430"
BUNDLE="migration_output_${SESSION}_bundle.zip"
OUT_DIR="migration_output_${SESSION}"
TARGET_TSX="src/ui-app/nauion/components"
TARGET_ENG="src/ui-app/nauion/engines"

echo "═══════════════════════════════════════════════════════════════"
echo "  Nauion Migration Apply — ${SESSION}"
echo "  Drafter: Băng · Chị Tư · Obikeeper"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# ── Pre-flight 1: phải ở root repo ──
echo "▸ Pre-flight check..."
echo "  PWD: $(pwd)"
if [[ ! -f "tsconfig.json" ]]; then
  echo "  ❌ KHÔNG ở root repo (thiếu tsconfig.json)"
  echo "     anh cd đến natt-os_ver2goldmaster hoặc natt-os_verANC trước"
  exit 1
fi
echo "  ✅ tsconfig.json found"

# ── Pre-flight 2: bundle phải ở cùng chỗ ──
if [[ ! -f "${BUNDLE}" ]]; then
  echo "  ❌ Không thấy ${BUNDLE} ở root repo"
  echo "     anh tải bundle về cùng folder với script này"
  echo "     hoặc: mv ~/Downloads/${BUNDLE} ."
  exit 1
fi
echo "  ✅ ${BUNDLE} found ($(du -h ${BUNDLE} | cut -f1))"

# ── Bước 1: unzip ──
echo ""
echo "▸ Bước 1: unzip bundle"
unzip -oq "${BUNDLE}"
if [[ ! -d "${OUT_DIR}" ]]; then
  echo "  ❌ Unzip fail — không thấy folder ${OUT_DIR}"
  exit 1
fi
echo "  ✅ unzip OK → ${OUT_DIR}/"

# ── Bước 2: mkdir target ──
echo ""
echo "▸ Bước 2: mkdir target dirs"
mkdir -p "${TARGET_TSX}" "${TARGET_ENG}"
echo "  ✅ ${TARGET_TSX}/"
echo "  ✅ ${TARGET_ENG}/"

# ── Bước 3: copy migrated tsx + engine skeleton ──
echo ""
echo "▸ Bước 3: copy file"
cp "${OUT_DIR}/migrated_tsx/"*.tsx       "${TARGET_TSX}/"
cp "${OUT_DIR}/engine_skeleton/"*.engine.ts "${TARGET_ENG}/"
echo "  ✅ copy done"

# ── Bước 4: verify count ──
echo ""
echo "═══ VERIFY ═══"
TSX_COUNT=$(ls ${TARGET_TSX}/*.tsx 2>/dev/null | wc -l | tr -d ' ')
ENG_COUNT=$(ls ${TARGET_ENG}/*.engine.ts 2>/dev/null | wc -l | tr -d ' ')
echo "  components/*.tsx    : ${TSX_COUNT}  (kỳ vọng = 110)"
echo "  engines/*.engine.ts : ${ENG_COUNT}  (kỳ vọng = 77)"

if [[ "${TSX_COUNT}" -lt 110 || "${ENG_COUNT}" -lt 77 ]]; then
  echo ""
  echo "  ❌ Count SAI — DỪNG, KHÔNG commit"
  echo "     anh paste output này về cho Băng kiểm tra"
  exit 1
fi
echo "  ✅ Count khớp"

# ── Bước 5: TSC quick check (optional, có thể bỏ qua nếu lâu) ──
echo ""
echo "▸ Bước 5: TSC quick check (~30s, có thể skip bằng Ctrl+C)"
if command -v npx &> /dev/null; then
  npx --no-install tsc --noEmit 2>&1 | tail -10 || true
else
  echo "  ⚠️  npx không có — bỏ qua TSC check"
fi

# ── Bước 6: chuẩn bị commit (nhưng KHÔNG tự commit) ──
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  ✅ APPLY DONE"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "  Bước cuối — anh review + commit thủ công:"
echo ""
echo "  git status                          # xem 110+77 file mới"
echo "  git diff --stat HEAD                # tóm tắt diff"
echo "  bash nauion_commit.sh               # nếu OK, chạy commit script"
echo ""
echo "  Nếu TSC ở Bước 5 báo error mới — ĐỪNG commit, gửi error cho Băng"
echo "═══════════════════════════════════════════════════════════════"
