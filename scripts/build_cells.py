import os
files = {}
# WAREHOUSE CELL
files["src/cells/business/warehouse-cell/domain/entities/warehouse-item.entity.ts"] = """
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
""".strip()

files["src/cells/business/warehouse-cell/domain/entities/index.ts"] = "export * from './warehouse-item.entity';"
files["src/cells/business/warehouse-cell/domain/services/warehouse.engine.ts"] = """
import { WarehouseItem, WarehouseMovement, WarehouseZone } from '../entities/warehouse-item.entity';
export class WarehouseEngine {
  static receive(skuId: string, zone: WarehouseZone, tk: WarehouseItem['tk'], quantity: number, unit: string, pool: string, refCellId: string, refDocId: string, lotId?: string): { item: WarehouseItem; movement: WarehouseMovement } {
    const itemId = \`WH-\${Date.now()}\`;
    const item: WarehouseItem = { itemId, skuId, zone, tk, quantity, unit, pool, lotId, locationCode: \`\${zone}-AUTO\`, status: 'IN_STOCK', lastMovedAt: new Date() };
    const movement: WarehouseMovement = { movementId: \`WM-\${Date.now()}\`, itemId, type: 'INBOUND', quantity, toZone: zone, refCellId, refDocId, movedAt: new Date(), movedBy: 'system' };
    return { item, movement };
  }
  static issue(item: WarehouseItem, quantity: number, refCellId: string, refDocId: string): { updated: WarehouseItem; movement: WarehouseMovement } {
    if (quantity > item.quantity) throw new Error(\`WAREHOUSE_INSUFFICIENT: \${item.itemId} has \${item.quantity}, requested \${quantity}\`);
    const updated = { ...item, quantity: item.quantity - quantity, lastMovedAt: new Date() };
    const movement: WarehouseMovement = { movementId: \`WM-\${Date.now()}\`, itemId: item.itemId, type: 'OUTBOUND', quantity, fromZone: item.zone, refCellId, refDocId, movedAt: new Date(), movedBy: 'system' };
    return { updated, movement };
  }
}
""".strip()
files["src/cells/business/warehouse-cell/domain/services/index.ts"] = "export * from './warehouse.engine';"
files["src/cells/business/warehouse-cell/cell.manifest.json"] = '{"cellId":"warehouse-cell","cellName":"Warehouse Cell","version":"1.0.0","status":"ACTIVE","zone":"business","components":{"identity":"warehouse-cell@1.0.0","capability":["inbound","outbound","zone-transfer","stock-query"],"boundary":"boundary.policy.json","trace":"WarehouseMovement log","confidence":1.0,"smartLink":"finance-cell, inventory-cell, supplier-cell, production-cell"}}'
files["src/cells/business/warehouse-cell/boundary.policy.json"] = '{"cellId":"warehouse-cell","allowRead":["finance-cell","audit-cell","inventory-cell","production-cell"],"allowWrite":["supplier-cell","order-cell","casting-cell","polishing-cell"],"forbidden":["direct-ui-write"]}'
files["src/cells/business/warehouse-cell/index.ts"] = "export * from './domain/entities';\nexport * from './domain/services';"

# LOGISTICS CELL
files["src/cells/business/logistics-cell/domain/entities/shipment.entity.ts"] = """
export type ShipmentStatus = 'PENDING' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'RETURNED' | 'FAILED';
export type ShipmentDirection = 'INBOUND' | 'OUTBOUND';
export type LogisticsProvider = 'NHAT_TIN' | 'GHTK' | 'GHN' | 'VTP' | 'INTERNAL' | 'OTHER';
export interface ShipmentItem { skuId: string; description: string; quantity: number; unit: string; declaredValue: number; insured: boolean; }
export interface Shipment {
  shipmentId: string; direction: ShipmentDirection; provider: LogisticsProvider;
  trackingCode: string; refOrderId?: string; refSupplierId?: string;
  senderAddress: string; receiverAddress: string; items: ShipmentItem[];
  shippingFee: number; tkShippingFee: '641' | '152' | '156';
  status: ShipmentStatus; estimatedDelivery?: Date; actualDelivery?: Date;
  createdAt: Date; updatedAt: Date;
}
""".strip()
files["src/cells/business/logistics-cell/domain/entities/index.ts"] = "export * from './shipment.entity';"
files["src/cells/business/logistics-cell/domain/services/logistics.engine.ts"] = """
import { Shipment, ShipmentDirection, LogisticsProvider, ShipmentItem } from '../entities/shipment.entity';
export class LogisticsEngine {
  static createShipment(direction: ShipmentDirection, provider: LogisticsProvider, sender: string, receiver: string, items: ShipmentItem[], shippingFee: number, refOrderId?: string, refSupplierId?: string): Shipment {
    const tkShippingFee = direction === 'OUTBOUND' ? '641' : '152';
    return { shipmentId: \`SHIP-\${Date.now()}\`, direction, provider, trackingCode: '', refOrderId, refSupplierId, senderAddress: sender, receiverAddress: receiver, items, shippingFee, tkShippingFee, status: 'PENDING', createdAt: new Date(), updatedAt: new Date() };
  }
  static updateStatus(shipment: Shipment, status: Shipment['status'], trackingCode?: string): Shipment {
    return { ...shipment, status, trackingCode: trackingCode ?? shipment.trackingCode, actualDelivery: status === 'DELIVERED' ? new Date() : shipment.actualDelivery, updatedAt: new Date() };
  }
}
""".strip()
files["src/cells/business/logistics-cell/domain/services/index.ts"] = "export * from './logistics.engine';"
files["src/cells/business/logistics-cell/cell.manifest.json"] = '{"cellId":"logistics-cell","cellName":"Logistics Cell","version":"1.0.0","status":"ACTIVE","zone":"business","components":{"identity":"logistics-cell@1.0.0","capability":["shipment-create","tracking","fee-mapping","inbound-outbound"],"boundary":"boundary.policy.json","trace":"Shipment log","confidence":1.0,"smartLink":"order-cell, supplier-cell, warehouse-cell, finance-cell"}}'
files["src/cells/business/logistics-cell/boundary.policy.json"] = '{"cellId":"logistics-cell","allowRead":["order-cell","supplier-cell","audit-cell","finance-cell"],"allowWrite":["order-cell","supplier-cell"],"forbidden":["direct-payment"]}'
files["src/cells/business/logistics-cell/index.ts"] = "export * from './domain/entities';\nexport * from './domain/services';"

# SUPPLIER CELL
files["src/cells/business/supplier-cell/domain/entities/supplier.entity.ts"] = """
export type SupplierType = 'SERVICE' | 'B2B_MATERIAL';
export type SupplierStatus = 'ACTIVE' | 'INACTIVE' | 'BLACKLISTED';
export interface POItem { skuId: string; description: string; quantity: number; unit: string; unitPrice: number; pool?: string; lotId?: string; }
export interface Supplier {
  supplierId: string; supplierName: string; taxCode: string;
  type: SupplierType; status: SupplierStatus;
  contactEmail: string; contactPhone: string; address: string;
  isImporter: boolean; paymentTermDays: number;
  tkDefault: string; linkedCells: string[]; createdAt: Date;
}
export interface PurchaseOrder {
  poId: string; supplierId: string; supplierType: SupplierType;
  items: POItem[]; totalAmount: number; taxAmount: number;
  customsDuty?: number; tkDebit: string;
  status: 'DRAFT' | 'CONFIRMED' | 'RECEIVED' | 'PAID' | 'CANCELLED';
  requiresCustoms: boolean; requiresLogistics: boolean; requiresLegalReview: boolean;
  createdAt: Date; updatedAt: Date;
}
""".strip()
files["src/cells/business/supplier-cell/domain/entities/index.ts"] = "export * from './supplier.entity';"
files["src/cells/business/supplier-cell/domain/services/supplier.engine.ts"] = """
import { Supplier, PurchaseOrder, POItem } from '../entities/supplier.entity';
export class SupplierEngine {
  static createPO(supplier: Supplier, items: POItem[], totalAmount: number, taxAmount: number, customsDuty?: number): PurchaseOrder {
    const isService = supplier.type === 'SERVICE';
    return {
      poId: \`PO-\${Date.now()}\`, supplierId: supplier.supplierId, supplierType: supplier.type,
      items, totalAmount, taxAmount, customsDuty,
      tkDebit: isService ? '642' : (items.some(i => i.pool) ? '152' : '156'),
      status: 'DRAFT',
      requiresCustoms: !isService && !!supplier.isImporter,
      requiresLogistics: !isService,
      requiresLegalReview: totalAmount > 100_000_000,
      createdAt: new Date(), updatedAt: new Date(),
    };
  }
  static confirm(po: PurchaseOrder): PurchaseOrder { return { ...po, status: 'CONFIRMED', updatedAt: new Date() }; }
  static receive(po: PurchaseOrder): PurchaseOrder { return { ...po, status: 'RECEIVED', updatedAt: new Date() }; }
}
""".strip()
files["src/cells/business/supplier-cell/domain/services/index.ts"] = "export * from './supplier.engine';"
files["src/cells/business/supplier-cell/cell.manifest.json"] = '{"cellId":"supplier-cell","cellName":"Supplier Cell","version":"1.0.0","status":"ACTIVE","zone":"business","components":{"identity":"supplier-cell@1.0.0","capability":["supplier-mgmt","po-create","po-receive","type-routing"],"boundary":"boundary.policy.json","trace":"PurchaseOrder log","confidence":1.0,"smartLink":"warehouse-cell, finance-cell, customs-cell, logistics-cell, phap-che-cell, payment-cell"}}'
files["src/cells/business/supplier-cell/boundary.policy.json"] = '{"cellId":"supplier-cell","allowRead":["finance-cell","audit-cell","customs-cell","phap-che-cell"],"allowWrite":["procurement-authorized-only"],"forbidden":["auto-pay-without-approval"]}'
files["src/cells/business/supplier-cell/index.ts"] = "export * from './domain/entities';\nexport * from './domain/services';"

# NOI VU CELL
files["src/cells/business/noi-vu-cell/domain/entities/noi-vu.entity.ts"] = """
export type NoiVuCategory = 'ELECTRICITY' | 'WATER' | 'RENT' | 'SECURITY' | 'CLEANING' | 'DRIVER' | 'PACKAGING' | 'STATIONERY' | 'MEAL_ALLOWANCE' | 'OTHER_OVERHEAD';
export type CostCenter = 'FACTORY' | 'OFFICE' | 'SHOWROOM';
export interface OverheadExpense {
  expenseId: string; category: NoiVuCategory; costCenter: CostCenter;
  tkDebit: '627' | '642' | '641'; amount: number; description: string;
  period: string; refDocId: string; paidVia: '111' | '112' | '331';
  approvedBy: string; createdAt: Date;
}
""".strip()
files["src/cells/business/noi-vu-cell/domain/entities/index.ts"] = "export * from './noi-vu.entity';"
files["src/cells/business/noi-vu-cell/domain/services/noi-vu.engine.ts"] = """
import { OverheadExpense, NoiVuCategory, CostCenter } from '../entities/noi-vu.entity';
export class NoiVuEngine {
  static resolveTk(category: NoiVuCategory, costCenter: CostCenter): '627' | '642' | '641' {
    if (costCenter === 'FACTORY') return '627';
    if (costCenter === 'SHOWROOM' && (category === 'PACKAGING' || category === 'DRIVER')) return '641';
    return '642';
  }
  static createExpense(category: NoiVuCategory, costCenter: CostCenter, amount: number, description: string, period: string, refDocId: string, paidVia: OverheadExpense['paidVia'], approvedBy: string): OverheadExpense {
    return { expenseId: \`NV-\${Date.now()}\`, category, costCenter, tkDebit: NoiVuEngine.resolveTk(category, costCenter), amount, description, period, refDocId, paidVia, approvedBy, createdAt: new Date() };
  }
  static summarize624(expenses: OverheadExpense[], period: string): number {
    return expenses.filter(e => e.period === period && e.tkDebit === '642').reduce((s, e) => s + e.amount, 0);
  }
  static summarize627(expenses: OverheadExpense[], period: string): number {
    return expenses.filter(e => e.period === period && e.tkDebit === '627').reduce((s, e) => s + e.amount, 0);
  }
}
""".strip()
files["src/cells/business/noi-vu-cell/domain/services/index.ts"] = "export * from './noi-vu.engine';"
files["src/cells/business/noi-vu-cell/cell.manifest.json"] = '{"cellId":"noi-vu-cell","cellName":"Nội Vụ Cell","version":"1.0.0","status":"ACTIVE","zone":"business","components":{"identity":"noi-vu-cell@1.0.0","capability":["overhead-tracking","624-summary","627-summary","cost-center-routing"],"boundary":"boundary.policy.json","trace":"OverheadExpense log","confidence":1.0,"smartLink":"finance-cell, audit-cell, payment-cell, production-cell"}}'
files["src/cells/business/noi-vu-cell/boundary.policy.json"] = '{"cellId":"noi-vu-cell","allowRead":["finance-cell","audit-cell","hr-cell"],"allowWrite":["approved-by-gatekeeper"],"forbidden":["auto-approve-above-50M"]}'
files["src/cells/business/noi-vu-cell/index.ts"] = "export * from './domain/entities';\nexport * from './domain/services';"

for path, content in files.items():
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content)
    print(f"OK: {path}")

print(f"\nTotal: {len(files)} files")
