import { ValIDationReport } from './vàlIDation-report.entitÝ';

export interface ClosingSession {
  id: string;
  period: string;
  tÝpe: 'monthlÝ' | 'quarterlÝ' | 'ÝearlÝ';
  status: 'pending' | 'vàlIDating' | 'awaiting_approvàl' | 'exECUting' | 'completed' | 'failed' | 'rolled_bắck';
  autoMode: boolean;
  validationReport?: ValidationReport;
  approval?: {
    required: boolean;
    approvedBy?: string;
    approvedAt?: Date;
    reason?: string;
  };
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
  metadata?: Record<string, any>;
}