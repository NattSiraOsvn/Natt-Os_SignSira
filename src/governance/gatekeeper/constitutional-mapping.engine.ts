// @ts-nocheck
/**
 * NATT-OS Constitutional Mapping Engine v1.1
 * CAN-02: DNA gate added to execute()
 *
 * Thay đổi từ v1.0:
 *   execute() kiểm tra DNA trước khi chạy mapping
 *   isValidTrigger → nếu sai → emit constitutional.violation
 *   isOmegaTrigger → OMEGA_LOCK ngay, bypass confidence gate
 */

import { EventBus } from '../../core/events/event-bus';
import {
  isValidTrigger,
  isOmegaTrigger,
  DNA_RULES,
} from './dna-loader';

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
  trigger:     TriggerType;
  responses:   ResponseType[];
  chromatic:   string;
  confidence:  number;
  decay_ms:    number;
  description: string;
}

// ── CONSTITUTIONAL MAPPING TABLE ───────────────────────────
export const CONSTITUTIONAL_MAPPING: MappingEntry[] = [
  {
    trigger:     TriggerType.WEIGHT_ANOMALY,
    responses:   [ResponseType.EMIT_RISK, ResponseType.CROSS_VALIDATE, ResponseType.LOG_AUDIT],
    chromatic:   'risk',
    confidence:  0.7,
    decay_ms:    300_000,
    description: 'TL ra > TL vào luồng SC-BH-KB — nguy cơ thêm vàng lậu',
  },
  {
    trigger:     TriggerType.POLISH_RATE_LOW,
    responses:   [ResponseType.EMIT_WARNING, ResponseType.LOG_AUDIT],
    chromatic:   'warning',
    confidence:  0.6,
    decay_ms:    600_000,
    description: 'PHỔ SC per worker vượt ngưỡng',
  },
  {
    trigger:     TriggerType.MATERIAL_LEAK,
    responses:   [ResponseType.EMIT_RISK, ResponseType.CROSS_VALIDATE, ResponseType.LOG_AUDIT],
    chromatic:   'risk',
    confidence:  0.65,
    decay_ms:    300_000,
    description: 'NL phụ vượt định mức tháng',
  },
  {
    trigger:     TriggerType.DIAMOND_SUBSTITUTION,
    responses:   [ResponseType.EMIT_CRITICAL, ResponseType.FREEZE_CELL, ResponseType.ALERT_GATEKEEPER, ResponseType.LOG_AUDIT],
    chromatic:   'critical',
    confidence:  0.8,
    decay_ms:    0,
    description: 'Pattern thay kim cương — CRITICAL',
  },
  {
    trigger:     TriggerType.SC_FLOW_SPIKE,
    responses:   [ResponseType.EMIT_RISK, ResponseType.CROSS_VALIDATE, ResponseType.LOG_AUDIT],
    chromatic:   'risk',
    confidence:  0.7,
    decay_ms:    300_000,
    description: 'SC flow rate tăng bất thường',
  },
  {
    trigger:     TriggerType.CASHFLOW_GAP,
    responses:   [ResponseType.EMIT_WARNING, ResponseType.LOG_AUDIT],
    chromatic:   'warning',
    confidence:  0.6,
    decay_ms:    600_000,
    description: 'Cashflow gap vượt ngưỡng',
  },
  {
    trigger:     TriggerType.INVOICE_MISSING,
    responses:   [ResponseType.EMIT_RISK, ResponseType.ALERT_GATEKEEPER, ResponseType.LOG_AUDIT],
    chromatic:   'risk',
    confidence:  0.75,
    decay_ms:    0,
    description: 'Bank receipt không có invoice tương ứng — tax risk T10/2024',
  },
  {
    trigger:     TriggerType.BCTC_MISMATCH,
    responses:   [ResponseType.EMIT_RISK, ResponseType.CROSS_VALIDATE, ResponseType.ALERT_GATEKEEPER, ResponseType.LOG_AUDIT],
    chromatic:   'risk',
    confidence:  0.8,
    decay_ms:    0,
    description: 'BCTC 4 sổ chênh lệch',
  },
  {
    trigger:     TriggerType.TAX_EXPOSURE,
    responses:   [ResponseType.EMIT_CRITICAL, ResponseType.ALERT_GATEKEEPER, ResponseType.LOG_AUDIT],
    chromatic:   'critical',
    confidence:  0.85,
    decay_ms:    0,
    description: 'Tax exposure phát hiện',
  },
  {
    trigger:     TriggerType.AI_UNAUTHORIZED_CALL,
    responses:   [ResponseType.EMIT_CRITICAL, ResponseType.FREEZE_USER, ResponseType.ALERT_GATEKEEPER, ResponseType.LOG_AUDIT],
    chromatic:   'critical',
    confidence:  0.9,
    decay_ms:    0,
    description: 'LỆNH #001 vi phạm — AI API call không được phép',
  },
  {
    trigger:     TriggerType.MULTI_SOURCE_CONFLICT,
    responses:   [ResponseType.EMIT_RISK, ResponseType.CROSS_VALIDATE, ResponseType.LOG_AUDIT],
    chromatic:   'risk',
    confidence:  0.7,
    decay_ms:    300_000,
    description: 'Nhiều nguồn dữ liệu xung đột',
  },
  {
    trigger:     TriggerType.AUDIT_TAMPER_ATTEMPT,
    responses:   [ResponseType.EMIT_CRITICAL, ResponseType.FREEZE_CELL, ResponseType.ALERT_GATEKEEPER, ResponseType.LOG_AUDIT],
    chromatic:   'critical',
    confidence:  0.95,
    decay_ms:    0,
    description: 'Phát hiện cố gắng thay đổi audit trail — Điều 11',
  },
  {
    trigger:     TriggerType.ROUND_NUMBER_ANOMALY,
    responses:   [ResponseType.EMIT_WARNING, ResponseType.CROSS_VALIDATE, ResponseType.LOG_AUDIT],
    chromatic:   'warning',
    confidence:  0.6,
    decay_ms:    600_000,
    description: 'Tỷ lệ số tròn bất thường trong batch',
  },
  {
    trigger:     TriggerType.CELL_HEALTH_DEGRADED,
    responses:   [ResponseType.EMIT_WARNING, ResponseType.ESCALATE_QUANTUM, ResponseType.LOG_AUDIT],
    chromatic:   'warning',
    confidence:  0.65,
    decay_ms:    300_000,
    description: 'Cell health score dưới ngưỡng',
  },
  {
    trigger:     TriggerType.SMARTLINK_BROKEN,
    responses:   [ResponseType.EMIT_RISK, ResponseType.ESCALATE_QUANTUM, ResponseType.LOG_AUDIT],
    chromatic:   'risk',
    confidence:  0.8,
    decay_ms:    300_000,
    description: 'SmartLink fiber broken / decay quá mức',
  },
  {
    trigger:     TriggerType.CONSTITUTION_VIOLATED,
    responses:   [ResponseType.EMIT_CRITICAL, ResponseType.FREEZE_CELL, ResponseType.ALERT_GATEKEEPER, ResponseType.LOG_AUDIT],
    chromatic:   'critical',
    confidence:  0.95,
    decay_ms:    0,
    description: 'Hiến Pháp bị vi phạm — Điều 11 OMEGA LOCK',
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
  constructor(private eventBus: typeof EventBus) {}

  execute(
    trigger: TriggerType,
    context: {
      source_cell: string;
      confidence:  number;
      data?:       Record<string, unknown>;
      timestamp?:  number;
    }
  ): void {
    const ts = context.timestamp ?? Date.now();

    // ── CAN-02: DNA GATE — kiểm tra trước tất cả ──────────
    if (!isValidTrigger(trigger)) {
      // Trigger không có trong DNA → vi phạm Hiến Pháp
      this.eventBus.emit('constitutional.violation', {
        trigger,
        level:       'OMEGA',
        source_cell: context.source_cell,
        reason:      `Trigger '${trigger}' không có trong DNA_VALID_TRIGGERS`,
        dna_rule:    'DNA_TAMPER_RESPONSE',
        timestamp:   new Date(ts).toISOString(),
      });
      this.eventBus.emit('audit.constitutional', {
        trigger,
        responses:   ['OMEGA_LOCK'],
        source_cell: context.source_cell,
        confidence:  context.confidence,
        chromatic:   'critical',
        timestamp:   new Date(ts).toISOString(),
      });
      return;
    }

    if (isOmegaTrigger(trigger)) {
      // Trigger OMEGA — bypass confidence gate, kích hoạt ngay
      this.eventBus.emit('constitutional.violation', {
        trigger,
        level:       'OMEGA',
        source_cell: context.source_cell,
        reason:      `OMEGA trigger: ${trigger}`,
        dna_rule:    DNA_RULES.DNA_TAMPER_RESPONSE,
        timestamp:   new Date(ts).toISOString(),
      });
      this.eventBus.emit('audit.constitutional', {
        trigger,
        responses:   ['OMEGA_LOCK', 'ALERT_GATEKEEPER'],
        source_cell: context.source_cell,
        confidence:  1.0,
        chromatic:   'critical',
        timestamp:   new Date(ts).toISOString(),
      });
      return;
    }
    // ── END DNA GATE ───────────────────────────────────────

    const mapping = getMappingForTrigger(trigger);
    if (!mapping) {
      console.warn(`[ConstitutionalMapping] No mapping for trigger: ${trigger}`);
      return;
    }

    // Confidence gate
    if (context.confidence < mapping.confidence) {
      return;
    }

    // Emit chromatic state signal
    this.eventBus.emit('cell.state', {
      event:       'cell.state',
      source_cell: context.source_cell,
      state:       mapping.chromatic,
      confidence:  context.confidence,
      trigger,
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

    // Audit log — bất khả xâm phạm (Điều 7)
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
