/**
 * governance-enforcement.engine.ts
 * ────────────────────────────────
 * Validate AI commands trước khi cho phép thực thi.
 * 4 lớp kiểm tra: Identity → Scope → Trace → Constitutional Rules.
 *
 * Source: masterv1 GovernanceEnforcementEngine, adapted for LUOPON
 */

export interface AIIdentity {
  aiId:        string;        // 'bang', 'boi-boi', 'kim', 'can'
  displayName: string;        // 'Băng · Chị 5'
  role:        string;        // 'GROUND_TRUTH_VALIDATOR'
  scopeLimit:  string[];      // ['src/cells/*', 'src/governance/*']
}

export interface CommandEnvelope {
  commandId:    string;
  targetPath:   string;       // e.g. 'src/cells/business/warehouse-cell'
  action:       string;       // 'CREATE_FILE' | 'MODIFY' | 'DELETE' | 'EXECUTE'
  payload:      unknown;
  traceId:      string;
  correlationId: string;
  timestamp:    number;
}

export interface ValidationResult {
  allowed:  boolean;
  reason:   string | null;
  traceId:  string | null;
  aiId:     string;
}

export class GovernanceEnforcementEngine {

  private registry: Map<string, AIIdentity> = new Map();

  /**
   * Register an AI identity. Only Gatekeeper can call this.
   */
  registerAI(identity: AIIdentity): void {
    this.registry.set(identity.aiId, identity);
  }

  /**
   * Validate an AI command through 4-layer check.
   */
  validate(aiId: string, command: CommandEnvelope): ValidationResult {
    const base = { aiId, traceId: null as string | null };

    // Layer 1: Command must have ID
    if (!command.commandId) {
      return { ...base, allowed: false, reason: 'MISSING_COMMAND_ID' };
    }

    // Layer 2: AI must be registered
    const identity = this.registry.get(aiId);
    if (!identity) {
      return { ...base, allowed: false, reason: 'AI_NOT_REGISTERED' };
    }

    // Layer 3: Scope check — AI can only touch paths within its scopeLimit
    if (!this.isWithinScope(command.targetPath, identity.scopeLimit)) {
      return { ...base, allowed: false, reason: `SCOPE_VIOLATION: ${aiId} cannot access ${command.targetPath}` };
    }

    // Layer 4: Trace requirements — must have traceId and correlationId
    if (!command.traceId || !command.correlationId) {
      return { ...base, allowed: false, reason: 'MISSING_TRACE_FIELDS' };
    }

    // Layer 5: Constitutional rules — DELETE requires explicit authorization
    if (command.action === 'DELETE') {
      // SCAR: never suggest deleting files without confirming they aren't real source data
      return { ...base, allowed: false, reason: 'DELETE_REQUIRES_GATEKEEPER_APPROVAL' };
    }

    return {
      allowed: true,
      reason: null,
      traceId: `gov-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      aiId,
    };
  }

  /**
   * Check if target path is within allowed scopes.
   * Scope patterns support wildcard (*).
   */
  private isWithinScope(targetPath: string, allowedScopes: string[]): boolean {
    if (!targetPath) return true; // Generic commands without path
    return allowedScopes.some(scope => {
      const regex = new RegExp('^' + scope.replace(/\*/g, '.*') + '$');
      return regex.test(targetPath);
    });
  }

  /**
   * Get registered AI identity.
   */
  getIdentity(aiId: string): AIIdentity | null {
    return this.registry.get(aiId) || null;
  }

  /**
   * List all registered AIs.
   */
  listRegistered(): AIIdentity[] {
    return Array.from(this.registry.values());
  }
}
