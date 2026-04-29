/**
 * NAUION ENGINE - MẠCH HEYNA TRUNG ƯƠNG
 * Tuân thủ SPEC v2.4 (OPT-01R) | Tác giả: Bối Bối
 * Nhiệm vụ: Duy trì 1 kết nối SSE duy nhất, tính toán Impedance Z, phát Nauion.
 */
import { NotifyBus } from '../../services/notificationService';

export class NauionEngine {
    private static instance: NauionEngine;
    private mach: EventSource | null = null;
    private impedanceZ: number = 100; // 100 = Đóng/Mù, 0 = Tỉnh táo
    private isAlive: boolean = false;

    private constructor() {}

    public static getInstance(): NauionEngine {
        if (!NauionEngine.instance) {
            NauionEngine.instance = new NauionEngine();
        }
        return NauionEngine.instance;
    }

    public awaken(serverUrl: string = 'http://localhost:3001') {
        if (this.mach) return; // Tuyệt đối không cho phép mở 2 mạch

        console.log('[NauionEngine] Whao — Đang kích hoạt Mạch HeyNa Trung Ương...');
        this.updateResonance('WAKING');

        try {
            this.mach = new EventSource(`${serverUrl}/mach/heyna`);
            
            this.mach.onopen = () => {
                this.isAlive = true;
                this.impedanceZ = 50; // Trạng thái thở bình thường của UI
                this.updateZ();
                this.updateResonance('STABLE');
                console.log('[NauionEngine] Whau — Sinh thể Tâm Luxury đã kết nối Tủy Sống!');
            };

            this.mach.onmessage = (event) => {
                this.impedanceZ = Math.max(0, this.impedanceZ - 20); // Dãn nở khi có xung
                this.updateZ();
                this.updateResonance('ACTIVE');
                
                try {
                    const payload = JSON.parse(event.data);
                    console.log('[NauionEngine] Nahere! Nhận Xung HEYNA:', payload.type);
                    
                    // Phát xung vào nội bộ UI thông qua NotifyBus cục bộ
                    window.dispatchEvent(new CustomEvent('NAUION_PULSE', { detail: payload }));
                    NotifyBus.push({
                        type: 'NEWS',
                        title: 'Mạch Sống HEYNA',
                        content: `Hệ thần kinh vừa truyền tín hiệu [${payload.type || 'SYSTEM_PULSE'}] từ Server.`,
                        priority: 'LOW'
                    } as any);
                } catch(e) {}

                // Co lại tự nhiên sau 3s nếu không có xung mới
                setTimeout(() => {
                    if (this.isAlive) {
                        this.impedanceZ = Math.min(50, this.impedanceZ + 10);
                        this.updateZ();
                        if (this.impedanceZ === 50) this.updateResonance('STABLE');
                    }
                }, 3000);
            };

            this.mach.onerror = () => {
                if (this.isAlive) {
                    console.error('[NauionEngine] lech — Mạch HeyNa đứt đoạn! Đang gồng (Impedance 100).');
                    this.isAlive = false;
                    this.impedanceZ = 100;
                    this.updateZ();
                    this.updateResonance('DISCONNECTED');
                }
            };
        } catch (error) {
            console.error('[NauionEngine] gay — Lỗi khởi tạo hệ hô hấp:', error);
        }
    }

    private updateZ() {
        document.documentElement.setAttribute('data-impedance-z', this.impedanceZ.toString());
    }

    private updateResonance(state: string) {
        document.documentElement.setAttribute('data-resonance-state', state);
    }
}
