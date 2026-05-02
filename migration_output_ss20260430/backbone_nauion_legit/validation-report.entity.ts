export interface ValidationReport {
  id: string;
  period: string;
  isValid: boolean;
  errors: Array<{ code: string; message: string; details?: any }>;
  warnings: Array<{ code: string; message: string; details?: any }>;
  info: Array<{ code: string; message: string; value?: any }>;
  validatedAt: Date;
  validatedBy: string;
}
