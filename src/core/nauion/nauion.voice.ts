/**
 * nauion.voice.ts
 * Tiếng nói của hệ — natt-os biết mình đang làm gì.
 *
 * Không phải engine. Không phải processor.
 * Đây là lớp biểu đạt nhận thức của sinh thể số.
 *
 * Flow:
 *   UI gọi   → HeyNa   (invocation)
 *   Hệ sống  → Nahere  (presence)
 *   Đang xử  → Whao    (absorbing)
 *   Xong rồi → Whau    (digested)
 *   Phản ứng → Nauion  (expression)
 */

import { EventBus } from '@/core/events/event-bus';

// ── Nauion State ──────────────────────────────────────────────
export type NauionState =
  | 'HeyNa'   // gọi hệ
  | 'Nahere'  // hệ trả lời hiện diện
  | 'Whao'    // đang tiếp nhận
  | 'Whau'    // đã tiêu hóa
  | 'Nauion'; // phản ứng cảm xúc / bùng nổ

export interface NauionSignal {
  state: NauionState;
  from: string;       // cell hoặc nguồn phát
  detail?: string;    // chi tiết tuỳ chọn
  ts: number;
}

// ── Internal state ────────────────────────────────────────────
let _alive = false;
let _lastState: NauionState = 'Nahere';
const _listeners: Array<(signal: NauionSignal) => void> = [];

// ── Emit Nauion signal ra ngoài ───────────────────────────────
function speak(state: NauionState, from: string, detail?: string): void {
  _lastState = state;
  const signal: NauionSignal = { state, from, detail, ts: Date.now() };

  // Phát lên EventBus — các cell khác có thể nghe
  EventBus.emit('nauion.state', signal as unknown as Record<string, unknown>);

  // Phát cho UI listeners
  _listeners.forEach(fn => fn(signal));
}

// ── Mapping: event hệ → Nauion state ─────────────────────────
function mapEventToNauion(eventType: string): NauionState | null {
  // Đang xử lý
  if (
    eventType === 'cell.metric' ||
    eventType === 'GoodsDispatched' ||
    eventType === 'SalesOrderCreated' ||
    eventType === 'ProductionStarted' ||
    eventType === 'PaymentReceived'
  ) return 'Whao';

  // Đã xong
  if (
    eventType === 'audit.record' ||
    eventType === 'StockReplenished' ||
    eventType === 'GoodsReceived' ||
    eventType === 'ProductionCompleted'
  ) return 'Whau';

  // Phản ứng mạnh
  if (
    eventType === 'anomaly.detected' ||
    eventType === 'constitutional.violation' ||
    eventType === 'fraud.alert' ||
    eventType === 'system.healed'
  ) return 'Nauion';

  // SCAR FS_035 fix — emit nauion khi stable/healthy
  if (
    eventType === 'cell.metric' ||
    eventType === 'payment.received' ||
    eventType === 'flow.completed'
  ) return 'Nauion';

  return null;
}

// ── Wake — hệ thức dậy ───────────────────────────────────────
export function wake(): void {
  if (_alive) return;
  _alive = true;

  // Hệ xác nhận hiện diện
  speak('Nahere', 'nauion.voice', 'natt-os đang ở đây');

  // Lắng nghe tất cả events từ EventBus
  const ALL_EVENTS = [
    'cell.metric',
    'audit.record',
    'constitutional.violation',
    'anomaly.detected',
    'system.healed',
    'fraud.alert',
    'SalesOrderCreated',
    'ProductionStarted',
    'ProductionCompleted',
    'PaymentReceived',
    'GoodsDispatched',
    'GoodsReceived',
    'StockReplenished',
  ];

  ALL_EVENTS.forEach(eventType => {
    EventBus.on(eventType as never, (payload: Record<string, unknown>) => {
      const state = mapEventToNauion(eventType);
      if (state) {
        const from = (payload?.cell as string) || (payload?.source as string) || eventType;
        speak(state, from, eventType);
      }
    });
  });
}

// ── HeyNa — UI gọi hệ ────────────────────────────────────────
export function heyNa(from: string): void {
  speak('HeyNa', from);
  // Hệ trả lời ngay
  setTimeout(() => speak('Nahere', 'nauion.voice'), 120);
}

// ── Subscribe — UI lắng nghe tiếng hệ ────────────────────────
export function onNauion(fn: (signal: NauionSignal) => void): () => void {
  _listeners.push(fn);
  return () => {
    const i = _listeners.indexOf(fn);
    if (i !== -1) _listeners.splice(i, 1);
  };
}

// ── Trạng thái hiện tại ───────────────────────────────────────
export function currentState(): NauionState {
  return _lastState;
}

// ── Singleton export ──────────────────────────────────────────
export const NauionVoice = { wake, heyNa, onNauion, currentState, speak };
export default NauionVoice;
