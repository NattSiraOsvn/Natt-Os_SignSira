import { EventBus } from './src/core/events/event-bus.js';
import { SmartLinkEngine } from './src/cells/infrastructure/smartlink-cell/domain/services/smartlink.engine.js';
import { mountIseuSurface } from './src/cells/kernel/audit-cell/domain/services/iseu-boundary.surface.js';

mountIseuSurface();

const domainId = 'order-123';
const fromCell = 'sales-cell';
const toCell = 'payment-cell';

// Record touch — bind domain index
SmartLinkEngine.recordTouch(fromCell, toCell, 'sales.confirm', domainId);

const fiberBefore = SmartLinkEngine.getFiber(fromCell, toCell);
console.log('Before feedback:', { impedanceZ: fiberBefore?.impedanceZ, isIseu: fiberBefore?.isIseu });

EventBus.emit('audit.record', {
  type: 'payment.received',
  payload: { domainId, orderId: domainId },
  causationId: domainId,
  actor: 'payment-cell'
});

setTimeout(() => {
  const fiberAfter = SmartLinkEngine.getFiber(fromCell, toCell);
  console.log('After feedback:', { impedanceZ: fiberAfter?.impedanceZ, isIseu: fiberAfter?.isIseu });
  process.exit(0);
}, 200);
