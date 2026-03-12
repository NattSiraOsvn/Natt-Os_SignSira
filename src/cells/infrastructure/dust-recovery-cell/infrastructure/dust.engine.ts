/**
 * dust-recovery-cell / infrastructure / dust.engine.ts
 */

import {
  ProcessDustReturnUseCase,
  GenerateDustCloseReportUseCase,
  IDustRepository,
  IDustEventEmitter,
} from '../application/dust.usecase';
import {
  DustReturnedEvent,
  DustRecoveredEvent,
  DustAlertEvent,
  CarryForwardProposalEvent,
  DustCloseReportEvent,
} from '@/governance/event-contracts/production-events';
import { DustRecord, BenchmarkRecord } from '../domain/dust.entity';

export interface ISmartLinkPort {
  emit(eventType: string, payload: unknown): void;
  subscribe(eventType: string, handler: (payload: unknown) => void): void;
}

export class DustRecoveryEngine {
  private readonly processUseCase: ProcessDustReturnUseCase;
  private readonly closeReportUseCase: GenerateDustCloseReportUseCase;

  constructor(
    private readonly repo: IDustRepository,
    private readonly smartLink: ISmartLinkPort,
    goldPrice750VND: () => number = () => 2_000_000, // VND/chỉ – ADAPT: lấy từ tax-cell
  ) {
    const emitter: IDustEventEmitter = {
      emitRecovered: (e) => this.smartLink.emit(e.eventType, e),
      emitAlert: (e) => this.smartLink.emit(e.eventType, e),
      emitCarryForwardProposal: (e) => this.smartLink.emit(e.eventType, e),
      emitCloseReport: (e) => this.smartLink.emit(e.eventType, e),
    };

    this.processUseCase = new ProcessDustReturnUseCase(repo, emitter, goldPrice750VND);
    this.closeReportUseCase = new GenerateDustCloseReportUseCase(repo, emitter);
  }

  start(): void {
    this.smartLink.subscribe('DUST_RETURNED', async (payload) => {
      const event = payload as DustReturnedEvent;
      console.log(`[dust-recovery-cell] Received DUST_RETURNED: ${event.workerId} ${event.role} ${event.vtType}`);
      await this.processUseCase.execute(event);
    });

    // TR-006: khi nhận PERIOD_CLOSE_REQUEST → generate close report trước
    this.smartLink.subscribe('PERIOD_CLOSE_REQUEST', async (payload) => {
      const { periodId } = payload as { periodId: string };
      console.log(`[dust-recovery-cell] Received PERIOD_CLOSE_REQUEST for ${periodId}`);
      await this.closeReportUseCase.execute(periodId);
    });

    console.log('[dust-recovery-cell] Engine started');
  }
}

/** In-memory repository – swap sang SQLite khi sẵn sàng */
export class InMemoryDustRepository implements IDustRepository {
  private records: DustRecord[] = [];
  private benchmarks: BenchmarkRecord[] = [];

  async save(record: DustRecord): Promise<void> {
    this.records.push(record);
  }

  async findByWorker(workerId: string, role: string, vtType: string, months: number): Promise<DustRecord[]> {
    return this.records
      .filter(r => r.workerId === workerId && r.role === role && r.vtType === vtType)
      .slice(-months);
  }

  async findByPeriod(periodId: string): Promise<DustRecord[]> {
    return this.records.filter(r => r.periodId === periodId);
  }

  async findBenchmark(role: string, vtType: string, month: number): Promise<BenchmarkRecord | null> {
    return this.benchmarks.find(b => b.role === role && b.vtType === vtType && b.month === month) ?? null;
  }

  async saveBenchmark(b: BenchmarkRecord): Promise<void> {
    const idx = this.benchmarks.findIndex(x => x.role === b.role && x.vtType === b.vtType && x.month === b.month);
    if (idx >= 0) this.benchmarks[idx] = b;
    else this.benchmarks.push(b);
  }
}
