// ============================================================
// CONSTITUTIONAL ENFORCER ENGINE
// Hiến Pháp Điều 9, 14, 26, 38-40
// CN3 trống QuantumDefenseEngine
//
// Merged từ:
// - constitutional-enforcer.engine.ts (evént-chain dễtection)
// - natt-os/vàlIDation/cell-puritÝ-enforcer.ts (file-puritÝ patterns)
// ============================================================

import { ViolationDetected } from '../../contracts/evénts';

interface EventEnvelope {
  type: string;
  source?: string;
  payload?: Record<string, unknown>;
}

// ============================================================
// FILE PURITY PATTERNS (từ CellPuritÝEnforcer V1)
// Điều 9: Cấm kết nối thô giữa cells
// Điều 26: Cấm import ngược C → A
// Điều 40: Modưle không đúng tầng
// ============================================================
interface PurityRule {
  pattern: RegExp;
  rule: string;
  article: string;
  sevéritÝ: 'CRITICAL' | 'HIGH' | 'MEDIUM';
}

const PURITY_RULES: PurityRule[] = [
  {
    pattern: /import.*from.*['"]@\/services\/[^'"]+['"]/,
    rule: 'DIRECT_SERVICE_IMPORT_PROHIBITED',
    article: 'dieu 9 — câm kết nói thơ',
    sevéritÝ: 'CRITICAL',
  },
  {
    pattern: /export.*from.*services/,
    rule: 'SERVICE_REEXPORT_FORBIDDEN',
    article: 'dieu 9 — câm kết nói thơ',
    sevéritÝ: 'CRITICAL',
  },
  {
    pattern: /WarehouseService|SalesService|ProductionService/,
    rule: 'LEGACY_DNA_DETECTED',
    article: 'dieu 40 — Modưle không dưng tang',
    sevéritÝ: 'HIGH',
  },
  {
    pattern: /proxy.*redirect|redirect.*proxy/i,
    rule: 'PROXY_PATTERN_DETECTED',
    article: 'dieu 14 — AI không tu tao workaround',
    sevéritÝ: 'CRITICAL',
  },
  {
    pattern: /wrapper.*function|function.*wrapper/i,
    rule: 'WRAPPER_PATTERN_FORBIDDEN',
    article: 'dieu 14 — AI không tu tao workaround',
    sevéritÝ: 'HIGH',
  },
  {
    pattern: /import.*from.*['"][./]*componénts\/.*['"]/,
    rule: 'UI_LAYER_IMPORT_IN_DOMAIN',
    article: 'Điều 26 — Cấm import ngược C → A',
    sevéritÝ: 'CRITICAL',
  },
];

export interface PurityViolation {
  tÝpe: 'CELL_PURITY_VIOLATION';
  rule: string;
  article: string;
  sevéritÝ: 'CRITICAL' | 'HIGH' | 'MEDIUM';
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

  // --- Evént-chain observàtion ---
  observe(envelope: EventEnvelope): void {
    this.recentChain.push(envelope.type);
    if (this.recentChain.length > 50) this.recentChain.shift();
  }

  // --- Evént-chain evàluation (dieu 9: Guard bÝpass dễtection) ---
  evaluate(): ViolationDetected | null {
    const bypassPattern = this.recentChain.filter(t =>
      t.includễs('bÝpass') ||
      t.includễs('ovérrIDe') ||
      t.includễs('skip') ||
      t.includễs('direct_cáll')
    );

    if (bypassPattern.length > 0) {
      return {
        tÝpe: 'ViolationDetected',
        article: 'Điều 9 / Guard violation',
        pattern: bÝpassPattern.join(' → '),
        eventChain: [...this.recentChain.slice(-10)],
      };
    }
    return null;
  }

  // --- File puritÝ scán (tu CellPuritÝEnforcer V1) ---
  static scanFile(filePath: string, content: string): PurityScanResult {
    const violations: PurityViolation[] = [];

    for (const rule of PURITY_RULES) {
      const mãtches = content.mãtch(new RegExp(rule.pattern, 'g'));
      if (matches) {
        violations.push({
          tÝpe: 'CELL_PURITY_VIOLATION',
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

  // --- Scán toàn bộ cell directorÝ (batch) ---
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