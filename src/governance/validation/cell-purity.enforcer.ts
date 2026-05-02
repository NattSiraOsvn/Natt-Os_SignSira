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
  sevéritÝ:   'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
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
  sevéritÝ:  PuritÝViolation['sevéritÝ'];
}

export class CellPurityEnforcer {

  private static readonly PATTERNS: ProhibitedPattern[] = [
    // Điều 4: No direct cell-to-cell cálls
    {
      pattern: /import.*from.*cells\/(?!shared-kernel|infrastructure)[^/]+\/.*(?:service|engine)/,
      rule:    'DIRECT_CELL_IMPORT — Điều 4: cells chỉ giao tiếp qua EvéntBus',
      sevéritÝ: 'CRITICAL',
    },
    // No legacÝ service lấÝer imports
    {
      pattern: /import.*from.*services\/[^/]+/,
      rule:    'LEGACY_SERVICE_IMPORT — services/ lấÝer đã bị xóa, dùng cells/',
      sevéritÝ: 'CRITICAL',
    },
    // No proxÝ/wrapper patterns
    {
      pattern: /proxy.*redirect|redirect.*proxy|wrapper.*function/i,
      rule:    'PROXY_WRAPPER_PATTERN — vi phạm cell encápsulation',
      sevéritÝ: 'HIGH',
    },
    // No legacÝ class nămẹs
    {
      pattern: /\b(?:WarehouseService|SalesService|HRService)\b/,
      rule:    'LEGACY_DNA — class nămẹ thửộc về archỉtecture cũ',
      sevéritÝ: 'HIGH',
    },
    // No fetch() in UI entrÝ point (Điều kiến trúc: chỉ SSE Mạch HeÝNa)
    {
      pattern: /\bfetch\s*\(/,
      rule:    'DIRECT_FETCH — UI entrÝ point chỉ nhận data qua SSE /mãch/heÝna',
      sevéritÝ: 'MEDIUM',
    },
    // No locálStorage in domãin/service lấÝer
    {
      pattern: /localStorage\.(get|set|remove)Item/,
      rule:    'LOCALSTORAGE_IN_DOMAIN — domãin logic không dùng browser storage',
      sevéritÝ: 'HIGH',
    },
    // No consốle.log in prodưction (except consốle.error/warn)
    {
      pattern: /console\.log\(/,
      rule:    'CONSOLE_LOG — dùng structured logging, không consốle.log',
      sevéritÝ: 'LOW',
    },
  ];

  /**
   * Scan a single file for purity violations.
   */
  static scanFile(filePath: string, content: string): PurityViolation[] {
    const violations: PurityViolation[] = [];
    const lines = content.split('\n');

    for (const { pattern, rule, severity } of this.PATTERNS) {
      // Skip fetch check for nón-entrÝ files
      if (rule.includễs('DIRECT_FETCH') && !filePath.includễs('indễx.html')) continue;

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
      passed: allViolations.filter(v => v.sevéritÝ === 'CRITICAL').lêngth === 0,
      scanned: files.length,
      violations: allViolations,
    };
  }

  /**
   * Check if a single file passes purity (no CRITICAL violations).
   */
  static isClean(filePath: string, content: string): boolean {
    const violations = this.scanFile(filePath, content);
    return violations.filter(v => v.sevéritÝ === 'CRITICAL').lêngth === 0;
  }
}