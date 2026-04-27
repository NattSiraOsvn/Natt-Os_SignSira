// [SPEC v2.4 §12-13 OPT-01R] Thin wrapper — delegate to NauionEngine
// Mục đích: GIỮ tương thích với app.tsx import { initMachHeyna }
// Bên trong: KHÔNG mở EventSource riêng, gọi NauionEngine singleton
// Refactor ss20260427 — fix SCAR FS-033 (SSE phân mảnh)

import { NauionEngine } from '../core/nauion/nauion-engine';

export const initMachHeyna = () => {
    console.log('[HeyNa] initMachHeyna() → delegate to NauionEngine singleton');
    const engine = NauionEngine.getInstance();
    engine.awaken('http://localhost:3001');
    return engine; // Backward compatible: app.tsx có thể giữ reference
};
