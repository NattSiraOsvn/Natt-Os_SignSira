/**
 * prdmaterials-cell / infrastructure / prdmaterials.engine.ts
 */

import { CreateCastingRequestUseCase, ILapRepository, IPhieuInfoAdapter } from '../application/prdmaterials.usecase';
import { CastingRequestEvent } from '../../../../governance/event-contracts/production-events';
import { Lap } from '../domain/prdmaterials.entity';

export interface ISmartLinkPort {
  emit(eventType: string, payload: unknown): void;
}

export class PrdmaterialsEngine {
  private readonly useCase: CreateCastingRequestUseCase;
  private pollInterval?: ReturnType<typeof setInterval>;

  constructor(
    private readonly repo: ILapRepository,
    private readonly adapter: IPhieuInfoAdapter,
    private readonly smartLink: ISmartLinkPort,
  ) {
    this.useCase = new CreateCastingRequestUseCase(repo, (event) => this.publish(event));
  }

  async start(intervalMs = 30 * 60 * 1000): Promise<void> {
    console.log('[prdmaterials-cell] Engine started');
    await this.poll();
    this.pollInterval = setInterval(() => this.poll(), intervalMs);
  }

  stop(): void {
    if (this.pollInterval) clearInterval(this.pollInterval);
  }

  async poll(): Promise<void> {
    try {
      const laps = await this.adapter.fetchPendingLaps();
      for (const lap of laps) {
        await this.useCase.execute(lap);
      }
    } catch (err) {
      console.error('[prdmaterials-cell] Poll error:', err);
    }
  }

  private publish(event: CastingRequestEvent): void {
    this.smartLink.emit(event.eventType, event);
    console.log(`[prdmaterials-cell] Emitted CASTING_REQUEST: ${event.lapId}`);
  }
}

/** In-memory repository */
export class InMemoryLapRepository implements ILapRepository {
  private store = new Map<string, Lap>();

  async findById(lapId: string): Promise<Lap | null> {
    return this.store.get(lapId) ?? null;
  }

  async save(lap: Lap): Promise<void> {
    this.store.set(lap.lapId, lap);
  }

  async findByStatus(status: Lap['status']): Promise<Lap[]> {
    return Array.from(this.store.values()).filter(l => l.status === status);
  }
}
