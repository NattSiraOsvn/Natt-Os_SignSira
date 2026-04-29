import { EventBus } from '../../../../../core/events/event-bus';

// SmartLink wire — Điều 6 Hiến Pháp v5.0
import { publishWarrantySignal } from '../../ports/prdwarranty-smartlink.port';
// PrdwarrantySmartLinkPort wired — signal available for cross-cell communication
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
  process(input: WarrantyInput): WarrantyResult | undefined {
    const { productId, issueType, purchaseDate, reportDate } = input;
    const daysUsed    = Math.floor((reportDate - purchaseDate) / 86400000);
    const maxDays     = WARRANTY_DAYS[issueType];
    const withinPeriod = daysUsed <= maxDays;

    let status: WarrantyStatus = withinPeriod ? 'active' : 'expired';
    let action  = '';
    let isCritical = false;

    if (!withinPeriod) {
      action = 'het bao hanh — bao gia sua chua';
    } else if (issueType === 'stone') {
      // Stone loss = CRITICAL — có thể liên quan đến gian lận
      isCritical = true;
      status     = 'repair';
      action     = 'CRITICAL: Kim cuong co van de — kiem tra dich danh ngay';
      EventBus.emit('cell.metric', {
        cell: 'prdwarranty-cell', metric: 'warranty.anomaly',
        value: 1, confidence: 0.95,
        productId, issueType: 'stone',
      });
    } else if (issueType === 'metal') {
      status = 'repair';
      action = 'gui xuong sua chua — hoan tra trong 7 ngay';
    } else {
      status = 'repair';
      action = 'kiem tra va sua chua';
    }

    EventBus.emit('cell.metric', {
      cell: 'prdwarranty-cell', metric: 'warranty.claim',
      value: 1, confidence: 0.9,
      productId, issueType, withinPeriod, isCritical,
    });

    return { productId, status, action, isCritical, daysUsed, withinPeriod, confidence: 0.9 };
  }
}
