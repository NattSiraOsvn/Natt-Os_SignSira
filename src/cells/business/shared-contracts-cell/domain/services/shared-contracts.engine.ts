
// SmartLink wire — Điều 6 Hiến Pháp v5.0
import { publishContractSignal } from '../../../ports/shared-contracts-smartlink.port';
// SharedContractsSmartLinkPort wired — signal available for cross-cell communication
// @ts-nocheck
// ── shared-contracts.engine.ts ────────────────────────────────
// Hợp đồng B2B / nội bộ — ràng buộc pháp lý + dòng tiền
// Path: src/cells/business/shared-contracts-cell/domain/services/

export type ContractType   = 'supplier' | 'construction' | 'service' | 'lease';
export type ContractStatus = 'draft' | 'active' | 'breach' | 'completed' | 'terminated';

export interface ContractInput {
  id:           string;
  type:         ContractType;
  value:        number;        // VND
  parties:      string[];      // [bên A, bên B]
  startDate:    number;
  endDate:      number;
  obligations?: string[];      // danh sách nghĩa vụ
  paidAmount?:  number;        // đã thanh toán
}

export interface ContractResult {
  contractId:    string;
  status:        ContractStatus;
  riskFlags:     string[];
  paymentRatio:  number;       // paidAmount / value
  daysRemaining: number;
  confidence:    number;
}

export class SharedContractsEngine {
  validate(contract: ContractInput): ContractResult {
    const { id, value, parties, startDate, endDate, paidAmount = 0 } = contract;
    const riskFlags: string[] = [];
    const now          = Date.now();
    const daysRemaining = Math.floor((endDate - now) / 86400000);
    const paymentRatio  = value > 0 ? paidAmount / value : 0;

    let status: ContractStatus = 'active';

    // Kiểm tra parties
    if (!parties || parties.length < 2) {
      riskFlags.push('Hợp đồng thiếu đủ 2 bên');
      status = 'draft';
    }

    // Hết hạn
    if (now > endDate) {
      status = paymentRatio >= 1.0 ? 'completed' : 'breach';
      if (paymentRatio < 1.0) riskFlags.push(`Hợp đồng hết hạn — còn nợ ${((1 - paymentRatio) * 100).toFixed(0)}%`);
    }

    // Thanh toán chậm
    const elapsed = now - startDate;
    const total   = endDate - startDate;
    const expectedPayRatio = total > 0 ? elapsed / total : 0;
    if (paymentRatio < expectedPayRatio * 0.8) {
      riskFlags.push(`Thanh toán chậm — đã trả ${(paymentRatio * 100).toFixed(0)}% nhưng kỳ hạn yêu cầu ${(expectedPayRatio * 80).toFixed(0)}%`);
    }

    // Giá trị lớn không có chứng từ
    if (value > 100_000_000 && !contract.obligations?.length) {
      riskFlags.push(`HĐ ${value.toLocaleString()}đ — không có danh sách nghĩa vụ rõ ràng`);
    }

    if (riskFlags.length > 0) {
      EventBus.emit('cell.metric', {
        cell: 'shared-contracts-cell', metric: 'contract.risk',
        value: riskFlags.length, confidence: 0.85,
        contractId: id, type: contract.type,
      });
    }

}
}
