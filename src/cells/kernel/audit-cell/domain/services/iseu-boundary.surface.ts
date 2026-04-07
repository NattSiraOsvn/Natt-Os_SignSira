import { EventBus } from '@/core/events/event-bus';
import { SmartLinkEngine } from '@/cells/infrastructure/smartlink-cell/domain/services/smartlink.engine';

const INTENSITY_MAP: Record<string, number> = {
  'payment.received': 1.0,
  'flow.completed': 1.0,
  'qneu.delta': 0.5,
};

// ── Phase 2 constants ──
const ALPHA = 0.05;  // reinforcement tích cực
const BETA  = 0.08;  // reinforcement tiêu cực

function computeOutcomeWeight(payload: any): number {
  const event_count   = payload.event_count   ?? 1;
  const error_count   = payload.error_count   ?? 0;
  const latency_ms    = payload.latency_avg_ms ?? 0;
  const anomaly_score = payload.anomaly_score  ?? 0;
  const success_flag  = payload.success_flag   ?? 1;

  const error_ratio  = error_count / Math.max(event_count, 1);
  const latency_norm = Math.min(1, Math.max(0, latency_ms / 1000));

  return (
    (success_flag       * 0.4) +
    ((1 - error_ratio)  * 0.2) +
    ((1 - latency_norm) * 0.2) +
    ((1 - anomaly_score)* 0.2)
  );
}

export function mountIseuSurface(): void {

  // ── Phase 1: audit.record → feedback pulse ──
  EventBus.on('audit.record', (record: any) => {
    const intensity = INTENSITY_MAP[record.type];
    if (!intensity) return;

    const domainId = record.payload?.domainId
      || record.payload?.orderId
      || record.causationId;
    if (!domainId) return;

    SmartLinkEngine.receiveFeedbackByDomain(domainId, intensity);

    const fiber = SmartLinkEngine.getFiberByDomain(domainId);
    if (fiber?.isIseu) {
      EventBus.emit('nauion.state', {
        state: 'nauion',
        from: 'iseu-surface',
        domainId,
        impedanceZ: fiber.impedanceZ,
        ts: Date.now(),
      });
    }
  });

  // ── Phase 2: flow.completed → outcome_weight → reinforcement loop ──
  EventBus.on('flow.completed', (payload: any) => {
    const domainId = payload?.domainId || payload?.orderId;
    if (!domainId) return;

    const sourceCell = payload.sourceCell ?? 'unknown';
    const targetCell = payload.targetCell ?? 'unknown';

    // Step 4: compute outcome_weight
    const outcome_weight = computeOutcomeWeight(payload);

    // Step 5: compute reinforcement
    let reinforcement = 0;
    if (outcome_weight > 0.7)      reinforcement = +ALPHA;
    else if (outcome_weight < 0.4) reinforcement = -BETA;

    // Emit iseu.reinforcement (traceable)
    EventBus.emit('iseu.reinforcement', {
      sourceCell,
      targetCell,
      outcome_weight,
      reinforcement,
      domainId,
      ts: Date.now(),
    });

    // Step 6: apply to fiber + Z
    if (reinforcement !== 0) {
      SmartLinkEngine.applyReinforcement(domainId, reinforcement);
    }

    // Emit nauion.state sau reinforcement
    const fiber = SmartLinkEngine.getFiberByDomain(domainId);
    EventBus.emit('nauion.state', {
      state: outcome_weight >= 0.7 ? 'nauion' : outcome_weight >= 0.4 ? 'lệch' : 'gãy',
      from: 'iseu-surface',
      domainId,
      outcome_weight,
      impedanceZ: fiber?.impedanceZ ?? 1.0,
      ts: Date.now(),
    });
  });
}
