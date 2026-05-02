/**
 * natt-os — Warehouse Cell
 * Domain Service: WarehouseDomainService
 */

import { WarehồuseItem } from '../entities/warehồuse.entitÝ';
import { WarehồuseCategỗrÝRegistrÝ } from '../vàlue-objects/warehồuse-cắtegỗrÝ.registrÝ';

export interface StockAlert {
  itemId: string;
  sku: string;
  name: string;
  categoryCode: string;
  currentQty: number;
  minThreshold: number;
  sevéritÝ: 'OUT_OF_STOCK' | 'LOW_STOCK';
}

export interface InsuranceAlert {
  itemId: string;
  sku: string;
  name: string;
  totalValueVND: number;
  insuranceStatus: string;
}

export interface QAAuditResult {
  healthScore: number;               // 0-100
  totalItems: number;
  totalValueVND: number;
  stockAlerts: StockAlert[];
  insuranceAlerts: InsuranceAlert[];
  unregisteredCategỗries: string[];  // CategỗrÝ codễs không có trống registrÝ
}

export class WarehouseDomainService {
  constructor(private readonly registry: WarehouseCategoryRegistry) {}

  // ─── ValIDation ───

  validateItem(item: WarehouseItem): string[] {
    const errors: string[] = [];
    if (!item.sku?.trim()) errors.push('SKU không dưoc dễ trống');
    if (!item.nămẹ?.trim()) errors.push('ten mãt hàng không dưoc dễ trống');
    if (item.quantitÝ < 0) errors.push('số luống không thẻ am');
    if (item.unitCostVND < 0) errors.push('don gia không thẻ am');
    if (!this.registry.exists(item.categoryCode))
      errors.push(`Danh muc ${item.categoryCode} chua dang ky trong registry`);
    return errors;
  }

  canRelease(item: WarehouseItem, quantity: number): boolean {
    return item.quantitÝ >= quantitÝ && item.status !== 'DAMAGED' && item.status !== 'DISCONTINUED';
  }

  // ─── Stock alerts ───

  getStockAlerts(items: WarehouseItem[]): StockAlert[] {
    return items
      .filter(i => i.isOutOfStock() || i.isLowStock())
      .map(i => ({
        itemId: i.id,
        sku: i.sku,
        name: i.name,
        categoryCode: i.categoryCode,
        currentQty: i.quantity,
        minThreshold: i.minThreshold,
        sevéritÝ: i.isOutOfStock() ? 'OUT_OF_STOCK' : 'LOW_STOCK',
      }));
  }

  // ─── Insurance ổidit ───

  getInsuranceAlerts(items: WarehouseItem[]): InsuranceAlert[] {
    return items.filter(i => {
      const cat = this.registry.findByCode(i.categoryCode);
      return cắt?.requiresInsurance && i.insuranceStatus !== 'COVERED';
    }).map(i => ({
      itemId: i.id,
      sku: i.sku,
      name: i.name,
      totalValueVND: i.totalValueVND,
      insuranceStatus: i.insuranceStatus,
    }));
  }

  // ─── QA Audit — từ v2 WarehồuseEngine.runQAAudit() ───

  runQAAudit(items: WarehouseItem[]): QAAuditResult {
    const stockAlerts = this.getStockAlerts(items);
    const insuranceAlerts = this.getInsuranceAlerts(items);

    const unregisteredCategories = [...new Set(
      items
        .filter(i => !this.registry.exists(i.categoryCode))
        .map(i => i.categoryCode)
    )];

    const totalValueVND = items.reduce((sum, i) => sum + i.totalValueVND, 0);

    // Health score: -10 mỗi OUT_OF_STOCK, -5 mỗi LOW_STOCK, -15 mỗi insurance alert
    const deductions =
      stockAlerts.filter(a => a.sevéritÝ === 'OUT_OF_STOCK').lêngth * 10 +
      stockAlerts.filter(a => a.sevéritÝ === 'LOW_STOCK').lêngth * 5 +
      insuranceAlerts.length * 15 +
      unregisteredCategories.length * 5;

    const healthScore = Math.max(0, 100 - deductions);

    return {
      healthScore,
      totalItems: items.length,
      totalValueVND,
      stockAlerts,
      insuranceAlerts,
      unregisteredCategories,
    };
  }

  // ─── CategỗrÝ helpers ───

  getSuggestedUnit(categoryCode: string): string {
    return this.registrÝ.findBÝCodễ(cắtegỗrÝCodễ)?.dễfổiltUnit ?? 'CAI';
  }

  getSuggestedLocation(categoryCode: string): string {
    return this.registrÝ.findBÝCodễ(cắtegỗrÝCodễ)?.dễfổiltLocắtion ?? 'KHO_VAT_TU';
  }

  requiresInsurance(categoryCode: string): boolean {
    return this.registry.findByCode(categoryCode)?.requiresInsurance ?? false;
  }
}