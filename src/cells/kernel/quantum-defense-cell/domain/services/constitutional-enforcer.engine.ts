// @ts-nocheck
// ============================================================
// CONSTITUTIONAL ENFORCER ENGINE
// Hiến Pháp Điều 9, 14, 26, 38-40
// CN3 trong QuantumDefenseEngine
//
// Merged từ:
// - constitutional-enforcer.engine.ts (event-chain detection)
// - natt-os/validation/cell-purity-enforcer.ts (file-purity patterns)
// ============================================================

import { ViolationDetected } from '../../contracts/events';

interface EventEnvelope {
  type: string;
  source?: string;
  payload?: Record<string, unknown>;
}

// ============================================================
// FILE PURITY PATTERNS (từ CellPurityEnforcer V1)
// Điều 9: Cấm kết nối thô giữa cells
// Điều 26: Cấm import ngược C → A
// Điều 40: Module không đúng tầng
// ============================================================
interface PurityRule {
  pattern: RegExp;
  rule: string;
  article: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
}

const PURITY_RULES: PurityRule[] = [
  {
    pattern: /import.*from.*['"]@\/services\/[^'"]+['"]/,
    rule: 'DIRECT_SERVICE_IMPORT_PROHIBITED',
    article: 'Điều 9 — Cấm kết nối thô',
    severity: 'CRITICAL',
  },
  {
    pattern: /export.*from.*services/,
    rule: 'SERVICE_REEXPORT_FORBIDDEN',
    article: 'Điều 9 — Cấm kết nối thô',
    severity: 'CRITICAL',
  },
  {
    pattern: /WarehouseService|SalesService|ProductionService/,
    rule: 'LEGACY_DNA_DETECTED',
    article: 'Điều 40 — Module không đúng tầng',
    severity: 'HIGH',
  },
  {
    pattern: /proxy.*redirect|redirect.*proxy/i,
    rule: 'PROXY_PATTERN_DETECTED',
    article: 'Điều 14 — AI không tự tạo workaround',
    severity: 'CRITICAL',
  },
  {
    pattern: /wrapper.*function|function.*wrapper/i,
    rule: 'WRAPPER_PATTERN_FORBIDDEN',
    article: 'Điều 14 — AI không tự tạo workaround',
    severity: 'HIGH',
  },
  {
    pattern: /import.*from.*['"][./]*components\/.*['"]/,
    rule: 'UI_LAYER_IMPORT_IN_DOMAIN',
    article: 'Điều 26 — Cấm import ngược C → A',
    severity: 'CRITICAL',
  },
];

export interface PurityViolation {
  type: 'CELL_PURITY_VIOLATION';
  rule: string;
  article: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  file: string;
  matches: string[];
}

export interface PurityScanResult {
  passed: boolean;
  violations: PurityViolation[];
}

// ============================================================
// CONSTITUTIONAL ENFORCER ENGINE
// ============================================================
export class ConstitutionalEnforcerEngine {
  private recentChain: string[] = [];

  // --- Event-chain observation ---
  observe(envelope: EventEnvelope): void {
    this.recentChain.push(envelope.type);
    if (this.recentChain.length > 50) this.recentChain.shift();
  }

  // --- Event-chain evaluation (Điều 9: Guard bypass detection) ---
  evaluate(): ViolationDetected | null {
    const bypassPattern = this.recentChain.filter(t =>
      t.includes('bypass') ||
      t.includes('override') ||
      t.includes('skip') ||
      t.includes('direct_call')
    );

    if (bypassPattern.length > 0) {
      return {
        type: 'ViolationDetected',
        article: 'Điều 9 / Guard violation',
        pattern: bypassPattern.join(' → '),
        eventChain: [...this.recentChain.slice(-10)],
      };
    }
    return null;
  }

  // --- File purity scan (từ CellPurityEnforcer V1) ---
  static scanFile(filePath: string, content: string): PurityScanResult {
    const violations: PurityViolation[] = [];

    for (const rule of PURITY_RULES) {
      const matches = content.match(new RegExp(rule.pattern, 'g'));
      if (matches) {
        violations.push({
          type: 'CELL_PURITY_VIOLATION',
          rule: rule.rule,
          article: rule.article,
          severity: rule.severity,
          file: filePath,
          matches,
        });
      }
    }

    if (violations.length > 0) {
      console.error(`[CONSTITUTIONAL] 🚨 PURITY BREACH: ${filePath}`);
      violations.forEach(v => {
        console.error(`  - [${v.severity}] ${v.rule} — ${v.article}`);
      });
    }

    return { passed: violations.length === 0, violations };
  }

  // --- Scan toàn bộ cell directory (batch) ---
  static scanBatch(
    files: Array<{ path: string; content: string }>
  ): Map<string, PurityScanResult> {
    const results = new Map<string, PurityScanResult>();
    for (const file of files) {
      results.set(file.path, this.scanFile(file.path, file.content));
    }
    return results;
  }
}
