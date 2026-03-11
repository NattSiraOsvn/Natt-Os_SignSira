import { TaxSmartLinkPort } from "../../ports/tax-smartlink.port";
import { GtgtDeclaration, TaxTransaction, TaxType } from '../entities/tax-transaction.entity';

export class TaxCalculator {
  /**
   * Tính thuế GTGT theo phương pháp trực tiếp (Mẫu 03)
   */
  static calculateGtgt(
    revenue: number,
    cogs: number,
    taxRate: number = 10,
    previousCredit: number = 0
  ): GtgtDeclaration {
    const taxableAmount = revenue - cogs;
    const taxPayable = (taxableAmount * taxRate) / 100;
    return {
      period: '', // sẽ gán sau
      revenue,
      cogs,
      taxableAmount,
      taxRate,
      taxPayable,
      previousPeriodCredit: previousCredit,
      totalPayable: Math.max(0, taxPayable - previousCredit),
    };
  }

  /**
   * Tính thuế TNDN từ lợi nhuận kế toán và các điều chỉnh
   */
  static calculateTndn(
    accountingProfit: number,
    nonDeductibleExpenses: number[],
    taxExemptIncome: number,
    taxRate: number = 20,
    carriedLosses: number = 0
  ): { taxableIncome: number; taxAmount: number; adjustments: number } {
    const totalNonDeductible = nonDeductibleExpenses.reduce((a, b) => a + b, 0);
    const taxableIncome = Math.max(0, accountingProfit + totalNonDeductible - taxExemptIncome - carriedLosses);
    const taxAmount = (taxableIncome * taxRate) / 100;
    return { taxableIncome, taxAmount, adjustments: totalNonDeductible - taxExemptIncome };
  }

  /**
   * Tạo bút toán thuế TNDN (Nợ 8211 / Có 3334)
   */
  static createTndnTransaction(
    period: string,
    taxableIncome: number,
    taxAmount: number,
    adjustments: number
  ): TaxTransaction {
    return {
      transactionId: `TAX-${Date.now()}`,
      taxType: 'TNDN',
      period,
      baseAmount: taxableIncome,
      taxRate: 20,
      taxAmount,
      adjustments,
      finalAmount: taxAmount,
      status: 'DRAFT',
      refDocs: [],
    };
  }
}
