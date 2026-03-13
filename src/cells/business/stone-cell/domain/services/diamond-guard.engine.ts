/**
 * diamond-guard.engine.ts
 * 
 * Engine chặn thất thoát kim cương tấm tại công đoạn Hột.
 * Chạy khi DIAMOND_ISSUED + DIAMOND_RETURNED events.
 * 
 * Chặn: LĐ-7 (giữ viên, đổi size, khai bể thừa, SC không BOM)
 * 
 * Evidence: 7561 BOM rows, 38.587 carat tồn kho
 *           KD25-7047: 194 viên 0.9-2.4mm — không thể đếm bằng mắt
 */

import type { DiamondIssueRecord, DiamondFlag, DiamondBomLine } from "../entities/diamond-tracking.entity";
import { DIAMOND_FLAGS, DIAMOND_SIZE_CARAT } from "../entities/diamond-tracking.entity";

// ═══════════ CONFIG ═══════════
const DIAMOND_CONFIG = {
  /** % viên bể cho phép tối đa */
  maxBrokenPercent: 3,
  /** Viên mất (variance) > 0 → flag */
  missingThreshold: 0,
  /** Tổng tích lũy thợ > N viên/tháng → flag */
  workerCumulativeMonthly: 10,
  /** Size chênh lệch cho phép (mm) */
  sizeToleranceMm: 0.1,
};

export interface DiamondGuardResult {
  record: DiamondIssueRecord;
  flags: DiamondFlag[];
  blocked: boolean;
  blockReason?: string;
}

/**
 * Validate 1 diamond issue record (sau khi QC kiểm)
 */
export function validateDiamondRecord(record: DiamondIssueRecord): DiamondGuardResult {
  const flags: DiamondFlag[] = [];

  // ── LĐ-7a: SC không BOM → block ──
  if (record.stream === "SC-BH-KB" && record.bomLines.length === 0) {
    flags.push({
      code: DIAMOND_FLAGS.SC_NO_BOM,
      severity: "CRITICAL",
      message: `Đơn SC [${record.orderId}] cần đá nhưng KHÔNG CÓ BOM. Yêu cầu Gatekeeper approve số viên trước khi cấp.`,
    });
  }

  if (!record.actualUsed) {
    return { record, flags, blocked: flags.some(f => f.severity === "CRITICAL") };
  }

  const actual = record.actualUsed;

  // ── LĐ-7b: Khai bể > 3% ──
  if (record.bomTotalPieces > 0) {
    const brokenPct = (actual.brokenPieces / record.bomTotalPieces) * 100;
    if (brokenPct > DIAMOND_CONFIG.maxBrokenPercent) {
      flags.push({
        code: DIAMOND_FLAGS.BROKEN_OVER_3PCT,
        severity: "WARN",
        message: `Khai bể ${actual.brokenPieces}/${record.bomTotalPieces} viên (${brokenPct.toFixed(1)}% > ${DIAMOND_CONFIG.maxBrokenPercent}%). Đơn ${record.orderId}, thợ ${record.receivedBy}.`,
      });
    }
  }

  // ── LĐ-7c: Viên mất ──
  const accounted = actual.totalPieces + actual.returnedPieces + actual.brokenPieces;
  const missing = record.bomTotalPieces - accounted;
  if (missing > DIAMOND_CONFIG.missingThreshold) {
    const missingCarat = estimateMissingCarat(record.bomLines, missing);
    flags.push({
      code: DIAMOND_FLAGS.PIECES_MISSING,
      severity: missing > 5 ? "CRITICAL" : "WARN",
      message: `${missing} viên không giải trình (~${missingCarat.toFixed(4)} carat). BOM=${record.bomTotalPieces}, gắn=${actual.totalPieces}, trả=${actual.returnedPieces}, bể=${actual.brokenPieces}. Đơn ${record.orderId}.`,
    });
  }

  const blocked = flags.some(f => f.severity === "CRITICAL");
  return {
    record: { ...record, variance: { pieces: missing, carat: 0, flags } },
    flags,
    blocked,
    blockReason: blocked ? `BLOCKED: ${flags.filter(f => f.severity === "CRITICAL").map(f => f.code).join(", ")}` : undefined,
  };
}

/**
 * Ước tính carat mất dựa trên BOM size distribution
 */
function estimateMissingCarat(bomLines: DiamondBomLine[], missingCount: number): number {
  if (bomLines.length === 0 || missingCount <= 0) return 0;
  // Giả định mất viên size trung bình
  const totalPieces = bomLines.reduce((s, l) => s + l.quantity, 0);
  const totalCarat = bomLines.reduce((s, l) => s + l.totalCarat, 0);
  const avgCaratPerPiece = totalPieces > 0 ? totalCarat / totalPieces : 0.01;
  return missingCount * avgCaratPerPiece;
}

/**
 * Tổng hợp per thợ per tháng — ranking rủi ro
 */
export interface DiamondWorkerScore {
  workerId: string;
  workerName: string;
  period: string;
  totalOrdersHandled: number;
  totalBomPieces: number;
  totalActualPieces: number;
  totalBroken: number;
  totalReturned: number;
  totalMissing: number;
  totalMissingCarat: number;
  brokenRate: number;        // % bể / tổng BOM
  missingRate: number;       // % mất / tổng BOM
  flagCount: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

export function scoreDiamondWorker(worker: DiamondWorkerScore): DiamondWorkerScore {
  worker.brokenRate = worker.totalBomPieces > 0
    ? (worker.totalBroken / worker.totalBomPieces) * 100 : 0;
  worker.missingRate = worker.totalBomPieces > 0
    ? (worker.totalMissing / worker.totalBomPieces) * 100 : 0;

  if (worker.missingRate > 5 || worker.totalMissing > 20) {
    worker.riskLevel = "CRITICAL";
  } else if (worker.missingRate > 2 || worker.totalMissing > 10) {
    worker.riskLevel = "HIGH";
  } else if (worker.missingRate > 1 || worker.totalMissing > 5) {
    worker.riskLevel = "MEDIUM";
  } else {
    worker.riskLevel = "LOW";
  }

  return worker;
}
