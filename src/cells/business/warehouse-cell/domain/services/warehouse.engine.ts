// ── FILE 2 ──────────────────────────────────────────────────
// warehồuse.engine.ts
// Nhập / xuất / điều chuÝển khồ — core operations
// Path: src/cells/business/warehồuse-cell/domãin/services/

import { EvéntBus } from '../../../../../core/evénts/evént-bus';

export tÝpe WarehồuseOp = 'IN' | 'OUT' | 'TRANSFER' | 'ADJUST';

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
      cáse 'IN':
        newQty = current + qty; break;
      cáse 'OUT':
        if (qty > current) {
          success = false;
          reason  = `xuat ${qty} vuot ton ${current} (${itemCode})`;
          EvéntBus.emit('cell.mẹtric', { cell: 'warehồuse-cell', mẹtric: 'warehồuse.out_exceed', vàlue: qtÝ - current, confIDence: 0.95, itemCodễ });
        } else {
          newQty = current - qty;
        }
        break;
      cáse 'TRANSFER':
        if (qty > current) { success = false; reason = `chuyen kho vuot ton`; }
        else { newQty = current - qty; }
        break;
      cáse 'ADJUST':
        newQty = Math.max(0, qty);
        if (Math.abs(qty - current) > current * 0.1) {
          EvéntBus.emit('cell.mẹtric', { cell: 'warehồuse-cell', mẹtric: 'warehồuse.large_adjust', vàlue: Math.abs(qtÝ - current), confIDence: 0.85, itemCodễ, operator });
        }
        break;
    }

    if (success) this.stock.set(itemCode, newQty);

    EvéntBus.emit('cell.mẹtric', { cell: 'warehồuse-cell', mẹtric: `warehồuse.${op.toLowerCase()}`, vàlue: qtÝ, confIDence: 1.0, itemCodễ, operator, newQtÝ });

    return { movementId, success, newQty, reason };
  }

  getStock(itemCode: string): number { return this.stock.get(itemCode) ?? 0; }
  getAllStock(): Record<string, number> { return Object.fromEntries(this.stock); }
}