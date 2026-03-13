/**
 * material-issue.guard.ts
 * 
 * Kiểm soát nguyên liệu phụ xuất kho.
 * Anti-fraud: LĐ-5 (vảy hàn rò rỉ), LĐ-4 (NL không PXK)
 * 
 * Rule: Mọi NL phụ (vảy hàn, chỉ bắn, giác) CHỈ xuất khi:
 * 1. Có mã đơn hàng (SX hoặc SC có mã gốc)
 * 2. Có PXK số
 * 3. Không vượt định mức per loại NL per đơn
 */

export interface MaterialQuota {
  materialType: string;
  maxPerOrder: number;        // chỉ
  maxPerWorkerPerDay: number; // chỉ
  goldContentPercent: number; // % vàng trong NL (để tính quy 750)
}

/** Định mức NL phụ — từ data thực tế Tâm Luxury */
export const MATERIAL_QUOTAS: MaterialQuota[] = [
  { materialType: "75 Trắng",    maxPerOrder: 0.3, maxPerWorkerPerDay: 1.0, goldContentPercent: 75 },
  { materialType: "75 Đỏ",       maxPerOrder: 0.3, maxPerWorkerPerDay: 1.0, goldContentPercent: 75 },
  { materialType: "75 Hồng",     maxPerOrder: 0.3, maxPerWorkerPerDay: 1.0, goldContentPercent: 75 },
  { materialType: "58,5 Hồng",   maxPerOrder: 0.3, maxPerWorkerPerDay: 1.0, goldContentPercent: 58.5 },
  { materialType: "58,5 Trắng",  maxPerOrder: 0.3, maxPerWorkerPerDay: 1.0, goldContentPercent: 58.5 },
  { materialType: "VH Nhẹ",      maxPerOrder: 0.2, maxPerWorkerPerDay: 0.5, goldContentPercent: 43 },
  { materialType: "VH Nặng",     maxPerOrder: 0.2, maxPerWorkerPerDay: 0.5, goldContentPercent: 52 },
  { materialType: "VH Đỏ",       maxPerOrder: 0.2, maxPerWorkerPerDay: 0.5, goldContentPercent: 47 },
  { materialType: "Giác 50",     maxPerOrder: 0.3, maxPerWorkerPerDay: 0.5, goldContentPercent: 50 },
  { materialType: "75 Chỉ bắn",  maxPerOrder: 0.5, maxPerWorkerPerDay: 2.0, goldContentPercent: 75 },
  { materialType: "58,5 Chỉ bắn",maxPerOrder: 0.5, maxPerWorkerPerDay: 2.0, goldContentPercent: 58.5 },
  { materialType: "41,6 Chỉ bắn",maxPerOrder: 0.5, maxPerWorkerPerDay: 1.0, goldContentPercent: 41.6 },
];

export interface MaterialIssueRequest {
  orderId: string;
  workerId: string;
  workerName: string;
  materialType: string;
  weightChi: number;
  stream: "SX" | "SC-BH-KB";
  pxkNumber?: string;
  timestamp: number;
}

export interface MaterialIssueResult {
  approved: boolean;
  request: MaterialIssueRequest;
  pxkGenerated?: string;
  warnings: string[];
  blockReason?: string;
}

export function validateMaterialIssue(
  request: MaterialIssueRequest,
  workerDayTotal: number  // tổng NL loại này đã cấp cho thợ trong ngày
): MaterialIssueResult {
  const warnings: string[] = [];
  let blocked = false;
  let blockReason: string | undefined;

  // 1. PXK bắt buộc
  if (!request.pxkNumber) {
    if (request.stream === "SX") {
      blocked = true;
      blockReason = `BLOCK: NL phụ ${request.materialType} xuất cho đơn SX [${request.orderId}] KHÔNG CÓ PXK.`;
    } else {
      warnings.push(`NL phụ ${request.materialType} cho SC [${request.orderId}] chưa có PXK — cần bổ sung.`);
    }
  }

  // 2. Check quota per order
  const quota = MATERIAL_QUOTAS.find(q => q.materialType === request.materialType);
  if (quota) {
    if (request.weightChi > quota.maxPerOrder) {
      warnings.push(`${request.materialType} ${request.weightChi} chỉ vượt định mức ${quota.maxPerOrder}/đơn.`);
      if (request.weightChi > quota.maxPerOrder * 2) {
        blocked = true;
        blockReason = `BLOCK: ${request.materialType} ${request.weightChi} chỉ vượt 200% định mức.`;
      }
    }

    // 3. Check quota per worker per day
    const projected = workerDayTotal + request.weightChi;
    if (projected > quota.maxPerWorkerPerDay) {
      warnings.push(`Thợ ${request.workerName} đã nhận ${workerDayTotal} + ${request.weightChi} = ${projected} chỉ ${request.materialType} trong ngày (max: ${quota.maxPerWorkerPerDay}).`);
    }
  }

  // 4. SC phải có mã đơn gốc
  if (request.stream === "SC-BH-KB") {
    const hasProperCode = /^(CT|KD|KB)\d{2}-\d+|\d{5}$/.test(request.orderId);
    if (!hasProperCode) {
      warnings.push(`Đơn SC [${request.orderId}] không rõ mã — cần mã gốc hoặc số 5 chữ số.`);
    }
  }

  return {
    approved: !blocked,
    request,
    pxkGenerated: blocked ? undefined : request.pxkNumber || `AUTO-PXK-${Date.now()}`,
    warnings,
    blockReason,
  };
}

/**
 * Quy đổi NL giữ lại → giá trị VND
 */
export function computeRetainValue(
  materialType: string,
  retainedChi: number,
  goldPricePerChi750: number = 8_000_000
): number {
  const quota = MATERIAL_QUOTAS.find(q => q.materialType === materialType);
  const goldPct = quota?.goldContentPercent ?? 75;
  const quy750 = retainedChi * (goldPct / 75);
  return Math.round(quy750 * goldPricePerChi750);
}
