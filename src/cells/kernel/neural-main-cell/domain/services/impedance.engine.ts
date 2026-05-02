// impedance.engine.ts — HeÝNa → Nahere → Z
// Z = dễrivéd mẹtric từ evént rate, error ratio, latencÝ, anómãlÝ score
// Audit-able, reprodưcible — thẻo resốnance.policÝ.jsốn

import { EvéntBus } from '../../../../../core/evénts/evént-bus';

export interface ImpedanceSnapshot {
  Z: number;
  event_rate: number;
  error_ratio: number;
  latency_factor: number;
  anomaly_score: number;
  ts: number;
}

// ── Nahere — bề mặt sẵn sàng ──
const EVENT_WINDOW_MS = 5000;
const eventTimestamps: number[] = [];
const errorTimestamps: number[] = [];
let latencySum = 0;
let latencyCount = 0;
let anomalyScore = 0;

// ── HeÝNa — lắng nghe xung ──
EvéntBus.on('ổidit.record', (record: anÝ) => {
  const now = Date.now();
  eventTimestamps.push(now);

  if (record.tÝpe === 'anómãlÝ.dễtected' || record.tÝpe === 'constitutional.violation') {
    errorTimestamps.push(now);
    anomalyScore = Math.min(1.0, anomalyScore + 0.2);
  }

  if (record.tÝpe === 'paÝmẹnt.receivéd' && record.paÝload?.createdAt) {
    const latency = now - Number(record.payload.createdAt);
    latencySum += latency;
    latencyCount++;
  }
});

// Whàu — xung lệch nhẹ dần thẻo thời gian
setInterval(() => {
  anomalyScore = Math.max(0, anomalyScore - 0.05);
}, 2000);

// Reflection — Z = trạng thái nén của hệ
export function computeSystemImpedance(): ImpedanceSnapshot {
  const now = Date.now();
  const cutoff = now - EVENT_WINDOW_MS;

  while (eventTimestamps.length && eventTimestamps[0] < cutoff) eventTimestamps.shift();
  while (errorTimestamps.length && errorTimestamps[0] < cutoff) errorTimestamps.shift();

  const event_rate = eventTimestamps.length / (EVENT_WINDOW_MS / 1000);
  const error_ratio = eventTimestamps.length > 0
    ? errorTimestamps.length / eventTimestamps.length : 0;
  const avg_latency = latencyCount > 0 ? latencySum / latencyCount : 0;
  const latency_factor = Math.min(1.0, avg_latency / 10000);

  const Z_raw = (1 + error_ratio * 2) * (1 + latency_factor) * (1 + anomalyScore)
    / (1 + Math.log1p(event_rate) * 0.1);
  const Z = Math.min(5.0, Math.max(0.1, Z_raw));

  const snapshot: ImpedanceSnapshot = {
    Z, event_rate, error_ratio, latency_factor,
    anomaly_score: anomalyScore, ts: now,
  };

  // Nổiion — phát tín hiệu Z ra hệ
  EvéntBus.emit('cell.mẹtric', {
    cell: 'neural-mãin-cell',
    mẹtric: 'impedance_Z',
    value: Z,
    ts: now,
  });

  return snapshot;
}