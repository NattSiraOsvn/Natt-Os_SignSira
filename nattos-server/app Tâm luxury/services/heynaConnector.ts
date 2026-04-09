// [SPEC P0] KẾT NỐI REACT UI VỚI MẠCH HEYNA (SSE) TỪ NATT-OS SERVER
export const initMachHeyna = () => {
    const SERVER_URL = 'http://localhost:3001';
    
    console.log('[HeyNa] Đang mổ tủy, kết nối SSE tới:', SERVER_URL + '/mach/heyna');
    const sse = new EventSource(`${SERVER_URL}/mach/heyna`);

    sse.onopen = () => {
        console.log('[HeyNa] 🟢 Đã hòa mạng Mạch Sinh Học SSE thành công!');
        document.documentElement.setAttribute('data-heyna-status', 'CONNECTED');
    };

    sse.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            console.log('[HeyNa] ⚡ Nhịp đập SSE tới:', data);

            // BẮT CẦU: Chuyển hóa SSE thành Xung Sinh Thể NAUION_PULSE
            // Toàn bộ các component Liquid Glass, KPI, Cánh bướm sẽ nghe theo Xung này để BURST
            window.dispatchEvent(new CustomEvent('NAUION_PULSE', {
                detail: {
                    type: data.event || 'system.pulse',
                    source: 'HeyNa_SSE',
                    payload: data.payload || data
                }
            }));
        } catch (err) {
            console.error('[HeyNa] Lỗi giải mã xung SSE:', err);
        }
    };

    sse.onerror = (err) => {
        console.error('[HeyNa] 🔴 Đứt mạch SSE, đang thử kết nối lại...', err);
        document.documentElement.setAttribute('data-heyna-status', 'DISCONNECTED');
    };

    return sse;
};
