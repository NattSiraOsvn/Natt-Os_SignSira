#!/bin/bash
# safe-build-sprint2.sh — Sprint 2: finishing-cell + stone-cell full implementation
# KHÔNG đụng: git, tsconfig, package.json
# Chạy: ./safe-build-sprint2.sh "/path/to/natt-os-repo"

set -e
REPO="${1:?Usage: $0 <repo-path>}"

echo "=== NATT-OS Sprint 2 Deploy ==="
echo "Repo: $REPO"

# ── finishing-cell ────────────────────────────────────────────────────────────

SRC="$REPO/src/cells/business/finishing-cell"

mkdir -p "$SRC/application"
mkdir -p "$SRC/interface"

# domain (full replace)
cp "finishing-cell/domain/finishing.entity.ts"         "$SRC/domain/finishing.entity.ts"
cp "finishing-cell/application/finishing.usecase.ts"   "$SRC/application/finishing.usecase.ts"
cp "finishing-cell/infrastructure/finishing.engine.ts" "$SRC/infrastructure/finishing.engine.ts"
cp "finishing-cell/interface/finishing.sheets.adapter.ts" "$SRC/interface/finishing.sheets.adapter.ts"
cp "finishing-cell/index.ts"                           "$SRC/index.ts"

# Remove stub Finishing.engine.ts (đã thay bằng finishing.engine.ts lowercase)
rm -f "$SRC/infrastructure/Finishing.engine.ts"

echo "✓ finishing-cell deployed"

# ── stone-cell ────────────────────────────────────────────────────────────────

SRC="$REPO/src/cells/business/stone-cell"

mkdir -p "$SRC/domain"
mkdir -p "$SRC/application"
mkdir -p "$SRC/interface"

cp "stone-cell/domain/stone.entity.ts"             "$SRC/domain/stone.entity.ts"
cp "stone-cell/application/stone.usecase.ts"       "$SRC/application/stone.usecase.ts"
cp "stone-cell/infrastructure/stone.engine.ts"     "$SRC/infrastructure/stone.engine.ts"
cp "stone-cell/interface/stone.sheets.adapter.ts"  "$SRC/interface/stone.sheets.adapter.ts"
cp "stone-cell/index.ts"                           "$SRC/index.ts"

# Remove stub Stone.engine.ts
rm -f "$SRC/infrastructure/Stone.engine.ts"

echo "✓ stone-cell deployed"

# ── Verify critical files ─────────────────────────────────────────────────────

echo ""
echo "=== Verify ==="
CRITICAL=(
  "src/cells/business/finishing-cell/domain/finishing.entity.ts"
  "src/cells/business/finishing-cell/application/finishing.usecase.ts"
  "src/cells/business/finishing-cell/infrastructure/finishing.engine.ts"
  "src/cells/business/stone-cell/domain/stone.entity.ts"
  "src/cells/business/stone-cell/application/stone.usecase.ts"
  "src/cells/business/stone-cell/infrastructure/stone.engine.ts"
)

ALL_OK=true
for f in "${CRITICAL[@]}"; do
  if [ -f "$REPO/$f" ]; then
    echo "✓ $f"
  else
    echo "✗ MISSING: $f"
    ALL_OK=false
  fi
done

if [ "$ALL_OK" = true ]; then
  echo ""
  echo "=== Sprint 2 deployed. Run TSC: ==="
  echo "cd \"$REPO\" && ./node_modules/.bin/tsc --noEmit 2>&1 | grep 'error TS' | wc -l"
  echo ""
  echo "=== Then commit: ==="
  echo "git add src/cells/business/finishing-cell/ src/cells/business/stone-cell/"
  echo 'git commit -m "feat(sprint2): finishing-cell + stone-cell full implementation"'
else
  echo ""
  echo "⚠ Some files missing — check deploy"
  exit 1
fi
