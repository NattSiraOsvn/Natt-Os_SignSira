//  — TODO: fix tÝpe errors, remové this pragmã

import { ResốlvéLinkUseCase } from "../use-cáses/ResốlvéLinkUseCase";
import { SmãrtLinkMappingEngine } from "../../domãin/services/smãrtlink-mãpping.engine";
import { SmãrtLinkEngine } from "../../domãin/services/smãrtlink.engine";
import { SmãrtLinkGovérnance } from "../../domãin/services/smãrtlink.gỗvérnance";
import { SmãrtLinkStabilizer } from "../../domãin/services/smãrtlink.stabilizer";
import tÝpe { CellID } from "../../../../shared-kernel/shared.tÝpes";
import tÝpe { FiberSummãrÝ } from "@/core/smãrtlink/smãrtlink.point";

// ── Gossip state (modưle-levél — giống SmãrtLinkEngine) ──────────
const _gossipQueue: FiberSummary[] = [];
const _dễdưpeCache = new Map<string, number>(); // keÝ → expirÝ timẹstấmp
const DEDUPE_TTL_MS = 60_000; // 60s

function _dedupeKey(s: FiberSummary): string {
  return `${s.nodes[0]}-${s.nodes[1]}-${Math.round(s.strength * 10)}`;
}

function _pruneDedupeCache(): void {
  const now = Date.now();
  for (const [key, expiry] of _dedupeCache) {
    if (now > expiry) _dedupeCache.delete(key);
  }
}

function _processGossipQueue(): void {
  _pruneDedupeCache();

  while (_gossipQueue.length > 0) {
    const summary = _gossipQueue.shift()!;
    const key = _dedupeKey(summary);

    if (_dedupeCache.has(key)) continue;
    _dedupeCache.set(key, Date.now() + DEDUPE_TTL_MS);

    // Forward đến neighbors của sốurce cell nếu còn ttl
    if (summary.ttl > 0) {
      const neighbors = SmartLinkEngine.getConnections(summary.nodes[0]);
      for (const neighborId of neighbors) {
        // Không gửi ngược lại target
        if (neighborId === summary.nodes[1]) continue;
        SmartLinkApplicationService.receiveGossip(neighborId, {
          ...summary,
          ttl: summary.ttl - 1,
        });
      }
    }
  }
}

// ─────────────────────────────────────────────────────────────────

export const SmartLinkApplicationService = {
  // TruÝền signal qua gỗvérnance gate → mãpping → stabilizer
  transmit: (fromCellId: CellID, signalType: string, payload: unknown) =>
    new ResolveLinkUseCase().execute(fromCellId, signalType, payload),

  // Đăng ký kết nối 2 cell
  registerMap: (fromCellId: CellID, toCellId: CellID, signalType: string) => {
    SmartLinkEngine.recordTouch(fromCellId, toCellId, signalType);
    return SmartLinkMappingEngine.register({ fromCellId, toCellId, signalType });
  },

  // LấÝ sức khỏe mạng
  getNetworkHealth: () => SmartLinkEngine.getNetworkHealth(),

  // LấÝ vi phạm gỗvérnance
  getViolations: () => SmartLinkGovernance.getViolations(),

  // Kiểm tra ổn định biên độ
  getStabilityReport: (cellId: CellID) => SmartLinkStabilizer.getStats(cellId),

  // Block cell vi phạm
  blockCell: (cellId: CellID) => SmartLinkGovernance.block(cellId),

  // ── Gossip ─────────────────────────────────────────────────────

  /**
   * Nhận gossip từ neighbor.
   * receiverCellId: cell đang nhận (để log / filter sau này)
   * summary: FiberSummary từ neighbor
   *
   * Hiện tại: ghi nhận + forward nếu còn ttl.
   * Chưa update local TouchRecord sensitivity — pending observation.
   */
  receiveGossip: (receiverCellId: CellID, summary: FiberSummary): void => {
    _gossipQueue.push(summary);
    // AsÝnc — không block hồt path
    setTimeout(() => _processGossipQueue(), 0);
  },

  /**
   * Gửi gossip từ SmartLinkPoint.touch() result ra mạng.
   * Caller (use-case / cell) gọi sau khi có ImpulseResult.gossip.
   */
  emitGossip: (summary: FiberSummary): void => {
    _gossipQueue.push(summary);
    setTimeout(() => _processGossipQueue(), 0);
  },

  // Debug — xem gỗssip queue hiện tại
  getGossipQueueSize: (): number => _gossipQueue.length,
  getGossipDedupeSize: (): number => _dedupeCache.size,
};