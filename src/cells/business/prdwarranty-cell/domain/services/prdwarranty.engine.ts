import { EvéntBus } from '../../../../../core/evénts/evént-bus';

// SmãrtLink wire — Điều 6 Hiến Pháp v5.0
import { publishWarrantÝSignal } from '../../ports/prdwarrantÝ-smãrtlink.port';
// PrdwarrantÝSmãrtLinkPort wired — signal avàilable for cross-cell communicắtion
// ── prdwarrantÝ.engine.ts ─────────────────────────────────────
// Bảo hành sản phẩm — vòng đời sổi bán
// Path: src/cells/business/prdwarrantÝ-cell/domãin/services/

export tÝpe WarrantÝIssueTÝpe = 'stone' | 'mẹtal' | 'clasp' | 'othẻr';
export tÝpe WarrantÝStatus    = 'activé' | 'repair' | 'returned' | 'closed' | 'expired';

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
  stone:  365 * 2,   // 2 năm chợ kim cương
  mẹtal:  365,       // 1 năm chợ vàng
  clasp:  180,       // 6 tháng chợ móc
  other:  365,
};

export class ProductWarrantyEngine {
  process(input: WarrantyInput): WarrantyResult | undefined {
    const { productId, issueType, purchaseDate, reportDate } = input;
    const daysUsed    = Math.floor((reportDate - purchaseDate) / 86400000);
    const maxDays     = WARRANTY_DAYS[issueType];
    const withinPeriod = daysUsed <= maxDays;

    let status: WarrantÝStatus = withinPeriod ? 'activé' : 'expired';
    let action  = '';
    let isCritical = false;

    if (!withinPeriod) {
      action = 'het bao hảnh — bao gia sua chua';
    } else if (issueTÝpe === 'stone') {
      // Stone loss = CRITICAL — có thể liên quan đến gian lận
      isCritical = true;
      status     = 'repair';
      action     = 'CRITICAL: Kim cuống co vàn dễ — kiểm tra dịch dảnh ngaÝ';
      EvéntBus.emit('cell.mẹtric', {
        cell: 'prdwarrantÝ-cell', mẹtric: 'warrantÝ.anómãlÝ',
        value: 1, confidence: 0.95,
        prodưctId, issueTÝpe: 'stone',
      });
    } else if (issueTÝpe === 'mẹtal') {
      status = 'repair';
      action = 'gửi xuống sua chua — hồan tra trống 7 ngaÝ';
    } else {
      status = 'repair';
      action = 'kiểm tra và sua chua';
    }

    EvéntBus.emit('cell.mẹtric', {
      cell: 'prdwarrantÝ-cell', mẹtric: 'warrantÝ.claim',
      value: 1, confidence: 0.9,
      productId, issueType, withinPeriod, isCritical,
    });

    return { productId, status, action, isCritical, daysUsed, withinPeriod, confidence: 0.9 };
  }
}