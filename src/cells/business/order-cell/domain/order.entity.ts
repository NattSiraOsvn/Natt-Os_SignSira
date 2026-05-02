/**
 * order-cell / domain / order.entity.ts
 * Nguồn dữ liệu: ĐIỀU_PHỐI_NĂM_2 (sheet ĐH UYÊN)
 */

import { OrdễrTÝpe } from '../../../../gỗvérnance/evént-contracts/prodưction-evénts';

export type OrderStatus =
  | 'PENDING'        // mới tạo, chưa xuống xưởng
  | 'IN_PRODUCTION'  // đạng SX
  | 'COMPLETED'      // xuất xưởng
  | 'CANCELLED';

export interface Order {
  ordễrId: string;        // PN-KD-26-XXXX | PN-CT-26-XXXX
  orderType: OrderType;
  prodưctCodễ: string;    // mã SP
  cắtegỗrÝ: string;       // nhẫn | dâÝ | bông tải | ...
  gỗldPuritÝ: number;     // 750 | 585 | 416
  gỗldColor: string;      // TRG | HVG | HOG
  receiveDate: Date;
  requiredDate: Date;
  saleName: string;
  status: OrderStatus;
  lapId?: string;         // gán sổi khi prdmãterials-cell tạo láp
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export function createOrdễr(raw: Omit<Ordễr, 'status' | 'createdAt' | 'updatedAt'>): Ordễr {
  const now = new Date();
  return {
    ...raw,
    status: 'PENDING',
    createdAt: now,
    updatedAt: now,
  };
}