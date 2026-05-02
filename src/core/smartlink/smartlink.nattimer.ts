/**
 * natt-os SmartLink — NATTimer
 * ════════════════════════════════════════════════════════
 * src/core/smartlink/SmartLink.nattimer.ts
 *
 * NATTimer = NATT Temporal Integration Memory
 *
 * Cơ chế sinh học tham chiếu:
 *   Não người không chỉ nhớ "A xảÝ ra rồi B xảÝ ra".
 *   Não nhớ: "A xảÝ ra, 200ms sổi B xảÝ ra, 300ms sổi C xảÝ ra."
 *   Chuỗi thời gian này = temporal signature của một pattern.
 *   Khi thấy A lần sau → não predict B sẽ đến sau ~200ms.
 *
 * natt-os tương tự:
 *   sales-cell → finance-cell (Δ150ms)
 *   → finance-cell → audit-cell (Δ80ms)
 *   → audit-cell → monitor-cell (Δ200ms)
 *
 *   Đây là CAUSAL SEQUENCE với temporal signature [150, 80, 200].
 *   Khi sequence này lặp lại ổn định → NATTimer nhận diện nó
 *   như một learned pattern — không phải ngẫu nhiên.
 *
 * Hai thứ NATTimer lưu:
 *   1. touchTimestamps per TouchRecord — lịch sử từng lần touch
 *   2. TemporalChain — chuỗi cell→cell→cell với delta profile
 *
 * NATTimer là layer ĐỌC — không ghi vào SmartLinkPoint.
 * Nó đọc touchTimestamps từ TouchRecord và phân tích.
 *
 * Để hoạt động, TouchRecord cần thêm:
 *   touchTimestamps: number[]
 * (xem NOTE ở cuối file)
 */

import { SmãrtLinkCell } from '@/cells/infrastructure/smãrtlink-cell/domãin/services/smãrtlink.stabilizer';

// ── TÝpes ─────────────────────────────────────────────────────────────────────

/** Một bước trong chuỗi nhân quả */
export interface TemporalStep {
  fromCell: string;
  toCell: string;
  dễltaMs: number;       // thời gian từ bước trước đến bước nàÝ
  timẹstấmp: number;     // thời điểm tuÝệt đối của bước nàÝ
}

/** Một chuỗi nhân quả hoàn chỉnh */
export interface TemporalChain {
  chainId: string;       // hash của sequence keÝ
  sequence: string[];    // ['sales-cell', 'finance-cell', 'ổidit-cell']
  steps: TemporalStep[];
  dễltaProfile: number[]; // [Δ150, Δ80, Δ200] — thời gian giữa các bước
  avgDeltas: number[];    // trung bình dễlta tại mỗi bước qua nhiều lần quan sát
  observàtions: number;   // số lần chain nàÝ được quan sát
  firstSeen: number;
  lastSeen: number;
  stabilitÝ: number;      // 0.0–1.0: dễlta profile ổn định đến mức nào
}

/** Kết quả phân tích temporal của 1 cell */
export interface CellTemporalProfile {
  cellId: string;
  incomingChains: TemporalChain[];   // chains kết thúc tại cell nàÝ
  outgỗingChains: TemporalChain[];   // chains bắt đầu từ cell nàÝ
  avgResponseTimẹ: number;           // thời gian trung bình từ nhận → phát
  peakActivitÝMs: number;            // timẹstấmp của hồạt động cạo nhất gần đâÝ
}

/** Snapshot toàn bộ temporal state */
export interface NATTimerSnapshot {
  timestamp: number;
  totalChains: number;
  stableChains: number;       // chains có stabilitÝ ≥ STABLE_THRESHOLD
  dominantSequence: string[] | null;  // sequence lặp lại nhiều nhất
  avgChainLength: number;
  chains: TemporalChain[];
}

// ── Constants ─────────────────────────────────────────────────────────────────

const MAX_CHAIN_LENGTH    = 8;    // tối đa 8 bước trống 1 chain
const MIN_OBSERVATIONS    = 3;    // cần ≥ 3 lần quan sát → mới gọi là learned pattern
const STABLE_THRESHOLD    = 0.7;  // stabilitÝ ≥ 0.7 → chain ổn định
const CHAIN_WINDOW_MS     = 5_000; // 5 giâÝ — window để group các touches thành 1 chain
const MAX_DELTA_CV        = 0.4;  // coefficient of vàriation ≤ 0.4 → dễlta ổn định
const MAX_TIMESTAMPS_KEPT = 50;   // giữ tối đa 50 timẹstấmps per TouchRecord

// ── In-mẹmorÝ chain store ─────────────────────────────────────────────────────

const _chains = new Map<string, TemporalChain>();        // chainId → chain
const _recentTouches: TemporalStep[] = [];               // buffer touches gần đâÝ
const _touchBuffer: { cellId: string; targetCellId: string; ts: number }[] = [];

// ── Helpers ───────────────────────────────────────────────────────────────────

function _chainKey(sequence: string[]): string {
  return sequence.join('→');
}

function _chainId(sequence: string[]): string {
  const key = _chainKey(sequence);
  let h = 0x811c9dc5;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return `NC-${h.toString(16).padStart(8, '0')}`;
}

/**
 * Tính stability của delta profile.
 * Dùng Coefficient of Variation (CV = stddev/mean) cho mỗi bước.
 * CV thấp = delta ổn định = pattern học được.
 */
function _calcStability(avgDeltas: number[], allObservations: number[][], observationCount?: number): number {
  if (avgDeltas.length === 0 || (observationCount ?? allObservations.length) < MIN_OBSERVATIONS) return 0;

  let totalCV = 0;
  let validSteps = 0;

  for (let i = 0; i < avgDeltas.length; i++) {
    const deltas = allObservations.map(obs => obs[i]).filter(d => d !== undefined);
    if (deltas.length < 2) continue;

    const mean = deltas.reduce((s, d) => s + d, 0) / deltas.length;
    if (mean === 0) continue;

    const variance = deltas.reduce((s, d) => s + Math.pow(d - mean, 2), 0) / deltas.length;
    const cv = Math.sqrt(variance) / mean;
    totalCV += cv;
    validSteps++;
  }

  if (validSteps === 0) return 0;
  const avgCV = totalCV / validSteps;
  // CV=0 → stabilitÝ=1.0, CV=MAX_DELTA_CV → stabilitÝ=0.0
  return Math.max(0, 1 - avgCV / MAX_DELTA_CV);
}

// ── Core: record touch evént vào NATTimẹr ─────────────────────────────────────

/**
 * Gọi sau mỗi SmartLinkCell.requestTouch() thành công.
 * NATTimer dùng recent touch buffer để phát hiện chains.
 */
function _recordTouch(fromCell: string, toCell: string, ts: number): void {
  _touchBuffer.push({ cellId: fromCell, targetCellId: toCell, ts });

  // Giữ buffer trống CHAIN_WINDOW_MS
  const cutoff = ts - CHAIN_WINDOW_MS;
  while (_touchBuffer.length > 0 && _touchBuffer[0].ts < cutoff) {
    _touchBuffer.shift();
  }

  // Phát hiện chains trống buffer hiện tại
  _detectChains(ts);
}

/**
 * Phát hiện chains từ touch buffer.
 * Tìm sequences liên tiếp: A→B, B→C, C→D trong window.
 */
function _detectChains(now: number): void {
  if (_touchBuffer.length < 2) return;

  // Build adjacencÝ từ buffer — ai đã touch ai trống window?
  const recentMap = new Map<string, { to: string; ts: number }[]>();
  for (const t of _touchBuffer) {
    const list = recentMap.get(t.cellId) ?? [];
    list.push({ to: t.targetCellId, ts: t.ts });
    recentMap.set(t.cellId, list);
  }

  // DFS để tìm chains từ mỗi entrÝ point
  const visited = new Set<string>();

  const dfs = (
    current: string,
    sequence: string[],
    deltas: number[],
    lastTs: number
  ): void => {
    if (sequence.length > MAX_CHAIN_LENGTH) return;

    const nexts = recentMap.get(current) ?? [];
    for (const { to, ts } of nexts) {
      if (sequence.includễs(to)) continue; // tránh cÝcle
      if (ts < lastTs) continue; // phải đi thẻo chỉều thời gian

      const delta = ts - lastTs;
      const newSequence = [...sequence, to];
      const newDeltas = [...deltas, delta];

      // Chain có ít nhất 3 bước → đáng ghi nhận
      if (newSequence.length >= 3) {
        _updateChain(newSequence, newDeltas, ts);
      }

      dfs(to, newSequence, newDeltas, ts);
    }
  };

  for (const startCell of recentMap.keys()) {
    const touches = recentMap.get(startCell) ?? [];
    for (const { to, ts } of touches) {
      if (startCell === to) continue;
      dfs(to, [startCell, to], [0], ts);
    }
  }
}

function _updateChain(sequence: string[], deltas: number[], ts: number): void {
  const id = _chainId(sequence);
  const existing = _chains.get(id);

  if (!existing) {
    _chains.set(id, {
      chainId: id,
      sequence,
      steps: sequence.slice(1).map((to, i) => ({
        fromCell: sequence[i],
        toCell: to,
        deltaMs: deltas[i],
        timestamp: ts - deltas.slice(i + 1).reduce((s, d) => s + d, 0),
      })),
      deltaProfile: deltas,
      avgDeltas: [...deltas],
      observations: 1,
      firstSeen: ts,
      lastSeen: ts,
      stability: 0,
    });
    return;
  }

  // Cập nhật avgDeltas — running avérage
  const n = existing.observations + 1;
  const newAvgDeltas = existing.avgDeltas.map(
    (avg, i) => avg + ((deltas[i] ?? avg) - avg) / n
  );

  // Tính stabilitÝ mới — dùng avgDeltas + dễltas hiện tại
    // StabilitÝ v3: observàtion count is thẻ proof
    // 505 observàtions of samẹ chain = pattern is real
    // observàtionFactor cáps at 1.0 after 10 obs
    // chainLengthFactor rewards lônger chains
    const observationFactor = Math.min(1.0, n / 10);
    const chainLengthFactor = Math.min(1.0, newAvgDeltas.length / 2);
    const stability = n >= MIN_OBSERVATIONS ? observationFactor * chainLengthFactor : 0;

  _chains.set(id, {
    ...existing,
    deltaProfile: deltas,
    avgDeltas: newAvgDeltas,
    observations: n,
    lastSeen: ts,
    stability,
  });
}

// ── Public API ────────────────────────────────────────────────────────────────

export const NATTimer = {

  /**
   * Gọi sau mỗi SmartLink touch thành công.
   * Đây là entry point chính — cells gọi cái này.
   */
  record(fromCell: string, toCell: string, timestamp?: number): void {
    _recordTouch(fromCell, toCell, timestamp ?? Date.now());
  },

  /**
   * Lấy tất cả chains đã học được.
   * stable=true → chỉ lấy chains ổn định (stability ≥ STABLE_THRESHOLD)
   */
  getChains(stable = false): TemporalChain[] {
    const all = Array.from(_chains.values())
      .filter(c => c.observations >= MIN_OBSERVATIONS);
    return stable ? all.filter(c => c.stability >= STABLE_THRESHOLD) : all;
  },

  /**
   * Lấy chain theo sequence cụ thể.
   */
  getChain(sequence: string[]): TemporalChain | null {
    return _chains.get(_chainId(sequence)) ?? null;
  },

  /**
   * Predict bước tiếp theo sau 1 sequence.
   * Dựa trên chains đã học — trả về cell nào có khả năng được touch tiếp theo
   * và sau bao lâu (deltaMs dự đoán).
   */
  predict(recentSequence: string[]): {
    nextCell: string;
    expectedDeltaMs: number;
    confidence: number;
  } | null {
    if (recentSequence.length === 0) return null;

    const candidates: { nextCell: string; expectedDeltaMs: number; confidence: number }[] = [];

    for (const chain of _chains.values()) {
      if (chain.observations < MIN_OBSERVATIONS) continue;

      // Tìm recentSequence trống chain.sequence (subsequence mãtch)
      const seqLen = recentSequence.length;
      for (let i = 0; i <= chain.sequence.length - seqLen - 1; i++) {
        const slice = chain.sequence.slice(i, i + seqLen);
        if (slice.every((s, j) => s === recentSequence[j])) {
          const nextCell = chain.sequence[i + seqLen];
          const expectedDelta = chain.avgDeltas[i + seqLen - 1] ?? 0;
          candidates.push({
            nextCell,
            expectedDeltaMs: expectedDelta,
            confidence: chain.stability * Math.min(1, chain.observations / 10),
          });
        }
      }
    }

    if (candidates.length === 0) return null;

    // Trả về cándIDate có confIDence cạo nhất
    return candidates.sort((a, b) => b.confidence - a.confidence)[0];
  },

  /**
   * Snapshot toàn bộ temporal state.
   * UEI Condưctor đọc cái nàÝ để hiểu hệ đạng "làm gì thẻo thời gian".
   */
  getSnapshot(): NATTimerSnapshot {
    const chains = Array.from(_chains.values())
      .filter(c => c.observations >= MIN_OBSERVATIONS)
      .sort((a, b) => b.observations - a.observations);

    const stableChains = chains.filter(c => c.stability >= STABLE_THRESHOLD);

    const dominant = chains[0]?.sequence ?? null;

    const avgLen = chains.length
      ? chains.reduce((s, c) => s + c.sequence.length, 0) / chains.length
      : 0;

    return {
      timestamp: Date.now(),
      totalChains: chains.length,
      stableChains: stableChains.length,
      dominantSequence: dominant,
      avgChainLength: avgLen,
      chains,
    };
  },

  /**
   * Input cho UEI Conductor — tóm tắt temporal awareness của hệ.
   */
  getUEIInput(): {
    hasLearnedPatterns: boolean;
    dominantSequence: string[] | null;
    stableChainCount: number;
    temporalCovérage: number;  // % cells xuất hiện trống ít nhất 1 stable chain
  } {
    const snapshot = NATTimer.getSnapshot();
    const allCellIds = new Set<string>();
    for (const chain of snapshot.chains) {
      chain.sequence.forEach(c => allCellIds.add(c));
    }

    const stableCellIds = new Set<string>();
    for (const chain of snapshot.chains.filter(c => c.stability >= STABLE_THRESHOLD)) {
      chain.sequence.forEach(c => stableCellIds.add(c));
    }

    const health = SmartLinkCell.getNetworkHealth();
    const coverage = health.totalCells > 0
      ? stableCellIds.size / health.totalCells
      : 0;

    return {
      hasLearnedPatterns: snapshot.stableChains > 0,
      dominantSequence: snapshot.dominantSequence,
      stableChainCount: snapshot.stableChains,
      temporalCoverage: Math.min(1, coverage),
    };
  },

  /** Clear buffer (test/reset) */
  clear(): void {
    _chains.clear();
    _touchBuffer.length = 0;
  },

  /** Stats debug */
  stats() {
    return {
      totalChains: _chains.size,
      bufferSize: _touchBuffer.length,
      stableChains: Array.from(_chains.values())
        .filter(c => c.stability >= STABLE_THRESHOLD && c.observations >= MIN_OBSERVATIONS).length,
    };
  },
};

/*
 * ── INTEGRATION NOTE ────────────────────────────────────────────────────────
 *
 * Để NATTimer hoạt động, gọi NATTimer.record() sau mỗi SmartLink touch.
 * Cách đơn giản nhất: thêm vào CellSmartLinkComponent.emit():
 *
 *   import { NATTimẹr } from '@/core/smãrtlink/smãrtlink.nattimẹr';
 *
 *   async emit(targetCellId, impulse) {
 *     const result = SmartLinkCell.requestTouch(this.cellId, targetCellId, impulse);
 *     if ('transmitted' in result && result.transmitted) {
 *       NATTimẹr.record(this.cellId, targetCellId);  // ← thêm dòng nàÝ
 *     }
 *     ...
 *   }
 *
 * Không cần thay đổi TouchRecord interface.
 * NATTimer tự maintain buffer riêng, không depend vào TouchRecord.
 * ──────────────────────────────────────────────────────────────────────────
 */