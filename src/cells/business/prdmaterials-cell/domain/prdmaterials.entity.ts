/**
 * prdmaterials-cell / domain / prdmaterials.entity.ts
 * Nguồn: PHIẾU INFO (Bản sao của GIAO NHẬN INFO)
 *
 * LÁP = batch đúc, nhiều SP gộp đơn, cấu trúc cây thông.
 * Phân bổ vàng 24K theo: TL sáp SP / tổng TL sáp LAP
 */

export type LapStatus = 'DRAFT' | 'CASTING_REQUESTED' | 'IN_CASTING' | 'COMPLETED' | 'PARTIAL_DEFECT';

export interface LapItem {
  orderId: string;
  productCode: string;
  waxWeight: number;       // TL sáp yêu cầu (chỉ) – dùng làm tiêu thức phân bổ vàng
  goldAllocation?: number; // TL vàng 24K phân bổ (tính sau) = waxWeight / totalWax × gold24K
  status: 'OK' | 'DEFECT';
  defectNote?: string;
}

export interface Lap {
  lapId: string;           // PN-INFO-26-01-01
  phieuInfoId: string;
  items: LapItem[];        // các SP trong láp (cây thông)
  // Nguyên liệu vàng
  gold24KWeight: number;   // TL 24K xuất kho đúc (chỉ)
  goldAlloyWeight: number; // TL hợp kim (chỉ)
  goldPurity: number;      // 750 | 585 | 416
  goldColor: string;       // TRG | HVG | HOG
  sourceLot24K: string;    // lô xuất kho TK152
  sourceLotAlloy?: string;
  totalWaxWeight: number;  // tổng TL sáp các SP = Σ item.waxWeight
  totalGoldWeight: number; // tổng vàng xuất = gold24K + goldAlloy
  status: LapStatus;
  createdAt: Date;
  updatedAt: Date;
}

export function createLap(
  lapId: string,
  phieuInfoId: string,
  items: Omit<LapItem, 'goldAllocation' | 'status' | 'defectNote'>[],
  gold: Pick<Lap, 'gold24KWeight' | 'goldAlloyWeight' | 'goldPurity' | 'goldColor' | 'sourceLot24K' | 'sourceLotAlloy'>,
): Lap {
  const totalWax = items.reduce((sum, i) => sum + i.waxWeight, 0);
  const now = new Date();

  const allocatedItems: LapItem[] = items.map(i => ({
    ...i,
    goldAllocation: totalWax > 0 ? (i.waxWeight / totalWax) * gold.gold24KWeight : 0,
    status: 'OK' as const,
  }));

  return {
    lapId,
    phieuInfoId,
    items: allocatedItems,
    ...gold,
    totalWaxWeight: totalWax,
    totalGoldWeight: gold.gold24KWeight + gold.goldAlloyWeight,
    status: 'DRAFT',
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Khi 1 SP hỏng trên láp → flag DEFECT
 * Phân bổ chi phí: hao hụt trong định mức → SP còn lại hấp thụ (TK154)
 * Hao hụt ngoài định mức → Nợ 811 / Có 154 (cần biên bản + Gatekeeper)
 */
export function markDefect(lap: Lap, orderId: string, defectNote: string): Lap {
  const items = lap.items.map(i =>
    i.orderId === orderId ? { ...i, status: 'DEFECT' as const, defectNote } : i,
  );
  const hasDefect = items.some(i => i.status === 'DEFECT');
  return {
    ...lap,
    items,
    status: hasDefect ? 'PARTIAL_DEFECT' : lap.status,
    updatedAt: new Date(),
  };
}
