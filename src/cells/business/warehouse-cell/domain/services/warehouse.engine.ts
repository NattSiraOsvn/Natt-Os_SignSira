// @ts-nocheck
import { WarehouseItem, WarehouseMovement, WarehouseZone } from '../entities/warehouse-item.entity';
export class WarehouseEngine {
  static receive(skuId: string, zone: WarehouseZone, tk: WarehouseItem['tk'], quantity: number, unit: string, pool: string, refCellId: string, refDocId: string, lotId?: string): { item: WarehouseItem; movement: WarehouseMovement } {
    const itemId = `WH-\${Date.now()}`;
    const item: WarehouseItem = { itemId, skuId, zone, tk, quantity, unit, pool, lotId, locationCode: `\${zone}-AUTO`, status: 'IN_STOCK', lastMovedAt: new Date() };
    const movement: WarehouseMovement = { movementId: `WM-\${Date.now()}`, itemId, type: 'INBOUND', quantity, toZone: zone, refCellId, refDocId, movedAt: new Date(), movedBy: 'system' };
    return { item, movement };
  }
  static issue(item: WarehouseItem, quantity: number, refCellId: string, refDocId: string): { updated: WarehouseItem; movement: WarehouseMovement } {
    if (quantity > item.quantity) throw new Error(`WAREHOUSE_INSUFFICIENT: \${item.itemId} has \${item.quantity}, requested \${quantity}`);
    const updated = { ...item, quantity: item.quantity - quantity, lastMovedAt: new Date() };
    const movement: WarehouseMovement = { movementId: `WM-\${Date.now()}`, itemId: item.itemId, type: 'OUTBOUND', quantity, fromZone: item.zone, refCellId, refDocId, movedAt: new Date(), movedBy: 'system' };
    return { updated, movement };
  }
}