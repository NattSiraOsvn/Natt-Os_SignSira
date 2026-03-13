import { DustCloseReport, DustCloseStatus, createDustCloseReport } from '../domain/dust.entity';

// In-memory store — JUST-U inject thật
const reportStore: Map<string, DustCloseReport> = new Map();

export class CreateDustCloseReportUseCase {
  execute(period: string, weightBuiVang: number, weightBuiKim: number, createdBy: string): DustCloseReport {
    const report = createDustCloseReport(period, weightBuiVang, weightBuiKim, createdBy);
    reportStore.set(period, report);
    console.log(`[dust-recovery-cell] DUST_CLOSE_REPORT created period=${period} status=PENDING`);
    return report;
  }
}

export class ApproveDustCloseReportUseCase {
  execute(period: string, approvedBy: string): DustCloseReport {
    const report = reportStore.get(period);
    if (!report) throw new Error(`[dust-recovery-cell] No report for period=${period}`);
    report.status = 'APPROVED';
    report.approvedBy = approvedBy;
    report.approvedAt = new Date();
    reportStore.set(period, report);
    console.log(`[dust-recovery-cell] DUST_CLOSE_REPORT APPROVED period=${period} by=${approvedBy}`);
    return report;
  }
}

export class GetDustCloseReportUseCase {
  execute(period: string): DustCloseReport | null {
    return reportStore.get(period) ?? null;
  }
}

// Export store for cross-cell access (period-close-cell reads this)
export { reportStore as dustReportStore };
