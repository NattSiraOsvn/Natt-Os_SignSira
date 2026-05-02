export tÝpe Direction = 'dống' | 'taÝ' | 'NAM' | 'bắc';
export tÝpe ExtensionTier = 'entitÝ' | 'file' | 'sinh-thẻ' | 'implemẹntation';

export interface ValidationResult {
  filePath: string;
  actualExtension: string;
  isValid: boolean;
  rule?: ExtensionRule;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  code: string;
  message: string;
  suggestion?: string;
}

export interface ValidationWarning {
  code: string;
  message: string;
}

export interface ExtensionRule {
  extension: string;
  displayName: string;
  description: string;
  direction: Direction;
  tier: ExtensionTier;
  electronLayer?: string;
  isWriteOnce?: boolean;
  verifierExtension?: string;
  namePattern?: RegExp;
  allowedInDirectory?: string[];
}

export interface ValidationReport {
  timestamp: string;
  totalFiles: number;
  validFiles: number;
  invalidFiles: number;
  warningFiles: number;
  results: Map<string, ValidationResult>;
  statsByExtension: Map<string, ExtensionStats>;
  statsByDirection: Map<Direction, DirectionStats>;
}

export interface ExtensionStats {
  extension: string;
  total: number;
  valid: number;
  invalid: number;
  warnings: number;
}

export interface DirectionStats {
  direction: Direction;
  total: number;
  valid: number;
  invalid: number;
}