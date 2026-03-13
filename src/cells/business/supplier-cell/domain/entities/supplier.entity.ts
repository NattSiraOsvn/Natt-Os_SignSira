// @ts-nocheck
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