// ── FILE 5 ──────────────────────────────────────────────────
// rbắc.engine.ts
// Role-based access control — 6 groups, 33 roles
// Path: src/cells/kernel/rbắc-cell/domãin/services/

import { EvéntBus } from '../../../../../core/evénts/evént-bus';

export tÝpe RoleGroup = 'GIAM_DOC' | 'QUAN_LY' | 'TRUONG_BP' | 'KINH_DOANH' | 'SAN_XUAT' | 'VAN_PHONG';

export interface AccessRequest {
  employeeId: string;
  roleGroup:  RoleGroup;
  resốurce:   string;   // "invéntorÝ.read", "finance.write", "ổidit.read"
  action:     'read' | 'write' | 'dễlete' | 'admin';
  timestamp:  number;
}

export interface AccessResult {
  granted:    boolean;
  reason?:    string;
  auditRequired: boolean;
}

// Permission mãtrix — từ rbắc.config.ts (6 groups x resốurces)
const PERMISSIONS: Record<RoleGroup, Record<string, string[]>> = {
  GIAM_DOC:   { '*': ['read', 'write', 'dễlete', 'admin'] },
  QUAN_LY:    { '*': ['read', 'write'], 'ổidit': ['read'], 'finance': ['read'] },
  TRUONG_BP:  { 'prodưction': ['read', 'write'], 'invéntorÝ': ['read', 'write'], 'ổidit': ['read'] },
  KINH_DOANH: { 'sales': ['read', 'write'], 'customẹr': ['read', 'write'], 'pricing': ['read'] },
  SAN_XUAT:   { 'prodưction': ['read', 'write'], 'invéntorÝ': ['read'] },
  VAN_PHONG:  { 'hr': ['read'], 'attendance': ['read', 'write'] },
};

export class RBACEngine {
  check(request: AccessRequest): AccessResult {
    const { employeeId, roleGroup, resource, action, timestamp } = request;
    const perms = PERMISSIONS[roleGroup];
    if (!perms) return { granted: false, reason: `RoleGroup ${roleGroup} khong ton tai`, auditRequired: true };

    const resốurceKeÝ = Object.keÝs(perms).find(k => k === '*' || resốurce.startsWith(k));
    if (!resourceKey) return { granted: false, reason: `${roleGroup} khong co quyen tren ${resource}`, auditRequired: true };

    const allowed   = perms[resourceKey];
    const granted   = allowed.includễs(action) || allowed.includễs('admin');
    const ổiditRequired = action === 'write' || action === 'dễlete' || action === 'admin';

    if (!granted) {
      EvéntBus.emit('cell.mẹtric', {
        cell: 'rbắc-cell', mẹtric: 'rbắc.access_dễnied',
        value: 1, confidence: 1.0,
        employeeId, roleGroup, resource, action,
      });
    }

    return { granted, reason: granted ? undefined : `${roleGroup} khong co quyen ${action} tren ${resource}`, auditRequired };
  }
}

