export type WarehouseZone = 'RAW_MATERIAL' | 'WIP' | 'FINISHED_GOODS' | 'TRADING';
export type WarehouseItemStatus = 'IN_STOCK' | 'RESERVED' | 'SHIPPED' | 'QUARANTINE';

export interface WarehouseItem {
  itemId: string; skuId: string; zone: WarehouseZone;
  tk: '152' | '154' | '155' | '156';
  quantity: number; unit: string; pool: string;
  lotId?: string; locationCode: string;
  status: WarehouseItemStatus; lastMovedAt: Date;
}
export interface WarehouseMovement {
  movementId: string; itemId: string;
  type: 'INBOUND' | 'OUTBOUND' | 'TRANSFER' | 'ADJUSTMENT';
  quantity: number; fromZone?: WarehouseZone; toZone?: WarehouseZone;
  refCellId: string; refDocId: string; movedAt: Date; movedBy: string;
}