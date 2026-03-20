// @ts-nocheck
export * from './domain/entities';
export * from './domain/services';

// ─── P1: Wire EventBus → WarehouseIngestHandler ───────────────────────────
import { EventBus } from '@/core/events/event-bus';
import { createWarehouseIngestHandler } from './domain/services/warehouse-ingest.handler';

export const warehouseIngestHandler = createWarehouseIngestHandler(
  (ev) => EventBus.publish(ev, 'warehouse-cell', undefined)
);
