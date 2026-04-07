// event-bus.ts — ui-vision bridge
// Dùng Mạch HeyNa SSE thay NATT-OS EventBus (không circular)

type Handler = (event: any) => void;

const _subs: Record<string, Handler[]> = {};
const _mach = typeof window !== 'undefined'
  ? new EventSource('http://localhost:3001/mach/heyna')
  : null;

if (_mach) {
  _mach.onmessage = (e) => {
    try {
      const data = JSON.parse(e.data);
      const handlers = _subs[data.event] || [];
      handlers.forEach(h => h(data));
      (_subs['*'] || []).forEach(h => h(data));
    } catch {}
  };
}

export const EventBus = {
  emit: (event: any) => {
    fetch('http://localhost:3001/phat/nauion', { // [DIEU9-OK: ui-vision bridge — not a cell]
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: event.type, payload: event.payload }),
    }).catch(() => {});
  },
  on: (type: string, handler: Handler) => {
    if (!_subs[type]) _subs[type] = [];
    _subs[type].push(handler);
  },
  off: (type: string, handler: Handler) => {
    _subs[type] = (_subs[type] || []).filter(h => h !== handler);
  },
};

export function createEvent(type: string, payload: any, causationId?: string) {
  return { type, payload, causationId, ts: Date.now() };
}
