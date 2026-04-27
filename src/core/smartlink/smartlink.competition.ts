/**
 * natt-os SmartLink — Pattern Competition Layer
 * ════════════════════════════════════════════════════════
 * src/core/SmartLink/SmartLink.competition.ts
 *
 * Pattern competition = cơ chế chọn lọc tự nhiên của mạng sợi.
 *
 * Khi nhiều cell cùng gửi tín hiệu đến 1 target:
 *   → Các patterns cạnh tranh nhau về strength (sensitivity)
 *   → Pattern mạnh nhất = DOMINANT
 *   → Patterns yếu hơn = SUPPRESSED (vẫn tồn tại, chỉ bị giảm ưu tiên)
 *   → Patterns dưới ngưỡng = FADING (sắp dissolve)
 *
 * KHÔNG xóa patterns thua. Chỉ xác định thứ bậc.
 * Vì: pattern thua hôm nay có thể reinforce và thắng ngày mai.
 *
 * Đây là layer emergence — đọc từ SmartLinkPoint, không ghi vào.
 * Pattern competition KHÔNG được code như module kiểm soát.
 * Nó đọc trạng thái thật của mạng và báo cáo trạng thái cạnh tranh.
 *
 * Liên quan: UEI emergence — khi nhiều causal horizon overlap,
 * pattern competition là cơ chế hệ "chọn" pattern nào được lan xa hơn.
 */

import type { TouchRecord } from './SmartLink.point';
import { SmartLinkCell } from '@/cells/infrastructure/SmartLink-cell/domain/services/SmartLink.stabilizer';

// ── Types ─────────────────────────────────────────────────────────────────────

export type CompetitionStatus = 'DOMINANT' | 'COMPETING' | 'SUPPRESSED' | 'FADING';

export interface PatternCompetitor {
  sourceCellId: string;
  targetCellId: string;
  sensitivity: number;
  touchCount: number;
  hasFiber: boolean;
  status: CompetitionStatus;
  dominanceScore: number; // 0.0–1.0, normalized trong nhóm cạnh tranh
}

export interface CompetitionResult {
  targetCellId: string;
  competitors: PatternCompetitor[];
  dominant: PatternCompetitor | null;   // null nếu chưa có ai đủ mạnh
  suppressed: PatternCompetitor[];
  fading: PatternCompetitor[];
  timestamp: number;
}

export interface NetworkCompetitionSnapshot {
  timestamp: number;
  totalTargets: number;         // số targets đang có competition
  totalPatterns: number;        // tổng số patterns đang active
  dominantPatterns: number;     // số patterns đang DOMINANT
  suppressedPatterns: number;
  fadingPatterns: number;
  hotspots: CompetitionResult[]; // targets có nhiều competitors nhất
}

// ── Constants ─────────────────────────────────────────────────────────────────

const DOMINANT_THRESHOLD   = 0.65; // sensitivity ≥ 0.65 → đủ mạnh để DOMINANT
const FADING_THRESHOLD     = 0.20; // sensitivity ≤ 0.20 → FADING (= fiberLost zone)
const MIN_COMPETITORS      = 2;    // cần ít nhất 2 sources → mới gọi là competition
const DOMINANCE_GAP        = 0.15; // khoảng cách tối thiểu với #2 để được DOMINANT rõ ràng

// ── Core logic ────────────────────────────────────────────────────────────────

/**
 * Phân tích competition cho 1 target cell cụ thể.
 * Lấy tất cả cells đang có TouchRecord trỏ đến targetCellId.
 */
function analyzeTarget(
  targetCellId: string,
  allCellIds: string[]
): CompetitionResult | null {
  // Thu thập tất cả TouchRecords từ mọi source → target này
  const competitors: { source: string; record: TouchRecord }[] = [];

  for (const sourceCellId of allCellIds) {
    if (sourceCellId === targetCellId) continue;
    const point = SmartLinkCell.getPoint(sourceCellId);
    if (!point) continue;

    const record = point.getTouches().find(t => t.targetCellId === targetCellId);
    if (record) {
      competitors.push({ source: sourceCellId, record });
    }
  }

  // Cần ít nhất MIN_COMPETITORS để gọi là competition
  if (competitors.length < MIN_COMPETITORS) return null;

  // Sort by sensitivity descending
  competitors.sort((a, b) => b.record.sensitivity - a.record.sensitivity);

  const maxSensitivity = competitors[0].record.sensitivity;
  const now = Date.now();

  // Build PatternCompetitor array với status
  const patternCompetitors: PatternCompetitor[] = competitors.map((c, idx) => {
    const { sensitivity, touchCount, fiber } = c.record;

    // Normalize dominance score trong nhóm này
    const dominanceScore = maxSensitivity > 0 ? sensitivity / maxSensitivity : 0;

    // Xác định status
    let status: CompetitionStatus;
    if (sensitivity <= FADING_THRESHOLD) {
      status = 'FADING';
    } else if (idx === 0 && sensitivity >= DOMINANT_THRESHOLD) {
      // Chỉ DOMINANT nếu đứng đầu VÀ đủ mạnh VÀ có khoảng cách với #2
      const secondSensitivity = competitors[1]?.record.sensitivity ?? 0;
      status = (sensitivity - secondSensitivity) >= DOMINANCE_GAP
        ? 'DOMINANT'
        : 'COMPETING';
    } else if (sensitivity < FADING_THRESHOLD * 2) {
      status = 'SUPPRESSED';
    } else {
      status = 'COMPETING';
    }

    return {
      sourceCellId: c.source,
      targetCellId,
      sensitivity,
      touchCount,
      hasFiber: !!fiber,
      status,
      dominanceScore,
    };
  });

  const dominant = patternCompetitors.find(p => p.status === 'DOMINANT') ?? null;
  const suppressed = patternCompetitors.filter(p => p.status === 'SUPPRESSED');
  const fading = patternCompetitors.filter(p => p.status === 'FADING');

  return {
    targetCellId,
    competitors: patternCompetitors,
    dominant,
    suppressed,
    fading,
    timestamp: now,
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

export const PatternCompetition = {
  /**
   * Phân tích competition cho 1 target cell cụ thể.
   * Trả về null nếu chưa đủ MIN_COMPETITORS.
   */
  analyzeTarget(targetCellId: string): CompetitionResult | null {
    const health = SmartLinkCell.getNetworkHealth();
    if (health.totalCells === 0) return null;

    // Lấy tất cả cellIds đang registered
    const allCellIds = _getRegisteredCellIds();
    return analyzeTarget(targetCellId, allCellIds);
  },

  /**
   * Snapshot toàn mạng — xem competition đang xảy ra ở đâu.
   * Chỉ analyze targets có ≥ MIN_COMPETITORS sources.
   */
  getNetworkSnapshot(): NetworkCompetitionSnapshot {
    const allCellIds = _getRegisteredCellIds();
    const now = Date.now();

    if (allCellIds.length === 0) {
      return {
        timestamp: now,
        totalTargets: 0,
        totalPatterns: 0,
        dominantPatterns: 0,
        suppressedPatterns: 0,
        fadingPatterns: 0,
        hotspots: [],
      };
    }

    // Thu thập tất cả targets đang được nhiều cell trỏ đến
    const targetMap = new Map<string, Set<string>>(); // targetCellId → Set<sourceCellId>

    for (const sourceCellId of allCellIds) {
      const point = SmartLinkCell.getPoint(sourceCellId);
      if (!point) continue;
      for (const record of point.getTouches()) {
        const sources = targetMap.get(record.targetCellId) ?? new Set();
        sources.add(sourceCellId);
        targetMap.set(record.targetCellId, sources);
      }
    }

    // Chỉ analyze targets có đủ competition
    const results: CompetitionResult[] = [];
    for (const [targetCellId, sources] of targetMap) {
      if (sources.size < MIN_COMPETITORS) continue;
      const result = analyzeTarget(targetCellId, allCellIds);
      if (result) results.push(result);
    }

    // Sort hotspots — nhiều competitors nhất lên đầu
    const hotspots = [...results].sort(
      (a, b) => b.competitors.length - a.competitors.length
    ).slice(0, 5);

    const allPatterns = results.flatMap(r => r.competitors);

    return {
      timestamp: now,
      totalTargets: results.length,
      totalPatterns: allPatterns.length,
      dominantPatterns: allPatterns.filter(p => p.status === 'DOMINANT').length,
      suppressedPatterns: allPatterns.filter(p => p.status === 'SUPPRESSED').length,
      fadingPatterns: allPatterns.filter(p => p.status === 'FADING').length,
      hotspots,
    };
  },

  /**
   * Lấy tất cả patterns đang DOMINANT trong toàn mạng.
   * Dùng để gossip ưu tiên — dominant patterns nên được lan xa hơn.
   */
  getDominantPatterns(): PatternCompetitor[] {
    const snapshot = PatternCompetition.getNetworkSnapshot();
    return snapshot.hotspots
      .flatMap(r => r.competitors)
      .filter(p => p.status === 'DOMINANT');
  },

  /**
   * Kiểm tra 1 pattern cụ thể đang ở trạng thái gì.
   * Dùng trong gossip decision: có nên lan pattern này không?
   */
  getPatternStatus(sourceCellId: string, targetCellId: string): CompetitionStatus | null {
    const result = PatternCompetition.analyzeTarget(targetCellId);
    if (!result) return null;
    return result.competitors.find(p => p.sourceCellId === sourceCellId)?.status ?? null;
  },
};

// ── Internal helper ───────────────────────────────────────────────────────────

function _getRegisteredCellIds(): string[] {
  // SmartLinkCell._points là private — đọc qua getNetworkHealth stats
  // Cách tiếp cận: dùng getNetworkHealth để biết có cells không,
  // sau đó enumerate qua touch records của nhau.
  //
  // Hiện tại SmartLinkCell không expose danh sách cellIds trực tiếp.
  // Cần thêm SmartLinkCell.getRegisteredCellIds() — xem note bên dưới.
  return SmartLinkCell.getRegisteredCellIds?.() ?? [];
}

/*
 * NOTE — cần thêm 1 method vào SmartLinkCell trong SmartLink.stabilizer.ts:
 *
 * static getRegisteredCellIds(): string[] {
 *   return Array.from(_points.keys());
 * }
 *
 * Không thêm ở đây vì SmartLink.stabilizer.ts là file riêng.
 * Anh copy lệnh này vào terminal để patch:
 *
 * sed -i '' '/static getPoint(cellId: string)/i\
 *   static getRegisteredCellIds(): string[] { return Array.from(_points.keys()); }\
 * ' src/cells/infrastructure/SmartLink-cell/domain/services/SmartLink.stabilizer.ts
 */
