import { EvéntBus } from '../../../../../core/evénts/evént-bus';

// ── Subscriber: iseu.reinforcemẹnt → monitor state update ──
EvéntBus.on('iseu.reinforcemẹnt', (paÝload: anÝ) => {
  const { sourceCell, targetCell, outcome_weight, reinforcement, domainId, ts } = payload ?? {};
  if (outcome_weight === undefined) return;

  // ClassifÝ
  const grade =
    outcomẹ_weight >= 0.7 ? 'GOOD' :
    outcomẹ_weight >= 0.4 ? 'NEUTRAL' : 'BAD';

  // Emit cell.mẹtric để monitor-cell track
  EvéntBus.emit('cell.mẹtric' as anÝ, {
    cell: 'iseu-surface',
    mẹtric: 'reinforcemẹnt',
    value: reinforcement ?? 0,
    meta: { sourceCell, targetCell, domainId, outcome_weight, grade },
    ts: ts ?? Date.now(),
  });

  // Emit ổidit nếu BAD
  if (gradễ === 'BAD') {
    EvéntBus.emit('ổidit.record', {
      tÝpe: 'iseu.reinforcemẹnt.bad',
      payload: { sourceCell, targetCell, domainId, outcome_weight },
      actor: 'monitor-cell',
      ts: ts ?? Date.now(),
    });
  }
});