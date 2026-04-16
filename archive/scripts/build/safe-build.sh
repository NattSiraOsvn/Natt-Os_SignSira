#!/bin/bash
# ============================================================
# NATT-OS SAFE BUILD SCRIPT – Production Chain
# Version: 1.0.0 | Sprint 1-2.5
#
# SAFE: chỉ tạo thư mục và copy files vào repo
# KHÔNG đụng: git, tsconfig.json, package.json
#
# Cách dùng:
#   chmod +x safe-build.sh
#   ./safe-build.sh /path/to/natt-os-repo
# ============================================================

set -e

REPO_DIR="${1:-$(pwd)}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "🚀 NATT-OS Safe Build – Production Chain"
echo "📁 Target repo: $REPO_DIR"
echo ""

# Verify repo exists và có dấu hiệu đúng repo
if [ ! -d "$REPO_DIR/src" ]; then
  echo "❌ ERROR: $REPO_DIR/src không tồn tại. Kiểm tra lại đường dẫn repo."
  exit 1
fi

if [ ! -f "$REPO_DIR/tsconfig.json" ]; then
  echo "⚠️ WARNING: tsconfig.json không tìm thấy. Đảm bảo đây đúng là NATT-OS repo."
  read -p "Tiếp tục? (y/N): " confirm
  [ "$confirm" != "y" ] && exit 1
fi

echo "✅ Repo verified: $REPO_DIR"
echo ""

# ─────────────────────────────────────────────
# 1. Tạo thư mục (idempotent)
# ─────────────────────────────────────────────
echo "📂 Tạo cấu trúc thư mục..."

mkdir -p "$REPO_DIR/src/governance/event-contracts"
mkdir -p "$REPO_DIR/src/cells/business/order-cell"/{domain,application,infrastructure,interface,ports}
mkdir -p "$REPO_DIR/src/cells/business/prdmaterials-cell"/{domain,application,infrastructure,interface,ports}
mkdir -p "$REPO_DIR/src/cells/business/casting-cell"/{domain,application,infrastructure,interface,ports}
mkdir -p "$REPO_DIR/src/cells/business/stone-cell"/{domain,application,infrastructure,interface,ports}
mkdir -p "$REPO_DIR/src/cells/business/finishing-cell"/{domain,application,infrastructure,interface,ports}
mkdir -p "$REPO_DIR/src/cells/business/polishing-cell"/{domain,application,infrastructure,interface,ports}
mkdir -p "$REPO_DIR/src/cells/business/inventory-cell"/{domain,application,infrastructure,interface,ports}
mkdir -p "$REPO_DIR/src/cells/business/tax-cell"/{domain,application,infrastructure,interface,ports}
mkdir -p "$REPO_DIR/src/cells/infrastructure/dust-recovery-cell"/{domain,application,infrastructure,interface,ports}

echo "✅ Thư mục OK"
echo ""

# ─────────────────────────────────────────────
# 2. Copy files từ package này vào repo
# ─────────────────────────────────────────────
echo "📋 Copy files..."

SRC="$SCRIPT_DIR/src"

copy_if_new() {
  local src="$1"
  local dst="$2"
  if [ -f "$dst" ]; then
    echo "  ⏭️  Skip (đã tồn tại): $(basename $dst)"
  else
    cp "$src" "$dst"
    echo "  ✅ Copied: $(basename $dst)"
  fi
}

# Event contracts – luôn overwrite (source of truth)
echo "→ Event contracts..."
cp "$SRC/governance/event-contracts/production-events.ts" \
   "$REPO_DIR/src/governance/event-contracts/production-events.ts"
echo "  ✅ production-events.ts (overwrite – source of truth)"

# Sprint 1 cells
echo "→ order-cell..."
for f in domain/order.entity.ts application/order.usecase.ts infrastructure/order.engine.ts infrastructure/order.repository.ts interface/order.sheets.adapter.ts ports/order.smartlink.port.ts cell.manifest.json index.ts; do
  copy_if_new "$SRC/cells/business/order-cell/$f" "$REPO_DIR/src/cells/business/order-cell/$f"
done

echo "→ prdmaterials-cell..."
for f in domain/prdmaterials.entity.ts application/prdmaterials.usecase.ts infrastructure/prdmaterials.engine.ts interface/prdmaterials.sheets.adapter.ts cell.manifest.json index.ts; do
  copy_if_new "$SRC/cells/business/prdmaterials-cell/$f" "$REPO_DIR/src/cells/business/prdmaterials-cell/$f"
done

echo "→ casting-cell..."
for f in domain/casting.entity.ts application/casting.usecase.ts infrastructure/casting.engine.ts interface/casting.sheets.adapter.ts cell.manifest.json index.ts; do
  copy_if_new "$SRC/cells/business/casting-cell/$f" "$REPO_DIR/src/cells/business/casting-cell/$f"
done

# Sprint 2.5 – dust-recovery-cell (full implementation)
echo "→ dust-recovery-cell (Sprint 2.5)..."
for f in domain/dust.entity.ts application/dust.usecase.ts infrastructure/dust.engine.ts cell.manifest.json index.ts; do
  copy_if_new "$SRC/cells/infrastructure/dust-recovery-cell/$f" "$REPO_DIR/src/cells/infrastructure/dust-recovery-cell/$f"
done

# Sprint 2 skeletons
echo "→ stone-cell (skeleton Sprint 2)..."
copy_if_new "$SRC/cells/business/stone-cell/cell.manifest.json" "$REPO_DIR/src/cells/business/stone-cell/cell.manifest.json"
copy_if_new "$SRC/cells/business/stone-cell/index.ts" "$REPO_DIR/src/cells/business/stone-cell/index.ts"

echo "→ finishing-cell (skeleton Sprint 2 + role enforcement)..."
copy_if_new "$SRC/cells/business/finishing-cell/domain/finishing.entity.ts" "$REPO_DIR/src/cells/business/finishing-cell/domain/finishing.entity.ts"
copy_if_new "$SRC/cells/business/finishing-cell/cell.manifest.json" "$REPO_DIR/src/cells/business/finishing-cell/cell.manifest.json"
copy_if_new "$SRC/cells/business/finishing-cell/index.ts" "$REPO_DIR/src/cells/business/finishing-cell/index.ts"

# Sprint 3 skeletons
for cell in polishing-cell inventory-cell tax-cell; do
  echo "→ $cell (skeleton Sprint 3)..."
  copy_if_new "$SRC/cells/business/$cell/cell.manifest.json" "$REPO_DIR/src/cells/business/$cell/cell.manifest.json"
  copy_if_new "$SRC/cells/business/$cell/index.ts" "$REPO_DIR/src/cells/business/$cell/index.ts"
done

echo ""
echo "─────────────────────────────────────────────"
echo "✅ Copy hoàn tất"
echo ""

# ─────────────────────────────────────────────
# 3. Verify – đếm files created
# ─────────────────────────────────────────────
echo "🔍 Verify..."

TOTAL=0
MISSING=0

check_file() {
  TOTAL=$((TOTAL + 1))
  if [ ! -f "$1" ]; then
    echo "  ❌ MISSING: $1"
    MISSING=$((MISSING + 1))
  fi
}

check_file "$REPO_DIR/src/governance/event-contracts/production-events.ts"
check_file "$REPO_DIR/src/cells/business/order-cell/domain/order.entity.ts"
check_file "$REPO_DIR/src/cells/business/order-cell/application/order.usecase.ts"
check_file "$REPO_DIR/src/cells/business/order-cell/infrastructure/order.engine.ts"
check_file "$REPO_DIR/src/cells/business/prdmaterials-cell/domain/prdmaterials.entity.ts"
check_file "$REPO_DIR/src/cells/business/casting-cell/domain/casting.entity.ts"
check_file "$REPO_DIR/src/cells/infrastructure/dust-recovery-cell/domain/dust.entity.ts"
check_file "$REPO_DIR/src/cells/infrastructure/dust-recovery-cell/application/dust.usecase.ts"
check_file "$REPO_DIR/src/cells/infrastructure/dust-recovery-cell/infrastructure/dust.engine.ts"
check_file "$REPO_DIR/src/cells/business/finishing-cell/domain/finishing.entity.ts"

if [ $MISSING -eq 0 ]; then
  echo "✅ Verify passed: $TOTAL/$TOTAL files present"
else
  echo "⚠️  $MISSING/$TOTAL files missing"
fi

echo ""
echo "─────────────────────────────────────────────"
echo "🏁 SAFE BUILD COMPLETE"
echo ""
echo "⚠️  KHÔNG tự động commit. Làm thủ công:"
echo "   cd $REPO_DIR"
echo "   git status"
echo "   git diff --stat"
echo "   # Review kỹ trước khi add"
echo "   git add src/governance/event-contracts/production-events.ts"
echo "   git add src/cells/business/order-cell/"
echo "   git add src/cells/business/prdmaterials-cell/"
echo "   git add src/cells/business/casting-cell/"
echo "   git add src/cells/infrastructure/dust-recovery-cell/"
echo "   git add src/cells/business/finishing-cell/domain/"
echo "   git commit -m 'feat(production): Sprint 1 cells + dust-recovery-cell skeleton'"
echo ""
echo "📋 Tiếp theo: chạy tsc để verify 0 errors trước khi commit"
echo "   npx tsc --noEmit"
