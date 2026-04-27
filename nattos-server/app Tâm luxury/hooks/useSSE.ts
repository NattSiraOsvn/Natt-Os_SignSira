// [SPEC v2.4 §12-13 OPT-01R] Hook listen NAUION_PULSE — KHÔNG tự open SSE
// Mục đích: Component subscribe event type cụ thể từ Mạch HeyNa trung ương
// Bên trong: window.addEventListener('NAUION_PULSE', filter, dispatch)
// Refactor ss20260427 — fix BUG mỗi render = 1 EventSource mới

import { useEffect } from 'react';

export function useSSE<T = any>(eventType: string, handler: (data: T) => void) {
  useEffect(() => {
    const listener = (e: Event) => {
      const ce = e as CustomEvent;
      if (!ce.detail) return;
      // Filter: only fire if event type khớp
      if (ce.detail.type === eventType) {
        try {
          handler(ce.detail.payload as T);
        } catch (err) {
          console.error('[useSSE] handler error for', eventType, err);
        }
      }
    };
    window.addEventListener('NAUION_PULSE', listener);
    return () => window.removeEventListener('NAUION_PULSE', listener);
  }, [eventType, handler]);
}
