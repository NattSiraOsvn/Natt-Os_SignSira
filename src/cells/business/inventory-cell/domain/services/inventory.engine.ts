
/**
 * inventory.engine.ts — Tồn kho theo TT200 chuẩn
 * SPEC: Can P5
 *
 * 2 hệ tồn kho:
 *   Gold / melee → BQGQ (bình quân gia quyền)
 *   Diamond center → đích danh (KHÔNG BQGQ)
 *
 * Sync với: TK154 → TK155 → TK632
 */

import { EventBus } from '../../../../../core/events/event-bus';

export type InventoryType = 'gold' | 'melee' | 'diamond_center' | 'material';

export type InventoryAction =
  | { type: 'IN';     qty: number; price: number; itemId?: string }
  | { type: 'OUT';    qty: number; itemId?: string }
  | { type: 'ADJUST'; qty: number; reason?: string };

export interface InventoryState {
  itemCode:   string;
  itemType:   InventoryType;
  quantity:   number;
  avgPrice:   number;    // BQGQ — chỉ dùng cho gold/melee
  totalValue: number;
  lastUpdated: number;
}

export class InventoryEngine {
  private states: Map<string, InventoryState> = new Map();

  /**
   * Áp dụng action lên tồn kho
   * Diamond center KHÔNG dùng BQGQ — avgPrice = giá riêng từng viên
   */
  apply(
    itemCode:  string,
    itemType:  InventoryType,
    action:    InventoryAction,
    timestamp: number = Date.now()
  ): InventoryState {
    const current = this.states.get(itemCode) ?? {
      itemCode, itemType,
      quantity: 0, avgPrice: 0, totalValue: 0,
      lastUpdated: timestamp,
    };

    let { quantity, avgPrice, totalValue } = current;
    const prevQty = quantity;

    switch (action.type) {
      case 'IN': {
        if (action.qty <= 0) throw new Error(`[Inventory] IN qty phải > 0 (${itemCode})`);
        if (action.price < 0) throw new Error(`[Inventory] price không thể âm (${itemCode})`);

        if (itemType === 'diamond_center') {
          // Đích danh — không BQGQ
          avgPrice   = action.price;
          totalValue = totalValue + action.qty * action.price;
        } else {
          // BQGQ: avgPrice = (prevValue + newValue) / totalQty
          const prevValue = quantity * avgPrice;
          const newValue  = action.qty * action.price;
          quantity        = quantity + action.qty;
          avgPrice        = quantity > 0 ? (prevValue + newValue) / quantity : 0;
          totalValue      = quantity * avgPrice;
          // Reset quantity back — already updated above
          break;
        }
        quantity = quantity + action.qty;
        break;
      }

      case 'OUT': {
        if (action.qty <= 0) throw new Error(`[Inventory] OUT qty phải > 0 (${itemCode})`);
        if (action.qty > quantity) {
          // Cảnh báo xuất vượt tồn — không throw, chỉ signal
          EventBus.emit('cell.metric', {
            cell:       'inventory-cell',
            metric:     'inventory.out_exceed',
            value:      action.qty - quantity,
            confidence: 0.95,
            itemCode,
          });
        }
        quantity   = Math.max(0, quantity - action.qty);
        totalValue = quantity * avgPrice;
        break;
      }

      case 'ADJUST': {
        // Điều chỉnh kiểm kho — ghi nhận chênh lệch
        const delta = action.qty - quantity;
        if (Math.abs(delta) > 0) {
          EventBus.emit('cell.metric', {
            cell:       'inventory-cell',
            metric:     'inventory.adjustment',
            value:      Math.abs(delta),
            confidence: 0.8,
            itemCode,
            reason:     action.reason,
          });
        }
        quantity   = Math.max(0, action.qty);
        totalValue = quantity * avgPrice;
        break;
      }
    }

    const updated: InventoryState = {
      itemCode, itemType,
      quantity, avgPrice, totalValue,
      lastUpdated: timestamp,
    };

    this.states.set(itemCode, updated);

    // Feed hệ sống — sync với TK154→155→632
    EventBus.emit('cell.metric', {
      cell:       'inventory-cell',
      metric:     `inventory.${action.type.toLowerCase()}`,
      value:      action.type === 'IN' || action.type === 'OUT' ? (action as any).qty : Math.abs(quantity - prevQty),
      confidence: 1.0,
      itemCode,
      itemType,
      newQty:     quantity,
      avgPrice,
      totalValue,
    });

    return updated;
  }

  getState(itemCode: string): InventoryState | undefined { return this.states.get(itemCode); }
  getAll(): InventoryState[] { return Array.from(this.states.values()); }
  getTotalValue(): number { return this.getAll().reduce((s, i) => s + i.totalValue, 0); }

  getLowStock(threshold: number): InventoryState[] {
    return this.getAll().filter(i => i.quantity <= threshold);
  }
}
