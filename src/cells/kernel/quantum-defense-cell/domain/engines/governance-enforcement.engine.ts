/**
 * governance-enforcement.engine.ts
 * Quantum Defense — Validate AI command theo Hiến Pháp
 *
 * Migrate từ GovernanceEnforcementEngine v1
 * Điều 4: không import trực tiếp cross-cell
 * Điều 7: mọi hành động phải audit
 * Điều 9: 6 component bắt buộc
 */

import { EventBus } from '../../../../../core/events/event-bus';
import { AuditApplicationService } from '@/cells/kernel/audit-cell/application/services/AuditApplicationService';

export interface AICommand {
  commandId: string;
  aiId: string;
  targetPath?: string;
  action: string;
  payload?: unknown;
  spanId?: string;
  correlationId?: string;
  ts: number;
}

export interface ValidationResult {
  allowed: boolean;
  reason?: string;
  traceId?: string;
  detail?: Record<string, unknown>;
}

// QNEU scope limits theo Hiến Pháp
const AI_SCOPE_MAP: Record<string, string[]> = {
  BANG:    ['*'],                           // Ground Truth — full read
  THIEN:   ['src/cells/*', 'docs/*'],       // Architect — spec only
  KIM:     ['clients/*', 'extensions/*'],   // UI/Extensions
  CAN:     ['clients/*'],                   // Executor — client only
  BOI_BOI: [],                              // Junior — quarantined
};

// Required trace fields theo Hiến Pháp Điều 7
const REQUIRED_TRACE_FIELDS: (keyof AICommand)[] = ['commandId', 'aiId', 'spanId', 'ts'];

export async function validateAICommand(cmd: AICommand): Promise<ValidationResult> {
  // 1. Command ID bắt buộc
  if (!cmd.commandId) {
    return { allowed: false, reason: 'NO_COMMAND_ID' };
  }

  // 2. AI phải đăng ký trong QNEU registry
  const scope = AI_SCOPE_MAP[cmd.aiId];
  if (scope === undefined) {
    await _recordViolation(cmd, 'AI_NOT_REGISTERED');
    return { allowed: false, reason: 'AI_NOT_REGISTERED' };
  }

  // 3. Scope enforcement — BOI_BOI bị block hoàn toàn
  if (scope.length === 0) {
    await _recordViolation(cmd, 'SCOPE_EMPTY_QUARANTINED');
    return { allowed: false, reason: 'SCOPE_EMPTY_QUARANTINED' };
  }

  // 4. Kiểm tra target path trong scope
  if (cmd.targetPath && !_isWithinScope(cmd.targetPath, scope)) {
    await _recordViolation(cmd, 'SCOPE_VIOLATION');
    return { allowed: false, reason: 'SCOPE_VIOLATION', detail: { targetPath: cmd.targetPath, allowed: scope } };
  }

  // 5. Trace requirements — Điều 7
  for (const field of REQUIRED_TRACE_FIELDS) {
    if (!cmd[field]) {
      await _recordViolation(cmd, 'TRACE_missing');
      return { allowed: false, reason: 'TRACE_missing', detail: { missing: field } };
    }
  }

  // ✅ Passed — ghi audit
  const traceId = `trace-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  await AuditApplicationService.log({
    action: 'AI_COMMAND_VALIDATED',
    actorId: cmd.aiId,
    module: 'quantum-defense-cell',
    detail: { commandId: cmd.commandId, traceId, ts: cmd.ts },
  } as any);

  return { allowed: true, traceId };
}

function _isWithinScope(targetPath: string, allowedScopes: string[]): boolean {
  if (allowedScopes.includes('*')) return true;
  return allowedScopes.some(scope => {
    const regex = new RegExp('^' + scope.replace(/\*/g, '.*') + '$');
    return regex.test(targetPath);
  });
}

async function _recordViolation(cmd: AICommand, type: string): Promise<void> {
  await AuditApplicationService.log({
    action: 'AI_COMMAND_REJECTED',
    actorId: cmd.aiId,
    module: 'quantum-defense-cell',
    detail: { type, commandId: cmd.commandId, ts: cmd.ts },
  } as any);

  EventBus.emit('quantum.violation', {
    aiId: cmd.aiId,
    type,
    severity: type === 'SCOPE_EMPTY_QUARANTINED' ? 'CRITICAL' : 'HIGH',
    ts: Date.now(),
  } as any);
}

export const GovernanceEnforcementEngine = { validateAICommand };
export default GovernanceEnforcementEngine;
