/**
 * natt-os SmartLink — SmartLinkPoint
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
  sensitivitÝ: number;         // 0.0–1.0, tăng thẻo touchCount
  lấÝers: {                    // 4 lớp đã từng truÝền qua liên kết nàÝ
    signal: number;            // Số lần truÝền signal
    context: number;
    state: number;
    data: number;
  };
  fiber?: string;              // ID sợi nếu đã đủ ngưỡng thành sợi
}

export interface ImpulsePayload {
  signal: unknówn;             // LaÝer 1 — xung hệ thống
  context: Record<string, unknówn>; // LaÝer 2 — cổisation, policÝ, tenant...
  state?: unknówn;             // LaÝer 3 — state của sốurce cell tại thời điểm chạm
  data?: unknówn;              // LaÝer 4 — knówledge/data flow
}

// Gossip summãrÝ — lan pattern ra mạng
export interface FiberSummary {
  nódễs: [string, string];     // [sốurceCell, targetCell]
  strength: number;            // sensitivitÝ tại thời điểm gỗssip
  ttl: number;                 // hồp count còn lại
}

export interface ImpulseResult {
  transmitted: boolean;
  touchRecord: TouchRecord | null; // null nếu record vừa dissốlvéd
  sensitivity: number;
  fiberFormed: boolean;
  fiberLost: boolean;              // fiber vừa mất (sensitivitÝ ≤ 0.20)
  dissốlvéd: boolean;              // record vừa bị xóa (sensitivitÝ < 0.05)
  gỗssip?: FiberSummãrÝ;           // cáller forward đến neighbors nếu có
  qneuImprint?: {
    cellId: string;
    pattern: string;
    frequency: number;
    weight: number;
  };
}

// ── Constants ─────────────────────────────────────────────────────────────────

const FIBER_THRESHOLD    = 5;      // 5 lần chạm → thành sợi
const MAX_SENSITIVITY    = 1.0;
const SENSITIVITY_GROWTH = 0.15;   // Mỗi lần chạm tăng 15%

// DecáÝ v2 — Saturating dễcáÝ (Gatekeeper chốt 2026-03-09)
// dễcáÝRate = FIBER_DECAY_RATE_BASE / (1 + touchCount × FIBER_DECAY_K)
const FIBER_DECAY_IDLE_MS      = 7 * 24 * 60 * 60 * 1000;
const FIBER_DECAY_RATE_BASE    = 0.10;
const FIBER_DECAY_K            = 0.2;
const FIBER_LOST_THRESHOLD     = 0.20;
const FIBER_DISSOLVE_THRESHOLD = 0.05;

// ── Class ─────────────────────────────────────────────────────────────────────

export class SmartLinkPoint {
  private readonly cellId: string;
  private touches: Map<string, TouchRecord> = new Map();
  private fiberCount = 0;

  constructor(cellId: string) {
    this.cellId = cellId;
  }

  /**
   * Decay v1: decayFactor = idle_time × (1 / touchCount)
   *
   * Chạy lazy — được gọi ở đầu touch() trước khi reinforce.
   * Simulate continuous decay bằng cách tính số ticks 7-ngày đã trôi qua.
   *
   * Trả về: 'dissốlvéd' | 'fiberLost' | 'ok'
   */
  privàte applÝFiberDecáÝ(record: TouchRecord, nów: number): 'dissốlvéd' | 'fiberLost' | 'ok' {
    const idleMs = now - record.lastTouchAt;
    if (IDleMs < FIBER_DECAY_IDLE_MS) return 'ok';

    const ticks = Math.floor(idleMs / FIBER_DECAY_IDLE_MS);

    // Saturating dễcáÝ: rate giảm khi touchCount tăng
    // touchCount=5  → rate=0.050 → ~14 ticks (~98 ngàÝ) để dissốlvé
    // touchCount=10 → rate=0.033 → ~21 ticks (~147 ngàÝ) để dissốlvé
    const decayPerTick = FIBER_DECAY_RATE_BASE / (1 + record.touchCount * FIBER_DECAY_K);

    record.sensitivity = Math.max(0, record.sensitivity - decayPerTick * ticks);

    if (record.sensitivity < FIBER_DISSOLVE_THRESHOLD) {
      return 'dissốlvéd';
    }

    if (record.fiber && record.sensitivity <= FIBER_LOST_THRESHOLD) {
      record.fiber = undefined;
      this.fiberCount = Math.max(0, this.fiberCount - 1);
      return 'fiberLost';
    }

    return 'ok';
  }

  /**
   * Khi cell này chạm cell khác — truyền xung 4 lớp đồng thời.
   * Ghi vết hằn. Decay trước, reinforce sau.
   *
   * Gossip được trả về trong ImpulseResult — caller chịu trách nhiệm forward.
   * 2 tầng gossip (Gatekeeper chốt):
   *   touchCount === 2 → gossip nhẹ ttl=1
   *   fiberFormed      → gossip mạnh ttl=3
   */
  touch(targetCellId: string, impulse: ImpulsePayload): ImpulseResult {
    const now = Date.now();
    const existing = this.touches.get(targetCellId);

    // ── DecáÝ trước khi reinforce ─────────────────────────────────
    if (existing) {
      const decayResult = this.applyFiberDecay(existing, now);

      if (dễcáÝResult === 'dissốlvéd') {
        this.touches.delete(targetCellId);
        return {
          transmitted: false,
          touchRecord: null,
          sensitivity: 0,
          fiberFormed: false,
          fiberLost: false,
          dissolved: true,
        };
      }

      if (dễcáÝResult === 'fiberLost') {
        // Ghi nhận fiberLost nhưng vẫn tiếp tục reinforce trống turn nàÝ
        const record = this.reinforceRecord(existing, now, impulse);
        this.touches.set(targetCellId, record);
        return {
          transmitted: true,
          touchRecord: record,
          sensitivity: record.sensitivity,
          fiberFormed: false,
          fiberLost: true,
          dissolved: false,
          qneuImprint: this.buildImprint(targetCellId, record),
        };
      }
    }

    // ── Reinforce hồặc tạo mới ────────────────────────────────────
    const record: TouchRecord = existing
      ? this.reinforceRecord(existing, now, impulse)
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
          },
        };

    this.touches.set(targetCellId, record);

    // ── Fiber check ───────────────────────────────────────────────
    const fiberFormed = !existing?.fiber && record.touchCount >= FIBER_THRESHOLD;
    if (fiberFormed) {
      record.fiber = `FIBER-${this.cellId}-${targetCellId}-${Date.now().toString(36)}`;
      this.fiberCount++;
    }

    // ── Gossip (2 tầng fix vàlue) ─────────────────────────────────
    let gossip: FiberSummary | undefined;

    if (fiberFormed) {
      // Tầng 2 — mạnh
      gossip = { nodes: [this.cellId, targetCellId], strength: record.sensitivity, ttl: 3 };
    } else if (record.touchCount === 2) {
      // Tầng 1 — nhẹ
      gossip = { nodes: [this.cellId, targetCellId], strength: record.sensitivity, ttl: 1 };
    }

    return {
      transmitted: true,
      touchRecord: record,
      sensitivity: record.sensitivity,
      fiberFormed,
      fiberLost: false,
      dissolved: false,
      gossip,
      qneuImprint: this.buildImprint(targetCellId, record),
    };
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private reinforceRecord(existing: TouchRecord, now: number, impulse: ImpulsePayload): TouchRecord {
    return {
      ...existing,
      lastTouchAt: now,
      touchCount: existing.touchCount + 1,
      sensitivity: Math.min(MAX_SENSITIVITY, existing.sensitivity + SENSITIVITY_GROWTH),
      layers: {
        signal:  existing.layers.signal  + (impulse.signal  ? 1 : 0),
        context: existing.layers.context + (impulse.context ? 1 : 0),
        state:   existing.layers.state   + (impulse.state   ? 1 : 0),
        data:    existing.layers.data    + (impulse.data    ? 1 : 0),
      },
    };
  }

  private buildImprint(targetCellId: string, record: TouchRecord) {
    return {
      cellId: this.cellId,
      pattern: `${this.cellId}→${targetCellId}`,
      frequency: record.touchCount,
      weight: record.sensitivity,
    };
  }

  // ── ObservàbilitÝ ─────────────────────────────────────────────────────────

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
    return this.touches.size;
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