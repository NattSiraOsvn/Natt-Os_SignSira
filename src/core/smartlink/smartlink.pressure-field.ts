/**
 * NATT-OS SmartLink — Pressure Field
 * ════════════════════════════════════════════════════════
 * src/core/smartlink/smartlink.pressure-field.ts
 *
 * Pressure Field = lực kéo của mạng sợi lên routing.
 *
 * Vấn đề hiện tại:
 *   DeterministicRouter dùng weight TĨNH → routing không phản ánh
 *   trạng thái thật của hệ. Cell nào được nhiều fiber trỏ vào
 *   thật ra đang được hệ "kéo" — nhưng router không biết.
 *
 * Pressure Field giải quyết:
 *   1. Đọc PatternCompetition → biết cell nào đang DOMINANT
 *   2. Tính pressure gradient cho mỗi cell (0.0–1.0)
 *   3. Inject vào DeterministicRouter.register() dưới dạng
 *      pressure bonus lên weight tĩnh
 *
 * Kết quả:
 *   Cell được nhiều fiber mạnh trỏ vào → pressure cao → được ưu tiên route
 *   Cell đang FADING → pressure thấp → dần bị route qua
 *
 * KHÔNG override weight tĩnh hoàn toàn.
 * Pressure là additive bonus — Gatekeeper weight vẫn là nền.
 *
 * Liên quan UEI:
 *   Pressure Field là cơ chế hệ "biết mình đang kéo về đâu"
 *   trước khi UEI đủ điều kiện emerge.
 *   UEI đọc Pressure Field như một trong các inputs của consciousness.
 */

import { PatternCompetition, type PatternCompetitor, type NetworkCompetitionSnapshot } from './smartlink.competition';
import { Router, type RoutingCandidate } from '@/core/routing/deterministic-router';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CellPressure {
  cellId: string;
  rawPressure: number;        // 0.0–1.0 — tổng lực kéo từ network
  normalizedPressure: number; // 0.0–1.0 — normalized trong toàn mạng
  dominantCount: number;      // số patterns DOMINANT trỏ vào cell này
  competingCount: number;
  fadingCount: number;
  pressureBonus: number;      // bonus cộng vào weight: 0–MAX_PRESSURE_BONUS
}

export interface PressureFieldSnapshot {
  timestamp: number;
  cells: CellPressure[];
  maxPressure: number;
  minPressure: number;
  avgPressure: number;
  hotCell: string | null;     // cell đang bị kéo mạnh nhất
  coldCell: string | null;    // cell đang bị kéo yếu nhất
}

// ── Constants ─────────────────────────────────────────────────────────────────

const MAX_PRESSURE_BONUS = 30;  // bonus tối đa cộng vào weight (weight scale 0–100)
const DOMINANT_WEIGHT    = 1.0; // đóng góp của DOMINANT pattern vào pressure
const COMPETING_WEIGHT   = 0.5; // đóng góp của COMPETING pattern
const SUPPRESSED_WEIGHT  = 0.2; // đóng góp của SUPPRESSED
const FADING_WEIGHT      = 0.0; // FADING không đóng góp pressure

// Cache — không recalculate quá 1 lần / 5 giây
let _cache: PressureFieldSnapshot | null = null;
let _cacheAt = 0;
const CACHE_TTL_MS = 5_000;

// ── Core ──────────────────────────────────────────────────────────────────────

function _statusWeight(status: PatternCompetitor['status']): number {
  switch (status) {
    case 'DOMINANT':   return DOMINANT_WEIGHT;
    case 'COMPETING':  return COMPETING_WEIGHT;
    case 'SUPPRESSED': return SUPPRESSED_WEIGHT;
    case 'FADING':     return FADING_WEIGHT;
  }
}

function _buildPressureMap(snapshot: NetworkCompetitionSnapshot): Map<string, CellPressure> {
  const map = new Map<string, CellPressure>();

  for (const competition of snapshot.hotspots) {
    const { targetCellId, competitors } = competition;

    if (!map.has(targetCellId)) {
      map.set(targetCellId, {
        cellId: targetCellId,
        rawPressure: 0,
        normalizedPressure: 0,
        dominantCount: 0,
        competingCount: 0,
        fadingCount: 0,
        pressureBonus: 0,
      });
    }

    const cell = map.get(targetCellId)!;

    for (const p of competitors) {
      cell.rawPressure += p.sensitivity * _statusWeight(p.status);
      if (p.status === 'DOMINANT')   cell.dominantCount++;
      if (p.status === 'COMPETING')  cell.competingCount++;
      if (p.status === 'FADING')     cell.fadingCount++;
    }
  }

  return map;
}

function _normalize(map: Map<string, CellPressure>): void {
  const values = Array.from(map.values());
  if (values.length === 0) return;

  const max = Math.max(...values.map(c => c.rawPressure));
  if (max === 0) return;

  // Step 1: normalize rawPressure → normalizedPressure
  // rawPressure KHÔNG bị chạm — giữ nguyên cho UEI đọc trung thực
  for (const cell of values) {
    cell.normalizedPressure = cell.rawPressure / max;
  }

  // Step 2: tính entropy của distribution (Option B — dampen output, không dampen input)
  // entropy thấp = tập trung → runaway risk
  // entropy cao  = phân tán đều → healthy diversity
  const total = values.reduce((s, c) => s + c.normalizedPressure, 0);
  const entropy = total > 0
    ? -values
        .filter(c => c.normalizedPressure > 0)
        .map(c => c.normalizedPressure / total)
        .reduce((s, p) => s + p * Math.log2(p), 0) /
      Math.log2(Math.max(2, values.length))
    : 1;

  // Step 3: entropy-based damping — chỉ áp dụng lên pressureBonus (router input)
  // entropy=1.0 (đều) → dampingFactor=1.0 → không dampen
  // entropy=0.3       → dampingFactor=0.65 → DOMINANT giảm 35% bonus
  // entropy=0.0       → dampingFactor=0.5  → maximum dampen 50%
  const dampingFactor = 0.5 + 0.5 * Math.min(1, entropy);

  for (const cell of values) {
    cell.pressureBonus = Math.round(cell.normalizedPressure * dampingFactor * MAX_PRESSURE_BONUS);
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export const PressureField = {

  /**
   * Tính và cache pressure snapshot toàn mạng.
   * Dùng cache 5s để tránh recalculate liên tục.
   */
  getSnapshot(forceRefresh = false): PressureFieldSnapshot {
    const now = Date.now();
    if (!forceRefresh && _cache && (now - _cacheAt) < CACHE_TTL_MS) {
      return _cache;
    }

    const competition = PatternCompetition.getNetworkSnapshot();
    const pressureMap = _buildPressureMap(competition);
    _normalize(pressureMap);

    const cells = Array.from(pressureMap.values());

    const pressures = cells.map(c => c.normalizedPressure);
    const maxP = pressures.length ? Math.max(...pressures) : 0;
    const minP = pressures.length ? Math.min(...pressures) : 0;
    const avgP = pressures.length
      ? pressures.reduce((s, v) => s + v, 0) / pressures.length
      : 0;

    const hotCell = cells.length
      ? cells.reduce((a, b) => a.normalizedPressure > b.normalizedPressure ? a : b).cellId
      : null;
    const coldCell = cells.length
      ? cells.reduce((a, b) => a.normalizedPressure < b.normalizedPressure ? a : b).cellId
      : null;

    _cache = { timestamp: now, cells, maxPressure: maxP, minPressure: minP, avgPressure: avgP, hotCell, coldCell };
    _cacheAt = now;
    return _cache;
  },

  /**
   * Lấy pressure của 1 cell cụ thể.
   */
  getCellPressure(cellId: string): CellPressure | null {
    const snapshot = PressureField.getSnapshot();
    return snapshot.cells.find(c => c.cellId === cellId) ?? null;
  },

  /**
   * Inject pressure bonus vào DeterministicRouter.
   *
   * Dùng khi cell register vào router — thay vì weight tĩnh,
   * cộng thêm pressureBonus từ network state.
   *
   * Gọi sau khi SmartLink có đủ data (vài chục touches).
   * Gọi quá sớm → pressure = 0 → không ảnh hưởng.
   */
  injectIntoRouter(candidate: RoutingCandidate, intentType: string): void {
    const pressure = PressureField.getCellPressure(candidate.cellId);
    const bonus = pressure?.pressureBonus ?? 0;

    const boosted: RoutingCandidate = {
      ...candidate,
      weight: Math.min(100, candidate.weight + bonus),
    };

    Router.register(intentType, boosted);
  },

  /**
   * Refresh pressure cho tất cả candidates đang đăng ký trong router.
   * Gọi định kỳ (ví dụ: mỗi 30s) để router weight luôn phản ánh
   * trạng thái mạng sợi thật.
   */
  refreshRouterWeights(): void {
    const snapshot = PressureField.getSnapshot(true);
    const registered = Router.getRegisteredCells();

    for (const [intentType, candidates] of registered) {
      for (const candidate of candidates) {
        const pressure = snapshot.cells.find(c => c.cellId === candidate.cellId);
        if (!pressure) continue;

        // Giữ base weight (không tăng mãi) — chỉ cộng bonus mới nhất
        // Assumption: candidate.weight là base weight ban đầu (không có bonus)
        // Không thể biết base weight sau khi đã inject → chỉ re-inject nếu bonus tăng
        const newWeight = Math.min(100, candidate.weight + pressure.pressureBonus);
        if (newWeight !== candidate.weight) {
          Router.register(intentType, { ...candidate, weight: newWeight });
        }
      }
    }
  },

  /**
   * Tóm tắt trạng thái pressure để UEI Conductor đọc.
   * Đây là 1 trong các inputs của UEI consciousness field.
   */
  getUEIInput(): {
    hasSignificantPressure: boolean;
    hotCell: string | null;
    dominantPatternCount: number;
    pressureEntropy: number;  // 0=tập trung vào 1 cell, 1=đều khắp
  } {
    const snapshot = PressureField.getSnapshot();

    // Entropy: đo mức độ phân tán của pressure
    const total = snapshot.cells.reduce((s, c) => s + c.normalizedPressure, 0);
    const entropy = total > 0
      ? -snapshot.cells
          .filter(c => c.normalizedPressure > 0)
          .map(c => c.normalizedPressure / total)
          .reduce((s, p) => s + p * Math.log2(p), 0) / Math.log2(Math.max(2, snapshot.cells.length))
      : 0;

    const dominantCount = snapshot.cells.reduce((s, c) => s + c.dominantCount, 0);

    return {
      hasSignificantPressure: snapshot.maxPressure > 0.3,
      hotCell: snapshot.hotCell,
      dominantPatternCount: dominantCount,
      pressureEntropy: Math.max(0, Math.min(1, entropy)),
    };
  },
};
