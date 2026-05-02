/**
 * HEYNA RECEIVER ENGINE — v0.1 (PILOT)
 * @cell: render-stack-cell
 * @status: pilot — nhận render instruction từ Mạch HeyNa (transport layer)
 * 
 * Lắng nghe tín hiệu từ Mạch HeyNa và chuyển đổi thành render instruction
 */

import type { RenderInstruction } from './render-instruction.types';

export type HeynaEventType = 'render' | 'layout' | 'navigate' | 'interaction' | 'pulse';

export interface HeynaEvent {
  type: HeynaEventType;
  source: string;
  timestamp: number;
  payload: any;
}

export class HeynaReceiverEngine {
  private listeners: Map<HeynaEventType, ((event: HeynaEvent) => void)[]> = new Map();
  private eventLog: HeynaEvent[] = [];
  public state: string = 'active';
  public connected: boolean = false;

  constructor() {
    this.initDefaultListeners();
  }

  /**
   * Khởi tạo các listener mặc định
   */
  private initDefaultListeners(): void {
    // Log tất cả sự kiện
    this.on('*' as HeynaEventType, (event: HeynaEvent) => {
      this.eventLog.push(event);
    });
  }

  /**
   * Kết nối đến Mạch HeyNa (mô phỏng)
   */
  connect(): void {
    this.connected = true;
    console.log('[HeynaReceiver] Connected to Mạch HeyNa');
    
    // Phát sự kiện kết nối
    this.emit({
      type: 'pulse',
      source: 'heyna-receiver',
      timestamp: Date.now(),
      payload: { status: 'connected' }
    });
  }

  /**
   * Ngắt kết nối
   */
  disconnect(): void {
    this.connected = false;
    console.log('[HeynaReceiver] Disconnected from Mạch HeyNa');
  }

  /**
   * Nhận sự kiện từ Mạch HeyNa (được gọi bởi transport layer)
   */
  receive(event: HeynaEvent): void {
    if (!this.connected) {
      console.warn('[HeynaReceiver] Cannot receive event — not connected');
      return;
    }

    console.log(`[HeynaReceiver] Received: ${event.type} from ${event.source}`);
    
    // Phát cho tất cả listener của loại sự kiện này
    const typeListeners = this.listeners.get(event.type) || [];
    for (const listener of typeListeners) {
      listener(event);
    }

    // Phát cho wildcard listeners
    const wildcardListeners = this.listeners.get('*' as HeynaEventType) || [];
    for (const listener of wildcardListeners) {
      listener(event);
    }
  }

  /**
   * Đăng ký listener cho một loại sự kiện
   */
  on(type: HeynaEventType, listener: (event: HeynaEvent) => void): void {
    const existing = this.listeners.get(type) || [];
    existing.push(listener);
    this.listeners.set(type, existing);
  }

  /**
   * Phát sự kiện nội bộ (để test)
   */
  emit(event: HeynaEvent): void {
    this.receive(event);
  }

  /**
   * Chuyển đổi HeynaEvent thành RenderInstruction
   */
  parseRenderInstruction(event: HeynaEvent): RenderInstruction | null {
    if (event.type !== 'render') return null;
    
    try {
      const instruction = event.payload as RenderInstruction;
      // Validate cơ bản
      if (!instruction.frame_id || !instruction.signals) {
        console.error('[HeynaReceiver] Invalid render instruction payload');
        return null;
      }
      return instruction;
    } catch (err) {
      console.error('[HeynaReceiver] Failed to parse render instruction:', err);
      return null;
    }
  }

  /**
   * Lấy lịch sử sự kiện
   */
  getEventLog(): HeynaEvent[] {
    return [...this.eventLog];
  }

  /**
   * Xóa lịch sử
   */
  clearEventLog(): void {
    this.eventLog = [];
  }
}
