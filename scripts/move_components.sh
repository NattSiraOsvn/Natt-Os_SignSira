#!/usr/bin/env bash
# Chạy từ project root: bash move_components.sh /path/to/Lưu\ trữ/
# Hoặc: bash move_components.sh   (nếu folder Lưu trữ đã giải nén cùng chỗ)

ROOT="$(pwd)"
SRC="$ROOT/src/components"
ZIP_DIR="${1:-$ROOT/Lưu trữ}"   # nhận arg hoặc dùng default

if [ ! -d "$ZIP_DIR" ]; then
  echo "❌  Không tìm thấy folder: $ZIP_DIR"
  echo "    Dùng: bash move_components.sh /đường/dẫn/tới/folder"
  exit 1
fi

move() {
  local s="$1" d="$2"
  [ -f "$s" ] || { echo "  SKIP (không có) ${s##*/}"; return; }
  mkdir -p "$(dirname "$d")"
  cp "$s" "$d"
  echo "  ✅  ${s##$ZIP_DIR/}  →  ${d#$ROOT/}"
}

echo ""
echo "══════════════════════════════════════════"
echo "  MOVE → src/components/"
echo "══════════════════════════════════════════"

echo ""
echo "── admin/ ──"
move "$ZIP_DIR/admin/audit-dashboard.tsx"               "$SRC/admin/audit-dashboard.tsx"

echo ""
echo "── analytics/ ──"
move "$ZIP_DIR/analytics/governance-kpi-board.tsx"      "$SRC/analytics/governance-kpi-board.tsx"

echo ""
echo "── approval/ ──"
move "$ZIP_DIR/approval/approval-dashboard.tsx"         "$SRC/approval/approval-dashboard.tsx"

echo ""
echo "── calibration/ ──"
move "$ZIP_DIR/calibration/calibration-wizard.tsx"      "$SRC/calibration/calibration-wizard.tsx"

echo ""
echo "── common/ (giữ PascalCase có nội dung, bỏ kebab-case rỗng) ──"
move "$ZIP_DIR/common/ErrorBoundary.tsx"                "$SRC/common/ErrorBoundary.tsx"
move "$ZIP_DIR/common/LoadingSpinner.tsx"               "$SRC/common/LoadingSpinner.tsx"
move "$ZIP_DIR/common/error-display.tsx"                "$SRC/common/error-display.tsx"
move "$ZIP_DIR/common/luxury-button.tsx"                "$SRC/common/luxury-button.tsx"
move "$ZIP_DIR/common/natt-3d-icon.tsx"                 "$SRC/common/natt-3d-icon.tsx"
move "$ZIP_DIR/common/permission-guard.tsx"             "$SRC/common/permission-guard.tsx"
# error-boundary.tsx (0 dòng) và loading-spinner.tsx (6 dòng) — BỎ, dùng PascalCase bên trên

echo ""
echo "── compliance/ ──"
move "$ZIP_DIR/compliance/certification-manager.tsx"    "$SRC/compliance/certification-manager.tsx"
move "$ZIP_DIR/compliance/compliance-dashboard.tsx"     "$SRC/compliance/compliance-dashboard.tsx"
move "$ZIP_DIR/compliance/policy-manager.tsx"           "$SRC/compliance/policy-manager.tsx"

echo ""
echo "── financial/ (giữ PascalCase có nội dung) ──"
move "$ZIP_DIR/financial/FinancialDashboard.tsx"        "$SRC/financial/FinancialDashboard.tsx"
# financial-dashboard.tsx (0 dòng) — BỎ

echo ""
echo "── gatekeeper/ ──"
move "$ZIP_DIR/gatekeeper/emergency-dashboard.tsx"      "$SRC/gatekeeper/emergency-dashboard.tsx"
move "$ZIP_DIR/gatekeeper/production-gate.tsx"          "$SRC/gatekeeper/production-gate.tsx"

echo ""
echo "── showroom/ ──"
move "$ZIP_DIR/showroom/branch-context-panel.tsx"       "$SRC/showroom/branch-context-panel.tsx"
move "$ZIP_DIR/showroom/experience-trust-block.tsx"     "$SRC/showroom/experience-trust-block.tsx"
move "$ZIP_DIR/showroom/hero-media-block.tsx"           "$SRC/showroom/hero-media-block.tsx"
move "$ZIP_DIR/showroom/owner-vault.tsx"                "$SRC/showroom/owner-vault.tsx"
move "$ZIP_DIR/showroom/product-page.tsx"               "$SRC/showroom/product-page.tsx"
move "$ZIP_DIR/showroom/related-products.tsx"           "$SRC/showroom/related-products.tsx"
move "$ZIP_DIR/showroom/reservation-modal.tsx"          "$SRC/showroom/reservation-modal.tsx"
move "$ZIP_DIR/showroom/specification-block.tsx"        "$SRC/showroom/specification-block.tsx"

echo ""
echo "══════════════════════════════════════════"
echo "  ✅  DONE — 25 files → src/components/"
echo ""
echo "  Bỏ 3 files rỗng/trùng:"
echo "    common/error-boundary.tsx     (0 dòng — dùng ErrorBoundary.tsx)"
echo "    common/loading-spinner.tsx    (6 dòng — dùng LoadingSpinner.tsx)"
echo "    financial/financial-dashboard.tsx (0 dòng — dùng FinancialDashboard.tsx)"
echo ""
echo "  Bước tiếp: npx tsc --noEmit"
echo "══════════════════════════════════════════"
