/**
 * P1.3 — FILE EXTENSION VALIDATOR INTERFACE
 * SPEC v1.3 FINAL §4.3
 * Tầng 2 (Structural/Manifest) — Kim scaffold
 */

import { ValidationResult, ExtensionRule } from '../types/validation-result.types';

export interface IFileExtensionValidator {
  validate(filePath: string): ValidationResult;
  validateBatch(filePaths: string[]): Map<string, ValidationResult>;
  getRule(extension: string): ExtensionRule | null;
  getAllRules(): ExtensionRule[];
  getCanonicalExtensions(): string[];
}
