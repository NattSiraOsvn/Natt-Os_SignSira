import { Supplier, PurchaseOrder, POItem } from '../entities/supplier.entity';
export class SupplierEngine {
  static createPO(supplier: Supplier, items: POItem[], totalAmount: number, taxAmount: number, customsDuty?: number): PurchaseOrder {
    const isService = supplier.type === 'SERVICE';
    return {
      poId: `PO-\${Date.now()}`, supplierId: supplier.supplierId, supplierType: supplier.type,
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