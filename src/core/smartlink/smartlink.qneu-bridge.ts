/**
 * natt-os SmartLink → QNEU Bridge
 *
 * Sau mỗi lần touch, SmartLinkPoint gửi imprint sang QNEU.
 * QNEU không biết SmartLink là gì — chỉ nhận imprint và ghi vết hằn.
 *
 * Cơ chế:
 *   touch nhiều lần cùng pattern → frequency tăng → weight tăng
 *   → QNEU tạo permanent node → hệ nhận ra pattern này là "quen"
 *   → lần sau pattern đó xuất hiện, phản ứng nhanh hơn, chính xác hơn
 */

export interface SmartLinkImprint {
  cellId: string;              // Cell nào tạo imprint
  pattern: string;             // Ví dụ: 'sales-cell→finance-cell'
  frequency: number;           // Tổng số lần pattern này xảy ra
  weight: number;              // Độ nhạy hiện tại (0.0–1.0)
  timestamp: number;
  layersActive: string[];      // Layer nào đang active
}

type ImprintHandler = (imprint: SmartLinkImprint) => void;

class SmartLinkQneuBridge {
  private static instance: SmartLinkQneuBridge;
  private handlers: ImprintHandler[] = [];
  private imprintLog: SmartLinkImprint[] = [];

  static getInstance(): SmartLinkQneuBridge {
    if (!this.instance) this.instance = new SmartLinkQneuBridge();
    return this.instance;
  }

  /** QNEU runtime đăng ký nhận imprint */
  onImprint(handler: ImprintHandler): void {
    this.handlers.push(handler);
  }

  /** SmartLinkPoint gọi sau mỗi touch */
  emit(imprint: SmartLinkImprint): void {
    this.imprintLog.push(imprint);
    if (this.imprintLog.length > 10000) this.imprintLog.shift();
    this.handlers.forEach(h => {
      try { h(imprint); } catch {}
    });
  }

  getLog(limit = 100): SmartLinkImprint[] {
    return this.imprintLog.slice(-limit);
  }

  getPatternFrequency(pattern: string): number {
    const latest = [...this.imprintLog]
      .reverse()
      .find(i => i.pattern === pattern);
    return latest?.frequency ?? 0;
  }
}

export const QneuBridge = SmartLinkQneuBridge.getInstance();
export default QneuBridge;
