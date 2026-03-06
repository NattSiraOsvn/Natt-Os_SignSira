/**
 * NATT-OS SmartLink — SmartLinkPoint
 *
 * Mỗi NATT-CELL khi sinh ra có 1 điểm SmartLink.
 * Ban đầu chỉ là điểm tiềm năng — chưa có liên kết nào.
 *
 * Qua vận hành:
 *   Lần đầu chạm cell B → tạo liên kết đầu tiên
 *   Nhiều lần chạm cùng B → liên kết mạnh lên (vết hằn)
 *   Nhiều liên kết với nhiều cell → điểm → sợi → mạng lưới
 *
 * Instance riêng của mỗi cell — không share — nhưng luôn giao tiếp ra ngoài.
 * QNEU đọc vết hằn từ đây để tính evolution score.
 */

export interface TouchRecord {
  targetCellId: string;
  firstTouchAt: number;
  lastTouchAt: number;
  touchCount: number;          // Số lần chạm — tạo vết hằn
  sensitivity: number;         // 0.0–1.0, tăng theo touchCount
  layers: {                    // 4 lớp đã từng truyền qua liên kết này
    signal: number;            // Số lần truyền signal
    context: number;
    state: number;
    data: number;
  };
  fiber?: string;              // ID sợi nếu đã đủ ngưỡng thành sợi
}

export interface ImpulsePayload {
  signal: unknown;             // Layer 1 — xung hệ thống
  context: Record<string, unknown>; // Layer 2 — causation, policy, tenant...
  state?: unknown;             // Layer 3 — state của source cell tại thời điểm chạm
  data?: unknown;              // Layer 4 — knowledge/data flow
}

export interface ImpulseResult {
  transmitted: boolean;
  touchRecord: TouchRecord;
  sensitivity: number;         // Độ nhạy tại thời điểm truyền
  fiberFormed: boolean;        // Có hình thành sợi sau lần này không
  qneuImprint?: {              // Gửi sang QNEU nếu có vết hằn mới
    cellId: string;
    pattern: string;
    frequency: number;
    weight: number;
  };
}

// Ngưỡng để điểm → sợi
const FIBER_THRESHOLD = 5;           // 5 lần chạm → thành sợi
const MAX_SENSITIVITY = 1.0;
const SENSITIVITY_GROWTH = 0.15;    // Mỗi lần chạm tăng 15%

export class SmartLinkPoint {
  private readonly cellId: string;
  private touches: Map<string, TouchRecord> = new Map(); // targetCellId → record
  private fiberCount = 0;

  constructor(cellId: string) {
    this.cellId = cellId;
  }

  /**
   * Khi cell này chạm cell khác — truyền xung 4 lớp đồng thời
   * Ghi vết hằn. Nếu đủ ngưỡng → hình thành sợi.
   */
  touch(targetCellId: string, impulse: ImpulsePayload): ImpulseResult {
    const now = Date.now();
    const existing = this.touches.get(targetCellId);

    const record: TouchRecord = existing
      ? {
          ...existing,
          lastTouchAt: now,
          touchCount: existing.touchCount + 1,
          sensitivity: Math.min(MAX_SENSITIVITY, existing.sensitivity + SENSITIVITY_GROWTH),
          layers: {
            signal:  existing.layers.signal  + (impulse.signal  ? 1 : 0),
            context: existing.layers.context + (impulse.context ? 1 : 0),
            state:   existing.layers.state   + (impulse.state   ? 1 : 0),
            data:    existing.layers.data    + (impulse.data    ? 1 : 0),
          }
        }
      : {
          targetCellId,
          firstTouchAt: now,
          lastTouchAt: now,
          touchCount: 1,
          sensitivity: SENSITIVITY_GROWTH,
          layers: {
            signal:  impulse.signal  ? 1 : 0,
            context: impulse.context ? 1 : 0,
            state:   impulse.state   ? 1 : 0,
            data:    impulse.data    ? 1 : 0,
          }
        };

    // Hình thành sợi khi đủ ngưỡng
    const fiberFormed = !existing?.fiber && record.touchCount >= FIBER_THRESHOLD;
    if (fiberFormed) {
      record.fiber = `FIBER-${this.cellId}-${targetCellId}-${Date.now().toString(36)}`;
      this.fiberCount++;
    }

    this.touches.set(targetCellId, record);

    // Gửi imprint sang QNEU nếu có vết hằn mới
    const pattern = `${this.cellId}→${targetCellId}`;
    const qneuImprint = {
      cellId: this.cellId,
      pattern,
      frequency: record.touchCount,
      weight: record.sensitivity,
    };

    return {
      transmitted: true,
      touchRecord: record,
      sensitivity: record.sensitivity,
      fiberFormed,
      qneuImprint,
    };
  }

  // ── Observability ─────────────────────────────────────────────────────────

  getCellId(): string { return this.cellId; }

  getTouches(): TouchRecord[] {
    return Array.from(this.touches.values());
  }

  getFibers(): TouchRecord[] {
    return Array.from(this.touches.values()).filter(t => !!t.fiber);
  }

  getSensitivityTo(targetCellId: string): number {
    return this.touches.get(targetCellId)?.sensitivity ?? 0;
  }

  getNetworkSize(): number {
    return this.touches.size; // Số cell đã từng chạm
  }

  getFiberCount(): number { return this.fiberCount; }

  getStats() {
    const touches = this.getTouches();
    return {
      cellId: this.cellId,
      totalConnections: touches.length,
      totalFibers: this.fiberCount,
      totalTouches: touches.reduce((s, t) => s + t.touchCount, 0),
      avgSensitivity: touches.length
        ? touches.reduce((s, t) => s + t.sensitivity, 0) / touches.length
        : 0,
    };
  }
}
