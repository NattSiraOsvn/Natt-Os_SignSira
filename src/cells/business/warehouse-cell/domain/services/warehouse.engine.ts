// ── FILE 2 ──────────────────────────────────────────────────
// warehouse.engine.ts
// Nhập / xuất / điều chuyển kho — core operations
// Path: src/cells/business/warehouse-cell/domain/services/

import { EventBus } from '../../../../../core/events/event-bus';

export type WarehouseOp = 'IN' | 'OUT' | 'TRANSFER' | 'ADJUST';

export interface WarehouseMovement {
  movementId: string;
  itemCode:   string;
  op:         WarehouseOp;
  qty:        number;
  fromLoc?:   string;
  toLoc?:     string;
  operator:   string;
  timestamp:  number;
  note?:      string;
}

export interface WarehouseResult {
  movementId: string;
  success:    boolean;
  newQty:     number;
  reason?:    string;
}

export class WarehouseEngine {
  private stock: Map<string, number> = new Map();

  process(movement: WarehouseMovement): WarehouseResult {
    const { movementId, itemCode, op, qty, operator, timestamp } = movement;
    const current = this.stock.get(itemCode) ?? 0;
    let newQty = current;
    let success = true;
    let reason: string | undefined;

    switch (op) {
      case 'IN':
        newQty = current + qty; break;
      case 'OUT':
        if (qty > current) {
          success = false;
          reason  = `Xuất ${qty} vượt tồn ${current} (${itemCode})`;
          EventBus.emit('cell.metric', { cell: 'warehouse-cell', metric: 'warehouse.out_exceed', value: qty - current, confidence: 0.95, itemCode });
        } else {
          newQty = current - qty;
        }
        break;
      case 'TRANSFER':
        if (qty > current) { success = false; reason = `Chuyển kho vượt tồn`; }
        else { newQty = current - qty; }
        break;
      case 'ADJUST':
        newQty = Math.max(0, qty);
        if (Math.abs(qty - current) > current * 0.1) {
          EventBus.emit('cell.metric', { cell: 'warehouse-cell', metric: 'warehouse.large_adjust', value: Math.abs(qty - current), confidence: 0.85, itemCode, operator });
        }
        break;
    }

    if (success) this.stock.set(itemCode, newQty);

    EventBus.emit('cell.metric', { cell: 'warehouse-cell', metric: `warehouse.${op.toLowerCase()}`, value: qty, confidence: 1.0, itemCode, operator, newQty });

    return { movementId, success, newQty, reason };
  }

  getStock(itemCode: string): number { return this.stock.get(itemCode) ?? 0; }
  getAllStock(): Record<string, number> { return Object.fromEntries(this.stock); }
}
