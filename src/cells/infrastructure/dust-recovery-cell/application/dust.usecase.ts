import { DustRecord, BenchmarkRecord, DustCloseReport, createDustCloseReport } from '../domain/dust.entity';

// ── Interfaces for old engine ──────────────────────────────────
export interface IDustRepository {
  save(record: DustRecord): Promise<void>;
  findByWorker(workerId: string, role: string, vtType: string, months: number): Promise<DustRecord[]>;
  findByPeriod(periodId: string): Promise<DustRecord[]>;
  findBenchmark(role: string, vtType: string, month: number): Promise<BenchmarkRecord | null>;
  saveBenchmark(b: BenchmarkRecord): Promise<void>;
}

export interface IDustEventEmitter {
  emitRecovered(e: any): void;
  emitAlert(e: any): void;
  emitCarryForwardProposal(e: any): void;
  emitCloseReport(e: any): void;
}

// ── Old use cases (used by dust.engine.ts) ─────────────────────
export class ProcessDustReturnUseCase {
  constructor(
    private readonly repo: IDustRepository,
    private readonly emitter: IDustEventEmitter,
    private readonly goldPrice: () => number
  ) {}

  async execute(event: any): Promise<void> {
    const record: DustRecord = {
      id: `DR_${Date.now()}`,
      workerId: event.workerId,
      workerName: event.workerName ?? '',
      role: event.role,
      vtType: event.vtType,
      periodId: event.periodId ?? '',
      weightGross: event.weightGross ?? 0,
      weightNet: event.weightNet ?? 0,
      recoveredVND: (event.weightNet ?? 0) * this.goldPrice(),
      createdAt: new Date()
    };
    await this.repo.save(record);
    this.emitter.emitRecovered({
      eventType: 'DUST_RECOVERED',
      ...record
    });
    console.log(`[dust-recovery-cell] Processed dust return workerId=${event.workerId}`);
  }
}

export class GenerateDustCloseReportUseCase {
  constructor(
    private readonly repo: IDustRepository,
    private readonly emitter: IDustEventEmitter
  ) {}

  async execute(periodId: string): Promise<void> {
    const records = await this.repo.findByPeriod(periodId);
    const totalNet = records.reduce((s, r) => s + r.weightNet, 0);
    const totalVND = records.reduce((s, r) => s + r.recoveredVND, 0);

    // Also write to new store for period-close-cell
    const report = reportStore.get(periodId);
    if (!report) {
      const newReport = createDustCloseReport(periodId, totalNet, 0, 'system');
      reportStore.set(periodId, newReport);
    }

    this.emitter.emitCloseReport({
      eventType: 'DUST_CLOSE_REPORT',
      periodId,
      totalWeightNet: totalNet,
      totalRecoveredVND: totalVND,
      recordCount: records.length,
      createdAt: new Date()
    });
    console.log(`[dust-recovery-cell] Close report generated period=${periodId} records=${records.length}`);
  }
}

// ── New use cases (used by period-close-cell) ──────────────────
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

export { reportStore as dustReportStore };
