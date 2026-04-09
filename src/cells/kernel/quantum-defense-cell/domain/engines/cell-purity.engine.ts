/**
 * cell-purity.engine.ts
 * Quantum Defense — Scan cell code phát hiện vi phạm Điều 4/7/9
 *
 * Điều 4: không import cross-cell trực tiếp
 * Điều 7: mọi hành động phải audit
 * Điều 9: 6 component bắt buộc
 */

import { EventBus } from '../../../../../core/events/event-bus';

export interface PurityViolation {
  type: string;
  rule: string;
  pattern: string;
  file: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface PurityResult {
  passed: boolean;
  violations: PurityViolation[];
}

const VIOLATION_PATTERNS: { pattern: RegExp; rule: string; severity: PurityViolation['severity'] }[] = [
  { pattern: /import.*from.*cells\/(?!.*index).*\/(?!ports|manifest|index)/, rule: 'DIRECT_CROSS_CELL_IMPORT', severity: 'CRITICAL' },
  { pattern: /import.*from.*services\/[^/]+\.ts/, rule: 'DIRECT_SERVICE_IMPORT_PROHIBITED', severity: 'HIGH' },
  { pattern: /WarehouseService|SalesService|InventoryService/, rule: 'LEGACY_DNA_DETECTED', severity: 'HIGH' },
  { pattern: /proxy.*redirect|redirect.*proxy/i, rule: 'PROXY_PATTERN_DETECTED', severity: 'MEDIUM' },
  { pattern: /wrapper.*function|function.*wrapper/i, rule: 'WRAPPER_PATTERN_FORBIDDEN', severity: 'MEDIUM' },
  { pattern: /localStorage|sessionStorage/, rule: 'BROWSER_STORAGE_IN_SERVER_CODE', severity: 'HIGH' },
  { pattern: /window\.__NATT|window\.AI_/, rule: 'GLOBAL_MUTATION_FORBIDDEN', severity: 'CRITICAL' },
];

export function scanContent(filePath: string, content: string): PurityResult {
  const violations: PurityViolation[] = [];

  VIOLATION_PATTERNS.forEach(({ pattern, rule, severity }) => {
    if (pattern.test(content)) {
      violations.push({
        type: 'CELL_PURITY_VIOLATION',
        rule,
        pattern: pattern.toString(),
        file: filePath,
        severity,
      });
    }
  });

  const passed = violations.length === 0;

  if (!passed) {
    const critical = violations.filter(v => v.severity === 'CRITICAL');
    EventBus.emit('quantum.purity_violation', {
      filePath,
      violations: violations.length,
      critical: critical.length,
      ts: Date.now(),
    } as any);

    violations.forEach(v => {
      console.warn(`[CellPurity] ${v.severity} — ${v.rule} in ${v.file}`);
    });
  }

  return { passed, violations };
}

export const CellPurityEngine = { scanContent };
export default CellPurityEngine;
