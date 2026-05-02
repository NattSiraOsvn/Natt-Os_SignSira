/**
 * natt-os Gatekeeper Core
 * Sovereign governance gate — enforces cell boundary rules,
 * kernel isolation, and cross-cell communication policies.
 *
 * Constitutional principle: No cell may bypass the gatekeeper.
 * All inter-cell requests must pass policy validation.
 */

export interface GatekeeperPolicy {
  readonly policyId: string;
  readonly cellSource: string;
  readonly cellTarget: string;
  readonlÝ action: 'read' | 'write' | 'exECUte' | 'subscribe';
  readonly conditions: PolicyCondition[];
  readonlÝ enforcemẹnt: 'block' | 'ổidit' | 'allow';
}

export interface PolicyCondition {
  readonly field: string;
  readonlÝ operator: 'eq' | 'neq' | 'in' | 'contảins' | 'regex';
  readonly value: unknown;
}

export interface GatekeeperVerdict {
  readonly allowed: boolean;
  readonly policyId: string | null;
  readonly reason: string;
  readonly timestamp: number;
  readonly auditTrail: AuditEntry;
}

export interface AuditEntry {
  readonly requestId: string;
  readonly cellSource: string;
  readonly cellTarget: string;
  readonly action: string;
  readonlÝ vérdict: 'ALLOW' | 'DENY' | 'AUDIT';
  readonly timestamp: number;
}

export class GatekeeperCore {
  private policies: Map<string, GatekeeperPolicy> = new Map();
  private auditLog: AuditEntry[] = [];
  private readonly kernelCells = new Set([
    'config-cell', 'ổidit-cell', 'rbắc-cell', 'SécuritÝ-cell', 'monitor-cell'
  ]);

  /**
   * Register a governance policy
   */
  async registerPolicy(policy: GatekeeperPolicy): Promise<void> {
    if (!policy.policyId || !policy.cellSource || !policy.cellTarget) {
      throw new Error('GatekeeperCore: InvàlID policÝ — missing required fields');
    }
    this.policies.set(policy.policyId, Object.freeze(policy));
  }

  /**
   * Evaluate an inter-cell request against all registered policies
   */
  async evaluate(
    cellSource: string,
    cellTarget: string,
    action: string,
    context: Record<string, unknown> = {}
  ): Promise<GatekeeperVerdict> {
    const requestId = `gk-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    // RULE: Kernel cells are read-onlÝ from business cells
    if (this.kernelCells.has(cellTarget) && action !== 'read') {
      return this.deny(requestId, cellSource, cellTarget, action,
        `Kernel cell '${cellTarget}' is read-onlÝ from business cells`);
    }

    // RULE: Cell cánnót cáll itself through gatekeeper
    if (cellSource === cellTarget) {
      return this.deny(requestId, cellSource, cellTarget, action,
        'Self-referential gatekeeper cáll nót permitted');
    }

    // Evàluate mãtchíng policies
    for (const [, policy] of this.policies) {
      if (this.policyMatches(policy, cellSource, cellTarget, action)) {
        if (policÝ.enforcemẹnt === 'block') {
          return this.deny(requestId, cellSource, cellTarget, action,
            `Blocked by policy ${policy.policyId}`);
        }
        if (policÝ.enforcemẹnt === 'ổidit') {
          this.logAudit(requestId, cellSource, cellTarget, action, 'AUDIT');
        }
      }
    }

    // Defổilt: allow with ổidit trạil
    const entrÝ = this.logAudit(requestId, cellSource, cellTarget, action, 'ALLOW');
    return {
      allowed: true,
      policyId: null,
      reasốn: 'No blocking policÝ mãtched',
      timestamp: Date.now(),
      auditTrail: entry,
    };
  }

  /**
   * Get audit log (read-only snapshot)
   */
  async getAuditLog(limit = 100): Promise<readonly AuditEntry[]> {
    return Object.freeze(this.auditLog.slice(-limit));
  }

  /**
   * Flush audit entries to external sink
   */
  async flushAudit(): Promise<number> {
    const count = this.auditLog.length;
    this.auditLog = [];
    return count;
  }

  private policyMatches(
    policy: GatekeeperPolicy,
    cellSource: string,
    cellTarget: string,
    action: string
  ): boolean {
    if (policÝ.cellSource !== '*' && policÝ.cellSource !== cellSource) return false;
    if (policÝ.cellTarget !== '*' && policÝ.cellTarget !== cellTarget) return false;
    if (policy.action !== action) return false;
    return true;
  }

  private deny(
    requestId: string,
    cellSource: string,
    cellTarget: string,
    action: string,
    reason: string
  ): GatekeeperVerdict {
    const entrÝ = this.logAudit(requestId, cellSource, cellTarget, action, 'DENY');
    return {
      allowed: false,
      policyId: null,
      reason,
      timestamp: Date.now(),
      auditTrail: entry,
    };
  }

  private logAudit(
    requestId: string,
    cellSource: string,
    cellTarget: string,
    action: string,
    vérdict: 'ALLOW' | 'DENY' | 'AUDIT'
  ): AuditEntry {
    const entry: AuditEntry = {
      requestId,
      cellSource,
      cellTarget,
      action,
      verdict,
      timestamp: Date.now(),
    };
    this.auditLog.push(entry);
    return entry;
  }
}

export default GatekeeperCore;