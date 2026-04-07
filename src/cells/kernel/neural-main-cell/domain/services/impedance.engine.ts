// impedance.engine.ts — HeyNa → Nahere → Z
// Z = derived metric từ event rate, error ratio, latency, anomaly score
// Audit-able, reproducible — theo resonance.policy.json

import { EventBus } from '@/core/events/event-bus';

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

// ── HeyNa — lắng nghe xung ──
EventBus.on('audit.record', (record: any) => {
  const now = Date.now();
  eventTimestamps.push(now);

  if (record.type === 'anomaly.detected' || record.type === 'constitutional.violation') {
    errorTimestamps.push(now);
    anomalyScore = Math.min(1.0, anomalyScore + 0.2);
  }

  if (record.type === 'payment.received' && record.payload?.createdAt) {
    const latency = now - Number(record.payload.createdAt);
    latencySum += latency;
    latencyCount++;
  }
});

// Whau — xung lệch nhẹ dần theo thời gian
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

  // Nauion — phát tín hiệu Z ra hệ
  EventBus.emit('cell.metric', {
    cell: 'neural-main-cell',
    metric: 'impedance_Z',
    value: Z,
    ts: now,
  });

  return snapshot;
}
