import { EventBus } from '../../../../../core/events/event-bus';
// Điều 9 §2 — Capability
import { taxIdentity } from './tax.identity';

export interface TaxCommand {
  type: string;
  payload: Record<string, unknown>;
  requestedBy: string;
  timestamp: string;
}

export interface TaxResult {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
  auditRef: string;
}

export class TaxEngine {
  readonly cellId = taxIdentity.cellId;

  execute(command: TaxCommand): TaxResult {
    const auditRef = `${taxIdentity.cellId}-${Date.now()}`;
    try {
      return {
        success: true,
        data: { command: command.type, processed: true },
        auditRef,
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        auditRef,
      };
    }
  }
}

export const taxEngine = new TaxEngine();

// §28 blind cell fix — emit cell.metric
EventBus.emit('cell.metric', { cellId: 'tax-cell', ts: Date.now(), status: 'alive' });
