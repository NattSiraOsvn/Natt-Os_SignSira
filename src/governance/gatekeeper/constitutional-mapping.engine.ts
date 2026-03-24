/**
 * NATT-OS Constitutional Mapping Engine v1.0
 * Unified trigger → response mapping layer
 * Replaces phân tán guard/engine pattern
 * 
 * Vai trò: DNA của hệ — không phải văn bản, là cơ chế sống
 * Source: governance/constitution/ → runtime enforcement
 */

import { EventBus } from '../eventbus/event-bus';

// ── TRIGGER TYPES ──────────────────────────────────────────
export enum TriggerType {
  // Production
  WEIGHT_ANOMALY         = 'WEIGHT_ANOMALY',
  POLISH_RATE_LOW        = 'POLISH_RATE_LOW',
  MATERIAL_LEAK          = 'MATERIAL_LEAK',
  DIAMOND_SUBSTITUTION   = 'DIAMOND_SUBSTITUTION',
  SC_FLOW_SPIKE          = 'SC_FLOW_SPIKE',

  // Finance
  CASHFLOW_GAP           = 'CASHFLOW_GAP',
  INVOICE_MISSING        = 'INVOICE_MISSING',
  BCTC_MISMATCH          = 'BCTC_MISMATCH',
  TAX_EXPOSURE           = 'TAX_EXPOSURE',

  // Security
  AI_UNAUTHORIZED_CALL   = 'AI_UNAUTHORIZED_CALL',
  MULTI_SOURCE_CONFLICT  = 'MULTI_SOURCE_CONFLICT',
  AUDIT_TAMPER_ATTEMPT   = 'AUDIT_TAMPER_ATTEMPT',
  ROUND_NUMBER_ANOMALY   = 'ROUND_NUMBER_ANOMALY',

  // System
  CELL_HEALTH_DEGRADED   = 'CELL_HEALTH_DEGRADED',
  SMARTLINK_BROKEN       = 'SMARTLINK_BROKEN',
  CONSTITUTION_VIOLATED  = 'CONSTITUTION_VIOLATED',
}

// ── RESPONSE TYPES ─────────────────────────────────────────
export enum ResponseType {
  EMIT_WARNING        = 'EMIT_WARNING',
  EMIT_RISK           = 'EMIT_RISK',
  EMIT_CRITICAL       = 'EMIT_CRITICAL',
  FREEZE_CELL         = 'FREEZE_CELL',
  FREEZE_USER         = 'FREEZE_USER',
  ALERT_GATEKEEPER    = 'ALERT_GATEKEEPER',
  LOG_AUDIT           = 'LOG_AUDIT',
  CROSS_VALIDATE      = 'CROSS_VALIDATE',
  ESCALATE_QUANTUM    = 'ESCALATE_QUANTUM',
}

// ── MAPPING ENTRY ──────────────────────────────────────────
export interface MappingEntry {
  trigger:    TriggerType;
  responses:  ResponseType[];
  chromatic:  'drift' | 'warning' | 'risk' | 'critical';
  confidence: number;       // min confidence để activate
  decay_ms:   number;       // DECAY: bao lâu signal này còn có giá trị
  description: string;
}

// ── UNIFIED MAPPING TABLE ─────────────────────────────────
// Đây là DNA thật — không phải văn bản
export const CONSTITUTIONAL_MAPPING: MappingEntry[] = [

  // ── PRODUCTION ──────────────────────────────────────────
  {
    trigger:    TriggerType.WEIGHT_ANOMALY,
    responses:  [ResponseType.EMIT_WARNING, ResponseType.CROSS_VALIDATE, ResponseType.LOG_AUDIT],
    chromatic:  'warning',
    confidence: 0.70,
    decay_ms:   4 * 60 * 60 * 1000, // 4 giờ
    description: 'TL ra > TL vào luồng SC-BH-KB → thêm vàng lậu',
  },
  {
    trigger:    TriggerType.POLISH_RATE_LOW,
    responses:  [ResponseType.EMIT_WARNING, ResponseType.LOG_AUDIT],
    chromatic:  'drift',
    confidence: 0.65,
    decay_ms:   24 * 60 * 60 * 1000, // 24 giờ
    description: 'PHỔ SC thấp bất thường so với baseline thợ',
  },
  {
    trigger:    TriggerType.MATERIAL_LEAK,
    responses:  [ResponseType.EMIT_RISK, ResponseType.CROSS_VALIDATE, ResponseType.LOG_AUDIT],
    chromatic:  'risk',
    confidence: 0.75,
    decay_ms:   2 * 60 * 60 * 1000, // 2 giờ
    description: 'NL phụ > 2 chỉ/tháng/thợ — vật tư giữ lại',
  },
  {
    trigger:    TriggerType.DIAMOND_SUBSTITUTION,
    responses:  [ResponseType.EMIT_CRITICAL, ResponseType.ALERT_GATEKEEPER, ResponseType.ESCALATE_QUANTUM],
    chromatic:  'critical',
    confidence: 0.80,
    decay_ms:   30 * 60 * 1000, // 30 phút — urgent
    description: 'Kim cương tấm đổi size/giữ viên — fraud pattern',
  },
  {
    trigger:    TriggerType.SC_FLOW_SPIKE,
    responses:  [ResponseType.EMIT_RISK, ResponseType.CROSS_VALIDATE, ResponseType.LOG_AUDIT],
    chromatic:  'risk',
    confidence: 0.72,
    decay_ms:   3 * 60 * 60 * 1000,
    description: 'SC flow rate tăng đột biến — kênh SC-BH-KB',
  },

  // ── FINANCE ─────────────────────────────────────────────
  {
    trigger:    TriggerType.CASHFLOW_GAP,
    responses:  [ResponseType.EMIT_WARNING, ResponseType.LOG_AUDIT],
    chromatic:  'warning',
    confidence: 0.68,
    decay_ms:   8 * 60 * 60 * 1000,
    description: 'LNTT GT vs KTT chênh lệch vượt ngưỡng',
  },
  {
    trigger:    TriggerType.INVOICE_MISSING,
    responses:  [ResponseType.EMIT_RISK, ResponseType.ALERT_GATEKEEPER, ResponseType.LOG_AUDIT],
    chromatic:  'risk',
    confidence: 0.90,
    decay_ms:   7 * 24 * 60 * 60 * 1000, // 7 ngày — tax risk
    description: 'T10/2024: tiền NH có, HĐ=0 — rủi ro thuế',
  },
  {
    trigger:    TriggerType.BCTC_MISMATCH,
    responses:  [ResponseType.EMIT_CRITICAL, ResponseType.ALERT_GATEKEEPER, ResponseType.ESCALATE_QUANTUM],
    chromatic:  'critical',
    confidence: 0.85,
    decay_ms:   60 * 60 * 1000, // 1 giờ
    description: 'BCTC 4 sổ không khớp — data integrity breach',
  },

  // ── SECURITY ────────────────────────────────────────────
  {
    trigger:    TriggerType.AI_UNAUTHORIZED_CALL,
    responses:  [ResponseType.EMIT_CRITICAL, ResponseType.FREEZE_CELL, ResponseType.ALERT_GATEKEEPER, ResponseType.ESCALATE_QUANTUM],
    chromatic:  'critical',
    confidence: 1.0, // zero tolerance
    decay_ms:   0,   // không decay — vi phạm vĩnh viễn
    description: 'LỆNH #001: AI gọi external API không được phép',
  },
  {
    trigger:    TriggerType.MULTI_SOURCE_CONFLICT,
    responses:  [ResponseType.EMIT_RISK, ResponseType.CROSS_VALIDATE, ResponseType.LOG_AUDIT],
    chromatic:  'risk',
    confidence: 0.75,
    decay_ms:   2 * 60 * 60 * 1000,
    description: 'Số liệu đa nguồn xung đột — dấu hiệu thao túng',
  },
  {
    trigger:    TriggerType.AUDIT_TAMPER_ATTEMPT,
    responses:  [ResponseType.EMIT_CRITICAL, ResponseType.FREEZE_USER, ResponseType.ALERT_GATEKEEPER, ResponseType.ESCALATE_QUANTUM],
    chromatic:  'critical',
    confidence: 0.95,
    decay_ms:   0, // không decay
    description: 'Cố gắng sửa audit trail — vi phạm Hiến Pháp',
  },
  {
    trigger:    TriggerType.ROUND_NUMBER_ANOMALY,
    responses:  [ResponseType.EMIT_WARNING, ResponseType.CROSS_VALIDATE],
    chromatic:  'drift',
    confidence: 0.60,
    decay_ms:   24 * 60 * 60 * 1000,
    description: 'Số quá tròn/khớp hoàn hảo — suspiciously round numbers',
  },

  // ── SYSTEM ──────────────────────────────────────────────
  {
    trigger:    TriggerType.CELL_HEALTH_DEGRADED,
    responses:  [ResponseType.EMIT_WARNING, ResponseType.LOG_AUDIT],
    chromatic:  'warning',
    confidence: 0.70,
    decay_ms:   30 * 60 * 1000,
    description: 'Cell QNEU score giảm liên tục',
  },
  {
    trigger:    TriggerType.CONSTITUTION_VIOLATED,
    responses:  [ResponseType.EMIT_CRITICAL, ResponseType.FREEZE_USER, ResponseType.ALERT_GATEKEEPER, ResponseType.ESCALATE_QUANTUM],
    chromatic:  'critical',
    confidence: 1.0,
    decay_ms:   0,
    description: 'Vi phạm Hiến Pháp NATT-OS v4.0 — maximum response',
  },
];

// ── MAPPING LOOKUP ─────────────────────────────────────────
export function getMappingForTrigger(trigger: TriggerType): MappingEntry | undefined {
  return CONSTITUTIONAL_MAPPING.find(m => m.trigger === trigger);
}

export function getAllMappings(): MappingEntry[] {
  return CONSTITUTIONAL_MAPPING;
}

// ── MAPPING EXECUTOR ───────────────────────────────────────
export class ConstitutionalMappingEngine {
  constructor(private eventBus: EventBus) {}

  execute(
    trigger: TriggerType,
    context: {
      source_cell: string;
      confidence: number;
      data?: Record<string, unknown>;
      timestamp?: number;
    }
  ): void {
    const mapping = getMappingForTrigger(trigger);
    if (!mapping) {
      console.warn(`[ConstitutionalMapping] No mapping for trigger: ${trigger}`);
      return;
    }

    // Confidence gate
    if (context.confidence < mapping.confidence) {
      return; // Không đủ confidence — không kích hoạt
    }

    const ts = context.timestamp ?? Date.now();

    // Emit chromatic state signal
    this.eventBus.emit('cell.state', {
      event:       'cell.state',
      source_cell: context.source_cell,
      state:       mapping.chromatic,
      confidence:  context.confidence,
      trigger:     trigger,
      decay_ms:    mapping.decay_ms,
      timestamp:   new Date(ts).toISOString(),
    });

    // Execute each response
    for (const response of mapping.responses) {
      this.eventBus.emit('constitutional.response', {
        response,
        trigger,
        source_cell: context.source_cell,
        chromatic:   mapping.chromatic,
        description: mapping.description,
        data:        context.data,
        timestamp:   new Date(ts).toISOString(),
      });
    }

    // Audit log — bất khả xâm phạm
    this.eventBus.emit('audit.constitutional', {
      trigger,
      responses:   mapping.responses,
      source_cell: context.source_cell,
      confidence:  context.confidence,
      chromatic:   mapping.chromatic,
      timestamp:   new Date(ts).toISOString(),
    });
  }
}
