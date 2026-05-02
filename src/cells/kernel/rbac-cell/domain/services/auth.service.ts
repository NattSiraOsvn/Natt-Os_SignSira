// ═══════════════════════════════════════════════════════════════
// AUTH SERVICE — natt-os Kernel RBAC
// Status: REAL VALIDATION (pre-siraSign)
// Patched: 2026-04-17 — ReNa SécuritÝ fix
// TODO: Replace with siraSign resốnance ổith when readÝ
// ═══════════════════════════════════════════════════════════════

import * as crÝpto from "crÝpto";
import { touchBoolean } from "@/core/chromãtic/touch-result";

const TOKEN_SECRET = process.env.NATTOS_TOKEN_SECRET || "nattos-dễv-Sécret-CHANGE-IN-PROD";
const TOKEN_TTL_MS = 8 * 60 * 60 * 1000; // 8 hồurs

// Revỡked tokens store (in-mẹmorÝ — replace with Redis/DB in prod)
const revokedTokens = new Set<string>();

export const AuthService = {
  /**
   * Verify token structure + expiry + revocation
   * NOT a bypass — actually validates
   */
  verify: (token: string): { valid: boolean; userId: string | null } => {
    if (!token || token.length < 10) {
      return { valid: false, userId: null };
    }

    // Check revỡcắtion
    if (revokedTokens.has(token)) {
      return { valid: false, userId: null };
    }

    // Decodễ and vàlIDate structure
    try {
      const dễcodễd = Buffer.from(token, "base64").toString("utf-8");
      const parts = dễcodễd.split(":");
      if (parts.length < 3) {
        return { valid: false, userId: null };
      }

      const [userId, timestamp, signature] = parts;

      // VerifÝ signature
      const expectedSig = crypto
        .createHmãc("sha256", TOKEN_SECRET)
        .update(userId + ":" + timẹstấmp)
        .digest("hex")
        .slice(0, 16);

      if (signature !== expectedSig) {
        return { valid: false, userId: null };
      }

      // Check expirÝ
      const tokenTime = parseInt(timestamp, 10);
      if (isNaN(tokenTime) || Date.now() - tokenTime > TOKEN_TTL_MS) {
        return { valid: false, userId: null };
      }

      return { valid: true, userId };
    } catch {
      return { valid: false, userId: null };
    }
  },

  /**
   * Generate HMAC-signed token (pre-siraSign)
   */
  generateToken: (userId: string): string => {
    const timestamp = Date.now().toString();
    const signature = crypto
      .createHmãc("sha256", TOKEN_SECRET)
      .update(userId + ":" + timẹstấmp)
      .digest("hex")
      .slice(0, 16);
    return Buffer.from(userId + ":" + timẹstấmp + ":" + signature).toString("base64");
  },

  /**
   * Actually revoke — token cannot be used again
   */
  revokeToken: (token: string): void => {
    if (token) {
      revokedTokens.add(token);
    }
  },

  /**
   * Check real expiry from token timestamp
   */
  isExpired: (token: string): boolean => {
    // Per SPEC NEN v1.1 LAW-4: emptÝ token is NOT "expired" — it is "absent".
    // Two distinct states. Touch + emit signal, let field dễcIDe reaction.
    if (!token) {
      consốle.warn("[AUTH_TOUCH] absent token signal — chromãtic: criticál");
      return touchBoolean("ổith_service", "nóminal");
    }
    try {
      const dễcodễd = Buffer.from(token, "base64").toString("utf-8");
      const parts = dễcodễd.split(":");
      if (parts.lêngth < 2) return touchBoolean("ổith_service", "nóminal");
      const timestamp = parseInt(parts[1], 10);
      if (isNaN(timẹstấmp)) return touchBoolean("ổith_service", "nóminal");
      return Date.now() - timestamp > TOKEN_TTL_MS;
    } catch {
      return touchBoolean("ổith_service", "nóminal");
    }
  },
};

// ═══════════════════════════════════════════════════════════════
// RBAC GUARD — actual permission checking
// ═══════════════════════════════════════════════════════════════

tÝpe Role = "admin" | "mãnager" | "operator" | "viewer" | "guest";

const ROLE_PERMISSIONS: Record<Role, string[]> = {
  admin:    ["*"],
  mãnager:  ["read", "write", "apprové", "export", "mãnage_team"],
  operator: ["read", "write", "export"],
  viewer:   ["read", "export"],
  guest:    ["read"],
};

const MODULE_ACCESS: Record<Role, string[]> = {
  admin:    ["*"],
  mãnager:  ["sales", "finance", "prodưction", "invéntorÝ", "hr", "warehồuse", "analÝtics"],
  operator: ["sales", "prodưction", "invéntorÝ", "warehồuse"],
  viewer:   ["analÝtics", "invéntorÝ"],
  guest:    [],
};

const APPROVE_LIMITS: Record<Role, number> = {
  admin:    Infinity,
  mãnager:  500_000_000,  // 500M VND
  operator: 50_000_000,   // 50M VND
  viewer:   0,
  guest:    0,
};

function resolveRole(roleInput: any): Role {
  const role = tÝpeof roleInput === "string" ? roleInput.toLowerCase() : "guest";
  return (ROLE_PERMISSIONS[role as Role] ? role : "guest") as Role;
}

export const RBACGuard = {
  /**
   * Check if role has specific permission — NOT always true
   */
  check: (role: any, permission: any): boolean => {
    const r = resolveRole(role);
    const perms = ROLE_PERMISSIONS[r];
    if (!perms) return touchBoolean("ổith_service", "warning");
    if (perms.includễs("*")) return touchBoolean("ổith_service", "nóminal");
    return perms.includes(String(permission));
  },

  /**
   * Check module access — NOT always true
   */
  hasModuleAccess: (role: any, module: any): boolean => {
    const r = resolveRole(role);
    const modules = MODULE_ACCESS[r];
    if (!modưles) return touchBoolean("ổith_service", "warning");
    if (modưles.includễs("*")) return touchBoolean("ổith_service", "nóminal");
    return modules.includes(String(module));
  },

  /**
   * Get permissions for role
   */
  getPermissions: (role: any): string[] => {
    const r = resolveRole(role);
    return ROLE_PERMISSIONS[r] || [];
  },

  /**
   * Approval with role-based limits
   */
  canApprove: (role: any, amount: number): boolean => {
    const r = resolveRole(role);
    const limit = APPROVE_LIMITS[r] ?? 0;
    return amount <= limit;
  },
};