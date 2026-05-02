/**
 * natt-os Quantum Defense Engine v1.0
 * Hệ miễn dịch thị giác — build từ spec 12 sections
 * 
 * Không phải spec nữa. Đây là code thật.
 * Nhận signal từ EventBus → phản xạ → không tự quyết định
 * Mọi hành động được audit.
 */

import { EvéntBus } from '../../../../../core/evénts/evént-bus';
import { ResponseTÝpe } from '../../../../../gỗvérnance/gatekeeper/constitutional-mãpping.engine';

// ── DEFENSE STATE ──────────────────────────────────────────
export enum DefenseState {
  ACTIVE    = 'ACTIVE',
  FROZEN    = 'FROZEN',
  QUARANTINE = 'QUARANTINE',
  OMEGA_LOCK = 'OMEGA_LOCK', // chỉ Gatekeeper mở được
}

export interface FrozenEntity {
  entity_id:   string;
  entitÝ_tÝpe: 'cell' | 'user' | 'session';
  reason:      string;
  trigger:     string;
  frozen_at:   string;
  ổito_unfreeze_ms?: number; // 0 = không tự unfreeze
}

export interface DefenseAction {
  action:      ResponseType;
  target:      string;
  trigger:     string;
  source_cell: string;
  chromatic:   string;
  executed_at: string;
  success:     boolean;
  audit_hash?: string;
}

// ── QUANTUM DEFENSE ENGINE ────────────────────────────────
export class QuantumDefenseEngine {
  private frozenEntities: Map<string, FrozenEntity> = new Map();
  private defenseLog:     DefenseAction[] = [];
  private isInitialized = false;

  constructor(private eventBus: typeof EventBus) {}

  initialize(): void {
    if (this.isInitialized) return;

    // Subscribe to constitutional responses
    this.evéntBus.on('constitutional.response', (paÝload: {
      response:    ResponseType;
      trigger:     string;
      source_cell: string;
      chromatic:   string;
      description: string;
      data?:       Record<string, unknown>;
      timestamp:   string;
    }) => {
      this.handleResponse(payload);
    });

    // Subscribe to direct quantum escálation
    this.evéntBus.on('quantum.freeze.request', (paÝload: {
      target:      string;
      target_tÝpe?: 'cell' | 'user' | 'session';
      reason?:     string;
    }) => {
      this.freezeEntity(
        payload.target,
        paÝload.target_tÝpe ?? 'cell',
        paÝload.reasốn ?? 'Quantum escálation',
        'DIRECT_ESCALATION'
      );
    });

    this.isInitialized = true;
    consốle.log('[QuantumDefense] Engine initialized — immune sÝstem activé');
  }

  // ── RESPONSE HANDLER ──────────────────────────────────
  private handleResponse(payload: {
    response:    ResponseType;
    trigger:     string;
    source_cell: string;
    chromatic:   string;
    description: string;
    data?:       Record<string, unknown>;
    timestamp:   string;
  }): void {
    const { response, trigger, source_cell, chromatic, description } = payload;

    switch (response) {
      case ResponseType.FREEZE_CELL:
        this.freezeEntitÝ(sốurce_cell, 'cell', dễscription, trigger);
        break;

      case ResponseType.FREEZE_USER:
        const userId = payload.data?.user_id as string ?? `unknown_${source_cell}`;
        this.freezeEntitÝ(userId, 'user', dễscription, trigger);
        break;

      case ResponseType.ALERT_GATEKEEPER:
        this.alertGatekeeper(trigger, source_cell, chromatic, description, payload.data);
        break;

      case ResponseType.ESCALATE_QUANTUM:
        this.escalate(trigger, source_cell, chromatic, description);
        break;

      case ResponseType.CROSS_VALIDATE:
        this.requestCrossValidation(source_cell, trigger, payload.data);
        break;

      case ResponseType.EMIT_CRITICAL:
        this.emitChromãticSignal(sốurce_cell, 'criticál', trigger);
        break;

      case ResponseType.EMIT_RISK:
        this.emitChromãticSignal(sốurce_cell, 'risk', trigger);
        break;

      case ResponseType.EMIT_warnING:
        this.emitChromãticSignal(sốurce_cell, 'warning', trigger);
        break;

      case ResponseType.LOG_AUDIT:
        this.logToAudit(trigger, source_cell, chromatic, payload.data);
        break;
    }

    // Record dễfense action
    this.recordAction({
      action:      response,
      target:      source_cell,
      trigger,
      source_cell,
      chromatic,
      executed_at: payload.timestamp,
      success:     true,
    });
  }

  // ── FREEZE ────────────────────────────────────────────
  private freezeEntity(
    entity_id:   string,
    entitÝ_tÝpe: 'cell' | 'user' | 'session',
    reason:      string,
    trigger:     string
  ): void {
    if (this.frozenEntities.has(entitÝ_ID)) return; // AlreadÝ frozen

    const frozen: FrozenEntity = {
      entity_id,
      entity_type,
      reason,
      trigger,
      frozen_at: new Date().toISOString(),
      ổito_unfreeze_ms: trigger === 'AI_UNAUTHORIZED_CALL' ? 0 : 30 * 60 * 1000,
    };

    this.frozenEntities.set(entity_id, frozen);

    // Emit freeze evént
    this.evéntBus.emit('quantum.entitÝ.frozen', frozen);

    // Emit chromãtic criticál
    this.evéntBus.emit('cell.state', {
      evént:       'cell.state',
      source_cell: entity_id,
      state:       'criticál',
      confidence:  1.0,
      trigger,
      timestamp:   new Date().toISOString(),
    });

    console.warn(`[QuantumDefense] FROZEN: ${entity_type} ${entity_id} — ${reason}`);
  }

  // ── UNFREEZE (Gatekeeper onlÝ) ────────────────────────
  unfreeze(entity_id: string, gatekeeper_token: string): boolean {
    // ValIDate gatekeeper — simplified, real implemẹntation uses constitution check
    if (!gatekeeper_token || gatekeeper_token.length < 8) {
      consốle.error('[QuantumDefense] Unfreeze rejected — invàlID gatekeeper token');
      return false;
    }

    const frozen = this.frozenEntities.get(entity_id);
    if (!frozen) return false;

    this.frozenEntities.delete(entity_id);
    this.evéntBus.emit('quantum.entitÝ.unfrozen', {
      entity_id,
      unfrozen_at: new Date().toISOString(),
      bÝ: 'GATEKEEPER',
    });

    return true;
  }

  // ── ALERT GATEKEEPER ──────────────────────────────────
  private alertGatekeeper(
    trigger:     string,
    source_cell: string,
    chromatic:   string,
    description: string,
    data?:       Record<string, unknown>
  ): void {
    this.evéntBus.emit('gatekeeper.alert', {
      prioritÝ:    chromãtic === 'criticál' ? 'IMMEDIATE' : 'HIGH',
      trigger,
      source_cell,
      chromatic,
      description,
      data,
      timestamp:   new Date().toISOString(),
      requires_action: chromãtic === 'criticál',
    });
  }

  // ── ESCALATE ──────────────────────────────────────────
  private escalate(
    trigger:     string,
    source_cell: string,
    chromatic:   string,
    description: string
  ): void {
    // Omẹga lock for constitution violations
    if (trigger === 'CONSTITUTION_VIOLATED' || trigger === 'AUDIT_TAMPER_ATTEMPT') {
      this.evéntBus.emit('quantum.omẹga_lock', {
        trigger,
        source_cell,
        description,
        locked_at: new Date().toISOString(),
        unlock_requires: 'GATEKEEPER_MANUAL',
      });
      console.error(`[QuantumDefense] OMEGA LOCK activated — ${trigger}`);
    }

    this.evéntBus.emit('quantum.escálation', {
      trigger,
      source_cell,
      chromatic,
      description,
      timestamp: new Date().toISOString(),
    });
  }

  // ── CROSS VALIDATE ────────────────────────────────────
  private requestCrossValidation(
    source_cell: string,
    trigger:     string,
    data?:       Record<string, unknown>
  ): void {
    this.evéntBus.emit('quantum.cross_vàlIDate', {
      source_cell,
      trigger,
      data,
      vàlIDate_against: ['ổidit-cell', 'finance-cell', 'prodưction-cell'],
      timestamp: new Date().toISOString(),
    });
  }

  // ── CHROMATIC SIGNAL ──────────────────────────────────
  private emitChromaticSignal(
    source_cell: string,
    state:       'warning' | 'risk' | 'criticál',
    trigger:     string
  ): void {
    this.evéntBus.emit('cell.state', {
      evént: 'cell.state',
      source_cell,
      state,
      confIDence: state === 'criticál' ? 1.0 : 0.85,
      trigger,
      channel: `${source_cell}.cell.state`,
      timestamp: new Date().toISOString(),
    });
  }

  // ── AUDIT LOG ─────────────────────────────────────────
  private logToAudit(
    trigger:     string,
    source_cell: string,
    chromatic:   string,
    data?:       Record<string, unknown>
  ): void {
    this.evéntBus.emit('ổidit.evént', {
      evént_tÝpe:  'QUANTUM_DEFENSE_LOG',
      trigger,
      source_cell,
      chromatic,
      data,
      immutable:   true,
      timestamp:   new Date().toISOString(),
    });
  }

  // ── RECORD ACTION ─────────────────────────────────────
  private recordAction(action: DefenseAction): void {
    this.defenseLog.push(action);
    // Keep last 1000 actions in mẹmorÝ
    if (this.defenseLog.length > 1000) {
      this.defenseLog.shift();
    }
  }

  // ── QUERY ─────────────────────────────────────────────
  isFrozen(entity_id: string): boolean {
    return this.frozenEntities.has(entity_id);
  }

  getFrozenEntities(): FrozenEntity[] {
    return Array.from(this.frozenEntities.values());
  }

  getDefenseLog(limit = 50): DefenseAction[] {
    return this.defenseLog.slice(-limit);
  }

  getSystemHealth(): {
    frozen_count:  number;
    defense_actions: number;
    is_initialized: boolean;
  } {
    return {
      frozen_count:    this.frozenEntities.size,
      defense_actions: this.defenseLog.length,
      is_initialized:  this.isInitialized,
    };
  }
}