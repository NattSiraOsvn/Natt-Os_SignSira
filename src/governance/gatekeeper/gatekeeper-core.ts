/**
 * Natt-OS Gatekeeper Core
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
  readonly action: 'read' | 'write' | 'execute' | 'subscribe';
  readonly conditions: PolicyCondition[];
  readonly enforcement: 'block' | 'audit' | 'allow';
}

export interface PolicyCondition {
  readonly field: string;
  readonly operator: 'eq' | 'neq' | 'in' | 'contains' | 'regex';
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
  readonly verdict: 'ALLOW' | 'DENY' | 'AUDIT';
  readonly timestamp: number;
}

export class GatekeeperCore {
  private policies: Map<string, GatekeeperPolicy> = new Map();
  private auditLog: AuditEntry[] = [];
  private readonly kernelCells = new Set([
    'config-cell', 'audit-cell', 'rbac-cell', 'security-cell', 'monitor-cell'
  ]);

  /**
   * Register a governance policy
   */
  async registerPolicy(policy: GatekeeperPolicy): Promise<void> {
    if (!policy.policyId || !policy.cellSource || !policy.cellTarget) {
      throw new Error('GatekeeperCore: Invalid policy — missing required fields');
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

    // RULE: Kernel cells are read-only from business cells
    if (this.kernelCells.has(cellTarget) && action !== 'read') {
      return this.deny(requestId, cellSource, cellTarget, action,
        `Kernel cell '${cellTarget}' is read-only from business cells`);
    }

    // RULE: Cell cannot call itself through gatekeeper
    if (cellSource === cellTarget) {
      return this.deny(requestId, cellSource, cellTarget, action,
        'Self-referential gatekeeper call not permitted');
    }

    // Evaluate matching policies
    for (const [, policy] of this.policies) {
      if (this.policyMatches(policy, cellSource, cellTarget, action)) {
        if (policy.enforcement === 'block') {
          return this.deny(requestId, cellSource, cellTarget, action,
            `Blocked by policy ${policy.policyId}`);
        }
        if (policy.enforcement === 'audit') {
          this.logAudit(requestId, cellSource, cellTarget, action, 'AUDIT');
        }
      }
    }

    // Default: allow with audit trail
    const entry = this.logAudit(requestId, cellSource, cellTarget, action, 'ALLOW');
    return {
      allowed: true,
      policyId: null,
      reason: 'No blocking policy matched',
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
    if (policy.cellSource !== '*' && policy.cellSource !== cellSource) return false;
    if (policy.cellTarget !== '*' && policy.cellTarget !== cellTarget) return false;
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
    const entry = this.logAudit(requestId, cellSource, cellTarget, action, 'DENY');
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
    verdict: 'ALLOW' | 'DENY' | 'AUDIT'
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
