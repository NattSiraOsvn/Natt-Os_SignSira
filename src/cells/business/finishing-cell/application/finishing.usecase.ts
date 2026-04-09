// @ts-nocheck — TODO: fix type errors, remove this pragma

/**
 * finishing-cell — application/finishing.usecase.ts
 * Sprint 2 | Tâm Luxury NATT-OS
 *
 * Subscribe: WIP_PHOI (từ casting-cell)
 * Emit:      WIP_IN_PROGRESS (sang stone-cell / polishing-cell)
 * Rule:      FS-025 — role SX|SC bắt buộc trong mọi DustIssue
 */

import { WorkerAssignment, DustIssue, createDustIssue, FinishingRecord } from '../domain/finishing.entity';
import { WipPhoiEvent, WipInProgressEvent } from '../../../../governance/event-contracts/production-events';

// ─── Ports ──────────────────────────────────────────────────────────────────

export interface IFinishingRepository {
  save(record: FinishingRecord): Promise<void>;
  findByLapId(lapId: string): Promise<FinishingRecord | null>;
  findByOrderId(orderId: string): Promise<FinishingRecord[]>;
}

export interface IFinishingSheetAdapter {
  fetchWorkerAssignments(lapId: string): Promise<RawWorkerRow[]>;
}

export interface RawWorkerRow {
  workerId: string;
  workerName: string;
  role: 'SX' | 'SC';
  assignedAt: string; // ISO
}

// ─── UseCase: AssignWorkerUseCase ────────────────────────────────────────────

export class AssignWorkerUseCase {
  constructor(
    private repo: IFinishingRepository,
    private adapter: IFinishingSheetAdapter,
  ) {}

  async execute(lapId: string, orderId: string): Promise<WorkerAssignment[]> {
    const rows = await this.adapter.fetchWorkerAssignments(lapId);
    return rows.map(r => ({
      workerId:   r.workerId,
      workerName: r.workerName,
      role:       r.role,
      assignedAt: new Date(r.assignedAt),
    }));
  }
}

// ─── UseCase: ProcessWipPhoiUseCase ─────────────────────────────────────────

export class ProcessWipPhoiUseCase {
  constructor(
    private repo: IFinishingRepository,
    private assign: AssignWorkerUseCase,
    private emit: (event: WipInProgressEvent) => Promise<void>,
  ) {}

  async execute(event: WipPhoiEvent): Promise<void> {
    const { lapId, orderId } = event;

    const workers = await this.assign.execute(lapId, orderId);

    const record: FinishingRecord = {
      id:         `FIN-${lapId}-${Date.now()}`,
      lapId,
      orderId,
      workers,
      dustIssues: [],
      status:     'IN_PROGRESS',
      startedAt:  new Date(),
    };

    await this.repo.save(record);

    // Emit WIP_IN_PROGRESS cho từng worker (stage đầu tiên: NGUOI_1)
    for (const w of workers) {
      const outEvent: WipInProgressEvent = {
        eventType:   'WIP_IN_PROGRESS',
        orderId,
        lapId,
        stage:       'NGUOI_1',
        workerId:    w.workerId,
        workerName:  w.workerName,
        role:        w.role,
        completedAt: new Date(),
      };
      await this.emit(outEvent);
    }
  }
}

// ─── UseCase: RecordDustIssueUseCase ─────────────────────────────────────────
// TR-007 analog: role SX|SC bắt buộc — FS-025

export class RecordDustIssueUseCase {
  constructor(private repo: IFinishingRepository) {}

  async execute(
    finishingId: string,
    workerId: string,
    role: 'SX' | 'SC',
    weightGram: number,
    note?: string,
  ): Promise<DustIssue> {
    const record = await this.repo.findByLapId(finishingId);
    if (!record) throw new Error(`FinishingRecord not found: ${finishingId}`);

    const issue = createDustIssue(workerId, role, weightGram, note);
    record.dustIssues.push(issue);
    await this.repo.save(record);
    return issue;
  }
}
