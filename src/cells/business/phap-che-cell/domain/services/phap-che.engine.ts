import { EventBus } from '../../../../../core/events/event-bus';
import { PhapCheSmartLinkPort } from "../../ports/phapche-SmartLink.port";
import { Contract, ContractType, LegalAlert } from '../entities/contract.entity';

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
      currency: 'VND',
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
      if (daysRemaining < 0 && c.status === 'ACTIVE') {
        alerts.push({ alertId: `ALT-${Date.now()}`, contractId: c.contractId, type: 'EXPIRED', message: `Hợp đồng ${c.title} đã hết hạn`, createdAt: new Date() });
      } else if (daysRemaining <= 30 && daysRemaining >= 0) {
        alerts.push({ alertId: `ALT-${Date.now()}`, contractId: c.contractId, type: 'EXPIRING_SOON', message: `Hợp đồng ${c.title} hết hạn sau ${daysRemaining} ngày`, daysRemaining, createdAt: new Date() });
      } else if (c.status === 'REVIEWING' && c.requiresGatekeeperApproval) {
        alerts.push({ alertId: `ALT-${Date.now()}`, contractId: c.contractId, type: 'PENDING_APPROVAL', message: `Hợp đồng ${c.title} chờ Gatekeeper duyệt`, createdAt: new Date() });
      }
    }
    return alerts;
  }

  static approve(contract: Contract, approvedBy: string): Contract {
    EventBus.emit('cell.metric', { cell: 'phap-che-cell', metric: 'engine.executed', value: 1, ts: Date.now() });
    return { ...contract, status: 'ACTIVE', approvedBy, approvedAt: new Date(), updatedAt: new Date() };
  }
}