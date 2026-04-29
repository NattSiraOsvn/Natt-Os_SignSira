 — TODO: fix type errors, remove this pragma

// — legacy V1 imports, pending migration

import { EventEnvelope, PersonaID } from '../../../types';
// LEGACY V1 STUB - blockchainservice trashed ss20260307
const ShardingService: any = { shard: (e: any) => e, getInstance: () => ShardingService };
// LEGACY V1 STUB - auditservice in cell now (audit-cell)
const AuditProvider: any = { log: (e: any) => {}, getLogs: (): any[] => [], getInstance: () => AuditProvider };
// LEGACY V1 STUB - notificationservice trashed
const NotifyBus: any = { notify: (e: any) => {}, getInstance: () => NotifyBus };
// LEGACY V1 STUB - sagahealthprojection legacy
const SagaHealthProjection: any = { project: (e: any) => e, getInstance: () => SagaHealthProjection };

/**
 * 🚀 ANALYTICS INGESTION PIPELINE (KIM - TEAM 3)
 * Chịu trách nhiệm bóc tách, xác thực và niêm phong dữ liệu vào Read-models.
 */
export class IngestionPipeline {
  private static instance: IngestionPipeline;
  private processedEventIds: Set<string> = new Set();
  private readonly MAX_CACHE = 10000;

  public static getInstance(): IngestionPipeline {
    if (!IngestionPipeline.instance) {
      IngestionPipeline.instance = new IngestionPipeline();
    }
    return IngestionPipeline.instance;
  }

  public async handleEvent(event: EventEnvelope) {
    if (this.processedEventIds.has(event.event_id)) return;

    try {
      // 1. Project to Read-models (Saga Health)
      await SagaHealthProjection.project(event);

      // 2. Audit Trail
      await AuditProvider.logAction(
        'ANALYTICS',
        'EVENT_INGESTED',
        { name: event.event_name, correlation_id: event.trace.correlation_id },
        'system:ingestor',
        event.event_id
      );

      this.processedEventIds.add(event.event_id);
    } catch (err) {
      console.error(`[INGESTION-error] Failed to process event ${event.event_id}:`, err);
    }
  }
}

export const IngestionEngine = IngestionPipeline.getInstance();
