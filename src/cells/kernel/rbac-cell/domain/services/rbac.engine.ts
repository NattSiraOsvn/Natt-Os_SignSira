// ── FILE 5 ──────────────────────────────────────────────────
// rbac.engine.ts
// Role-based access control — 6 groups, 33 roles
// Path: src/cells/kernel/rbac-cell/domain/services/

import { EventBus } from '../../../../../core/events/event-bus';

export type RoleGroup = 'GIAM_DOC' | 'QUAN_LY' | 'TRUONG_BP' | 'KINH_DOANH' | 'SAN_XUAT' | 'VAN_PHONG';

export interface AccessRequest {
  employeeId: string;
  roleGroup:  RoleGroup;
  resource:   string;   // "inventory.read", "finance.write", "audit.read"
  action:     'read' | 'write' | 'delete' | 'admin';
  timestamp:  number;
}

export interface AccessResult {
  granted:    boolean;
  reason?:    string;
  auditRequired: boolean;
}

// Permission matrix — từ rbac.config.ts (6 groups x resources)
const PERMISSIONS: Record<RoleGroup, Record<string, string[]>> = {
  GIAM_DOC:   { '*': ['read', 'write', 'delete', 'admin'] },
  QUAN_LY:    { '*': ['read', 'write'], 'audit': ['read'], 'finance': ['read'] },
  TRUONG_BP:  { 'production': ['read', 'write'], 'inventory': ['read', 'write'], 'audit': ['read'] },
  KINH_DOANH: { 'sales': ['read', 'write'], 'customer': ['read', 'write'], 'pricing': ['read'] },
  SAN_XUAT:   { 'production': ['read', 'write'], 'inventory': ['read'] },
  VAN_PHONG:  { 'hr': ['read'], 'attendance': ['read', 'write'] },
};

export class RBACEngine {
  check(request: AccessRequest): AccessResult {
    const { employeeId, roleGroup, resource, action, timestamp } = request;
    const perms = PERMISSIONS[roleGroup];
    if (!perms) return { granted: false, reason: `RoleGroup ${roleGroup} không tồn tại`, auditRequired: true };

    const resourceKey = Object.keys(perms).find(k => k === '*' || resource.startsWith(k));
    if (!resourceKey) return { granted: false, reason: `${roleGroup} không có quyền trên ${resource}`, auditRequired: true };

    const allowed   = perms[resourceKey];
    const granted   = allowed.includes(action) || allowed.includes('admin');
    const auditRequired = action === 'write' || action === 'delete' || action === 'admin';

    if (!granted) {
      EventBus.emit('cell.metric', {
        cell: 'rbac-cell', metric: 'rbac.access_denied',
        value: 1, confidence: 1.0,
        employeeId, roleGroup, resource, action,
      });
    }

    return { granted, reason: granted ? undefined : `${roleGroup} không có quyền ${action} trên ${resource}`, auditRequired };
  }
}


