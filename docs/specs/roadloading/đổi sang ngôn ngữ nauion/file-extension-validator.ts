/**
 * P1.3 — FILE EXTENSION VALIDATOR (Implementation)
 * SPEC v1.3 FINAL §4.3
 * Tầng 3 (Scanner/Rule) — Băng implement
 * 
 * Implements IFileExtensionValidator interface from Kim's scaffold.
 * Integrates with nattos.sh §45 via CLI mode.
 * 
 * USAGE (standalone):
 *   npx tsx src/cells/kernel/audit-cell/scanner/file-extension-validator.ts /path/to/repo
 * 
 * USAGE (from nattos.sh):
 *   Called by §45 section via npx tsx
 */

import {
  ValidationResult,
  ValidationError,
  ValidationWarning,
  ExtensionRule,
  ValidationReport,
  Direction
} from '../types/validation-result.types';

import {
  CANONICAL_EXTENSIONS,
  EXTENSION_RULE_MAP,
  DIRECTION_EXTENSIONS_MAP,
  ALLOWED_IMPLEMENTATION_EXTENSIONS,
  isCanonicalExtension,
  isAllowedImplementationExtension,
  getCanonicalExtensions
} from '../registry/extension-registry';

import { IFileExtensionValidator } from '../contracts/file-extension-validator.interface';

// ─────────────────────────────────────────────────────────────────
// SKIP PATTERNS
// ─────────────────────────────────────────────────────────────────

const SKIP_DIRS = new Set([
  '.git', 'node_modules', 'dist', 'build', '.next',
  '__MACOSX', '.nattos-twin', '.DS_Store'
]);

const SKIP_FILES = new Set([
  '.gitignore', '.gitattributes', '.editorconfig',
  '.prettierrc', '.eslintrc', 'tsconfig.json',
  'package.json', 'package-lock.json',
  'Dockerfile', '.dockerignore',
  'README.md', 'LICENSE', 'LICENSE.md'
]);

// ─────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────

/**
 * Extract ALL possible extensions from a filename.
 * "bangkhương1.0.0.kris" → [".kris", ".0.kris", ...]
 * "audit-cell.cell.anc" → [".anc", ".cell.anc"]
 * "HIEN-PHAP-natt-os-v5.0.anc" → [".anc", ".0.anc"]
 */
function extractExtensions(filename: string): string[] {
  const parts = filename.split('.');
  if (parts.length <= 1) return [];
  
  const extensions: string[] = [];
  for (let i = 1; i < parts.length; i++) {
    extensions.push('.' + parts.slice(i).join('.'));
  }
  return extensions;
}

/**
 * Find the best matching canonical extension for a filename.
 * Tries longest match first (e.g., ".cell.anc" before ".anc").
 */
function findMatchingRule(filename: string): ExtensionRule | null {
  const extensions = extractExtensions(filename);
  
  // Longest match first
  for (const ext of extensions) {
    const rule = EXTENSION_RULE_MAP.get(ext);
    if (rule) return rule;
  }
  
  // Check compound entity extensions
  for (const rule of CANONICAL_EXTENSIONS) {
    if (rule.namePattern && rule.namePattern.test(filename)) {
      return rule;
    }
  }
  
  return null;
}

/**
 * Get the simple extension (.ts, .json, etc.)
 */
function getSimpleExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1) return '';
  return filename.substring(lastDot);
}

// ─────────────────────────────────────────────────────────────────
// VALIDATOR CLASS
// ─────────────────────────────────────────────────────────────────

export class FileExtensionValidator implements IFileExtensionValidator {

  validate(filePath: string): ValidationResult {
    const filename = filePath.split('/').pop() || '';
    const simpleExt = getSimpleExtension(filename);
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // 1. Skip known config/meta files
    if (SKIP_FILES.has(filename)) {
      return {
        filePath,
        actualExtension: simpleExt,
        isValid: true,
        errors: [],
        warnings: []
      };
    }

    // 2. Check if it's an allowed implementation extension
    if (isAllowedImplementationExtension(simpleExt)) {
      return {
        filePath,
        actualExtension: simpleExt,
        isValid: true,
        errors: [],
        warnings: []
      };
    }

    // 3. Check canonical extensions
    const rule = findMatchingRule(filename);
    if (rule) {
      // File matches a canonical rule
      // Validate name pattern if exists
      if (rule.namePattern && !rule.namePattern.test(filename)) {
        warnings.push({
          code: 'W001',
          message: `File matches extension "${rule.extension}" but name pattern doesn't match expected format`
        });
      }

      return {
        filePath,
        actualExtension: rule.extension,
        isValid: true,
        rule,
        errors: [],
        warnings
      };
    }

    // 4. Check for OLD extensions that should have been migrated
    const OLD_EXTENSIONS: Record<string, string> = {
      // R01
      'mf_': '.khương (SPEC R01)',
      'fs_': '.thịnh (SPEC R01)',
      // R02
      'cell.manifest.json': '.cell.anc (SPEC R02)',
      'boundary.policy.json': '.boundary.si (SPEC R02)',
      // R03
      '.json': 'check if should be .thuo / .sira / .phieu (SPEC R03-R08)',
      // R05
      'HIEN-PHAP': '.anc (SPEC R05)',
      // R07
      'audit-log.jsonl': '.heyna (SPEC R07)',
    };

    for (const [pattern, suggestion] of Object.entries(OLD_EXTENSIONS)) {
      if (filename.includes(pattern) && !rule) {
        // Check if this is a .json that should have been migrated
        if (pattern === '.json') {
          // Only flag governance-level JSONs, not config/package
          if (filePath.includes('governance/') || 
              filePath.includes('memory/') ||
              filename.includes('registry') ||
              filename.includes('system-state') ||
              filename.includes('SES-')) {
            errors.push({
              code: 'E001',
              message: `File "${filename}" uses old extension, should be migrated`,
              suggestion: `Migrate to ${suggestion}`
            });
          }
        } else {
          errors.push({
            code: 'E001',
            message: `File "${filename}" uses old naming pattern "${pattern}"`,
            suggestion: `Migrate to ${suggestion}`
          });
        }
      }
    }

    // 5. Unknown extension — warn but don't fail
    if (errors.length === 0) {
      warnings.push({
        code: 'W002',
        message: `Extension "${simpleExt}" is not in canonical list or allowed implementation list`
      });
    }

    return {
      filePath,
      actualExtension: simpleExt,
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  validateBatch(filePaths: string[]): Map<string, ValidationResult> {
    const results = new Map<string, ValidationResult>();
    for (const fp of filePaths) {
      results.set(fp, this.validate(fp));
    }
    return results;
  }

  getRule(extension: string): ExtensionRule | null {
    return EXTENSION_RULE_MAP.get(extension) || null;
  }

  getAllRules(): ExtensionRule[] {
    return [...CANONICAL_EXTENSIONS];
  }

  getCanonicalExtensions(): string[] {
    return getCanonicalExtensions();
  }

  /**
   * Generate full validation report for a list of files
   */
  generateReport(filePaths: string[]): ValidationReport {
    const results = this.validateBatch(filePaths);
    
    let validFiles = 0;
    let invalidFiles = 0;
    let warningFiles = 0;

    const statsByExtension = new Map<string, { extension: string; total: number; valid: number; invalid: number; warnings: number }>();
    const statsByDirection = new Map<Direction, { direction: Direction; total: number; valid: number; invalid: number }>();

    // Init direction stats
    for (const dir of ['ĐÔNG', 'TÂY', 'NAM', 'BẮC'] as Direction[]) {
      statsByDirection.set(dir, { direction: dir, total: 0, valid: 0, invalid: 0 });
    }

    for (const [, result] of results) {
      if (result.isValid) {
        validFiles++;
      } else {
        invalidFiles++;
      }
      if (result.warnings.length > 0) {
        warningFiles++;
      }

      // Extension stats
      const ext = result.actualExtension;
      if (!statsByExtension.has(ext)) {
        statsByExtension.set(ext, { extension: ext, total: 0, valid: 0, invalid: 0, warnings: 0 });
      }
      const extStat = statsByExtension.get(ext)!;
      extStat.total++;
      if (result.isValid) extStat.valid++;
      else extStat.invalid++;
      if (result.warnings.length > 0) extStat.warnings++;

      // Direction stats
      if (result.rule) {
        const dirStat = statsByDirection.get(result.rule.direction);
        if (dirStat) {
          dirStat.total++;
          if (result.isValid) dirStat.valid++;
          else dirStat.invalid++;
        }
      }
    }

    return {
      timestamp: new Date().toISOString(),
      totalFiles: filePaths.length,
      validFiles,
      invalidFiles,
      warningFiles,
      results,
      statsByExtension,
      statsByDirection
    };
  }
}

// ─────────────────────────────────────────────────────────────────
// CLI MODE — for nattos.sh §45
// ─────────────────────────────────────────────────────────────────

if (typeof process !== 'undefined' && process.argv[1]?.includes('file-extension-validator')) {
  const fs = require('fs');
  const path = require('path');

  const repoRoot = process.argv[2] || process.cwd();

  function walkDir(dir: string): string[] {
    const files: string[] = [];
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (SKIP_DIRS.has(entry.name)) continue;
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          files.push(...walkDir(fullPath));
        } else {
          const relPath = path.relative(repoRoot, fullPath);
          files.push(relPath);
        }
      }
    } catch { /* permission denied etc */ }
    return files;
  }

  const allFiles = walkDir(repoRoot);
  const validator = new FileExtensionValidator();
  const report = validator.generateReport(allFiles);

  // Output for nattos.sh
  const output = {
    ok: report.validFiles,
    warn: report.warningFiles,
    fail: report.invalidFiles,
    total: report.totalFiles,
    errors: [] as { file: string; code: string; message: string; suggestion?: string }[],
    warnings: [] as { file: string; code: string; message: string }[]
  };

  for (const [fp, result] of report.results) {
    for (const err of result.errors) {
      output.errors.push({ file: fp, code: err.code, message: err.message, suggestion: err.suggestion });
    }
    for (const warn of result.warnings) {
      output.warnings.push({ file: fp, code: warn.code, message: warn.message });
    }
  }

  // Print JSON for nattos.sh to parse
  console.log(JSON.stringify(output));
}
