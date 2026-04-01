import { EventBus } from '@/core/events/event-bus';
import { SmartLinkEngine } from '@/cells/infrastructure/smartlink-cell/domain/services/smartlink.engine';
import { resolveDomainId } from '@/core/domain/resolver';

export function startIseuFeedbackListener(): void {
  EventBus.on('audit.record', (record: any) => {
    let feedbackIntensity = 0;
    const type = record.type;
    let causationId = record.causationId;

    if (type === 'payment.received') {
      feedbackIntensity = 1.0;
    } else if (type === 'flow.completed') {
      feedbackIntensity = 1.0;
    } else if (type === 'qneu.delta') {
      const delta = record.payload?.delta || 0;
      feedbackIntensity = delta > 0 ? 0.5 + delta/100 : 0.5 + delta/100;
      feedbackIntensity = Math.min(1.5, Math.max(0.1, feedbackIntensity));
    } else {
      return;
    }

    if (!causationId) {
      causationId = record.payload?.causationId || record.payload?.orderId;
    }

    const domainId = resolveDomainId(causationId, record.payload);
    if (!domainId) return;

    const fromCell = record.payload?.fromCell || 'audit-cell';
    const toCell = record.payload?.toCell || domainId;

    SmartLinkEngine.receiveFeedbackPulse(fromCell, toCell, feedbackIntensity, domainId);
  });
}
