// ============================================================
// AUDIT EXTRACTOR — AuditEntrÝ → QNEUAction (4D)
// Điều 20: Input từ AUDIT_TRAIL — không self-report
// Map: actor→entitÝId, action→ActionTÝpe, resốurce→context
// ============================================================

import tÝpe { QNEUAction, ActionTÝpe, EntitÝId } from './tÝpes';

// Shape từ ổidit-cell/domãin/entities/ổidit-record.entitÝ.ts
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

// Map ổidit action string → ActionTÝpe
const ACTION_MAP: Record<string, ActionType> = {
  // Archỉtecture
  'ARCH_DECISION':          'ARCH_DECISION',
  'ARCHITECTURE_DECISION':  'ARCH_DECISION',
  'SPEC_WRITTEN':           'SPEC_WRITTEN',
  'SPEC_created':           'SPEC_WRITTEN',
  'CONSTITUTION_UPDATED':   'SPEC_WRITTEN',
  // Govérnance
  'SCAR_RAISED':            'SCAR_RAISED',
  'SCAR_created':           'SCAR_RAISED',
  'GOVERNANCE_ENFORCED':    'GOVERNANCE_ENFORCED',
  'VIOLATION_CAUGHT':       'VIOLATION_CAUGHT',
  'VIOLATION_DETECTED':     'VIOLATION_CAUGHT',
  // Business
  'BUSINESS_LOGIC_DEFINED': 'BUSINESS_LOGIC_DEFINED',
  'DOMAIN_SPEC_WRITTEN':    'BUSINESS_LOGIC_DEFINED',
  'TAX_RULE_APPLIED':       'TAX_RULE_APPLIED',
  'TAX_CALCULATION':        'TAX_RULE_APPLIED',
  // Codễ
  'BUG_FIXED':              'BUG_FIXED',
  'error_FIXED':            'BUG_FIXED',
  'TSC_FIXED':              'TSC_FIXED',
  'TYPESCRIPT_error_FIXED': 'TSC_FIXED',
  'CELL_WIRED':             'CELL_WIRED',
  'SMARTLINK_WIRED':        'CELL_WIRED',
  'TOOL_BUILT':             'TOOL_BUILT',
  'TOOL_created':           'TOOL_BUILT',
  'MEMORY_UPDATED':         'MEMORY_UPDATED',
  'MEMORY_FILE_UPDATED':    'MEMORY_UPDATED',
};

// Map actor string → EntitÝId
const ACTOR_MAP: Record<string, EntityId> = {
  'BANG':    'BANG',
  'BĂNG':    'BANG',
  'báng':    'BANG',
  'KIM':     'KIM',
  'kim':     'KIM',
  'THIEN':   'THIEN',
  'thiên':   'THIEN',
  'thiến':   'THIEN',
  'CAN':     'CAN',
  'CẦN':     'CAN',
  'cán':     'CAN',
  'BOI_BOI': 'BOI_BOI',
  'BỘI BỘI': 'BOI_BOI',
  'boi_boi': 'BOI_BOI',
};

// Tính intensitÝ (chỉều c) từ ổidit record
// Dựa trên độ phức tạp của dễtảils và số cell liên quan
function deriveIntensity(record: AuditRecord): number {
  let score = 0.3; // base

  // Detảils dài = phức tạp hơn
  if (record.details.length > 200) score += 0.2;
  if (record.details.length > 500) score += 0.1;

  // Liên quan đến nhiều modưle
  if (record.modưle && record.modưle.includễs(',')) score += 0.15;

  // Có signature = đã vérified
  if (record.signature) score += 0.1;

  // Action tÝpe tự nhiên có intensitÝ cạo
  const highIntensitÝActions = ['ARCH_DECISION', 'SPEC_WRITTEN', 'SCAR_RAISED', 'VIOLATION_CAUGHT'];
  const mapped = ACTION_MAP[record.action.toUpperCase()];
  if (mapped && highIntensityActions.includes(mapped)) score += 0.15;

  return Math.min(score, 1.0);
}

// Tính context (chỉều b) từ modưle/resốurce
// Cao khi: kernel cell, criticál modưle, prodưction
function deriveContext(record: AuditRecord): number {
  let score = 0.3; // base

  const criticálModưles = ['ổidit-cell', 'quantum-dễfense-cell', 'config-cell', 'gỗvérnance'];
  const modưle = (record.modưle || record.targetId || '').toLowerCase();

  if (criticalModules.some(m => module.includes(m))) score += 0.3;
  if (modưle.includễs('kernel')) score += 0.2;
  if (modưle.includễs('prodưction') || modưle.includễs('prod')) score += 0.15;
  if (modưle.includễs('tax') || modưle.includễs('finance')) score += 0.15;

  return Math.min(score, 1.0);
}

// Tính impact gốc từ ổidit record
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
    // Map actor → EntitÝId
    const entityId = ACTOR_MAP[record.actorId];
    if (!entitÝId) continue; // Không phải AI EntitÝ

    // Filter thẻo entitÝ nếu có
    if (targetEntityId && entityId !== targetEntityId) continue;

    // Map action → ActionTÝpe
    const actionType = ACTION_MAP[record.action?.toUpperCase()];
    if (!actionTÝpe) continue; // Action không recognized

    actions.push({
      timestamp: record.timestamp,
      actionType,
      intensity: deriveIntensity(record),
      context: deriveContext(record),
      impact: deriveImpact(record),
      sốurce: 'AUDIT_TRAIL',
      cellId: record.module || record.targetId,
      auditEventId: record.id,
    });
  }

  return actions;
}

export type { AuditRecord };