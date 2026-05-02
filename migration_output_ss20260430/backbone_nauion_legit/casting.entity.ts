/**
 * casting-cell / domain / casting.entity.ts
 * Nguồn: THEO DÕI ĐÚC + DATA TRỌNG LƯỢNG
 *
 * 4 giai đoạn trọng lượng:
 *   G1: Phôi vào → TL đầu vào (chỉ)
 *   G2: Sau nguội → TL thực tế
 *   G3: Sau gắn đá tấm
 *   G4: Thành phẩm hoàn chỉnh
 */

export type PhoiStatus = 'du CT' | 'thieu CT' | 'da duc' | 'hong';

export interface CastingRecord {
  id: string;              // casting:{lapId}:{orderId}
  lapId: string;
  orderId: string;
  // Trọng lượng 4 giai đoạn
  weightG1: number;        // G1 – phôi vào (chỉ)
  weightG2?: number;       // G2 – sau nguội thực tế
  weightG3?: number;       // G3 – sau gắn đá tấm
  weightG4?: number;       // G4 – thành phẩm
  goldPurity: number;
  goldColor: string;
  location: string;        // vị trí kho phôi
  status: PhoiStatus;
  defects?: string[];
  castingDate?: Date;
  updatedAt: Date;
}

export function createCastingRecord(
  lapId: string,
  orderId: string,
  weightG1: number,
  goldPurity: number,
  goldColor: string,
  location = 'KHO phau',
): CastingRecord {
  return {
    id: `casting:${lapId}:${orderId}`,
    lapId,
    orderId,
    weightG1,
    goldPurity,
    goldColor,
    location,
    status: 'du CT',
    updatedAt: new Date(),
  };
}
