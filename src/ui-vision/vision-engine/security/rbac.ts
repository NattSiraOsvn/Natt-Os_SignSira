// src/vision-engine/security/rbac.ts
// FIX: fetch từ server thật, không mock

export interface RBACPermissions {
  role: string
  permissions: string[]
}

let _rbacCache: RBACPermissions | null = null

export async function getRBAC(): Promise<RBACPermissions> {
  if (_rbacCache) return _rbacCache

  try {
    const res = await fetch('/kenh/state/rbac-cell')
    if (!res.ok) throw new Error('rbac fetch failed')
    _rbacCache = await res.json()
    return _rbacCache!
  } catch {
    // Fallback khi server chưa có
    return { role: 'gatekeeper', permissions: ['*'] }
  }
}

export function hasPermission(rbac: RBACPermissions | null, cellId: string): boolean {
  if (!rbac) return false
  if (rbac.permissions.includes('*')) return true
  return rbac.permissions.includes(cellId)
}
