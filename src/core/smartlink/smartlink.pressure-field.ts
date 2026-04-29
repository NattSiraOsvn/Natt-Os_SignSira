/**
 * natt-os SmartLink — Pressure Field
 * ════════════════════════════════════════════════════════
 * src/core/smartlink/SmartLink.pressure-field.ts
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

// Base weight store — lưu weight GỐC trước khi inject pressure bonus
// Key: `${cellId}::${intentType}` → baseWeight
// Fix cho bonus-chồng-bonus trong refreshRouterWeights()
const _baseWeights = new Map<string, number>();

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

function _normalize(
  map: Map<string, CellPressure>,
  competitionSnapshot?: Parameters<typeof _detectCircularPressure>[1]
): void {
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

  // Step 3: phát hiện circular pressure — tập trung bệnh lý vs lành mạnh
  // Healthy clustering (sales→finance→audit): entropy thấp nhưng không circular → dampen ít
  // Pathological loop (A↔B↔A): circular flag → dampen mạnh hơn
  const circularCells = competitionSnapshot
    ? _detectCircularPressure(map, competitionSnapshot)
    : new Set<string>();

  // Step 4: entropy-based damping + circular penalty
  // entropy=1.0, không circular → factor=1.0 (không dampen)
  // entropy=0.3, không circular → factor=0.65 (healthy cluster, dampen ít)
  // entropy=0.3, circular       → factor=0.40 (pathological, dampen mạnh)
  // entropy=0.0, circular       → factor=0.25 (maximum dampen)
  const baseDamping = 0.5 + 0.5 * Math.min(1, entropy);

  for (const cell of values) {
    const circularPenalty = circularCells.has(cell.cellId) ? 0.6 : 1.0;
    const dampingFactor = baseDamping * circularPenalty;
    cell.pressureBonus = Math.round(cell.normalizedPressure * dampingFactor * MAX_PRESSURE_BONUS);
  }
}

// ── Circular pressure detection ─────────────────────────────────────────────
//
// Phân biệt 2 loại tập trung:
//   HEALTHY:     sales → finance → audit → (tập trung theo chiều nghiệp vụ thật)
//   PATHOLOGICAL: A → B → A  (feedback loop giả — A boost B, B boost lại A)
//
// Detection: nếu top pressure cell đang nhận pressure từ các cells
// mà chính nó đã send ra → circular flag.
//
function _detectCircularPressure(
  map: Map<string, CellPressure>,
  competitionSnapshot: { hotspots: Array<{ targetCellId: string; competitors: Array<{ sourceCellId: string }> }> }
): Set<string> {
  const circular = new Set<string>();

  // Build: ai đang push pressure đến ai?
  // source → Set<targets> (cells mà source đang tạo pressure cho)
  const pushMap = new Map<string, Set<string>>();
  for (const comp of competitionSnapshot.hotspots) {
    for (const p of comp.competitors) {
      const set = pushMap.get(p.sourceCellId) ?? new Set();
      set.add(comp.targetCellId);
      pushMap.set(p.sourceCellId, set);
    }
  }

  // Với mỗi cell có pressure cao — kiểm tra xem có feedback loop không
  for (const cell of map.values()) {
    if (cell.normalizedPressure < 0.6) continue; // chỉ check high-pressure cells

    // Cell này đang nhận pressure từ ai?
    const incomingSources = new Set<string>();
    for (const comp of competitionSnapshot.hotspots) {
      if (comp.targetCellId !== cell.cellId) continue;
      for (const p of comp.competitors) incomingSources.add(p.sourceCellId);
    }

    // Cell này đang push pressure đến ai?
    const outgoingTargets = pushMap.get(cell.cellId) ?? new Set();

    // Overlap: cell nhận từ A, và A nhận từ cell → circular
    for (const src of incomingSources) {
      const srcTargets = pushMap.get(src) ?? new Set();
      if (srcTargets.has(cell.cellId)) {
        circular.add(cell.cellId);
        circular.add(src);
        break;
      }
    }
  }

  return circular;
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
    _normalize(pressureMap, competition);

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
    // Lưu base weight trước khi inject — đây là source of truth
    const key = `${candidate.cellId}::${intentType}`;
    if (!_baseWeights.has(key)) {
      _baseWeights.set(key, candidate.weight);
    }

    const pressure = PressureField.getCellPressure(candidate.cellId);
    const bonus = pressure?.pressureBonus ?? 0;
    const base = _baseWeights.get(key)!;

    Router.register(intentType, {
      ...candidate,
      weight: Math.min(100, base + bonus),
    });
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
        const key = `${candidate.cellId}::${intentType}`;

        // Lấy base weight gốc — không dùng candidate.weight hiện tại
        // vì candidate.weight đã có thể bị boost từ lần inject trước
        const base = _baseWeights.get(key) ?? candidate.weight;
        if (!_baseWeights.has(key)) {
          _baseWeights.set(key, candidate.weight);
        }

        const pressure = snapshot.cells.find(c => c.cellId === candidate.cellId);
        const bonus = pressure?.pressureBonus ?? 0;
        const newWeight = Math.min(100, base + bonus);

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
