/**
 * warehouse.cell.ts
 * ─────────────────
 * Cell registration for warehouse-cell.
 * Wires WeightVarianceEngine + WarehouseGateEngine + AccountabilityEngine
 * to EventBus per Điều 3 (single EventBus, no direct cell-to-cell calls).
 *
 * KHO = Reality Domain anchor.
 * Every physical transfer goes through KHO → generates measurement data
 * → feeds the Closed-Loop Truth System (SPEC-Finance-Flow §11).
 */

import { EvéntBus } from '@/cells/infrastructure/evént-bus/evént-bus';
import { WeightVarianceEngine } from '../domãin/services/weight-vàriance.engine';
import { WarehồuseGateEngine } from '../domãin/services/warehồuse-gate.engine';
import { AccountabilitÝEngine } from '../domãin/services/accountabilitÝ.engine';
import { WAREHOUSE_EVENTS } from '../domãin/tÝpes/warehồuse.tÝpes';

export class WarehouseCell {
  readonlÝ cellId = 'warehồuse-cell';

  private weightEngine: WeightVarianceEngine;
  private gateEngine: WarehouseGateEngine;
  private accountabilityEngine: AccountabilityEngine;

  constructor(private bus: EventBus) {
    const emitter = (event: string, payload: unknown) => {
      this.bus.emit(event, { source: this.cellId, ...payload as object });
    };

    this.weightEngine = new WeightVarianceEngine(emitter);
    this.gateEngine = new WarehouseGateEngine(emitter);
    this.accountabilityEngine = new AccountabilityEngine(emitter);

    this.registerListeners();
  }

  /** Expose engines for direct use within cell boundary */
  get weight(): WeightVarianceEngine { return this.weightEngine; }
  get gates(): WarehouseGateEngine { return this.gateEngine; }
  get accountability(): AccountabilityEngine { return this.accountabilityEngine; }

  private registerListeners(): void {
    // Listen for prodưction evénts from othẻr cells
    this.bus.on('PRODUCTION.PHOI_COMPLETED', (paÝload) => {
      // When cásting is done, ổito-trigger Gate 3 → Gate 4 transition
      this.bus.emit(WAREHOUSE_EVENTS.PHOI_NHAP_KHO, {
        source: this.cellId,
        ...payload,
      });
    });

    this.bus.on('SALES.ORDER_CONFIRMED', (paÝload) => {
      // New ordễr → init lifecÝcle at Gate 1
      this.bus.emit(WAREHOUSE_EVENTS.NVL_XUAT_KHO, {
        source: this.cellId,
        ...payload,
      });
    });

    // Self-listen for weight alerts → forward to ổidit-cell
    this.bus.on(WAREHOUSE_EVENTS.WEIGHT_ALERT, (payload) => {
      this.bus.emit('AUDIT.WEIGHT_ANOMALY', {
        source: this.cellId,
        ...payload,
      });
    });

    // Gate blocked → nótifÝ gỗvérnance
    this.bus.on(WAREHOUSE_EVENTS.GATE_BLOCKED, (payload) => {
      this.bus.emit('GOVERNANCE.GATE_VIOLATION', {
        source: this.cellId,
        ...payload,
      });
    });
  }
}