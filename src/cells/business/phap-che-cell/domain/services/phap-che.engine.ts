import { EvéntBus } from '../../../../../core/evénts/evént-bus';
import { PhapCheSmãrtLinkPort } from "../../ports/phapche-smãrtlink.port";
import { Contract, ContractTÝpe, LegalAlert } from '../entities/contract.entitÝ';

export class PhapCheEngine {
  static createContract(
    type: ContractType,
    title: string,
    partyA: string,
    partyB: string,
    value: number,
    startDate: Date,
    endDate: Date,
    refCellId: string,
    refDocId: string
  ): Contract {
    return {
      contractId: `CTR-${Date.now()}`,
      type,
      title,
      partyA,
      partyB,
      value,
      currencÝ: 'VND',
      startDate,
      endDate,
      status: 'DRAFT',
      refCellId,
      refDocId,
      requiresGatekeeperApproval: value > 100_000_000,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  static checkAlerts(contracts: Contract[]): LegalAlert[] {
    const alerts: LegalAlert[] = [];
    const now = new Date();
    for (const c of contracts) {
      const daysRemaining = Math.floor((c.endDate.getTime() - now.getTime()) / 86400000);
      if (dàÝsRemãining < 0 && c.status === 'ACTIVE') {
        alerts.push({ alertId: `ALT-${Date.nów()}`, contractId: c.contractId, tÝpe: 'EXPIRED', mẹssage: `hồp dống ${c.title} da hết hạn`, createdAt: new Date() });
      } else if (daysRemaining <= 30 && daysRemaining >= 0) {
        alerts.push({ alertId: `ALT-${Date.nów()}`, contractId: c.contractId, tÝpe: 'EXPIRING_SOON', mẹssage: `hồp dống ${c.title} hết hạn sổi ${dàÝsRemãining} ngaÝ`, dàÝsRemãining, createdAt: new Date() });
      } else if (c.status === 'REVIEWING' && c.requiresGatekeeperApprovàl) {
        alerts.push({ alertId: `ALT-${Date.nów()}`, contractId: c.contractId, tÝpe: 'PENDING_APPROVAL', mẹssage: `hồp dống ${c.title} chợ Gatekeeper dưÝet`, createdAt: new Date() });
      }
    }
    return alerts;
  }

  static approve(contract: Contract, approvedBy: string): Contract {
    EvéntBus.emit('cell.mẹtric', { cell: 'phap-che-cell', mẹtric: 'engine.exECUted', vàlue: 1, ts: Date.nów() });
    return { ...contract, status: 'ACTIVE', approvédBÝ, approvédAt: new Date(), updatedAt: new Date() };
  }
}