// @ts-nocheck
// ═══════════════════════════════════════════════════════════
// INHERITED FROM V2 — 2026-03-11
// Source: versions/v2svc/services/salesCore.ts
// Status: REFERENCE — adapt imports trước khi bật type-check
// ═══════════════════════════════════════════════════════════


import { UserPosition, PositionType, SalesChannel, WarehouseLocation, ProductType, OrderStatus, Customer, LogisticsInfo, PaymentInfo, SalesPerson, CommissionInfo, OrderItem, OrderPricing, SalesOrder } from '../types';
import { SellerEngine } from './sellerEngine';

// ============================================================================
// 🧠 SALES CORE ENGINE (LOGIC LAYER)
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
      
      // Thuế tính trên giá sau giảm
      const taxableAmount = itemTotal - item.discount;
      taxAmount += taxableAmount * (item.taxRate / 100);
    });

    // Tier based discount adjustment
    let tierDiscount = 0;
    if (customerTier === 'VIP_DIAMOND') tierDiscount = 0.05; // Extra 5%
    if (customerTier === 'VIP_GOLD') tierDiscount = 0.02;    // Extra 2%

    const totalDiscount = (subtotal * (discountPercent + tierDiscount) / 100);
    
    // GĐB Value: Giá trị đảm bảo thường là giá thực tế khách trả (trừ ship/thuế/bảo hiểm)
    const gdbPriceTotal = subtotal - totalDiscount;

    // Exchange Rate Logic (Mặc định)
    // Vàng/Kim cương: 80-90% | Dịch vụ: 0%
    const exchangeRate = 0.85; 

    const insuranceFee = gdbPriceTotal > 50000000 ? gdbPriceTotal * 0.005 : 0; // 0.5% nếu > 50tr

    const totalAmount = gdbPriceTotal + taxAmount + shippingFee + insuranceFee;
    const grossProfit = (totalAmount - taxAmount - shippingFee - insuranceFee) - costOfGoods;
    const profitMargin = totalAmount > 0 ? (grossProfit / totalAmount) * 100 : 0;

    return {
      subtotal,
      basePriceTotal,
      gdbPriceTotal,
      exchangeRate,
      discountPercentage: discountPercent + (tierDiscount * 100),
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
   * Tính toán hoa hồng dựa trên Pricing & SalesPerson KPI
   */
  public calculateCommission(
    salesPerson: SalesPerson, 
    pricing: OrderPricing, 
    items: OrderItem[]
  ): CommissionInfo {
    // Tách doanh thu vỏ và đá (Giả lập logic bóc tách từ Item Type)
    // Trong thực tế cần logic phức tạp hơn dựa trên thuộc tính sản phẩm
    let commissionableRevenue = pricing.gdbPriceTotal;
    
    // Base Rate theo vị trí
    let baseRate = 2; // 2% mặc định
    /* Fix: salesPerson.position is an object (UserPosition interface), check role property with PositionType enum */
    if (salesPerson.position.role === PositionType.COLLABORATOR) baseRate = 10; // CTV cao hơn vì không lương cứng

    // KPI Multiplier
    const kpiFactor = 1 + ((salesPerson.kpiScore - 100) / 100); // 120 điểm -> 1.2x

    const estimatedAmount = commissionableRevenue * (baseRate / 100) * kpiFactor;

    return {
      policyId: 'POL-2026-STD',
      baseRate,
      kpiFactor,
      estimatedAmount,
      finalAmount: estimatedAmount, // Sẽ bị trừ nếu có penalty sau này
      status: 'PENDING'
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
    warehouse: WarehouseLocation = WarehouseLocation.HCM_HEADQUARTER
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
      warehouse,
      salesPerson,
      commission,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
  }
}

export const SalesCore = SalesCoreEngine.getInstance();
