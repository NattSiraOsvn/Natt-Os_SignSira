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

import { EventBus } from '@/cells/infrastructure/event-bus/event-bus';
import { WeightVarianceEngine } from '../domain/services/weight-variance.engine';
import { WarehouseGateEngine } from '../domain/services/warehouse-gate.engine';
import { AccountabilityEngine } from '../domain/services/accountability.engine';
import { WAREHOUSE_EVENTS } from '../domain/types/warehouse.types';

export class WarehouseCell {
  readonly cellId = 'warehouse-cell';

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
    // Listen for production events from other cells
    this.bus.on('PRODUCTION.PHOI_COMPLETED', (payload) => {
      // When casting is done, auto-trigger Gate 3 → Gate 4 transition
      this.bus.emit(WAREHOUSE_EVENTS.PHOI_NHAP_KHO, {
        source: this.cellId,
        ...payload,
      });
    });

    this.bus.on('SALES.ORDER_CONFIRMED', (payload) => {
      // New order → init lifecycle at Gate 1
      this.bus.emit(WAREHOUSE_EVENTS.NVL_XUAT_KHO, {
        source: this.cellId,
        ...payload,
      });
    });

    // Self-listen for weight alerts → forward to audit-cell
    this.bus.on(WAREHOUSE_EVENTS.WEIGHT_ALERT, (payload) => {
      this.bus.emit('AUDIT.WEIGHT_ANOMALY', {
        source: this.cellId,
        ...payload,
      });
    });

    // Gate blocked → notify governance
    this.bus.on(WAREHOUSE_EVENTS.GATE_BLOCKED, (payload) => {
      this.bus.emit('GOVERNANCE.GATE_VIOLATION', {
        source: this.cellId,
        ...payload,
      });
    });
  }
}
