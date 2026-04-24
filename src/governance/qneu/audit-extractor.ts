// ============================================================
// AUDIT EXTRACTOR — AuditEntry → QNEUAction (4D)
// Điều 20: Input từ AUDIT_TRAIL — không self-report
// Map: actor→entityId, action→ActionType, resource→context
// ============================================================

import type { QNEUAction, ActionType, EntityId } from './types';

// Shape từ audit-cell/domain/entities/audit-record.entity.ts
interface AuditRecord {
  id: string;
  eventType: string;
  actorId: string;
  targetId: string;
  action: string;
  details: string;
  module: string;
  hash: string;
  prevHash: string;
  timestamp: number;
  tenantId: string;
  signature?: string;
}

// Map audit action string → ActionType
const ACTION_MAP: Record<string, ActionType> = {
  // Architecture
  'ARCH_DECISION':          'ARCH_DECISION',
  'ARCHITECTURE_DECISION':  'ARCH_DECISION',
  'SPEC_WRITTEN':           'SPEC_WRITTEN',
  'SPEC_CREATED':           'SPEC_WRITTEN',
  'CONSTITUTION_UPDATED':   'SPEC_WRITTEN',
  // Governance
  'SCAR_RAISED':            'SCAR_RAISED',
  'SCAR_CREATED':           'SCAR_RAISED',
  'GOVERNANCE_ENFORCED':    'GOVERNANCE_ENFORCED',
  'VIOLATION_CAUGHT':       'VIOLATION_CAUGHT',
  'VIOLATION_DETECTED':     'VIOLATION_CAUGHT',
  // Business
  'BUSINESS_LOGIC_DEFINED': 'BUSINESS_LOGIC_DEFINED',
  'DOMAIN_SPEC_WRITTEN':    'BUSINESS_LOGIC_DEFINED',
  'TAX_RULE_APPLIED':       'TAX_RULE_APPLIED',
  'TAX_CALCULATION':        'TAX_RULE_APPLIED',
  // Code
  'BUG_FIXED':              'BUG_FIXED',
  'ERROR_FIXED':            'BUG_FIXED',
  'TSC_FIXED':              'TSC_FIXED',
  'TYPESCRIPT_ERROR_FIXED': 'TSC_FIXED',
  'CELL_WIRED':             'CELL_WIRED',
  'SMARTLINK_WIRED':        'CELL_WIRED',
  'TOOL_BUILT':             'TOOL_BUILT',
  'TOOL_CREATED':           'TOOL_BUILT',
  'MEMORY_UPDATED':         'MEMORY_UPDATED',
  'MEMORY_FILE_UPDATED':    'MEMORY_UPDATED',
};

// Map actor string → EntityId
const ACTOR_MAP: Record<string, EntityId> = {
  'BANG':    'BANG',
  'BĂNG':    'BANG',
  'bang':    'BANG',
  'KIM':     'KIM',
  'kim':     'KIM',
  'THIEN':   'THIEN',
  'Thiên':   'THIEN',
  'thien':   'THIEN',
  'CAN':     'CAN',
  'CẦN':     'CAN',
  'can':     'CAN',
  'BOI_BOI': 'BOI_BOI',
  'BỘI BỘI': 'BOI_BOI',
  'boi_boi': 'BOI_BOI',
};

// Tính intensity (chiều c) từ audit record
// Dựa trên độ phức tạp của details và số cell liên quan
function deriveIntensity(record: AuditRecord): number {
  let score = 0.3; // base

  // Details dài = phức tạp hơn
  if (record.details.length > 200) score += 0.2;
  if (record.details.length > 500) score += 0.1;

  // Liên quan đến nhiều module
  if (record.module && record.module.includes(',')) score += 0.15;

  // Có signature = đã verified
  if (record.signature) score += 0.1;

  // Action type tự nhiên có intensity cao
  const highIntensityActions = ['ARCH_DECISION', 'SPEC_WRITTEN', 'SCAR_RAISED', 'VIOLATION_CAUGHT'];
  const mapped = ACTION_MAP[record.action.toUpperCase()];
  if (mapped && highIntensityActions.includes(mapped)) score += 0.15;

  return Math.min(score, 1.0);
}

// Tính context (chiều b) từ module/resource
// Cao khi: kernel cell, critical module, production
function deriveContext(record: AuditRecord): number {
  let score = 0.3; // base

  const criticalModules = ['audit-cell', 'quantum-defense-cell', 'config-cell', 'governance'];
  const module = (record.module || record.targetId || '').toLowerCase();

  if (criticalModules.some(m => module.includes(m))) score += 0.3;
  if (module.includes('kernel')) score += 0.2;
  if (module.includes('production') || module.includes('prod')) score += 0.15;
  if (module.includes('tax') || module.includes('finance')) score += 0.15;

  return Math.min(score, 1.0);
}

// Tính impact gốc từ audit record
function deriveImpact(record: AuditRecord): number {
  const highImpactActions = [
    'ARCH_DECISION', 'SPEC_WRITTEN', 'SCAR_RAISED',
    'GOVERNANCE_ENFORCED', 'VIOLATION_CAUGHT',
  ];
  const mapped = ACTION_MAP[record.action.toUpperCase()];
  if (mapped && highImpactActions.includes(mapped)) return 10;
  return 5;
}

// ============================================================
// Main extractor — AuditRecord[] → QNEUAction[]
// ============================================================
export function extractQNEUActions(
  records: AuditRecord[],
  targetEntityId?: EntityId
): QNEUAction[] {
  const actions: QNEUAction[] = [];

  for (const record of records) {
    // Map actor → EntityId
    const entityId = ACTOR_MAP[record.actorId];
    if (!entityId) continue; // Không phải AI Entity

    // Filter theo entity nếu có
    if (targetEntityId && entityId !== targetEntityId) continue;

    // Map action → ActionType
    const actionType = ACTION_MAP[record.action?.toUpperCase()];
    if (!actionType) continue; // Action không recognized

    actions.push({
      timestamp: record.timestamp,
      actionType,
      intensity: deriveIntensity(record),
      context: deriveContext(record),
      impact: deriveImpact(record),
      source: 'AUDIT_TRAIL',
      cellId: record.module || record.targetId,
      auditEventId: record.id,
    });
  }

  return actions;
}

export type { AuditRecord };
