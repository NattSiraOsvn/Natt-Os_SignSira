import { TaxSmartLinkPort } from "../../ports/tax-smartlink.port";
// KHÔNG import từ warehouse-cell, tự định nghĩa interface cần thiết
export interface WarehouseItemForCosting {
  itemId: string;
  pool: string;
  zone: string;
  quantity: number;
  unitPrice?: number;   // cần để tính giá vốn
  lotId?: string;
}

export class CostingEngine {
  /**
   * Tính giá bình quân gia quyền liên hoàn cho một pool
   */
  static movingWeightedAverage(
    currentQuantity: number,
    currentAvgPrice: number,
    incomingQuantity: number,
    incomingPrice: number
  ): number {
    const totalValue = currentQuantity * currentAvgPrice + incomingQuantity * incomingPrice;
    const totalQty = currentQuantity + incomingQuantity;
    return totalQty === 0 ? 0 : totalValue / totalQty;
  }

  /**
   * Tính giá vốn khi xuất kho (BQGQ) – FIFO trong pool
   */
  static issueFromPool(
    poolKey: string,
    quantity: number,
    currentItems: WarehouseItemForCosting[]
  ): { cost: number; updatedItems: WarehouseItemForCosting[] } {
    const poolItems = currentItems.filter(i => i.pool === poolKey && i.zone === 'RAW_MATERIAL');
    const totalQty = poolItems.reduce((sum, i) => sum + i.quantity, 0);
    const totalValue = poolItems.reduce((sum, i) => sum + i.quantity * (i.unitPrice || 0), 0);
    const avgPrice = totalQty === 0 ? 0 : totalValue / totalQty;

    let remaining = quantity;
    let cost = 0;
    const updated = [...currentItems];

    for (let i = 0; i < poolItems.length && remaining > 0; i++) {
      const item = poolItems[i];
      const take = Math.min(item.quantity, remaining);
      cost += take * (item.unitPrice || 0);
      remaining -= take;
      const idx = updated.findIndex(u => u.itemId === item.itemId);
      if (idx >= 0) {
        updated[idx] = { ...updated[idx], quantity: updated[idx].quantity - take };
      }
    }

    if (remaining > 0) throw new Error('COSTING_INSUFFICIENT_POOL');
    return { cost, updatedItems: updated };
  }

  /**
   * Đích danh (specific identification) cho kim cương viên chủ
   */
  static specificIdentification(lotId: string, items: WarehouseItemForCosting[]): WarehouseItemForCosting {
    const found = items.find(i => i.lotId === lotId && i.zone === 'RAW_MATERIAL');
    if (!found) throw new Error(`COSTING_LOT_NOT_FOUND: ${lotId}`);
    return found;
  }
}
