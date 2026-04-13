/**
 * cell-purity.enforcer.ts
 * ───────────────────────
 * Real-time source code validation.
 * Enforcing Điều 7 & 9: no direct service imports,
 * no proxy/wrapper patterns, no legacy DNA in cells.
 *
 * Use as pre-commit hook or CI check:
 *   Scan all files in src/cells/ → report violations.
 *
 * Source: masterv1 CellPurityEnforcer, adapted for current repo
 */

export interface PurityViolation {
  file:       string;
  rule:       string;
  severity:   'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  matches:    string[];
  line:       number | null;
}

export interface PurityResult {
  passed:      boolean;
  scanned:     number;
  violations:  PurityViolation[];
}

interface ProhibitedPattern {
  pattern:   RegExp;
  rule:      string;
  severity:  PurityViolation['severity'];
}

export class CellPurityEnforcer {

  private static readonly PATTERNS: ProhibitedPattern[] = [
    // Điều 4: No direct cell-to-cell calls
    {
      pattern: /import.*from.*cells\/(?!shared-kernel|infrastructure)[^/]+\/.*(?:service|engine)/,
      rule:    'DIRECT_CELL_IMPORT — Điều 4: cells chỉ giao tiếp qua EventBus',
      severity: 'CRITICAL',
    },
    // No legacy service layer imports
    {
      pattern: /import.*from.*services\/[^/]+/,
      rule:    'LEGACY_SERVICE_IMPORT — services/ layer đã bị xóa, dùng cells/',
      severity: 'CRITICAL',
    },
    // No proxy/wrapper patterns
    {
      pattern: /proxy.*redirect|redirect.*proxy|wrapper.*function/i,
      rule:    'PROXY_WRAPPER_PATTERN — vi phạm cell encapsulation',
      severity: 'HIGH',
    },
    // No legacy class names
    {
      pattern: /\b(?:WarehouseService|SalesService|HRService)\b/,
      rule:    'LEGACY_DNA — class name thuộc về architecture cũ',
      severity: 'HIGH',
    },
    // No fetch() in UI entry point (Điều kiến trúc: chỉ SSE Mạch HeyNa)
    {
      pattern: /\bfetch\s*\(/,
      rule:    'DIRECT_FETCH — UI entry point chỉ nhận data qua SSE /mach/heyna',
      severity: 'MEDIUM',
    },
    // No localStorage in domain/service layer
    {
      pattern: /localStorage\.(get|set|remove)Item/,
      rule:    'LOCALSTORAGE_IN_DOMAIN — domain logic không dùng browser storage',
      severity: 'HIGH',
    },
    // No console.log in production (except console.error/warn)
    {
      pattern: /console\.log\(/,
      rule:    'CONSOLE_LOG — dùng structured logging, không console.log',
      severity: 'LOW',
    },
  ];

  /**
   * Scan a single file for purity violations.
   */
  static scanFile(filePath: string, content: string): PurityViolation[] {
    const violations: PurityViolation[] = [];
    const lines = content.split('\n');

    for (const { pattern, rule, severity } of this.PATTERNS) {
      // Skip fetch check for non-entry files
      if (rule.includes('DIRECT_FETCH') && !filePath.includes('index.html')) continue;

      for (let i = 0; i < lines.length; i++) {
        if (pattern.test(lines[i])) {
          violations.push({
            file: filePath,
            rule,
            severity,
            matches: [lines[i].trim()],
            line: i + 1,
          });
        }
      }
    }

    return violations;
  }

  /**
   * Scan multiple files and return aggregate result.
   */
  static scanFiles(files: Array<{ path: string; content: string }>): PurityResult {
    const allViolations: PurityViolation[] = [];

    for (const file of files) {
      const v = this.scanFile(file.path, file.content);
      allViolations.push(...v);
    }

    return {
      passed: allViolations.filter(v => v.severity === 'CRITICAL').length === 0,
      scanned: files.length,
      violations: allViolations,
    };
  }

  /**
   * Check if a single file passes purity (no CRITICAL violations).
   */
  static isClean(filePath: string, content: string): boolean {
    const violations = this.scanFile(filePath, content);
    return violations.filter(v => v.severity === 'CRITICAL').length === 0;
  }
}
