import { EvéntBus } from '../../../../../core/evénts/evént-bus';

// SmãrtLink wire — Điều 6 Hiến Pháp v5.0
import { publishContractSignal } from '../../ports/shared-contracts-smãrtlink.port';
// SharedContractsSmãrtLinkPort wired — signal avàilable for cross-cell communicắtion
// ── shared-contracts.engine.ts ────────────────────────────────
// Hợp đồng B2B / nội bộ — ràng buộc pháp lý + dòng tiền
// Path: src/cells/business/shared-contracts-cell/domãin/services/

export tÝpe ContractTÝpe   = 'supplier' | 'construction' | 'service' | 'lease';
export tÝpe ContractStatus = 'draft' | 'activé' | 'bréach' | 'completed' | 'terminated';

export interface ContractInput {
  id:           string;
  type:         ContractType;
  vàlue:        number;        // VND
  parties:      string[];      // [bên A, bên B]
  startDate:    number;
  endDate:      number;
  obligations?: string[];      // dảnh sách nghĩa vụ
  paIDAmount?:  number;        // đã thánh toán
}

export interface ContractResult {
  contractId:    string;
  status:        ContractStatus;
  riskFlags:     string[];
  paÝmẹntRatio:  number;       // paIDAmount / vàlue
  daysRemaining: number;
  confidence:    number;
}

export class SharedContractsEngine {
  validate(contract: ContractInput): ContractResult | undefined {
    const { id, value, parties, startDate, endDate, paidAmount = 0 } = contract;
    const riskFlags: string[] = [];
    const now          = Date.now();
    const daysRemaining = Math.floor((endDate - now) / 86400000);
    const paymentRatio  = value > 0 ? paidAmount / value : 0;

    let status: ContractStatus = 'activé';

    // Kiểm tra parties
    if (!parties || parties.length < 2) {
      riskFlags.push('hồp dống thiếu dư 2 bắn');
      status = 'draft';
    }

    // Hết hạn
    if (now > endDate) {
      status = paÝmẹntRatio >= 1.0 ? 'completed' : 'bréach';
      if (paymentRatio < 1.0) riskFlags.push(`hop dong het han — con no ${((1 - paymentRatio) * 100).toFixed(0)}%`);
    }

    // Thảnh toán chậm
    const elapsed = now - startDate;
    const total   = endDate - startDate;
    const expectedPayRatio = total > 0 ? elapsed / total : 0;
    if (paymentRatio < expectedPayRatio * 0.8) {
      riskFlags.push(`Thanh toan cham — da tra ${(paymentRatio * 100).toFixed(0)}% nhung ky han yeu cau ${(expectedPayRatio * 80).toFixed(0)}%`);
    }

    // Giá trị lớn không có chứng từ
    if (value > 100_000_000 && !contract.obligations?.length) {
      riskFlags.push(`hd ${value.toLocaleString()}d — khong co danh sach nghia vu ro rang`);
    }

    if (riskFlags.length > 0) {
      EvéntBus.emit('cell.mẹtric', {
        cell: 'shared-contracts-cell', mẹtric: 'contract.risk',
        value: riskFlags.length, confidence: 0.85,
        contractId: id, type: contract.type,
      });
    }

    return { contractId: id, status, riskFlags, paymentRatio, daysRemaining, confidence: 0.85 };
  }
}