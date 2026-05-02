/**
 * casting-cell / infrastructure / casting.engine.ts
 * ADAPT: subscribe CASTING_REQUEST từ SmartLink hiện có.
 */

import { ProcessCastingRequestUseCase, ICastingRepository, ICastingSheetAdapter } from '../application/casting.usecase';
import { CastingRequestEvent, WipPhoiEvent } from '../../../../governance/event-contracts/production-events';
import { CastingRecord } from '../domain/casting.entity';

export interface ISmartLinkPort {
  emit(eventType: string, payload: unknown): void;
  subscribe(eventType: string, handler: (payload: unknown) => void): void;
}

export class CastingEngine {
  private readonly useCase: ProcessCastingRequestUseCase;

  constructor(
    private readonly repo: ICastingRepository,
    private readonly adapter: ICastingSheetAdapter,
    private readonly smartLink: ISmartLinkPort,
  ) {
    this.useCase = new ProcessCastingRequestUseCase(repo, adapter, (e) => this.publish(e));
  }

  start(): void {
    // ADAPT: subscribe qua SmartLink hiện có
    this.smartLink.subscribe('CASTING_REQUEST', async (payload) => {
      const event = payload as CastingRequestEvent;
      console.log(`[casting-cell] Received CASTING_REQUEST: ${event.lapId}`);
      await this.useCase.execute(event);
    });
    console.log('[casting-cell] Engine started, subscribed to CASTING_REQUEST');
  }

  private publish(event: WipPhoiEvent): void {
    this.smartLink.emit(event.eventType, event);
    console.log(`[casting-cell] Emitted WIP_PHOI: ${event.lapId}/${event.orderId} status=${event.phoiStatus}`);
  }
}

export class InMemoryCastingRepository implements ICastingRepository {
  private store = new Map<string, CastingRecord>();

  async findById(id: string): Promise<CastingRecord | null> {
    return this.store.get(id) ?? null;
  }

  async save(record: CastingRecord): Promise<void> {
    this.store.set(record.id, record);
  }

  async findByLap(lapId: string): Promise<CastingRecord[]> {
    return Array.from(this.store.values()).filter(r => r.lapId === lapId);
  }
}
