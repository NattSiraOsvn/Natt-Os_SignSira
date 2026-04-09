import { EventBus } from '../../../../../core/events/event-bus';

// ── Subscriber: iseu.reinforcement → monitor state update ──
EventBus.on('iseu.reinforcement', (payload: any) => {
  const { sourceCell, targetCell, outcome_weight, reinforcement, domainId, ts } = payload ?? {};
  if (outcome_weight === undefined) return;

  // Classify
  const grade =
    outcome_weight >= 0.7 ? 'GOOD' :
    outcome_weight >= 0.4 ? 'NEUTRAL' : 'BAD';

  // Emit cell.metric để monitor-cell track
  EventBus.emit('cell.metric' as any, {
    cell: 'iseu-surface',
    metric: 'reinforcement',
    value: reinforcement ?? 0,
    meta: { sourceCell, targetCell, domainId, outcome_weight, grade },
    ts: ts ?? Date.now(),
  });

  // Emit audit nếu BAD
  if (grade === 'BAD') {
    EventBus.emit('audit.record', {
      type: 'iseu.reinforcement.bad',
      payload: { sourceCell, targetCell, domainId, outcome_weight },
      actor: 'monitor-cell',
      ts: ts ?? Date.now(),
    });
  }
});
