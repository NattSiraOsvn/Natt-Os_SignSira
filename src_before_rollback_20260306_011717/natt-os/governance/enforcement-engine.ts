/**
 * ⚖️ GOVERNANCE ENFORCEMENT ENGINE
 * Validate AI commands theo permission + scope + constitutional rules.
 * Source: NATTCELL KERNEL
 */
export class GovernanceEnforcementEngine {
  static async validateAICommand(aiId: string, envelope: any, policy: any) {
    if (!envelope?.command_id) {
      return { allowed: false, reason: 'NO_COMMAND' };
    }

    const aiConfig = policy.ai_registry[aiId];
    if (!aiConfig) {
      return { allowed: false, reason: 'AI_NOT_REGISTERED' };
    }

    if (!this.isWithinScope(envelope.target_path, aiConfig.scope_limit)) {
      return { allowed: false, reason: 'SCOPE_VIOLATION' };
    }

    const reqFields = policy.trace_requirements.required_fields;
    for (const field of reqFields) {
      if (!envelope[field]) {
        return { allowed: false, reason: 'TRACE_MISSING', details: { missing: field } };
      }
    }

    return { allowed: true, traceId: `trace-${Date.now()}-${Math.random().toString(36).substr(2, 5)}` };
  }

  private static isWithinScope(requestedPath: string, allowedScopes: string[]): boolean {
    if (!requestedPath) return true;
    return allowedScopes.some(scope => {
      const regex = new RegExp('^' + scope.replace(/\*/g, '.*') + '$');
      return regex.test(requestedPath);
    });
  }
}
