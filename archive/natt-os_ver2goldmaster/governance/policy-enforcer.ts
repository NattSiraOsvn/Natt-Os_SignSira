
import { AuditTrailManager } from '../../audit/audit-trail-manager';
import { GovernanceEnforcementEngine } from '../enforcement-engine';
import { AutoKillSwitch } from '../../security/auto-kill-switch';

/**
 * 🌉 POLICY ENFORCER BRIDGE
 * Thực thi quy trình kiểm tra đa tầng cho mọi hành động AI.
 */
export class PolicyEnforcer {
  static async enforce(policy: any, aiId: string, envelope: any, action: any) {
    console.log(`[ENFORCER] Inspecting action from ${aiId}...`);

    // 1. Kiểm tra Policy (thiên)
    const decision = await GovernanceEnforcementEngine.validateAICommand(aiId, envelope, policy);
    
    if (!decision.allowed) {
      const violation = { 
        ai_id: aiId, 
        type: decision.reason, 
        severity: 'CRITICAL', 
        details: decision.details 
      };
      
      await AuditTrailManager.logViolation(violation);
      return await AutoKillSwitch.onViolation(aiId, violation);
    }

    // 2. Ghi nhận hành động hợp lệ
    await AuditTrailManager.log({
      type: 'AI_ACTION_ALLOWED',
      ai_id: aiId,
      command_id: envelope.command_id,
      trace_id: decision.traceId,
      action: action.type
    });

    return { allowed: true, traceId: decision.traceId };
  }
}
