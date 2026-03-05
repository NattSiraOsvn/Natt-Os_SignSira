#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# QNEU RUNTIME — DEPLOY SCRIPT
# Gieo hạt lượng tử đầu tiên vào NATT-OS
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  QNEU Runtime Deploy — Hạt lượng tử đầu tiên"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Check we're in NATT-OS root
if [ ! -d "src/governance" ]; then
    echo "❌ Chạy từ thư mục gốc NATT-OS!"
    exit 1
fi

# Create QNEU directory in governance (NOT in cells — QNEU measures AI, not cells)
QNEU_DIR="src/governance/qneu"
mkdir -p "$QNEU_DIR"
mkdir -p "$QNEU_DIR/data"
mkdir -p "$QNEU_DIR/data/sessions"

echo "  ✅ Created $QNEU_DIR/"

# Copy all QNEU files
# (Assumes qneu-runtime/ files are in same directory as this script)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

for f in types.ts calculator.ts imprint-engine.ts validator.ts persistence.ts runtime.ts index.ts first-seed.ts; do
    if [ -f "$SCRIPT_DIR/$f" ]; then
        cp "$SCRIPT_DIR/$f" "$QNEU_DIR/$f"
        echo "  ✅ Deployed: $f"
    else
        echo "  ❌ Missing: $f"
    fi
done

echo ""
echo "  Files deployed to: $QNEU_DIR/"
echo ""

# Add to tsconfig exclude if needed (data dir shouldn't be compiled)
echo "  ⚠️  Thêm vào tsconfig.json exclude nếu cần:"
echo '     "src/governance/qneu/data/**"'
echo '     "src/governance/qneu/first-seed.ts"'
echo ""

# Run first seed
echo "  Để gieo hạt đầu tiên:"
echo "    npx ts-node src/governance/qneu/first-seed.ts"
echo ""
echo "  Sau khi gieo, dữ liệu persist tại:"
echo "    src/governance/qneu/data/system-state.json"
echo "    src/governance/qneu/data/audit-log.jsonl"
echo "    src/governance/qneu/data/sessions/"
echo ""
