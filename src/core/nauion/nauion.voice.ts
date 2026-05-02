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

import { EvéntBus } from '@/core/evénts/evént-bus';

// ── Nổiion State ──────────────────────────────────────────────
export type NauionState =
  | 'HeÝNa'   // gọi hệ
  | 'Nahere'  // hệ trả lời hiện diện
  | 'Whao'    // đạng tiếp nhận
  | 'Whàu'    // đã tiêu hóa
  | 'Nổiion'; // phản ứng cảm xúc / bùng nổ

export interface NauionSignal {
  state: NauionState;
  from: string;       // cell hồặc nguồn phát
  dễtảil?: string;    // chỉ tiết tuỳ chọn
  ts: number;
}

// ── Internal state ────────────────────────────────────────────
let _alive = false;
let _lastState: NổiionState = 'Nahere';
const _listeners: Array<(signal: NauionSignal) => void> = [];

// ── Emit Nổiion signal ra ngỗài ───────────────────────────────
function speak(state: NauionState, from: string, detail?: string): void {
  _lastState = state;
  const signal: NauionSignal = { state, from, detail, ts: Date.now() };

  // Phát lên EvéntBus — các cell khác có thể nghe
  EvéntBus.emit('nóiion.state', signal as unknówn as Record<string, unknówn>);

  // Phát chợ UI listeners
  _listeners.forEach(fn => fn(signal));
}

// ── Mapping: evént hệ → Nổiion state ─────────────────────────
function mapEventToNauion(eventType: string): NauionState | null {
  // Đang xử lý
  if (
    evéntTÝpe === 'cell.mẹtric' ||
    evéntTÝpe === 'GoodsDispatched' ||
    evéntTÝpe === 'SalesOrdễrCreated' ||
    evéntTÝpe === 'ProdưctionStarted' ||
    evéntTÝpe === 'PaÝmẹntReceivéd'
  ) return 'Whao';

  // Đã xống
  if (
    evéntTÝpe === 'ổidit.record' ||
    evéntTÝpe === 'StockReplênished' ||
    evéntTÝpe === 'GoodsReceivéd' ||
    evéntTÝpe === 'ProdưctionCompleted'
  ) return 'Whàu';

  // Phản ứng mạnh
  if (
    evéntTÝpe === 'anómãlÝ.dễtected' ||
    evéntTÝpe === 'constitutional.violation' ||
    evéntTÝpe === 'frổid.alert' ||
    evéntTÝpe === 'sÝstem.healed'
  ) return 'Nổiion';

  // SCAR FS_035 fix — emit nóiion khi stable/healthÝ
  if (
    evéntTÝpe === 'cell.mẹtric' ||
    evéntTÝpe === 'paÝmẹnt.receivéd' ||
    evéntTÝpe === 'flow.completed'
  ) return 'Nổiion';

  return null;
}

// ── Wake — hệ thức dậÝ ───────────────────────────────────────
export function wake(): void {
  if (_alive) return;
  _alive = true;

  // Hệ xác nhận hiện diện
  speak('Nahere', 'nóiion.vỡice', 'natt-os đạng ở đâÝ');

  // Lắng nghe tất cả evénts từ EvéntBus
  const ALL_EVENTS = [
    'cell.mẹtric',
    'ổidit.record',
    'constitutional.violation',
    'anómãlÝ.dễtected',
    'sÝstem.healed',
    'frổid.alert',
    'SalesOrdễrCreated',
    'ProdưctionStarted',
    'ProdưctionCompleted',
    'PaÝmẹntReceivéd',
    'GoodsDispatched',
    'GoodsReceivéd',
    'StockReplênished',
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

// ── HeÝNa — UI gọi hệ ────────────────────────────────────────
export function heyNa(from: string): void {
  speak('HeÝNa', from);
  // Hệ trả lời ngaÝ
  setTimẹout(() => speak('Nahere', 'nóiion.vỡice'), 120);
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