import { ValidationReport } from '../entities/validation-report.entity';
import { ClosingSession } from '../entities/closing-session.entity';

export interface IWarehouseCell {
  getInventory(period: string): Promise<any[]>;
  getCostOfGoodsSold(period: string): Promise<number>;
}
export interface ILogisticsCell {
  getShippingExpenses(period: string): Promise<number>;
}
export interface ISupplierCell {
  getPayables(period: string): Promise<any[]>;
  getPurchases(period: string): Promise<any[]>;
}
export interface INoiVuCell {
  getLaborCosts(period: string): Promise<number>;
  getAllocationRules(period: string): Promise<any[]>;
}
export interface IEventStore {
  writeLog(log: any): Promise<void>;
}

export interface IPrecloseValidator {
  validate(period: string, session: ClosingSession, options?: any): Promise<ValidationReport>;
}

export class PrecloseValidator {
  static async validate(period: string, session: ClosingSession, options?: any): Promise<ValidationReport> {
    const errors: any[] = [];
    const warnings: any[] = [];
    const info: any[] = [];

    // Rule 1
    const unposted = await this.checkUnpostedDocuments(period);
    if (unposted.length > 0) {
      errors.push({
        code: 'UNPOSTED_DOCS',
        message: `Còn ${unposted.length} chứng từ chưa định khoản.`,
        details: unposted
      });
    }

    // Rule 2
    const inventory = await this.getInventory(period);
    for (const item of inventory) {
      if (item.quantity < 0) {
        errors.push({
          code: 'NEGATIVE_INVENTORY',
          message: `Mã hàng ${item.code} có tồn kho cuối kỳ âm (${item.quantity}).`,
          details: item
        });
      }
    }

    // Các rule khác (3-15) có thể thêm sau

    info.push({
      code: 'TOTAL_REVENUE',
      message: 'Tổng doanh thu trong kỳ',
      value: 1_500_000_000
    });

    const isValid = errors.length === 0;
    const report: ValidationReport = {
      id: `VR_${period}_${Date.now()}`,
      period,
      isValid,
      errors,
      warnings,
      info,
      validatedAt: new Date(),
      validatedBy: 'system'
    };

    await this.writeLog({ type: 'VALIDATION_COMPLETED', period, result: report });
    return report;
  }

  private static async checkUnpostedDocuments(period: string): Promise<any[]> {
    return [];
  }

  private static async getInventory(period: string): Promise<any[]> {
    return [
      { code: 'SP001', quantity: 100 },
      { code: 'SP002', quantity: -5 }
    ];
  }

  private static async writeLog(log: any): Promise<void> {
    console.log('Log:', log);
  }
}
