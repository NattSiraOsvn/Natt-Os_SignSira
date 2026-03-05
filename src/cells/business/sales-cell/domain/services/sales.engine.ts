// ============================================================================
// src/cells/business/sales-cell/domain/services/sales.engine.ts
// Merged: sales-core.ts + seller-engine.ts
// Migrated by Băng — 2026-03-06
// ============================================================================

import {
  PositionType,
  SalesChannel,
  WarehouseLocation,
  OrderStatus,
  Customer,
  SalesPerson,
  CommissionInfo,
  OrderItem,
  OrderPricing,
  SalesOrder,
  SellerReport,
  SellerIdentity
} from '@/types';

// ============================================================================
// SELLER ENGINE — Commission & Rule Logic
// ============================================================================

export class SellerEngine {
  /**
   * Tính hoa hồng theo Cơ chế mới (Commission Engine v2.0)
   * - Vỏ: 5%
   * - Đá dưới 4 ly: 5%
   * - Đá tròn >= 4 ly: 2%
   * - Đá Fancy: 3%
   * - KPI Factor: 0.8 - 1.2
   */
  static calculateCommission(report: Partial<SellerReport>, sellerKPI: number = 100): CommissionInfo {
    const shellHH = (report.shellRevenue || 0) * 0.05;
    let stoneHH = 0;
    let baseRate = 5;

    switch (report.stoneType) {
      case 'UNDER_4LY':
        stoneHH = (report.stoneRevenue || 0) * 0.05;
        break;
      case 'ROUND_OVER_4LY':
        stoneHH = (report.stoneRevenue || 0) * 0.02;
        break;
      case 'FANCY_SHAPE':
        stoneHH = (report.stoneRevenue || 0) * 0.03;
        break;
      default:
        stoneHH = 0;
    }

    // KPI Multiplier: 100đ = 1.0, max ±0.5
    const kpiFactor = 1 + ((sellerKPI - 100) / 100) * 0.5;
    const normalizedKPI = Math.max(0.8, Math.min(1.2, kpiFactor));

    let totalBeforePenalty = (shellHH + stoneHH) * normalizedKPI;

    let penalty = 0;
    if (report.isReportedWithin24h === false) {
      penalty = totalBeforePenalty * 0.1; // Phạt 10% nếu báo cáo chậm
    }

    return {
      policyId: 'POL-COMM-2026-V2',
      baseRate,
      kpiFactor: normalizedKPI,
      estimatedAmount: totalBeforePenalty,
      finalAmount: totalBeforePenalty - penalty,
      status: 'PENDING',
      total: totalBeforePenalty - penalty,
      shell: shellHH,
      stone: stoneHH
    };
  }

  /** Kiểm tra quy tắc 24h (Điều 9) */
  static check24hRule(reportTimestamp: number): boolean {
    const reportDate = new Date(reportTimestamp);
    const now = new Date();
    return reportDate.getDate() === now.getDate() &&
      reportDate.getMonth() === now.getMonth() &&
      reportDate.getFullYear() === now.getFullYear();
  }

  /** Kiểm tra quy tắc 90 ngày sở hữu Data (Điều 9) */
  static isLeadExpired(assignedAt: number): boolean {
    const ninetyDaysInMs = 90 * 24 * 60 * 60 * 1000;
    return (Date.now() - assignedAt) > ninetyDaysInMs;
  }

  /** Kiểm tra quy tắc 7 ngày không tương tác */
  static isLeadInactive(lastInteraction: number): boolean {
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
    return (Date.now() - lastInteraction) > sevenDaysInMs;
  }

  /** Tính lương thực lãnh (CTV = 0 lương cứng) */
  static calculateIncome(identity: SellerIdentity, baseSalary: number, commission: number): number {
    if ((identity as any).isCollaborator) {
      return commission;
    }
    return baseSalary + commission;
  }
}

// ============================================================================
// SALES CORE ENGINE — Pricing, Commission, Order Factory
// ============================================================================

export class SalesCoreEngine {
  private static instance: SalesCoreEngine;

  static getInstance(): SalesCoreEngine {
    if (!SalesCoreEngine.instance) {
      SalesCoreEngine.instance = new SalesCoreEngine();
    }
    return SalesCoreEngine.instance;
  }

  /**
   * Tính toán Pricing & P&L cho đơn hàng
   */
  public calculatePricing(
    items: OrderItem[],
    discountPercent: number = 0,
    shippingFee: number = 0,
    customerTier: string = 'STANDARD'
  ): OrderPricing {
    let subtotal = 0;
    let basePriceTotal = 0;
    let costOfGoods = 0;
    let taxAmount = 0;

    items.forEach(item => {
      const itemTotal = item.unitPrice * item.quantity;
      basePriceTotal += itemTotal;
      subtotal += itemTotal - item.discount;
      costOfGoods += item.costPrice * item.quantity;
      const taxableAmount = itemTotal - item.discount;
      taxAmount += taxableAmount * (item.taxRate / 100);
    });

    let tierDiscount = 0;
    if (customerTier === 'VIP_DIAMOND') tierDiscount = 0.05;
    if (customerTier === 'VIP_GOLD') tierDiscount = 0.02;

    const totalDiscount = subtotal * (discountPercent + tierDiscount) / 100;
    const gdbPriceTotal = subtotal - totalDiscount;
    const exchangeRate = 0.85;
    const insuranceFee = gdbPriceTotal > 50_000_000 ? gdbPriceTotal * 0.005 : 0;
    const totalAmount = gdbPriceTotal + taxAmount + shippingFee + insuranceFee;
    const grossProfit = (totalAmount - taxAmount - shippingFee - insuranceFee) - costOfGoods;
    const profitMargin = totalAmount > 0 ? (grossProfit / totalAmount) * 100 : 0;

    return {
      subtotal,
      basePriceTotal,
      gdbPriceTotal,
      discount: totalDiscount,
      tax: taxAmount,
      exchangeRate,
      discountPercentage: discountPercent + tierDiscount * 100,
      promotionDiscount: totalDiscount,
      taxAmount,
      shippingFee,
      insuranceFee,
      totalAmount,
      costOfGoods,
      grossProfit,
      profitMargin
    };
  }

  /**
   * Tính hoa hồng dựa trên Pricing & SalesPerson KPI
   */
  public calculateCommission(
    salesPerson: SalesPerson,
    pricing: OrderPricing,
    _items: OrderItem[]
  ): CommissionInfo {
    const commissionableRevenue = pricing.gdbPriceTotal;

    let baseRate = 2;
    if (salesPerson.position.role === PositionType.COLLABORATOR) baseRate = 10;

    const kpiFactor = 1 + ((salesPerson.kpiScore - 100) / 100);
    const estimatedAmount = commissionableRevenue * (baseRate / 100) * kpiFactor;

    return {
      policyId: 'POL-2026-STD',
      baseRate,
      kpiFactor,
      estimatedAmount,
      finalAmount: estimatedAmount,
      status: 'PENDING',
      total: estimatedAmount,
      shell: pricing.subtotal * 0.05,
      stone: pricing.subtotal * 0.03
    };
  }

  /**
   * Factory Method: Khởi tạo Đơn hàng chuẩn hóa
   */
  public createSalesOrder(
    channel: SalesChannel,
    customer: Customer,
    salesPerson: SalesPerson,
    items: OrderItem[],
    WAREHOUSE: WarehouseLocation = WarehouseLocation.HCM_HEADQUARTER
  ): SalesOrder {
    const pricing = this.calculatePricing(items, 0, 0, customer.tier);
    const commission = this.calculateCommission(salesPerson, pricing, items);

    return {
      orderId: `SO-${Date.now()}`,
      orderType: channel,
      customer,
      items,
      pricing,
      payment: {
        method: 'CASH',
        status: 'UNPAID',
        depositAmount: 0,
        remainingAmount: pricing.totalAmount,
        currency: 'VND'
      },
      status: OrderStatus.DRAFT,
      WAREHOUSE,
      salesPerson,
      commission,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
  }
}

export const SalesCore = SalesCoreEngine.getInstance();
