/**
 * NATT-OS SmartLinkCell — Nhà máy ổn áp
 *
 * KHÔNG phải hub. KHÔNG phải router. KHÔNG truyền dữ liệu.
 *
 * Nhiệm vụ:
 *   1. Kiểm soát điểm nào được phép chạm điểm nào (tránh nổ hệ)
 *   2. Ổn định biên độ xung — ngăn 1 cell "la hét" làm điếc cả hệ
 *   3. Theo dõi topology mạng lưới điểm toàn hệ
 *   4. Phát hiện khi mạng quá dày → điều tiết
 *   5. Cung cấp nền ổn định để hệ tự tiến hóa
 *
 * Giống cơ chế ức chế (inhibition) trong não —
 * không có nó thì kích hoạt tự do → động kinh hệ thống.
 */

import { SmartLinkPoint, ImpulsePayload, ImpulseResult } from '@/core/smartlink/smartlink.point';

// ── Quy tắc cho phép chạm ─────────────────────────────────────────────────

export interface TouchPermission {
  sourceCellId: string;        // '*' = mọi cell
  targetCellId: string;        // '*' = mọi cell
  maxFrequencyPerSec: number;  // Giới hạn tần suất — tránh flood
  requiresPolicy?: string;     // Policy bắt buộc nếu có
  allowedLayers: ('signal' | 'context' | 'state' | 'data')[];
  reason: string;
}

export interface AmplitudeLimit {
  cellId: string;
  maxTouchesPerSec: number;    // Tổng số touches cell này được phép emit/giây
  currentCount: number;
  windowStart: number;
}

export interface NetworkHealth {
  totalPoints: number;
  totalFibers: number;
  totalTouches: number;
  densityScore: number;        // 0.0–1.0, cao = quá dày
  hotspots: string[];          // CellId có quá nhiều liên kết
  isolated: string[];          // Cell chưa có liên kết nào
}

const MAX_DENSITY = 0.8;                // Ngưỡng cảnh báo mạng quá dày
const DEFAULT_MAX_FREQ = 100;           // 100 touches/giây mặc định
const HOTSPOT_THRESHOLD = 20;          // >20 liên kết = hotspot

export class SmartLinkStabilizer {
  private static instance: SmartLinkStabilizer;

  // Registry tất cả SmartLinkPoint của toàn hệ
  private points: Map<string, SmartLinkPoint> = new Map();

  // Quy tắc cho phép chạm — mặc định DENY nếu không có rule
  private permissions: TouchPermission[] = [];

  // Giới hạn biên độ theo cell
  private amplitudeLimits: Map<string, AmplitudeLimit> = new Map();

  // Log cho observability
  private blockedTouches: Array<{ from: string; to: string; reason: string; at: number }> = [];

  static getInstance(): SmartLinkStabilizer {
    if (!this.instance) this.instance = new SmartLinkStabilizer();
    return this.instance;
  }

  private constructor() {
    this.initDefaultPermissions();
  }

  // ── Cell đăng ký điểm SmartLink của nó ──────────────────────────────────

  registerPoint(cellId: string): SmartLinkPoint {
    if (!this.points.has(cellId)) {
      this.points.set(cellId, new SmartLinkPoint(cellId));
      this.amplitudeLimits.set(cellId, {
        cellId,
        maxTouchesPerSec: DEFAULT_MAX_FREQ,
        currentCount: 0,
        windowStart: Date.now(),
      });
    }
    return this.points.get(cellId)!;
  }

  getPoint(cellId: string): SmartLinkPoint | undefined {
    return this.points.get(cellId);
  }

  // ── Kiểm tra và cho phép/chặn touch ─────────────────────────────────────

  requestTouch(
    sourceCellId: string,
    targetCellId: string,
    impulse: ImpulsePayload
  ): ImpulseResult | { blocked: true; reason: string } {

    // 1. Kiểm tra permission
    const permission = this.resolvePermission(sourceCellId, targetCellId);
    if (!permission) {
      this.blockedTouches.push({ from: sourceCellId, to: targetCellId, reason: 'NO_PERMISSION', at: Date.now() });
      return { blocked: true, reason: 'NO_PERMISSION' };
    }

    // 2. Kiểm tra biên độ (tránh flood)
    if (!this.checkAmplitude(sourceCellId)) {
      this.blockedTouches.push({ from: sourceCellId, to: targetCellId, reason: 'AMPLITUDE_EXCEEDED', at: Date.now() });
      return { blocked: true, reason: 'AMPLITUDE_EXCEEDED' };
    }

    // 3. Lọc layers theo permission
    const filteredImpulse: ImpulsePayload = {
      signal:  permission.allowedLayers.includes('signal')  ? impulse.signal  : undefined,
      context: permission.allowedLayers.includes('context') ? impulse.context : {},
      state:   permission.allowedLayers.includes('state')   ? impulse.state   : undefined,
      data:    permission.allowedLayers.includes('data')    ? impulse.data    : undefined,
    };

    // 4. Thực hiện touch qua SmartLinkPoint của source
    const sourcePoint = this.points.get(sourceCellId);
    if (!sourcePoint) return { blocked: true, reason: 'SOURCE_NOT_REGISTERED' };

    const result = sourcePoint.touch(targetCellId, filteredImpulse);

    // 5. Ghi amplitude
    this.recordAmplitude(sourceCellId);

    // 6. Kiểm tra network health sau touch
    this.checkNetworkDensity();

    return result;
  }

  // ── Permission resolution ─────────────────────────────────────────────────

  private resolvePermission(source: string, target: string): TouchPermission | null {
    return this.permissions.find(p =>
      (p.sourceCellId === '*' || p.sourceCellId === source) &&
      (p.targetCellId === '*' || p.targetCellId === target)
    ) ?? null;
  }

  addPermission(permission: TouchPermission): void {
    this.permissions.push(permission);
  }

  // ── Amplitude control ─────────────────────────────────────────────────────

  private checkAmplitude(cellId: string): boolean {
    const limit = this.amplitudeLimits.get(cellId);
    if (!limit) return true;

    const now = Date.now();
    if (now - limit.windowStart > 1000) {
      // Reset window mỗi giây
      limit.currentCount = 0;
      limit.windowStart = now;
    }

    return limit.currentCount < limit.maxTouchesPerSec;
  }

  private recordAmplitude(cellId: string): void {
    const limit = this.amplitudeLimits.get(cellId);
    if (limit) limit.currentCount++;
  }

  setAmplitudeLimit(cellId: string, maxPerSec: number): void {
    const existing = this.amplitudeLimits.get(cellId);
    if (existing) existing.maxTouchesPerSec = maxPerSec;
  }

  // ── Network health + density check ───────────────────────────────────────

  private checkNetworkDensity(): void {
    const health = this.getNetworkHealth();
    if (health.densityScore > MAX_DENSITY) {
      console.warn(`[SMARTLINK-CELL] ⚠ Network density ${health.densityScore.toFixed(2)} — hotspots: ${health.hotspots.join(', ')}`);
    }
  }

  getNetworkHealth(): NetworkHealth {
    const points = Array.from(this.points.values());
    const totalPoints = points.length;
    const totalFibers = points.reduce((s, p) => s + p.getFiberCount(), 0);
    const totalTouches = points.reduce((s, p) =>
      s + p.getTouches().reduce((ts, t) => ts + t.touchCount, 0), 0
    );

    const maxPossibleConnections = totalPoints * (totalPoints - 1);
    const actualConnections = points.reduce((s, p) => s + p.getNetworkSize(), 0);
    const densityScore = maxPossibleConnections > 0
      ? Math.min(1, actualConnections / maxPossibleConnections)
      : 0;

    const hotspots = points
      .filter(p => p.getNetworkSize() > HOTSPOT_THRESHOLD)
      .map(p => p.getCellId());

    const isolated = points
      .filter(p => p.getNetworkSize() === 0)
      .map(p => p.getCellId());

    return { totalPoints, totalFibers, totalTouches, densityScore, hotspots, isolated };
  }

  // ── Default permissions ───────────────────────────────────────────────────

  private initDefaultPermissions(): void {
    // Business cells có thể chạm nhau — signal + context + data
    this.addPermission({
      sourceCellId: '*',
      targetCellId: '*',
      maxFrequencyPerSec: 50,
      allowedLayers: ['signal', 'context', 'data'],
      reason: 'Default inter-cell communication',
    });

    // Kernel cells nhận đầy đủ 4 lớp
    ['audit-cell', 'security-cell', 'analytics-cell'].forEach(kernelCell => {
      this.addPermission({
        sourceCellId: '*',
        targetCellId: kernelCell,
        maxFrequencyPerSec: 200,
        allowedLayers: ['signal', 'context', 'state', 'data'],
        reason: 'Kernel cells receive all layers',
      });
    });
  }

  // ── Observability ─────────────────────────────────────────────────────────

  getBlockedLog(limit = 50) {
    return this.blockedTouches.slice(-limit);
  }

  getAllStats() {
    return Array.from(this.points.values()).map(p => p.getStats());
  }
}

export const SmartLinkCell = SmartLinkStabilizer.getInstance();
export default SmartLinkCell;
