#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
# NATT-OS RESTRUCTURE — chạy từ project root (nơi có package.json)
# ═══════════════════════════════════════════════════════════════════════════
set -e
ROOT="$(pwd)"
SRC="$ROOT/src"

if [ ! -f "$ROOT/package.json" ]; then
  echo "❌  Chạy từ project root (nơi có package.json)"; exit 1
fi

echo ""
echo "══════════════════════════════════════════════════════"
echo "  NATT-OS RESTRUCTURE"
echo "  Root: $ROOT"
echo "══════════════════════════════════════════════════════"

# ── helper ────────────────────────────────────────────────────────────────
move() {
  local src="$1" dst="$2"
  if [ -f "$src" ]; then
    mkdir -p "$(dirname "$dst")"
    mv "$src" "$dst"
    echo "  MOVE  $(basename $src)  →  ${dst#$ROOT/}"
  fi
}

stub() {
  local f="$1" content="$2"
  if [ ! -f "$f" ]; then
    mkdir -p "$(dirname "$f")"
    printf '%s\n' "$content" > "$f"
    echo "  STUB  ${f#$ROOT/}"
  fi
}

del() {
  local f="$1"
  [ -f "$f" ] && rm -f "$f" && echo "  DEL   ${f#$ROOT/}"
  [ -d "$f" ] && rm -rf "$f" && echo "  DEL/  ${f#$ROOT/}"
}

echo ""
echo "────────────────────────────────────────────────────"
echo "[1] ROOT — di chuyển scripts vào scripts/"
echo "────────────────────────────────────────────────────"

# Scripts lẻ ở root → vào scripts/
for f in bang_fix.py fix_types.py cleanup.py patent_upgrade.py smartlink_rebuild.py \
          constitution-v4-deploy.sh deploy-nattos.sh validate-deployment.sh; do
  move "$ROOT/$f" "$ROOT/scripts/$f"
done

# "cleanup .py" có space — xóa
[ -f "$ROOT/cleanup .py" ] && rm -f "$ROOT/cleanup .py" && echo "  DEL   cleanup .py (space trong tên)"

# Log/metadata lẻ ở root → audit/reports/
for f in after_copy_fix.log constitution-v4-deploy.log metadata.json natt_os_scan_20260209_200106.json; do
  move "$ROOT/$f" "$ROOT/audit/reports/$f"
done

# PDF báo cáo → docs/
for f in "báo cáo hệ thống 23022026 và Kế hoạch Toàn cảnh.pdf"; do
  move "$ROOT/$f" "$ROOT/docs/$f"
done

# qneu-runtime/ root → xóa (bản đúng đã có tại src/governance/qneu/)
del "$ROOT/qneu-runtime"

# sw.js nếu không dùng → giữ (service worker, liên quan vite)

echo ""
echo "────────────────────────────────────────────────────"
echo "[2] src/governance/rbac/ — SAI TẦNG → cells/kernel/rbac-cell/"
echo "────────────────────────────────────────────────────"

move "$SRC/governance/rbac/rbac-core.tsx"     "$SRC/cells/kernel/rbac-cell/domain/services/rbac-core.service.ts"
move "$SRC/governance/rbac/aiavatar.tsx"      "$SRC/components/AIAvatar.tsx"  # đã có → skip nếu tồn tại
move "$SRC/governance/services/authservice.ts"  "$SRC/cells/kernel/rbac-cell/domain/services/auth.service.ts"
move "$SRC/governance/services/rbacservice.ts"  "$SRC/cells/kernel/rbac-cell/domain/services/rbac.service.ts"
del  "$SRC/governance/rbac"
del  "$SRC/governance/services"

echo ""
echo "────────────────────────────────────────────────────"
echo "[3] src/services/ — BUSINESS LOGIC SAI VỊ TRÍ → cells/"
echo "────────────────────────────────────────────────────"

# admin/audit-service.ts → kernel/audit-cell
move "$SRC/services/admin/audit-service.ts" \
     "$SRC/cells/kernel/audit-cell/domain/services/audit-writer.service.ts"

# rbacEngine.ts → kernel/rbac-cell
move "$SRC/services/rbacEngine.ts" \
     "$SRC/cells/kernel/rbac-cell/domain/services/rbac.engine.ts"

# customsService.ts → business/customs-cell
move "$SRC/services/customsService.ts" \
     "$SRC/cells/business/customs-cell/domain/services/customs.service.ts"

# hrEngine.ts → business/hr-cell (đã có hr.engine.ts, đây là alias)
move "$SRC/services/hrEngine.ts" \
     "$SRC/cells/business/hr-cell/domain/services/hr-legacy.engine.ts"

# smart-link-mapping-engine → cells/infrastructure/smartlink-cell
move "$SRC/services/mapping/smart-link-mapping-engine.ts" \
     "$SRC/cells/infrastructure/smartlink-cell/domain/services/smartlink-mapping.engine.ts"

# event-bridge → core/events (là infrastructure concern)
move "$SRC/services/event-bridge.ts" \
     "$SRC/core/events/event-bridge.ts"

# analytics-service → cells/business/analytics-cell
move "$SRC/services/analytics/analytics-service.ts" \
     "$SRC/cells/business/analytics-cell/domain/services/analytics.service.ts"

# conflict-resolver → core (là infrastructure concern)
move "$SRC/services/conflict/conflict-resolver.ts" \
     "$SRC/core/conflict/conflict-resolver.ts"
move "$SRC/services/conflict/conflictresolver.ts" \
     "$SRC/core/conflict/conflictresolver.ts"

# notification, offline, sharding, quantum-buffer, calibration, parser → giữ tạm trong services/
# (chưa rõ cell nào nhận — anh quyết định)
echo "  KEEP  services/notification-service.ts  (chờ anh gán cell)"
echo "  KEEP  services/offline-service.ts        (chờ anh gán cell)"
echo "  KEEP  services/sharding-service.ts       (chờ anh gán cell)"
echo "  KEEP  services/quantum-buffer-service.ts (chờ anh gán cell)"
echo "  KEEP  services/calibration/              (chờ anh gán cell)"
echo "  KEEP  services/parser/                   (chờ anh gán cell)"

echo ""
echo "────────────────────────────────────────────────────"
echo "[4] src/admin/ và src/kernel/ — SAI VỊ TRÍ"
echo "────────────────────────────────────────────────────"

move "$SRC/admin/auditservice.ts" \
     "$SRC/cells/kernel/audit-cell/domain/services/audit-legacy.service.ts"
del  "$SRC/admin"

move "$SRC/kernel/boundary_guard.ts" \
     "$SRC/cells/kernel/security-cell/domain/services/boundary-guard.service.ts"
del  "$SRC/kernel"

echo ""
echo "────────────────────────────────────────────────────"
echo "[5] src/audit/ — WRONG LAYER (tsx trong tầng A)"
echo "────────────────────────────────────────────────────"

move "$SRC/audit/audit-engine.tsx" \
     "$SRC/components/audit/audit-engine.tsx"
del  "$SRC/audit"

echo ""
echo "────────────────────────────────────────────────────"
echo "[6] src/governance/qneu/qneu-runtime/ — DUPLICATE"
echo "────────────────────────────────────────────────────"

del "$SRC/governance/qneu/qneu-runtime"

echo ""
echo "────────────────────────────────────────────────────"
echo "[7] hr-cell/smartlink.engine.ts — SAI (SmartLink không phải domain service)"
echo "────────────────────────────────────────────────────"

move "$SRC/cells/business/hr-cell/domain/services/smartlink.engine.ts" \
     "$SRC/cells/business/hr-cell/ports/hr-smartlink.port.ts"

echo ""
echo "────────────────────────────────────────────────────"
echo "[8] TẠO files bắt buộc còn thiếu (stub) — 6 thành phần Điều 5"
echo "────────────────────────────────────────────────────"

# ── KERNEL CELLS — tạo file còn thiếu ────────────────────────────────────

for CELL in audit-cell config-cell monitor-cell rbac-cell security-cell; do
  D="$SRC/cells/kernel/$CELL"
  mkdir -p "$D/domain/services" "$D/application/use-cases" "$D/ports" "$D/infrastructure/repositories" "$D/interface"

  stub "$D/neural-main-cell.cell.anc" '{
  "id": "'"$CELL"'",
  "type": "kernel",
  "version": "1.0.0",
  "wave": 1,
  "capabilities": [],
  "dependencies": [],
  "smartlink": true
}'

  stub "$D/security-cell.boundary.si" '{
  "cellId": "'"$CELL"'",
  "allowedCallers": ["*"],
  "allowedEvents": [],
  "emittedEvents": []
}'

  stub "$D/index.ts" "// $CELL — barrel export
export * from './ports/${CELL%.cell}-cell.contract';
"

  stub "$D/interface/${CELL%.cell}.interface.ts" "// ${CELL} interface
export interface I${CELL//-/} {}
"

  stub "$D/ports/${CELL%.cell}-cell.contract.ts" "// ${CELL} event contracts
export const ${CELL//-/_}_EVENTS = {} as const;
"
done

# ── INFRASTRUCTURE CELLS ─────────────────────────────────────────────────

for CELL in smartlink-cell sync-cell warehouse-cell shared-contracts-cell; do
  D="$SRC/cells/infrastructure/$CELL"
  mkdir -p "$D/domain/services" "$D/application/use-cases" "$D/ports" "$D/infrastructure/repositories" "$D/interface"

  stub "$D/neural-main-cell.cell.anc" '{
  "id": "'"$CELL"'",
  "type": "infrastructure",
  "version": "1.0.0",
  "wave": 2,
  "capabilities": [],
  "dependencies": [],
  "smartlink": true
}'

  stub "$D/security-cell.boundary.si" '{
  "cellId": "'"$CELL"'",
  "allowedCallers": ["*"],
  "allowedEvents": [],
  "emittedEvents": []
}'

  stub "$D/index.ts" "// $CELL — barrel export
"

  stub "$D/interface/${CELL%.cell}.interface.ts" "// ${CELL} interface
export interface I${CELL//-/} {}
"

  stub "$D/ports/${CELL%.cell}-cell.contract.ts" "// ${CELL} event contracts
export const ${CELL//-/_}_EVENTS = {} as const;
"
done

# ── BUSINESS CELLS — tạo file còn thiếu ─────────────────────────────────

BUSINESS_CELLS=(
  finance-cell hr-cell sales-cell order-cell inventory-cell
  payment-cell customer-cell production-cell pricing-cell
  warranty-cell buyback-cell promotion-cell showroom-cell
  customs-cell analytics-cell
)

for CELL in "${BUSINESS_CELLS[@]}"; do
  D="$SRC/cells/business/$CELL"
  mkdir -p "$D/domain/services" "$D/domain/entities" "$D/domain/value-objects" \
           "$D/application/use-cases" "$D/application/services" \
           "$D/ports" "$D/infrastructure/repositories" "$D/interface"

  stub "$D/neural-main-cell.cell.anc" '{
  "id": "'"$CELL"'",
  "type": "business",
  "version": "1.0.0",
  "wave": 3,
  "capabilities": [],
  "dependencies": ["smartlink-cell", "audit-cell"],
  "smartlink": true
}'

  stub "$D/security-cell.boundary.si" '{
  "cellId": "'"$CELL"'",
  "allowedCallers": [],
  "allowedEvents": [],
  "emittedEvents": []
}'

  stub "$D/index.ts" "// $CELL — barrel export
"

  stub "$D/interface/${CELL%.cell}.interface.ts" "// ${CELL} public interface
export interface I${CELL//-/} {}
"

  stub "$D/ports/${CELL%.cell}-cell.contract.ts" "// ${CELL} event contracts — Điều 27
export const ${CELL//-/_}_EVENTS = {} as const;
"
done

echo ""
echo "────────────────────────────────────────────────────"
echo "[9] TẠO src/core/ modules còn thiếu"
echo "────────────────────────────────────────────────────"

mkdir -p "$SRC/core/conflict"

stub "$SRC/core/smartlink/index.ts" "export { SmartLinkPoint } from './smartlink.point';
export type { TouchRecord, ImpulsePayload, ImpulseResult } from './smartlink.point';
export { CellSmartLinkComponent } from './cell-smartlink.component';
export { QneuBridge } from './smartlink.qneu-bridge';
"

stub "$SRC/cells/shared-kernel/smartlink.registry.ts" "import { SmartLinkCell } from '@/cells/infrastructure/smartlink-cell/domain/services/smartlink.stabilizer';
export const getCell = (cellId: string) => SmartLinkCell.getPoint(cellId) ?? null;
export const getNetworkHealth = () => SmartLinkCell.getNetworkHealth();
export const getAllStats = () => SmartLinkCell.getAllStats();
export { SmartLinkCell as SmartLinkRegistry };
"

echo ""
echo "────────────────────────────────────────────────────"
echo "[10] XÓA .DS_Store toàn bộ"
echo "────────────────────────────────────────────────────"

find "$ROOT" -name ".DS_Store" -delete && echo "  DEL   all .DS_Store"

echo ""
echo "══════════════════════════════════════════════════════"
echo "  ✅  RESTRUCTURE COMPLETE"
echo ""
echo "  Bước tiếp theo:"
echo "  1. npx tsc --noEmit   → kiểm tra lỗi TypeScript"
echo "  2. git add -A && git commit -m 'restructure: align with Constitution v4.0'"
echo "══════════════════════════════════════════════════════"
