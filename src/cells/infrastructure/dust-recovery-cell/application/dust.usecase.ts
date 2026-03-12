/**
 * dust-recovery-cell / application / dust.usecase.ts
 */

import {
  DustRecord,
  BenchmarkRecord,
  calculateDustScore,
  classifyAnomaly,
  detectCarryForward,
  calculateQuy750,
  PRELIMINARY_BENCHMARKS,
} from '../domain/dust.entity';
import {
  DustReturnedEvent,
  DustRecoveredEvent,
  DustAlertEvent,
  CarryForwardProposalEvent,
  DustCloseReportEvent,
} from '../../../../governance/event-contracts/production-events';

export interface IDustRepository {
  save(record: DustRecord): Promise<void>;
  findByWorker(workerId: string, role: string, vtType: string, months: number): Promise<DustRecord[]>;
  findByPeriod(periodId: string): Promise<DustRecord[]>;
  findBenchmark(role: string, vtType: string, month: number): Promise<BenchmarkRecord | null>;
  saveBenchmark(b: BenchmarkRecord): Promise<void>;
}

export interface IDustEventEmitter {
  emitRecovered(event: DustRecoveredEvent): void;
  emitAlert(event: DustAlertEvent): void;
  emitCarryForwardProposal(event: CarryForwardProposalEvent): void;
  emitCloseReport(event: DustCloseReportEvent): void;
}

let proposalSeq = 0;

export class ProcessDustReturnUseCase {
  constructor(
    private readonly repo: IDustRepository,
    private readonly emitter: IDustEventEmitter,
    private readonly goldPrice750VND: () => number, // giá vàng 750 hiện hành
  ) {}

  async execute(event: DustReturnedEvent): Promise<void> {
    // TR-007: validate role
    if (!event.role || !['SX', 'SC'].includes(event.role)) {
      throw new Error(`[dust-recovery] DUST_RETURNED missing valid role: workerId=${event.workerId}`);
    }

    const lossRate = event.tl_giao > 0
      ? (event.tl_giao - event.tl_tra) / event.tl_giao
      : 0;

    const day = event.returnedDate.getDate();

    const record: DustRecord = {
      id: `dust:${event.workerId}:${event.role}:${event.vtType}:${event.periodId}:${Date.now()}`,
      workerId: event.workerId,
      role: event.role,
      vtType: event.vtType,
      tlGiao: event.tl_giao,
      tlTra: event.tl_tra,
      phoPct: event.pho_pct,
      lossRate,
      periodId: event.periodId,
      day,
      isCarryForward: false,
      lapIds: event.lapIds,
      orderIds: event.orderIds,
    };

    // Tính quy750 chỉ khi có PHỔ% thực tế (không hard-code)
    if (event.pho_pct !== undefined && event.pho_pct > 0) {
      record.quy750 = calculateQuy750(event.tl_tra, event.pho_pct);
    }

    // Detect carry-forward
    if (detectCarryForward(record)) {
      const proposal: CarryForwardProposalEvent = {
        eventType: 'CARRY_FORWARD_PROPOSAL',
        proposalId: `cf-proposal-${++proposalSeq}`,
        workerId: event.workerId,
        role: event.role,
        vtType: event.vtType,
        amount: record.quy750 ?? event.tl_tra * 0.8,
        fromPeriod: this.prevPeriod(event.periodId),
        toPeriod: event.periodId,
        reason: 'Nộp bù tháng trước – lossRate âm trong 5 ngày đầu tháng',
        proposedBy: 'system',
        confidence: 0.85,
      };
      // KHÔNG ghi sổ – chờ CARRY_FORWARD_APPROVED từ Gatekeeper
      this.emitter.emitCarryForwardProposal(proposal);
      console.log(`[dust-recovery] CARRY_FORWARD_PROPOSAL: ${event.workerId} ${event.vtType} ${this.prevPeriod(event.periodId)}→${event.periodId}`);
      return; // đợi Gatekeeper
    }

    await this.repo.save(record);

    // Benchmark check
    await this.checkAnomaly(record);

    // Emit DUST_RECOVERED nếu có quy750
    if (record.quy750 !== undefined) {
      const totalVND = record.quy750 * this.goldPrice750VND();
      this.emitter.emitRecovered({
        eventType: 'DUST_RECOVERED',
        workerId: event.workerId,
        role: event.role,
        vtType: event.vtType,
        quy750: record.quy750,
        totalVND,
        periodId: event.periodId,
        // Bút toán: Nợ 152-PHAN-KIM / Có 154 (phân bổ về từng orderId theo TL vàng)
      });
    }
  }

  private async checkAnomaly(record: DustRecord): Promise<void> {
    const key = `${record.role}:${record.vtType}`;
    const preliminary = PRELIMINARY_BENCHMARKS[key];
    if (!preliminary) return;

    const month = parseInt(record.periodId.split('-')[1] ?? '1');
    const history = await this.repo.findByWorker(record.workerId, record.role, record.vtType, 3);

    const rolling3m = history.length >= 3
      ? history.slice(-3).reduce((s, r) => s + r.lossRate, 0) / 3
      : null;

    const dustScore = calculateDustScore(rolling3m, preliminary.avg, preliminary.avg);
    const { level, deviationSigma } = classifyAnomaly(record.lossRate, dustScore, preliminary.stdDev);

    if (level === 'NORMAL') return;

    const alert: DustAlertEvent = {
      eventType: 'DUST_ALERT',
      workerId: record.workerId,
      role: record.role,
      vtType: record.vtType,
      actualLossRate: record.lossRate,
      expectedLossRate: dustScore,
      deviationSigma,
      level,
      message: `Hao hụt ${(record.lossRate * 100).toFixed(1)}% vs định mức ${(dustScore * 100).toFixed(1)}% (${deviationSigma.toFixed(2)}σ)`,
      action: level === 'CRITICAL' ? 'BLOCK_PERIOD_CLOSE' : level === 'HIGH' ? 'INVESTIGATE' : 'REVIEW',
      periodId: record.periodId,
    };

    this.emitter.emitAlert(alert);
    console.log(`[dust-recovery] DUST_ALERT ${level}: ${record.workerId} ${record.vtType}`);
  }

  private prevPeriod(periodId: string): string {
    const [y, m] = periodId.split('-').map(Number);
    if (!y || !m) return periodId;
    if (m === 1) return `${y - 1}-12`;
    return `${y}-${String(m - 1).padStart(2, '0')}`;
  }
}

/**
 * TR-006: Tạo DUST_CLOSE_REPORT cuối kỳ.
 * period-close-cell BLOCK cho đến khi nhận được report này với status='APPROVED'.
 */
export class GenerateDustCloseReportUseCase {
  constructor(
    private readonly repo: IDustRepository,
    private readonly emitter: IDustEventEmitter,
  ) {}

  async execute(periodId: string): Promise<void> {
    const records = await this.repo.findByPeriod(periodId);
    const alerts: DustAlertEvent[] = [];

    // Thu thập tất cả alerts trong kỳ (cần thêm alert store nếu muốn persist)
    const report: DustCloseReportEvent = {
      eventType: 'DUST_CLOSE_REPORT',
      periodId,
      totalWorkers: new Set(records.map(r => r.workerId)).size,
      totalVTTypes: new Set(records.map(r => r.vtType)).size,
      anomalies: alerts,
      carryForwardProposals: [],
      status: 'PENDING', // Gatekeeper phải approve để thành 'APPROVED'
    };

    this.emitter.emitCloseReport(report);
    console.log(`[dust-recovery] DUST_CLOSE_REPORT emitted for ${periodId} – status=PENDING, chờ Gatekeeper`);
  }
}
