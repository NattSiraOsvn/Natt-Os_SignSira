// @ts-nocheck
// ═══════════════════════════════════════════════════════════
// INHERITED FROM V2 — 2026-03-11
// Source: versions/v2svc/services/cost/CostAllocationSystem.ts
// Status: REFERENCE — adapt imports trước khi bật type-check
// ═══════════════════════════════════════════════════════════


import { CostAllocation, AccountingEntry } from '../../types';

/**
 * ⚖️ COST ALLOCATION SYSTEM
 * Location: src/services/cost/CostAllocationSystem.ts
 * Logic: Phân bổ chi phí chung (Overhead) dựa trên tiêu thức doanh thu/nhân sự
 */
export class CostAllocationSystem {
  
  /**
   * Tính toán phân bổ chi phí
   * @param totalCost Tổng chi phí cần phân bổ (VD: Tiền thuê nhà, Marketing tổng)
   * @param costType Loại chi phí
   * @param drivers Các yếu tố phân bổ (Cost Drivers) - VD: Doanh thu từng chi nhánh
   */
  static allocateByRevenue(
    totalCost: number, 
    costType: 'MARKETING' | 'RENT' | 'OPERATIONS',
    drivers: { costCenter: string, revenue: number }[]
  ): CostAllocation {
    
    const totalRevenue = drivers.reduce((sum, d) => sum + d.revenue, 0);
    
    const allocations = drivers.map(d => {
      const ratio = totalRevenue > 0 ? d.revenue / totalRevenue : 0;
      return {
        costCenter: d.costCenter,
        allocatedAmount: Math.round(totalCost * ratio),
        allocationRatio: ratio,
        basis: `Revenue Share: ${(ratio * 100).toFixed(1)}%`
      };
    });

    return {
      costId: `COST-${Date.now()}`,
      costType,
      totalAmount: totalCost,
      allocationMethod: 'REVENUE_BASED',
      allocationDate: Date.now(),
      allocations
    };
  }

  /**
   * Tạo bút toán kế toán từ kết quả phân bổ
   */
  static generateJournalEntries(allocation: CostAllocation): AccountingEntry {
    // Nợ 641/642 (Chi tiết theo Cost Center) / Có 242 (Chi phí trả trước) hoặc 112 (Tiền)
    const debitEntries = allocation.allocations.map(a => ({
      accountNumber: '642', // TK Chi phí quản lý (Mặc định)
      accountName: 'Chi phí quản lý',
      amount: a.allocatedAmount,
      type: 'DEBIT' as const,
      detail: `PB ${allocation.costType} - ${a.costCenter}`,
      debit: a.allocatedAmount,
      credit: 0
    }));

    const creditEntry = {
      accountNumber: '242', // TK Chờ phân bổ
      accountName: 'Chi phí trả trước',
      amount: allocation.totalAmount,
      type: 'CREDIT' as const,
      detail: `Phân bổ ${allocation.costType} kỳ này`,
      debit: 0,
      credit: allocation.totalAmount
    };

    return {
      journalId: `JRN-ALLOC-${allocation.costId}`,
      transactionDate: allocation.allocationDate,
      referenceId: allocation.costId,
      referenceType: 'ALLOCATION',
      journalType: 'ALLOCATION',
      description: `Bút toán phân bổ chi phí ${allocation.costType}`,
      status: 'DRAFT',
      matchScore: 100,
      entries: [...debitEntries, creditEntry]
    };
  }
}
