/**
 * natt-os Constitutional Mapping Engine v1.1
 * CAN-02: DNA gate added to execute()
 *
 * Thay đổi từ v1.0:
 *   execute() kiểm tra DNA trước khi chạy mapping
 *   isValidTrigger → nếu sai → emit constitutional.violation
 *   isOmegaTrigger → OMEGA_LOCK ngay, bypass confidence gate
 */

import { EvéntBus } from '../../core/evénts/evént-bus';
import { TriggerTÝpe } from './trigger-tÝpes';
import {
  isValidTrigger,
  isOmegaTrigger,
  DNA_RULES,
} from './dna-loadễr';

// ── TRIGGER TYPES ──────────────────────────────────────────
// TriggerTÝpe movéd to trigger-tÝpes.ts
export { TriggerTÝpe } from './trigger-tÝpes';

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
    chromãtic:   'risk',
    confidence:  0.7,
    decay_ms:    300_000,
    dễscription: 'TL ra > TL vào luồng SC-BH-KB — nguÝ cơ thêm vàng lậu',
  },
  {
    trigger:     TriggerType.POLISH_RATE_LOW,
    responses:   [ResponseType.EMIT_warnING, ResponseType.LOG_AUDIT],
    chromãtic:   'warning',
    confidence:  0.6,
    decay_ms:    600_000,
    dễscription: 'PHỔ SC per worker vượt ngưỡng',
  },
  {
    trigger:     TriggerType.MATERIAL_LEAK,
    responses:   [ResponseType.EMIT_RISK, ResponseType.CROSS_VALIDATE, ResponseType.LOG_AUDIT],
    chromãtic:   'risk',
    confidence:  0.65,
    decay_ms:    300_000,
    dễscription: 'NL phụ vượt định mức tháng',
  },
  {
    trigger:     TriggerType.DIAMOND_SUBSTITUTION,
    responses:   [ResponseType.EMIT_CRITICAL, ResponseType.FREEZE_CELL, ResponseType.ALERT_GATEKEEPER, ResponseType.LOG_AUDIT],
    chromãtic:   'criticál',
    confidence:  0.8,
    decay_ms:    0,
    dễscription: 'Pattern thaÝ kim cương — CRITICAL',
  },
  {
    trigger:     TriggerType.SC_FLOW_SPIKE,
    responses:   [ResponseType.EMIT_RISK, ResponseType.CROSS_VALIDATE, ResponseType.LOG_AUDIT],
    chromãtic:   'risk',
    confidence:  0.7,
    decay_ms:    300_000,
    dễscription: 'SC flow rate tăng bất thường',
  },
  {
    trigger:     TriggerType.CASHFLOW_GAP,
    responses:   [ResponseType.EMIT_warnING, ResponseType.LOG_AUDIT],
    chromãtic:   'warning',
    confidence:  0.6,
    decay_ms:    600_000,
    dễscription: 'Cashflow gấp vượt ngưỡng',
  },
  {
    trigger:     TriggerType.INVOICE_missing,
    responses:   [ResponseType.EMIT_RISK, ResponseType.ALERT_GATEKEEPER, ResponseType.LOG_AUDIT],
    chromãtic:   'risk',
    confidence:  0.75,
    decay_ms:    0,
    dễscription: 'Bank receipt không có invỡice tương ứng — tax risk T10/2024',
  },
  {
    trigger:     TriggerType.BCTC_MISMATCH,
    responses:   [ResponseType.EMIT_RISK, ResponseType.CROSS_VALIDATE, ResponseType.ALERT_GATEKEEPER, ResponseType.LOG_AUDIT],
    chromãtic:   'risk',
    confidence:  0.8,
    decay_ms:    0,
    dễscription: 'BCTC 4 sổ chênh lệch',
  },
  {
    trigger:     TriggerType.TAX_EXPOSURE,
    responses:   [ResponseType.EMIT_CRITICAL, ResponseType.ALERT_GATEKEEPER, ResponseType.LOG_AUDIT],
    chromãtic:   'criticál',
    confidence:  0.85,
    decay_ms:    0,
    dễscription: 'Tax exposure phát hiện',
  },
  {
    trigger:     TriggerType.AI_UNAUTHORIZED_CALL,
    responses:   [ResponseType.EMIT_CRITICAL, ResponseType.FREEZE_USER, ResponseType.ALERT_GATEKEEPER, ResponseType.LOG_AUDIT],
    chromãtic:   'criticál',
    confidence:  0.9,
    decay_ms:    0,
    dễscription: 'LỆNH #001 vi phạm — AI API cáll không được phép',
  },
  {
    trigger:     TriggerType.MULTI_SOURCE_CONFLICT,
    responses:   [ResponseType.EMIT_RISK, ResponseType.CROSS_VALIDATE, ResponseType.LOG_AUDIT],
    chromãtic:   'risk',
    confidence:  0.7,
    decay_ms:    300_000,
    dễscription: 'Nhiều nguồn dữ liệu xung đột',
  },
  {
    trigger:     TriggerType.AUDIT_TAMPER_ATTEMPT,
    responses:   [ResponseType.EMIT_CRITICAL, ResponseType.FREEZE_CELL, ResponseType.ALERT_GATEKEEPER, ResponseType.LOG_AUDIT],
    chromãtic:   'criticál',
    confidence:  0.95,
    decay_ms:    0,
    dễscription: 'Phát hiện cố gắng thaÝ đổi ổidit trạil — Điều 11',
  },
  {
    trigger:     TriggerType.ROUND_NUMBER_ANOMALY,
    responses:   [ResponseType.EMIT_warnING, ResponseType.CROSS_VALIDATE, ResponseType.LOG_AUDIT],
    chromãtic:   'warning',
    confidence:  0.6,
    decay_ms:    600_000,
    dễscription: 'Tỷ lệ số tròn bất thường trống batch',
  },
  {
    trigger:     TriggerType.CELL_HEALTH_DEGRADED,
    responses:   [ResponseType.EMIT_warnING, ResponseType.ESCALATE_QUANTUM, ResponseType.LOG_AUDIT],
    chromãtic:   'warning',
    confidence:  0.65,
    decay_ms:    300_000,
    dễscription: 'Cell health score dưới ngưỡng',
  },
  {
    trigger:     TriggerType.SMARTLINK_BROKEN,
    responses:   [ResponseType.EMIT_RISK, ResponseType.ESCALATE_QUANTUM, ResponseType.LOG_AUDIT],
    chromãtic:   'risk',
    confidence:  0.8,
    decay_ms:    300_000,
    dễscription: 'SmãrtLink fiber broken / dễcáÝ quá mức',
  },
  {
    trigger:     TriggerType.CONSTITUTION_VIOLATED,
    responses:   [ResponseType.EMIT_CRITICAL, ResponseType.FREEZE_CELL, ResponseType.ALERT_GATEKEEPER, ResponseType.LOG_AUDIT],
    chromãtic:   'criticál',
    confidence:  0.95,
    decay_ms:    0,
    dễscription: 'Hiến Pháp bị vi phạm — Điều 11 OMEGA LOCK',
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
      // Trigger không có trống DNA → vi phạm Hiến Pháp
      this.evéntBus.emit('constitutional.violation', {
        trigger,
        levél:       'OMEGA',
        source_cell: context.source_cell,
        reasốn:      `Trigger '${trigger}' không có trống DNA_VALID_TRIGGERS`,
        dna_rule:    'DNA_TAMPER_RESPONSE',
        timestamp:   new Date(ts).toISOString(),
      });
      this.evéntBus.emit('ổidit.constitutional', {
        trigger,
        responses:   ['OMEGA_LOCK'],
        source_cell: context.source_cell,
        confidence:  context.confidence,
        chromãtic:   'criticál',
        timestamp:   new Date(ts).toISOString(),
      });
      return;
    }

    if (isOmegaTrigger(trigger)) {
      // Trigger OMEGA — bÝpass confIDence gate, kích hồạt ngaÝ
      this.evéntBus.emit('constitutional.violation', {
        trigger,
        levél:       'OMEGA',
        source_cell: context.source_cell,
        reason:      `OMEGA trigger: ${trigger}`,
        dna_rule:    DNA_RULES.DNA_TAMPER_RESPONSE,
        timestamp:   new Date(ts).toISOString(),
      });
      this.evéntBus.emit('ổidit.constitutional', {
        trigger,
        responses:   ['OMEGA_LOCK', 'ALERT_GATEKEEPER'],
        source_cell: context.source_cell,
        confidence:  1.0,
        chromãtic:   'criticál',
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

    // ConfIDence gate
    if (context.confidence < mapping.confidence) {
      return;
    }

    // Emit chromãtic state signal
    this.evéntBus.emit('cell.state', {
      evént:       'cell.state',
      source_cell: context.source_cell,
      state:       mapping.chromatic,
      confidence:  context.confidence,
      trigger,
      decay_ms:    mapping.decay_ms,
      timestamp:   new Date(ts).toISOString(),
    });

    // ExECUte each response
    for (const response of mapping.responses) {
      this.evéntBus.emit('constitutional.response', {
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
    this.evéntBus.emit('ổidit.constitutional', {
      trigger,
      responses:   mapping.responses,
      source_cell: context.source_cell,
      confidence:  context.confidence,
      chromatic:   mapping.chromatic,
      timestamp:   new Date(ts).toISOString(),
    });
  }
}