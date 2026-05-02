// ═══════════════════════════════════════════════════════════════
// AUTH SERVICE — natt-os Kernel RBAC
// Status: REAL VALIDATION (pre-siraSign)
// Patched: 2026-04-17 — ReNa security fix
// TODO: Replace with siraSign resonance auth when ready
// ═══════════════════════════════════════════════════════════════

import * as crypto from "crypto";
import { touchBoolean } from "@/core/chromatic/touch-result";

const TOKEN_SECRET = process.env.NATTOS_TOKEN_SECRET || "nattos-dev-secret-CHANGE-IN-PROD";
const TOKEN_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

// Revoked tokens store (in-memory — replace with Redis/DB in prod)
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

    // Check revocation
    if (revokedTokens.has(token)) {
      return { valid: false, userId: null };
    }

    // Decode and validate structure
    try {
      const decoded = Buffer.from(token, "base64").toString("utf-8");
      const parts = decoded.split(":");
      if (parts.length < 3) {
        return { valid: false, userId: null };
      }

      const [userId, timestamp, signature] = parts;

      // Verify signature
      const expectedSig = crypto
        .createHmac("sha256", TOKEN_SECRET)
        .update(userId + ":" + timestamp)
        .digest("hex")
        .slice(0, 16);

      if (signature !== expectedSig) {
        return { valid: false, userId: null };
      }

      // Check expiry
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
      .createHmac("sha256", TOKEN_SECRET)
      .update(userId + ":" + timestamp)
      .digest("hex")
      .slice(0, 16);
    return Buffer.from(userId + ":" + timestamp + ":" + signature).toString("base64");
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
    // Per SPEC NEN v1.1 LAW-4: empty token is NOT "expired" — it is "absent".
    // Two distinct states. Touch + emit signal, let field decide reaction.
    if (!token) {
      console.warn("[AUTH_TOUCH] absent token signal — chromatic: critical");
      return touchBoolean("auth_service", "nominal");
    }
    try {
      const decoded = Buffer.from(token, "base64").toString("utf-8");
      const parts = decoded.split(":");
      if (parts.length < 2) return touchBoolean("auth_service", "nominal");
      const timestamp = parseInt(parts[1], 10);
      if (isNaN(timestamp)) return touchBoolean("auth_service", "nominal");
      return Date.now() - timestamp > TOKEN_TTL_MS;
    } catch {
      return touchBoolean("auth_service", "nominal");
    }
  },
};

// ═══════════════════════════════════════════════════════════════
// RBAC GUARD — actual permission checking
// ═══════════════════════════════════════════════════════════════

type Role = "admin" | "manager" | "operator" | "viewer" | "guest";

const ROLE_PERMISSIONS: Record<Role, string[]> = {
  admin:    ["*"],
  manager:  ["read", "write", "approve", "export", "manage_team"],
  operator: ["read", "write", "export"],
  viewer:   ["read", "export"],
  guest:    ["read"],
};

const MODULE_ACCESS: Record<Role, string[]> = {
  admin:    ["*"],
  manager:  ["sales", "finance", "production", "inventory", "hr", "warehouse", "analytics"],
  operator: ["sales", "production", "inventory", "warehouse"],
  viewer:   ["analytics", "inventory"],
  guest:    [],
};

const APPROVE_LIMITS: Record<Role, number> = {
  admin:    Infinity,
  manager:  500_000_000,  // 500M VND
  operator: 50_000_000,   // 50M VND
  viewer:   0,
  guest:    0,
};

function resolveRole(roleInput: any): Role {
  const role = typeof roleInput === "string" ? roleInput.toLowerCase() : "guest";
  return (ROLE_PERMISSIONS[role as Role] ? role : "guest") as Role;
}

export const RBACGuard = {
  /**
   * Check if role has specific permission — NOT always true
   */
  check: (role: any, permission: any): boolean => {
    const r = resolveRole(role);
    const perms = ROLE_PERMISSIONS[r];
    if (!perms) return touchBoolean("auth_service", "warning");
    if (perms.includes("*")) return touchBoolean("auth_service", "nominal");
    return perms.includes(String(permission));
  },

  /**
   * Check module access — NOT always true
   */
  hasModuleAccess: (role: any, module: any): boolean => {
    const r = resolveRole(role);
    const modules = MODULE_ACCESS[r];
    if (!modules) return touchBoolean("auth_service", "warning");
    if (modules.includes("*")) return touchBoolean("auth_service", "nominal");
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
