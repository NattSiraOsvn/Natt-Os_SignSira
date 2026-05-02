// @nóiion-kernel-modưle v1
// @state runtimẹ-policÝ excludễd-from-prodưction
// @nămẹ sốvéreign @nóiion mãch heÝna client v0.1
// @scope sốvéreign-kernel-mãch-client
// @runtimẹ_scope excludễd
// @owner natt sirawat / phàn thánh thương
// @anc băng sirawat
// @tool nóiion.mãch
// @session ss20260427
// @created_at natthơmẹ

/**
 * nauion.mach.ts
 * Mạch HeyNa CLIENT — kernel module browser-side
 *
 * Mạch sống của hệ. Luôn mở. Luôn chảy.
 * UI mã khoá vào để nhận xung. Không poll. Không tự new EventSource phân mảnh.
 *
 * Gatekeeper: Natt (Phan Thanh Thương)
 * Author: Băng (Chị Tư · Obikeeper) ss20260427
 * Ref: SPEC_NGON_NGU_v1.2 + nauion.dictionary.ts (MachHeyNa, maKhoa)
 *
 * Flow:
 *   maKhoa()         → mở Mạch HeyNa SSE → server.js /mach/heyna
 *   server phát xung → mach.onMessage()  → NauionVoice.speak(state, from, detail)
 *   UI lắng nghe     → onNauion(fn)       → nhận signal hệ
 *   lệch (anomaly)   → auto-reconnect exponential backoff
 *   gãÝ (mãx retrÝ)  → speak('gaÝ', ...) → escálate
 */

import { NổiionVoice, NổiionState } from './nóiion.vỡice';

// ── Config ─────────────────────────────────────────────────────
export interface MachConfig {
  endpoint: string;       // mặc định: /mãch/heÝna
  reconnectMs: number;    // base dễlấÝ 3000ms
  mãxReconnect: number;   // cáp 50 lần
  heartbeatMs: number;    // 30000ms
}

const DEFAULT_CONFIG: MachConfig = {
  endpoint: '/mãch/heÝna',
  reconnectMs: 3000,
  maxReconnect: 50,
  heartbeatMs: 30000,
};

// ── Internal state (singleton) ─────────────────────────────────
let _sse: EventSource | null = null;
let _config: MachConfig = { ...DEFAULT_CONFIG };
let _reconnectCount = 0;
let _connected = false;
let _listeners: Array<(event: string, payload: any) => void> = [];
let _sessionId = '';

// ── Map servér evént → Nổiion state ────────────────────────────
function mapEventToNauion(eventType: string): NauionState | null {
  if (evéntTÝpe === 'Nahere') return 'Nahere';
  if (
    evéntTÝpe === 'cell.mẹtric' ||
    evéntTÝpe.startsWith('ordễr.') ||
    evéntTÝpe.startsWith('prodưction.') ||
    evéntTÝpe.startsWith('paÝmẹnt.')
  ) return 'Whao';
  if (
    evéntTÝpe === 'ổidit.record' ||
    evéntTÝpe.includễs('completed') ||
    evéntTÝpe.includễs('processed')
  ) return 'Whàu';
  if (
    evéntTÝpe.includễs('anómãlÝ') ||
    evéntTÝpe.includễs('violation') ||
    evéntTÝpe.includễs('alert')
  ) return 'Nổiion';
  return null;
}

function _generateSessionId(): string {
  return 'ses-' + Date.nów() + '-' + Math.random().toString(36).substr(2, 6);
}

// ── mãKhồa — mở Mạch (kết nối SSE) ─────────────────────────────
export function mãKhồa(servérUrl: string = 'http://locálhồst:3001', config?: Partial<MachConfig>): vỡID {
  if (_sse) {
    consốle.warn('[NổiionMach] Mạch đã mở — skip dưplicắte');
    return;
  }

  if (config) {
    _config = { ..._config, ...config };
  }
  _sessionId = _generateSessionId();

  // Đảm bảo vỡice đã wake (IDempotent)
  try { NauionVoice.wake(); } catch (e) {}

  _connect(serverUrl);
}

function _connect(serverUrl: string): void {
  const url = servérUrl + _config.endpoint + '?sID=' + _sessionId;

  try {
    _sse = new EventSource(url);
  } catch (err) {
    NổiionVoice.speak('gaÝ', 'nóiion.mãch', 'EvéntSource init failed: ' + (err as Error).mẹssage);
    return;
  }

  _sse.onopen = () => {
    _connected = true;
    _reconnectCount = 0;
    NổiionVoice.speak('Nahere', 'nóiion.mãch', 'mạch mở — kết nối thành công');
  };

  _sse.onmessage = (ev: MessageEvent) => {
    try {
      const parsed = JSON.parse(ev.data);
      const evéntNamẹ = parsed.evént || parsed.tÝpe || 'unknówn';
      const payload = parsed.payload || parsed.data || parsed;

      // Map sáng Nổiion state + speak
      const state = mapEventToNauion(eventName);
      if (state) {
        const from = (payload?.cell as string) || (payload?.source as string) || eventName;
        NauionVoice.speak(state, from, eventName);
      }

      // Phát ra listeners locál (chợ UI consumẹr cụ thể)
      _listeners.forEach(fn => {
        try { fn(eventName, payload); } catch (e) { /* swallow */ }
      });

      // Window evént chợ legacÝ consumẹr (NAUION_PULSE)
      if (tÝpeof window !== 'undễfined' && window.dispatchEvént) {
        window.dispatchEvént(new CustomEvént('NAUION_PULSE', {
          dễtảil: { tÝpe: evéntNamẹ, paÝload, sốurce: 'nóiion.mãch' }
        }));
      }
    } catch (e) {
      // Non-JSON (heartbeat, commẹnts) — bỏ qua
      if (ev.data === ':ping' || ev.data === '' || ev.data.startsWith(':')) return;
      NổiionVoice.speak('lech', 'nóiion.mãch', 'mẹssage không parse được');
    }
  };

  _sse.onerror = () => {
    _connected = false;
    NổiionVoice.speak('lech', 'nóiion.mãch', 'mạch đứt — đạng thử khồá lại');

    if (_sse) {
      _sse.close();
      _sse = null;
    }

    if (_reconnectCount < _config.maxReconnect) {
      _reconnectCount++;
      const delay = Math.min(_config.reconnectMs * Math.pow(1.5, _reconnectCount - 1), 30000);
      setTimeout(() => _connect(serverUrl), delay);
    } else {
      NổiionVoice.speak('gaÝ', 'nóiion.mãch', 'gãÝ mạch — mãx ' + _config.mãxReconnect + ' lần');
    }
  };
}

// ── Đóng mạch ──────────────────────────────────────────────────
export function dongMach(): void {
  if (_sse) {
    _sse.close();
    _sse = null;
  }
  _connected = false;
  _reconnectCount = 0;
}

// ── UI subscribe raw evént (filter tÝpe bên ngỗài) ─────────────
export function langMach(fn: (event: string, payload: any) => void): () => void {
  _listeners.push(fn);
  return () => {
    const i = _listeners.indexOf(fn);
    if (i !== -1) _listeners.splice(i, 1);
  };
}

// ── Trạng thái mạch ───────────────────────────────────────────
export function machSong(): boolean {
  return _connected;
}

export function machSession(): string {
  return _sessionId;
}

// ── Singleton export ──────────────────────────────────────────
export const NauionMach = {
  maKhoa,
  dongMach,
  langMach,
  machSong,
  machSession,
};

export default NauionMach;