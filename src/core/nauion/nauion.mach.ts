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
 *   gãy (max retry)  → speak('gay', ...) → escalate
 */

import { NauionVoice, NauionState } from './nauion.voice';

// ── Config ─────────────────────────────────────────────────────
export interface MachConfig {
  endpoint: string;       // mặc định: /mach/heyna
  reconnectMs: number;    // base delay 3000ms
  maxReconnect: number;   // cap 50 lần
  heartbeatMs: number;    // 30000ms
}

const DEFAULT_CONFIG: MachConfig = {
  endpoint: '/mach/heyna',
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

// ── Map server event → Nauion state ────────────────────────────
function mapEventToNauion(eventType: string): NauionState | null {
  if (eventType === 'Nahere') return 'Nahere';
  if (
    eventType === 'cell.metric' ||
    eventType.startsWith('order.') ||
    eventType.startsWith('production.') ||
    eventType.startsWith('payment.')
  ) return 'Whao';
  if (
    eventType === 'audit.record' ||
    eventType.includes('completed') ||
    eventType.includes('processed')
  ) return 'Whau';
  if (
    eventType.includes('anomaly') ||
    eventType.includes('violation') ||
    eventType.includes('alert')
  ) return 'Nauion';
  return null;
}

function _generateSessionId(): string {
  return 'ses-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);
}

// ── maKhoa — mở Mạch (kết nối SSE) ─────────────────────────────
export function maKhoa(serverUrl: string = 'http://localhost:3001', config?: Partial<MachConfig>): void {
  if (_sse) {
    console.warn('[NauionMach] Mạch đã mở — skip duplicate');
    return;
  }

  if (config) {
    _config = { ..._config, ...config };
  }
  _sessionId = _generateSessionId();

  // Đảm bảo voice đã wake (idempotent)
  try { NauionVoice.wake(); } catch (e) {}

  _connect(serverUrl);
}

function _connect(serverUrl: string): void {
  const url = serverUrl + _config.endpoint + '?sid=' + _sessionId;

  try {
    _sse = new EventSource(url);
  } catch (err) {
    NauionVoice.speak('gay', 'nauion.mach', 'EventSource init failed: ' + (err as Error).message);
    return;
  }

  _sse.onopen = () => {
    _connected = true;
    _reconnectCount = 0;
    NauionVoice.speak('Nahere', 'nauion.mach', 'mạch mở — kết nối thành công');
  };

  _sse.onmessage = (ev: MessageEvent) => {
    try {
      const parsed = JSON.parse(ev.data);
      const eventName = parsed.event || parsed.type || 'unknown';
      const payload = parsed.payload || parsed.data || parsed;

      // Map sang Nauion state + speak
      const state = mapEventToNauion(eventName);
      if (state) {
        const from = (payload?.cell as string) || (payload?.source as string) || eventName;
        NauionVoice.speak(state, from, eventName);
      }

      // Phát ra listeners local (cho UI consumer cụ thể)
      _listeners.forEach(fn => {
        try { fn(eventName, payload); } catch (e) { /* swallow */ }
      });

      // Window event cho legacy consumer (NAUION_PULSE)
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('NAUION_PULSE', {
          detail: { type: eventName, payload, source: 'nauion.mach' }
        }));
      }
    } catch (e) {
      // Non-JSON (heartbeat, comments) — bỏ qua
      if (ev.data === ':ping' || ev.data === '' || ev.data.startsWith(':')) return;
      NauionVoice.speak('lech', 'nauion.mach', 'message không parse được');
    }
  };

  _sse.onerror = () => {
    _connected = false;
    NauionVoice.speak('lech', 'nauion.mach', 'mạch đứt — đang thử khoá lại');

    if (_sse) {
      _sse.close();
      _sse = null;
    }

    if (_reconnectCount < _config.maxReconnect) {
      _reconnectCount++;
      const delay = Math.min(_config.reconnectMs * Math.pow(1.5, _reconnectCount - 1), 30000);
      setTimeout(() => _connect(serverUrl), delay);
    } else {
      NauionVoice.speak('gay', 'nauion.mach', 'gãy mạch — max ' + _config.maxReconnect + ' lần');
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

// ── UI subscribe raw event (filter type bên ngoài) ─────────────
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
