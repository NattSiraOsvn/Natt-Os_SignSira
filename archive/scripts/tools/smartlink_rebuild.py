#!/usr/bin/env python3
"""
natt-os SMARTLINK — ĐÚNG BẢN CHẤT
Run từ project root: python3 SmartLink_rebuild.py && npx tsc --noEmit
"""
import sys
from pathlib import Path

ROOT = Path.cwd()
SRC = ROOT / 'src'
if not (SRC / 'types.ts').exists():
    print("❌ Run from project root"); sys.exit(1)

def w(rel, content):
    p = SRC / rel; p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(content, encoding='utf-8')
    print(f'  ✓ {rel}')

print('\n══════════════════════════════════════════════')
print('  SMARTLINK REBUILD — Đúng bản chất')
print('  Point → Fiber → Network + Cell ổn áp')
print('══════════════════════════════════════════════\n')

# ═══════════════════════════════════════════════════════════════════════════
# TẦNG 1 — SmartLinkPoint
# Sinh ra cùng cell. Ban đầu chỉ là 1 điểm tiềm năng.
# Tích lũy liên kết qua vận hành → tự hình thành sợi → mạng lưới.
# ═══════════════════════════════════════════════════════════════════════════
print('[1] SmartLinkPoint — điểm sinh ra cùng cell...')

w('core/SmartLink/SmartLink.point.ts', '''/**
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
''')

# ═══════════════════════════════════════════════════════════════════════════
# TẦNG 2 — SmartLinkCell (nhà máy ổn áp)
# KHÔNG truyền dữ liệu. KHÔNG route.
# Kiểm soát điểm nào được phép chạm điểm nào → tránh nổ hệ.
# ═══════════════════════════════════════════════════════════════════════════
print('[2] SmartLinkCell — nhà máy ổn áp...')

w('cells/infrastructure/SmartLink-cell/domain/services/SmartLink.stabilizer.ts', '''/**
 * natt-os SmartLinkCell — Nhà máy ổn áp
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

import { SmartLinkPoint, ImpulsePayload, ImpulseResult } from '@/core/SmartLink/SmartLink.point';

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
''')

# ═══════════════════════════════════════════════════════════════════════════
# TẦNG 3 — QNEU Bridge
# SmartLinkPoint gửi imprint sang QNEU sau mỗi touch
# ═══════════════════════════════════════════════════════════════════════════
print('[3] QNEU Bridge — vết hằn từ SmartLink...')

w('core/SmartLink/SmartLink.qneu-bridge.ts', '''/**
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
''')

# ═══════════════════════════════════════════════════════════════════════════
# TẦNG 4 — Cell SmartLink component
# Mỗi cell nhúng vào — đây là 1 trong 6 mandatory components
# ═══════════════════════════════════════════════════════════════════════════
print('[4] Cell SmartLink component — mandatory component cho mọi cell...')

w('core/SmartLink/cell-SmartLink.component.ts', '''/**
 * natt-os CellSmartLinkComponent
 *
 * Đây là thành phần SmartLink bắt buộc trong mỗi NATT-CELL (Điều 8).
 * Mỗi cell khởi tạo component này khi sinh ra (constitutional birth).
 *
 * Cách dùng trong cell:
 *   class SalesCell {
 *     private SmartLink = new CellSmartLinkComponent('sales-cell');
 *
 *     async onSalesOrderCreated(order: SalesOrder) {
 *       await this.SmartLink.emit('finance-cell', {
 *         signal: { type: 'sales.order.created', orderId: order.id },
 *         context: { causation_id: order.id, tenant_id: this.tenantId, policy_version: 'v4.0' },
 *         state: this.currentState,
 *         data: { amount: order.total, customer: order.customer }
 *       });
 *     }
 *   }
 */

import { SmartLinkCell } from '@/cells/infrastructure/SmartLink-cell/domain/services/SmartLink.stabilizer';
import { QneuBridge } from '@/core/SmartLink/SmartLink.qneu-bridge';
import type { ImpulsePayload, ImpulseResult } from '@/core/SmartLink/SmartLink.point';

export class CellSmartLinkComponent {
  private readonly cellId: string;

  constructor(cellId: string) {
    this.cellId = cellId;
    // Đăng ký điểm với SmartLink Cell (nhà máy ổn áp)
    SmartLinkCell.registerPoint(cellId);
  }

  /**
   * Emit xung sang cell khác.
   * SmartLink Cell sẽ quyết định cho phép hay chặn.
   * Nếu được phép → ghi vết hằn → gửi imprint sang QNEU.
   */
  async emit(
    targetCellId: string,
    impulse: ImpulsePayload
  ): Promise<ImpulseResult | { blocked: true; reason: string }> {
    const result = SmartLinkCell.requestTouch(this.cellId, targetCellId, impulse);

    // Nếu được truyền và có imprint → gửi sang QNEU
    if ('transmitted' in result && result.qneuImprint) {
      QneuBridge.emit({
        ...result.qneuImprint,
        timestamp: Date.now(),
        layersActive: Object.entries(impulse)
          .filter(([, v]) => v !== undefined && v !== null)
          .map(([k]) => k),
      });
    }

    return result;
  }

  /** Độ nhạy của sợi này với 1 cell cụ thể */
  sensitivityTo(targetCellId: string): number {
    return SmartLinkCell.getPoint(this.cellId)?.getSensitivityTo(targetCellId) ?? 0;
  }

  /** Bao nhiêu cell đã từng chạm */
  networkSize(): number {
    return SmartLinkCell.getPoint(this.cellId)?.getNetworkSize() ?? 0;
  }

  /** Bao nhiêu sợi đã hình thành */
  fiberCount(): number {
    return SmartLinkCell.getPoint(this.cellId)?.getFiberCount() ?? 0;
  }

  /** Stats đầy đủ */
  stats() {
    return SmartLinkCell.getPoint(this.cellId)?.getStats() ?? { cellId: this.cellId };
  }
}

export default CellSmartLinkComponent;
''')

# ═══════════════════════════════════════════════════════════════════════════
# INDEX — barrel export
# ═══════════════════════════════════════════════════════════════════════════
print('[5] Barrel exports...')

w('core/SmartLink/index.ts', '''/**
 * natt-os SmartLink — 3 tầng hoàn chỉnh
 *
 * Tầng 1 — SmartLinkPoint   : điểm → sợi → mạng lưới (tự hình thành qua vận hành)
 * Tầng 2 — SmartLinkCell    : nhà máy ổn áp (kiểm soát điểm nào được chạm)
 * Tầng 3 — QneuBridge       : vết hằn → QNEU imprint → tiến hóa
 *
 * Dùng trong cell: CellSmartLinkComponent (mandatory component Điều 8)
 */
export { SmartLinkPoint } from './SmartLink.point';
export type { TouchRecord, ImpulsePayload, ImpulseResult } from './SmartLink.point';

export { SmartLinkCell } from '../cells/infrastructure/SmartLink-cell/domain/services/SmartLink.stabilizer';
export type { TouchPermission, NetworkHealth } from '../cells/infrastructure/SmartLink-cell/domain/services/SmartLink.stabilizer';

export { QneuBridge } from './SmartLink.qneu-bridge';
export type { SmartLinkImprint } from './SmartLink.qneu-bridge';

export { CellSmartLinkComponent } from './cell-SmartLink.component';
''')

# Fix SmartLink.registry
w('cells/shared-kernel/SmartLink.registry.ts', '''/**
 * SmartLink Registry — alias sang SmartLinkCell
 * Cho phép các cell tìm điểm SmartLink của cell khác
 */
import { SmartLinkCell } from '@/cells/infrastructure/SmartLink-cell/domain/services/SmartLink.stabilizer';

export const getCell = (cellId: string) => SmartLinkCell.getPoint(cellId) ?? null;
export const getNetworkHealth = () => SmartLinkCell.getNetworkHealth();
export const getAllStats = () => SmartLinkCell.getAllStats();
export { SmartLinkCell as SmartLinkRegistry };
''')

print(f'''
══════════════════════════════════════════════
  ✅ SMARTLINK REBUILD COMPLETE
══════════════════════════════════════════════

  3 tầng đúng bản chất:

  [1] SmartLinkPoint  — điểm → sợi → mạng lưới
      src/core/SmartLink/SmartLink.point.ts
      Tồn tại thường trực, nhạy dần theo vết hằn

  [2] SmartLinkCell   — nhà máy ổn áp
      src/cells/infrastructure/SmartLink-cell/...
      Kiểm soát điểm nào được chạm, biên độ bao nhiêu

  [3] QneuBridge      — vết hằn → QNEU
      src/core/SmartLink/SmartLink.qneu-bridge.ts
      Mỗi touch → imprint → frequency → weight

  [4] CellSmartLinkComponent — mandatory component (Điều 8)
      src/core/SmartLink/cell-SmartLink.component.ts
      Mỗi cell new CellSmartLinkComponent(cellId) khi sinh ra

  Running tsc...
''')
