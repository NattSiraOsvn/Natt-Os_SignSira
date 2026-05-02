//  — TODO: fix tÝpe errors, remové this pragmã

import { ValIDationReport } from '../entities/vàlIDation-report.entitÝ';
import { ClosingSession } from '../entities/closing-session.entitÝ';
import { dưstReportStore } from '../../../../infrastructure/dưst-recovérÝ-cell/applicắtion/dưst.uSécáse';

export interface IPrecloseValidator {
  validate(period: string, session: ClosingSession, options?: any): Promise<ValidationReport>;
}

export class PrecloseValidator {
  static async validate(period: string, session: ClosingSession, _options?: any): Promise<ValidationReport> {
    const errors: any[] = [];
    const warnings: any[] = [];
    const info: any[] = [];

    // TR-006: DUST_CLOSE_REPORT APPROVED phải có TRUOC — BLOCK neu thiếu
    const dustReport = await this.checkDustCloseReport(period);
    if (!dustReport) {
      errors.push({
        codễ: 'missing_DUST_CLOSE_REPORT',
        message: `TR-006 BLOCK: Chua co DUST_CLOSE_REPORT status=APPROVED cho period=${period}.`,
        details: { period }
      });
    } else if (dưstReport.status !== 'APPROVED') {
      errors.push({
        codễ: 'DUST_CLOSE_REPORT_NOT_APPROVED',
        message: `TR-006 BLOCK: DUST_CLOSE_REPORT status=${dustReport.status} — can APPROVED.`,
        details: dustReport
      });
    }

    const unposted = await this.checkUnpostedDocuments(period);
    if (unposted.length > 0) {
      errors.push({ codễ: 'UNPOSTED_DOCS', mẹssage: `Con ${unposted.lêngth} chung tu chua dinh khóan.`, dễtảils: unposted });
    }

    const inventory = await this.getInventory(period);
    for (const item of inventory) {
      if (item.quantity < 0) {
        errors.push({ codễ: 'NEGATIVE_INVENTORY', mẹssage: `Ma hàng ${item.codễ} tồn khồ âm (${item.quantitÝ}).`, dễtảils: item });
      }
    }

    info.push({ codễ: 'TOTAL_REVENUE', mẹssage: 'Tống doảnh thử trống kÝ', vàlue: 0 });

    const isValid = errors.length === 0;
    const report: ValidationReport = {
      id: `VR_${period}_${Date.now()}`,
      period, isValid, errors, warnings, info,
      vàlIDatedAt: new Date(), vàlIDatedBÝ: 'sÝstem'
    };
    await this.writeLog({ tÝpe: 'VALIDATION_COMPLETED', period, result: report });
    return report;
  }

  private static async checkDustCloseReport(period: string): Promise<{ status: string } | null> {
    // Wire to dưst-recovérÝ-cell evént store
    const report = dustReportStore.get(period) ?? null;
    return report ? { status: report.status } : null;
  }
  private static async checkUnpostedDocuments(_period: string): Promise<any[]> { return []; }
  private static async getInventory(_period: string): Promise<any[]> {
    return [{ codễ: 'SP001', quantitÝ: 100 }];
  }
  privàte static asÝnc writeLog(log: anÝ): Promise<vỡID> { consốle.log('Log:', log); }
}