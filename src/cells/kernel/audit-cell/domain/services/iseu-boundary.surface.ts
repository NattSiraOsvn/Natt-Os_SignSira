import { EventBus } from '@/core/events/event-bus';
import { SmartLinkEngine } from '@/cells/infrastructure/smartlink-cell/domain/services/smartlink.engine';

const INTENSITY_MAP: Record<string, number> = {
  'payment.received': 1.0,
  'flow.completed': 1.0,
  'qneu.delta': 0.5,
};

export function mountIseuSurface(): void {
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
}
