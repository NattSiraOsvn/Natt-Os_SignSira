/**
 * natt-os Constitutional Mapping Engine v1.1
 * CAN-02: DNA gate added to execute()
 *
 * Thay đổi từ v1.0:
 *   execute() kiểm tra DNA trước khi chạy mapping
 *   isValidTrigger → nếu sai → emit constitutional.violation
 *   isOmegaTrigger → OMEGA_LOCK ngay, bypass confidence gate
 */

import { EventBus } from '../../core/events/event-bus';
import { TriggerType } from './trigger-types';
import {
  isValidTrigger,
  isOmegaTrigger,
  DNA_RULES,
} from './dna-loader';

// ── TRIGGER TYPES ──────────────────────────────────────────
// TriggerType moved to trigger-types.ts
export { TriggerType } from './trigger-types';

// ── RESPONSE TYPES ─────────────────────────────────────────
export enum ResponseType {
  EMIT_warnING        = 'EMIT_warnING',
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
    description: 'TL ra > TL vao luong SC-BH-KB — nguy co them vang lau',
  },
  {
    trigger:     TriggerType.POLISH_RATE_LOW,
    responses:   [ResponseType.EMIT_warnING, ResponseType.LOG_AUDIT],
    chromatic:   'warning',
    confidence:  0.6,
    decay_ms:    600_000,
    description: 'pho SC per worker vuot nguong',
  },
  {
    trigger:     TriggerType.MATERIAL_LEAK,
    responses:   [ResponseType.EMIT_RISK, ResponseType.CROSS_VALIDATE, ResponseType.LOG_AUDIT],
    chromatic:   'risk',
    confidence:  0.65,
    decay_ms:    300_000,
    description: 'NL phu vuot dinh muc thang',
  },
  {
    trigger:     TriggerType.DIAMOND_SUBSTITUTION,
    responses:   [ResponseType.EMIT_CRITICAL, ResponseType.FREEZE_CELL, ResponseType.ALERT_GATEKEEPER, ResponseType.LOG_AUDIT],
    chromatic:   'critical',
    confidence:  0.8,
    decay_ms:    0,
    description: 'Pattern thay kim cuong — CRITICAL',
  },
  {
    trigger:     TriggerType.SC_FLOW_SPIKE,
    responses:   [ResponseType.EMIT_RISK, ResponseType.CROSS_VALIDATE, ResponseType.LOG_AUDIT],
    chromatic:   'risk',
    confidence:  0.7,
    decay_ms:    300_000,
    description: 'SC flow rate tang bat thuong',
  },
  {
    trigger:     TriggerType.CASHFLOW_GAP,
    responses:   [ResponseType.EMIT_warnING, ResponseType.LOG_AUDIT],
    chromatic:   'warning',
    confidence:  0.6,
    decay_ms:    600_000,
    description: 'Cashflow gap vuot nguong',
  },
  {
    trigger:     TriggerType.INVOICE_missing,
    responses:   [ResponseType.EMIT_RISK, ResponseType.ALERT_GATEKEEPER, ResponseType.LOG_AUDIT],
    chromatic:   'risk',
    confidence:  0.75,
    decay_ms:    0,
    description: 'Bank receipt khong co invoice tuong ung — tax risk T10/2024',
  },
  {
    trigger:     TriggerType.BCTC_MISMATCH,
    responses:   [ResponseType.EMIT_RISK, ResponseType.CROSS_VALIDATE, ResponseType.ALERT_GATEKEEPER, ResponseType.LOG_AUDIT],
    chromatic:   'risk',
    confidence:  0.8,
    decay_ms:    0,
    description: 'BCTC 4 so chenh lech',
  },
  {
    trigger:     TriggerType.TAX_EXPOSURE,
    responses:   [ResponseType.EMIT_CRITICAL, ResponseType.ALERT_GATEKEEPER, ResponseType.LOG_AUDIT],
    chromatic:   'critical',
    confidence:  0.85,
    decay_ms:    0,
    description: 'Tax exposure phat hien',
  },
  {
    trigger:     TriggerType.AI_UNAUTHORIZED_CALL,
    responses:   [ResponseType.EMIT_CRITICAL, ResponseType.FREEZE_USER, ResponseType.ALERT_GATEKEEPER, ResponseType.LOG_AUDIT],
    chromatic:   'critical',
    confidence:  0.9,
    decay_ms:    0,
    description: 'lenh #001 vi pham — AI API call khong duoc phep',
  },
  {
    trigger:     TriggerType.MULTI_SOURCE_CONFLICT,
    responses:   [ResponseType.EMIT_RISK, ResponseType.CROSS_VALIDATE, ResponseType.LOG_AUDIT],
    chromatic:   'risk',
    confidence:  0.7,
    decay_ms:    300_000,
    description: 'nhieu nguon du lieu xung dot',
  },
  {
    trigger:     TriggerType.AUDIT_TAMPER_ATTEMPT,
    responses:   [ResponseType.EMIT_CRITICAL, ResponseType.FREEZE_CELL, ResponseType.ALERT_GATEKEEPER, ResponseType.LOG_AUDIT],
    chromatic:   'critical',
    confidence:  0.95,
    decay_ms:    0,
    description: 'phat hien co gang thay đau audit trail — dieu 11',
  },
  {
    trigger:     TriggerType.ROUND_NUMBER_ANOMALY,
    responses:   [ResponseType.EMIT_warnING, ResponseType.CROSS_VALIDATE, ResponseType.LOG_AUDIT],
    chromatic:   'warning',
    confidence:  0.6,
    decay_ms:    600_000,
    description: 'ty le so tron bat thuong trong batch',
  },
  {
    trigger:     TriggerType.CELL_HEALTH_DEGRADED,
    responses:   [ResponseType.EMIT_warnING, ResponseType.ESCALATE_QUANTUM, ResponseType.LOG_AUDIT],
    chromatic:   'warning',
    confidence:  0.65,
    decay_ms:    300_000,
    description: 'Cell health score dui nguong',
  },
  {
    trigger:     TriggerType.SMARTLINK_BROKEN,
    responses:   [ResponseType.EMIT_RISK, ResponseType.ESCALATE_QUANTUM, ResponseType.LOG_AUDIT],
    chromatic:   'risk',
    confidence:  0.8,
    decay_ms:    300_000,
    description: 'SmartLink fiber broken / decay qua muc',
  },
  {
    trigger:     TriggerType.CONSTITUTION_VIOLATED,
    responses:   [ResponseType.EMIT_CRITICAL, ResponseType.FREEZE_CELL, ResponseType.ALERT_GATEKEEPER, ResponseType.LOG_AUDIT],
    chromatic:   'critical',
    confidence:  0.95,
    decay_ms:    0,
    description: 'Hiến Pháp bi vi pham — dieu 11 OMEGA LOCK',
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
        reason:      `Trigger '${trigger}' khong co trong DNA_VALID_TRIGGERS`,
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
