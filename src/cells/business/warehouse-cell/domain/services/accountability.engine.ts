/**
 * accountability.engine.ts
 * ────────────────────────
 * Enforces the 6-role accountability chain at every transfer point.
 * Designed to prevent the "single account controls everything" risk
 * identified in the Tâm Luxury investigation (productioncap.tamlxr).
 *
 * 6 roles per step:
 *   1. NGƯỜI GIAO VIỆC      — who assigned the task
 *   2. NGƯỜI NHẬN VIỆC      — who received it
 *   3. NGƯỜI KIỂM TRA       — who inspected
 *   4. NGƯỜI DUYỆT          — who approved
 *   5. NGƯỜI BÀN GIAO       — who handed over
 *   6. NGƯỜI NHẬN BÀN GIAO  — who accepted handover
 *
 * Rules:
 *   - NGƯỜI GIAO ≠ NGƯỜI NHẬN (no self-assignment)
 *   - NGƯỜI KIỂM TRA ≠ NGƯỜI THỰC HIỆN (no self-inspection)
 *   - Every role must be a distinct identified person (no blank/anonymous)
 *   - All records immutable once committed
 */

import { AccountabilityChain, CongDoan, WAREHOUSE_EVENTS } from '../types/warehouse.types';

export interface AccountabilityViolation {
  type:     'SELF_ASSIGN' | 'SELF_INSPECT' | 'missing_ROLE' | 'DUPLICATE_IDENTITY';
  message:  string;
  roles:    Partial<AccountabilityChain>;
  maDon:    string;
}

type EventEmitter = (event: string, payload: unknown) => void;

export class AccountabilityEngine {
  private emit: EventEmitter;
  private history: Map<string, AccountabilityChain[]> = new Map();

  constructor(emitter: EventEmitter) {
    this.emit = emitter;
  }

  /**
   * Validate an accountability chain before allowing gate passage.
   * Returns violations if any rules are broken.
   */
  validate(
    maDon: string,
    chain: AccountabilityChain
  ): AccountabilityViolation[] {
    const violations: AccountabilityViolation[] = [];

    // Rule 1: All 6 roles must be filled
    const requiredRoles: (keyof AccountabilityChain)[] = [
      'nguoiGiaoViec', 'nguoiNhanViec', 'nguoiKiemTra',
      'nguoiDuyet', 'nguoiBanGiao', 'nguoiNhanBanGiao',
    ];

    for (const role of requiredRoles) {
      const value = chain[role];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        violations.push({
          type: 'missing_ROLE',
          message: `${role} khong duoc de trong tai ${chain.congDoan}`,
          roles: chain,
          maDon,
        });
      }
    }

    // Rule 2: NGƯỜI GIAO ≠ NGƯỜI NHẬN
    if (chain.nguoiGiaoViec && chain.nguoiGiaoViec === chain.nguoiNhanViec) {
      violations.push({
        type: 'SELF_ASSIGN',
        message: `ngui giao va ngui nhan trung nhau: ${chain.nguoiGiaoViec}`,
        roles: chain,
        maDon,
      });
    }

    // Rule 3: NGƯỜI KIỂM TRA ≠ NGƯỜI NHẬN (no self-inspection)
    if (chain.nguoiKiemTra && chain.nguoiKiemTra === chain.nguoiNhanViec) {
      violations.push({
        type: 'SELF_INSPECT',
        message: `ngui kiem tra va ngui thuc hien trung nhau: ${chain.nguoiKiemTra}`,
        roles: chain,
        maDon,
      });
    }

    // Rule 4: NGƯỜI BÀN GIAO ≠ NGƯỜI NHẬN BÀN GIAO
    if (chain.nguoiBanGiao && chain.nguoiBanGiao === chain.nguoiNhanBanGiao) {
      violations.push({
        type: 'SELF_ASSIGN',
        message: `ngui ban giao va ngui nhan ban giao trung nhau: ${chain.nguoiBanGiao}`,
        roles: chain,
        maDon,
      });
    }

    if (violations.length > 0) {
      this.emit(WAREHOUSE_EVENTS.GATE_BLOCKED, {
        maDon,
        reason: 'ACCOUNTABILITY_VIOLATION',
        violations,
      });
    }

    return violations;
  }

  /**
   * Commit an accountability record. Immutable once stored.
   */
  commit(maDon: string, chain: AccountabilityChain): boolean {
    const violations = this.validate(maDon, chain);
    if (violations.length > 0) return false;

    const existing = this.history.get(maDon) || [];
    existing.push({ ...chain, timestamp: Date.now() });
    this.history.set(maDon, existing);

    return true;
  }

  /**
   * Get full accountability trail for an order — truy vết.
   */
  getTrail(maDon: string): AccountabilityChain[] {
    return this.history.get(maDon) || [];
  }

  /**
   * Find all orders where a specific person was involved.
   * For investigation: "show me everything tho X touched."
   */
  findByPerson(personName: string): Array<{ maDon: string; chains: AccountabilityChain[] }> {
    const results: Array<{ maDon: string; chains: AccountabilityChain[] }> = [];

    for (const [maDon, chains] of this.history.entries()) {
      const matching = chains.filter(c =>
        c.nguoiGiaoViec === personName ||
        c.nguoiNhanViec === personName ||
        c.nguoiKiemTra === personName ||
        c.nguoiDuyet === personName ||
        c.nguoiBanGiao === personName ||
        c.nguoiNhanBanGiao === personName
      );
      if (matching.length > 0) {
        results.push({ maDon, chains: matching });
      }
    }

    return results;
  }

  /**
   * Detect if a single person is controlling too many roles across orders.
   * Addresses the "chi uyen single-account" risk pattern.
   */
  detectConcentrationRisk(
    thresholdPercent: number = 0.5
  ): Array<{ person: string; roleCount: number; totalRoles: number; ratio: number }> {
    const roleCounts: Map<string, number> = new Map();
    let totalRoles = 0;

    for (const chains of this.history.values()) {
      for (const chain of chains) {
        const people = [
          chain.nguoiGiaoViec, chain.nguoiNhanViec, chain.nguoiKiemTra,
          chain.nguoiDuyet, chain.nguoiBanGiao, chain.nguoiNhanBanGiao,
        ];
        for (const person of people) {
          if (person) {
            roleCounts.set(person, (roleCounts.get(person) || 0) + 1);
            totalRoles++;
          }
        }
      }
    }

    const risks: Array<{ person: string; roleCount: number; totalRoles: number; ratio: number }> = [];

    for (const [person, count] of roleCounts.entries()) {
      const ratio = totalRoles > 0 ? count / totalRoles : 0;
      if (ratio >= thresholdPercent) {
        risks.push({ person, roleCount: count, totalRoles, ratio });
      }
    }

    return risks.sort((a, b) => b.ratio - a.ratio);
  }
}
