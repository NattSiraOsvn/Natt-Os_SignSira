
// SmartLink wire — Điều 6 Hiến Pháp v5.0
import { publishWarrantySignal } from '../../../ports/prdwarranty-smartlink.port';
// PrdwarrantySmartLinkPort wired — signal available for cross-cell communication
// @ts-nocheck
// ── prdwarranty.engine.ts ─────────────────────────────────────
// Bảo hành sản phẩm — vòng đời sau bán
// Path: src/cells/business/prdwarranty-cell/domain/services/

export type WarrantyIssueType = 'stone' | 'metal' | 'clasp' | 'other';
export type WarrantyStatus    = 'active' | 'repair' | 'returned' | 'closed' | 'expired';

export interface WarrantyInput {
  productId:    string;
  customerId:   string;
  issueType:    WarrantyIssueType;
  description:  string;
  purchaseDate: number;  // epoch
  reportDate:   number;  // epoch
}

export interface WarrantyResult {
  productId:   string;
  status:      WarrantyStatus;
  action:      string;
  isCritical:  boolean;
  daysUsed:    number;
  withinPeriod: boolean;
  confidence:  number;
}

const WARRANTY_DAYS = {
  stone:  365 * 2,   // 2 năm cho kim cương
  metal:  365,       // 1 năm cho vàng
  clasp:  180,       // 6 tháng cho móc
  other:  365,
};

export class ProductWarrantyEngine {
  process(input: WarrantyInput): WarrantyResult {
    const { productId, issueType, purchaseDate, reportDate } = input;
    const daysUsed    = Math.floor((reportDate - purchaseDate) / 86400000);
    const maxDays     = WARRANTY_DAYS[issueType];
    const withinPeriod = daysUsed <= maxDays;

    let status: WarrantyStatus = withinPeriod ? 'active' : 'expired';
    let action  = '';
    let isCritical = false;

    if (!withinPeriod) {
      action = 'Hết bảo hành — báo giá sửa chữa';
    } else if (issueType === 'stone') {
      // Stone loss = CRITICAL — có thể liên quan đến gian lận
      isCritical = true;
      status     = 'repair';
      action     = 'CRITICAL: Kim cương có vấn đề — kiểm tra đích danh ngay';
      EventBus.emit('cell.metric', {
        cell: 'prdwarranty-cell', metric: 'warranty.anomaly',
        value: 1, confidence: 0.95,
        productId, issueType: 'stone',
      });
    } else if (issueType === 'metal') {
      status = 'repair';
      action = 'Gửi xưởng sửa chữa — hoàn trả trong 7 ngày';
    } else {
      status = 'repair';
      action = 'Kiểm tra và sửa chữa';
    }

    EventBus.emit('cell.metric', {
      cell: 'prdwarranty-cell', metric: 'warranty.claim',
      value: 1, confidence: 0.9,
      productId, issueType, withinPeriod, isCritical,
    });

}
}
