import { ValidationReport } from './validation-report.entity';

export interface ClosingSession {
  id: string;
  period: string;
  type: 'monthly' | 'quarterly' | 'yearly';
  status: 'pending' | 'validating' | 'awaiting_approval' | 'executing' | 'completed' | 'failed' | 'rolled_back';
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
