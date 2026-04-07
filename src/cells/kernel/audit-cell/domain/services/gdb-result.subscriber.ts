import { EventBus } from '@/core/events/event-bus';

// ── Subscriber: gdb.analyze.result → audit trail ──
EventBus.on('gdb.analyze.result', (payload: any) => {
  const { requestId, result, causationId, ts } = payload ?? {};
  if (!result) return;

  EventBus.emit('audit.record', {
    type: 'gdb.result.received',
    payload: {
      requestId,
      documentType: result.type,
      confidence: result.confidence,
      template: result.metadata?.template,
      extractionQuality: result.metadata?.extractionQuality,
      matchedKeywords: result.metadata?.matchedKeywords?.length ?? 0,
    },
    causationId,
    actor: 'audit-cell',
    ts: ts ?? Date.now(),
  });
});
