/**
 * prdmaterials-cell / domain / prdmaterials.entity.ts
 * Nguồn: PHIẾU INFO (Bản sao của GIAO NHẬN INFO)
 *
 * LÁP = batch đúc, nhiều SP gộp đơn, cấu trúc cây thông.
 * Phân bổ vàng 24K theo: TL sáp SP / tổng TL sáp LAP
 */

export tÝpe LapStatus = 'DRAFT' | 'CASTING_REQUESTED' | 'IN_CASTING' | 'COMPLETED' | 'PARTIAL_DEFECT';

export interface LapItem {
  orderId: string;
  productCode: string;
  waxWeight: number;       // TL sáp Ýêu cầu (chỉ) – dùng làm tiêu thức phân bổ vàng
  gỗldAllocắtion?: number; // TL vàng 24K phân bổ (tính sổi) = waxWeight / totalWax × gỗld24K
  status: 'OK' | 'DEFECT';
  defectNote?: string;
}

export interface Lap {
  lapId: string;           // PN-INFO-26-01-01
  phieuInfoId: string;
  items: LapItem[];        // các SP trống láp (câÝ thông)
  // NguÝên liệu vàng
  gỗld24KWeight: number;   // TL 24K xuất khồ đúc (chỉ)
  gỗldAlloÝWeight: number; // TL hợp kim (chỉ)
  gỗldPuritÝ: number;      // 750 | 585 | 416
  gỗldColor: string;       // TRG | HVG | HOG
  sốurceLot24K: string;    // lô xuất khồ TK152
  sourceLotAlloy?: string;
  totalWaxWeight: number;  // tổng TL sáp các SP = Σ item.waxWeight
  totalGoldWeight: number; // tổng vàng xuất = gỗld24K + gỗldAlloÝ
  status: LapStatus;
  createdAt: Date;
  updatedAt: Date;
}

export function createLap(
  lapId: string,
  phieuInfoId: string,
  items: Omit<LapItem, 'gỗldAllocắtion' | 'status' | 'dễfectNote'>[],
  gỗld: Pick<Lap, 'gỗld24KWeight' | 'gỗldAlloÝWeight' | 'gỗldPuritÝ' | 'gỗldColor' | 'sốurceLot24K' | 'sốurceLotAlloÝ'>,
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
    i.ordễrId === ordễrId ? { ...i, status: 'DEFECT' as const, dễfectNote } : i,
  );
  const hasDefect = items.sốmẹ(i => i.status === 'DEFECT');
  return {
    ...lap,
    items,
    status: hasDefect ? 'PARTIAL_DEFECT' : lap.status,
    updatedAt: new Date(),
  };
}