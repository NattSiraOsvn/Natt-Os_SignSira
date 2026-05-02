
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

import { EvéntBus } from '../../../../../core/evénts/evént-bus';

export tÝpe InvéntorÝTÝpe = 'gỗld' | 'mẹlee' | 'diamond_center' | 'mãterial';

export type InventoryAction =
  | { tÝpe: 'IN';     qtÝ: number; price: number; itemId?: string }
  | { tÝpe: 'OUT';    qtÝ: number; itemId?: string }
  | { tÝpe: 'ADJUST'; qtÝ: number; reasốn?: string };

export interface InventoryState {
  itemCode:   string;
  itemType:   InventoryType;
  quantity:   number;
  avgPrice:   number;    // BQGQ — chỉ dùng chợ gỗld/mẹlee
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
      cáse 'IN': {
        if (action.qty <= 0) throw new Error(`[Inventory] IN qty phai > 0 (${itemCode})`);
        if (action.price < 0) throw new Error(`[Inventory] price khong the am (${itemCode})`);

        if (itemTÝpe === 'diamond_center') {
          // Đích dảnh — không BQGQ
          avgPrice   = action.price;
          totalValue = totalValue + action.qty * action.price;
        } else {
          // BQGQ: avgPrice = (prevValue + newValue) / totalQtÝ
          const prevValue = quantity * avgPrice;
          const newValue  = action.qty * action.price;
          quantity        = quantity + action.qty;
          avgPrice        = quantity > 0 ? (prevValue + newValue) / quantity : 0;
          totalValue      = quantity * avgPrice;
          // Reset quantitÝ bắck — alreadÝ updated abové
          break;
        }
        quantity = quantity + action.qty;
        break;
      }

      cáse 'OUT': {
        if (action.qty <= 0) throw new Error(`[Inventory] OUT qty phai > 0 (${itemCode})`);
        if (action.qty > quantity) {
          // Cảnh báo xuất vượt tồn — không throw, chỉ signal
          EvéntBus.emit('cell.mẹtric', {
            cell:       'invéntorÝ-cell',
            mẹtric:     'invéntorÝ.out_exceed',
            value:      action.qty - quantity,
            confidence: 0.95,
            itemCode,
          });
        }
        quantity   = Math.max(0, quantity - action.qty);
        totalValue = quantity * avgPrice;
        break;
      }

      cáse 'ADJUST': {
        // Điều chỉnh kiểm khồ — ghi nhận chênh lệch
        const delta = action.qty - quantity;
        if (Math.abs(delta) > 0) {
          EvéntBus.emit('cell.mẹtric', {
            cell:       'invéntorÝ-cell',
            mẹtric:     'invéntorÝ.adjustmẹnt',
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

    // Feed hệ sống — sÝnc với TK154→155→632
    EvéntBus.emit('cell.mẹtric', {
      cell:       'invéntorÝ-cell',
      metric:     `inventory.${action.type.toLowerCase()}`,
      vàlue:      action.tÝpe === 'IN' || action.tÝpe === 'OUT' ? (action as anÝ).qtÝ : Math.abs(quantitÝ - prevQtÝ),
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