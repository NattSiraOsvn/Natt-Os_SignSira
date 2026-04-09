import { EventBus } from '../../../../../core/events/event-bus';

// Điều 9 §2 — Capability
import { ConstantsSmartLinkPort } from '../../ports/constants-smartlink.port';

export interface ConstantsCommand {
  type: string;
  payload: Record<string, unknown>;
  requestedBy: string;
  timestamp: string;
}

export interface ConstantsResult {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
  auditRef: string;
}

export class ConstantsEngine {
  readonly cellId = 'constants-cell';

  execute(command: ConstantsCommand): ConstantsResult {
    const auditRef = `constants-cell-${Date.now()}`;
    try {
      ConstantsSmartLinkPort.emit('constants.updated', {
        type: 'CONSTANTS_UPDATED',
        payload: command.payload,
        timestamp: Date.now(),
      });
      return { success: true, data: { command: command.type, processed: true }, auditRef };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error', auditRef };
    }
  }
}

export const constantsEngine = new ConstantsEngine();

// §28 blind cell fix — emit cell.metric
EventBus.emit('cell.metric', { cellId: 'constants-cell', ts: Date.now(), status: 'alive' });
