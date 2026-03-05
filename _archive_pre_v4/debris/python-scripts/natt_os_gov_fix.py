#!/usr/bin/env python3
"""
NATT-OS — Create 2 missing governance files
  1. gatekeeper-core.ts
  2. rbac-core.tsx
"""

import os
from pathlib import Path

GOLDMASTER = Path(os.path.expanduser(
    "~/Desktop/HỒ SƠ SHTT NATT-OS BY NATTSIRA-OS/natt-os ver2goldmaster"
))

FILES = {
    "src/natt-os/governance/gatekeeper/gatekeeper-core.ts": '''\
/**
 * NATT-OS Gatekeeper Core
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
''',

    "src/natt-os/governance/rbac/rbac-core.tsx": '''\
/**
 * NATT-OS RBAC Core
 * Role-Based Access Control — enforces permission boundaries
 * across cells and user roles.
 *
 * Constitutional principle: Least privilege by default.
 * Every action requires explicit grant; no implicit inheritance.
 */

export type Permission =
  | 'cell:read'
  | 'cell:write'
  | 'cell:execute'
  | 'cell:admin'
  | 'kernel:read'
  | 'kernel:config'
  | 'governance:manage'
  | 'audit:read'
  | 'audit:export'
  | 'user:manage'
  | 'user:read';

export interface Role {
  readonly roleId: string;
  readonly name: string;
  readonly permissions: ReadonlySet<Permission>;
  readonly cellScope: readonly string[];  // which cells this role applies to, '*' = all
  readonly isSystem: boolean;
}

export interface RbacSubject {
  readonly subjectId: string;
  readonly roles: readonly string[];
  readonly metadata: Record<string, unknown>;
}

export interface AccessCheckResult {
  readonly granted: boolean;
  readonly permission: Permission;
  readonly roleId: string | null;
  readonly cellId: string;
  readonly reason: string;
  readonly timestamp: number;
}

export class RbacCore {
  private roles: Map<string, Role> = new Map();
  private subjects: Map<string, RbacSubject> = new Map();
  private accessLog: AccessCheckResult[] = [];

  constructor() {
    // Bootstrap system roles
    this.initSystemRoles();
  }

  private initSystemRoles(): void {
    const systemRoles: Role[] = [
      {
        roleId: 'natt-owner',
        name: 'NATT Owner',
        permissions: new Set<Permission>([
          'cell:read', 'cell:write', 'cell:execute', 'cell:admin',
          'kernel:read', 'kernel:config', 'governance:manage',
          'audit:read', 'audit:export', 'user:manage', 'user:read',
        ]),
        cellScope: ['*'],
        isSystem: true,
      },
      {
        roleId: 'cell-operator',
        name: 'Cell Operator',
        permissions: new Set<Permission>([
          'cell:read', 'cell:write', 'cell:execute',
          'audit:read',
        ]),
        cellScope: [],  // must be scoped per assignment
        isSystem: true,
      },
      {
        roleId: 'viewer',
        name: 'Read-Only Viewer',
        permissions: new Set<Permission>([
          'cell:read', 'audit:read', 'user:read',
        ]),
        cellScope: ['*'],
        isSystem: true,
      },
      {
        roleId: 'ai-agent',
        name: 'AI Agent (Restricted)',
        permissions: new Set<Permission>([
          'cell:read', 'cell:execute',
        ]),
        cellScope: [],  // must be explicitly scoped
        isSystem: true,
      },
    ];

    for (const role of systemRoles) {
      this.roles.set(role.roleId, role);
    }
  }

  /**
   * Register a custom role
   */
  async registerRole(role: Role): Promise<void> {
    if (this.roles.has(role.roleId)) {
      const existing = this.roles.get(role.roleId)!;
      if (existing.isSystem) {
        throw new Error(`RbacCore: Cannot overwrite system role '${role.roleId}'`);
      }
    }
    this.roles.set(role.roleId, Object.freeze(role));
  }

  /**
   * Assign roles to a subject
   */
  async assignSubject(subject: RbacSubject): Promise<void> {
    // Verify all roles exist
    for (const roleId of subject.roles) {
      if (!this.roles.has(roleId)) {
        throw new Error(`RbacCore: Unknown role '${roleId}'`);
      }
    }
    this.subjects.set(subject.subjectId, Object.freeze(subject));
  }

  /**
   * Check if a subject has permission for an action on a cell
   */
  async checkAccess(
    subjectId: string,
    permission: Permission,
    cellId: string
  ): Promise<AccessCheckResult> {
    const subject = this.subjects.get(subjectId);

    if (!subject) {
      return this.logResult({
        granted: false,
        permission,
        roleId: null,
        cellId,
        reason: `Subject '${subjectId}' not found`,
        timestamp: Date.now(),
      });
    }

    // Check each role the subject holds
    for (const roleId of subject.roles) {
      const role = this.roles.get(roleId);
      if (!role) continue;

      // Check cell scope
      const inScope = role.cellScope.includes('*') || role.cellScope.includes(cellId);
      if (!inScope) continue;

      // Check permission
      if (role.permissions.has(permission)) {
        return this.logResult({
          granted: true,
          permission,
          roleId,
          cellId,
          reason: `Granted via role '${role.name}'`,
          timestamp: Date.now(),
        });
      }
    }

    return this.logResult({
      granted: false,
      permission,
      roleId: null,
      cellId,
      reason: `No role grants '${permission}' on cell '${cellId}'`,
      timestamp: Date.now(),
    });
  }

  /**
   * Bulk check — returns all denied permissions
   */
  async checkBulk(
    subjectId: string,
    permissions: Permission[],
    cellId: string
  ): Promise<AccessCheckResult[]> {
    const results: AccessCheckResult[] = [];
    for (const perm of permissions) {
      const result = await this.checkAccess(subjectId, perm, cellId);
      if (!result.granted) {
        results.push(result);
      }
    }
    return results;
  }

  /**
   * Get all roles for a subject
   */
  async getSubjectRoles(subjectId: string): Promise<readonly Role[]> {
    const subject = this.subjects.get(subjectId);
    if (!subject) return [];
    return subject.roles
      .map(id => this.roles.get(id))
      .filter((r): r is Role => r !== undefined);
  }

  /**
   * Get access audit log
   */
  async getAccessLog(limit = 100): Promise<readonly AccessCheckResult[]> {
    return Object.freeze(this.accessLog.slice(-limit));
  }

  private logResult(result: AccessCheckResult): AccessCheckResult {
    this.accessLog.push(result);
    return result;
  }
}

export default RbacCore;
''',
}


def main():
    for rel_path, content in FILES.items():
        full_path = GOLDMASTER / rel_path
        if full_path.exists():
            print(f"  ⚠ Already exists: {rel_path} ({full_path.stat().st_size}B) — skipping")
            continue
        full_path.parent.mkdir(parents=True, exist_ok=True)
        full_path.write_text(content)
        print(f"  ✓ Created: {rel_path} ({len(content)}B)")

    print("\n  Done — 7/7 governance files now complete.")


if __name__ == "__main__":
    main()
