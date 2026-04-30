//  — TODO: fix type errors, remove this pragma

import { ValidationReport } from '../entities/validation-report.entity';
import { ClosingSession } from '../entities/closing-session.entity';
import { dustReportStore } from '../../../../infrastructure/dust-recovery-cell/application/dust.usecase';

export interface IPrecloseValidator {
  validate(period: string, session: ClosingSession, options?: any): Promise<ValidationReport>;
}

export class PrecloseValidator {
  static async validate(period: string, session: ClosingSession, _options?: any): Promise<ValidationReport> {
    const errors: any[] = [];
    const warnings: any[] = [];
    const info: any[] = [];

    // TR-006: DUST_CLOSE_REPORT APPROVED phai co TRUOC — BLOCK neu thieu
    const dustReport = await this.checkDustCloseReport(period);
    if (!dustReport) {
      errors.push({
        code: 'missing_DUST_CLOSE_REPORT',
        message: `TR-006 BLOCK: Chua co DUST_CLOSE_REPORT status=APPROVED cho period=${period}.`,
        details: { period }
      });
    } else if (dustReport.status !== 'APPROVED') {
      errors.push({
        code: 'DUST_CLOSE_REPORT_NOT_APPROVED',
        message: `TR-006 BLOCK: DUST_CLOSE_REPORT status=${dustReport.status} — can APPROVED.`,
        details: dustReport
      });
    }

    const unposted = await this.checkUnpostedDocuments(period);
    if (unposted.length > 0) {
      errors.push({ code: 'UNPOSTED_DOCS', message: `Con ${unposted.length} chung tu chua dinh khoan.`, details: unposted });
    }

    const inventory = await this.getInventory(period);
    for (const item of inventory) {
      if (item.quantity < 0) {
        errors.push({ code: 'NEGATIVE_INVENTORY', message: `Ma hang ${item.code} ton kho am (${item.quantity}).`, details: item });
      }
    }

    info.push({ code: 'TOTAL_REVENUE', message: 'Tong doanh thu trong ky', value: 0 });

    const isValid = errors.length === 0;
    const report: ValidationReport = {
      id: `VR_${period}_${Date.now()}`,
      period, isValid, errors, warnings, info,
      validatedAt: new Date(), validatedBy: 'system'
    };
    await this.writeLog({ type: 'VALIDATION_COMPLETED', period, result: report });
    return report;
  }

  private static async checkDustCloseReport(period: string): Promise<{ status: string } | null> {
    // Wire to dust-recovery-cell event store
    const report = dustReportStore.get(period) ?? null;
    return report ? { status: report.status } : null;
  }
  private static async checkUnpostedDocuments(_period: string): Promise<any[]> { return []; }
  private static async getInventory(_period: string): Promise<any[]> {
    return [{ code: 'SP001', quantity: 100 }];
  }
  private static async writeLog(log: any): Promise<void> { console.log('Log:', log); }
}
