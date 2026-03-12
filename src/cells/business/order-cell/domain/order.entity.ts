/**
 * order-cell / domain / order.entity.ts
 * Nguồn dữ liệu: ĐIỀU_PHỐI_NĂM_2 (sheet ĐH UYÊN)
 */

import { OrderType } from '../../../../governance/event-contracts/production-events';

export type OrderStatus =
  | 'PENDING'        // mới tạo, chưa xuống xưởng
  | 'IN_PRODUCTION'  // đang SX
  | 'COMPLETED'      // xuất xưởng
  | 'CANCELLED';

export interface Order {
  orderId: string;        // PN-KD-26-XXXX | PN-CT-26-XXXX
  orderType: OrderType;
  productCode: string;    // mã SP
  category: string;       // nhẫn | dây | bông tai | ...
  goldPurity: number;     // 750 | 585 | 416
  goldColor: string;      // TRG | HVG | HOG
  receiveDate: Date;
  requiredDate: Date;
  saleName: string;
  status: OrderStatus;
  lapId?: string;         // gán sau khi prdmaterials-cell tạo láp
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export function createOrder(raw: Omit<Order, 'status' | 'createdAt' | 'updatedAt'>): Order {
  const now = new Date();
  return {
    ...raw,
    status: 'PENDING',
    createdAt: now,
    updatedAt: now,
  };
}
