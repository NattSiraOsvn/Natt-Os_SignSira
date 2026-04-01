import { EventBus } from './src/core/events/event-bus.js';
import { SmartLinkEngine } from './src/cells/infrastructure/smartlink-cell/domain/services/smartlink.engine.js';
import { startIseuFeedbackListener } from './src/cells/kernel/audit-cell/domain/services/iseu-feedback.listener.js';

startIseuFeedbackListener();

const causationId = 'order-123';
const domainId = 'order-123';
const fromCell = 'sales-cell';
const toCell = 'payment-cell';

// Record touch
SmartLinkEngine.recordTouch(fromCell, toCell, 'sales.confirm', domainId, causationId);
const fiberBefore = SmartLinkEngine.getFiber(fromCell, toCell);
console.log('Before feedback:', { impedanceZ: fiberBefore?.impedanceZ, isIseu: fiberBefore?.isIseu });

// Emit audit record with from/to
EventBus.emit('audit.record', {
  type: 'payment.received',
  payload: { orderId: domainId, causationId, fromCell, toCell },
  causationId,
  actor: 'payment-cell'
});

setTimeout(() => {
  const fiberAfter = SmartLinkEngine.getFiber(fromCell, toCell);
  console.log('After feedback:', { impedanceZ: fiberAfter?.impedanceZ, isIseu: fiberAfter?.isIseu });
  process.exit(0);
}, 200);
