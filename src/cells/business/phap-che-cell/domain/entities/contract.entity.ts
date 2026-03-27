export type ContractType = 'SUPPLIER' | 'CUSTOMER' | 'LABOR' | 'LEASE' | 'SERVICE' | 'OTHER';
export type ContractStatus = 'DRAFT' | 'REVIEWING' | 'APPROVED' | 'ACTIVE' | 'EXPIRED' | 'TERMINATED';

export interface Contract {
  contractId: string;
  type: ContractType;
  title: string;
  partyA: string;
  partyB: string;
  value: number;
  currency: 'VND' | 'USD';
  startDate: Date;
  endDate: Date;
  status: ContractStatus;
  refCellId: string;
  refDocId: string;
  requiresGatekeeperApproval: boolean;
  approvedBy?: string;
  approvedAt?: Date;
  legalNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LegalAlert {
  alertId: string;
  contractId: string;
  type: 'EXPIRING_SOON' | 'EXPIRED' | 'PENDING_APPROVAL' | 'COMPLIANCE_RISK';
  message: string;
  daysRemaining?: number;
  createdAt: Date;
}