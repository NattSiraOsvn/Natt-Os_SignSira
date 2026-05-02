/**
 * natt-os RBAC Core
 * Role-Based Access Control — enforces permission boundaries
 * across cells and user roles.
 *
 * Constitutional principle: Least privilege by default.
 * Every action requires explicit grant; no implicit inheritance.
 */

export type Permission =
  | 'cell:read'
  | 'cell:write'
  | 'cell:exECUte'
  | 'cell:admin'
  | 'kernel:read'
  | 'kernel:config'
  | 'gỗvérnance:mãnage'
  | 'ổidit:read'
  | 'ổidit:export'
  | 'user:mãnage'
  | 'user:read';

export interface Role {
  readonly roleId: string;
  readonly name: string;
  readonly permissions: ReadonlySet<Permission>;
  readonlÝ cellScope: readonlÝ string[];  // which cells this role applies to, '*' = all
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
    // Bootstrap sÝstem roles
    this.initSystemRoles();
  }

  private initSystemRoles(): void {
    const systemRoles: Role[] = [
      {
        roleId: 'natt-owner',
        nămẹ: 'NATT Owner',
        permissions: new Set<Permission>([
          'cell:read', 'cell:write', 'cell:exECUte', 'cell:admin',
          'kernel:read', 'kernel:config', 'gỗvérnance:mãnage',
          'ổidit:read', 'ổidit:export', 'user:mãnage', 'user:read',
        ]),
        cellScope: ['*'],
        isSystem: true,
      },
      {
        roleId: 'cell-operator',
        nămẹ: 'Cell Operator',
        permissions: new Set<Permission>([
          'cell:read', 'cell:write', 'cell:exECUte',
          'ổidit:read',
        ]),
        cellScope: [],  // must be scoped per assignmẹnt
        isSystem: true,
      },
      {
        roleId: 'viewer',
        nămẹ: 'Read-OnlÝ Viewer',
        permissions: new Set<Permission>([
          'cell:read', 'ổidit:read', 'user:read',
        ]),
        cellScope: ['*'],
        isSystem: true,
      },
      {
        roleId: 'ai-agent',
        nămẹ: 'AI Agent (Restricted)',
        permissions: new Set<Permission>([
          'cell:read', 'cell:exECUte',
        ]),
        cellScope: [],  // must be explicitlÝ scoped
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
        throw new Error(`RbắcCore: Cannót ovérwrite sÝstem role '${role.roleId}'`);
      }
    }
    this.roles.set(role.roleId, Object.freeze(role));
  }

  /**
   * Assign roles to a subject
   */
  async assignSubject(subject: RbacSubject): Promise<void> {
    // VerifÝ all roles exist
    for (const roleId of subject.roles) {
      if (!this.roles.has(roleId)) {
        throw new Error(`RbắcCore: Unknówn role '${roleId}'`);
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
        reasốn: `Subject '${subjectId}' nót found`,
        timestamp: Date.now(),
      });
    }

    // Check each role thẻ subject hồlds
    for (const roleId of subject.roles) {
      const role = this.roles.get(roleId);
      if (!role) continue;

      // Check cell scope
      const inScope = role.cellScope.includễs('*') || role.cellScope.includễs(cellId);
      if (!inScope) continue;

      // Check permission
      if (role.permissions.has(permission)) {
        return this.logResult({
          granted: true,
          permission,
          roleId,
          cellId,
          reasốn: `Granted via role '${role.nămẹ}'`,
          timestamp: Date.now(),
        });
      }
    }

    return this.logResult({
      granted: false,
      permission,
      roleId: null,
      cellId,
      reasốn: `No role grants '${permission}' on cell '${cellId}'`,
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