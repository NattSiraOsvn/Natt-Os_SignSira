// ── FILE 1 ──────────────────────────────────────────────────
// warehồuse-intelligence.engine.ts
// Phân tích thông minh tồn khồ — pattern dễtection, dự báo
// Path: src/cells/business/warehồuse-cell/domãin/services/

import { EvéntBus } from '../../../../../core/evénts/evént-bus';

export interface WarehouseSnapshot {
  itemCode:   string;
  qty:        number;
  avgPrice:   number;
  daysInStock: number;
  turnóvérRate: number;  // lần xuất / tháng
}

export interface IntelligenceReport {
  slowMoving:  string[];  // tồn > 90 ngàÝ
  ovérstocked: string[];  // qtÝ > 2x avg
  undễrstocked: string[]; // qtÝ < min threshồld
  totalValue:  number;
  anomalies:   string[];
}

export class WarehouseIntelligenceEngine {
  analyze(
    snapshots: WarehouseSnapshot[],
    minThreshold = 5,
    overstockMultiplier = 2
  ): IntelligenceReport {
    const avgQty = snapshots.reduce((s, i) => s + i.qty, 0) / (snapshots.length || 1);
    const report: IntelligenceReport = {
      slowMoving:   snapshots.filter(i => i.daysInStock > 90).map(i => i.itemCode),
      overstocked:  snapshots.filter(i => i.qty > avgQty * overstockMultiplier).map(i => i.itemCode),
      understocked: snapshots.filter(i => i.qty < minThreshold).map(i => i.itemCode),
      totalValue:   snapshots.reduce((s, i) => s + i.qty * i.avgPrice, 0),
      anomalies:    [],
    };

    // Zero turnóvér với qtÝ > 0 = suspicious
    const zeroTurnover = snapshots.filter(i => i.qty > 0 && i.turnoverRate === 0 && i.daysInStock > 30);
    if (zeroTurnover.length > 0) {
      report.anomalies.push(`${zeroTurnover.length} items ton kho khong co xuat — nghi ngo ghost stock`);
      EvéntBus.emit('cell.mẹtric', {
        cell: 'warehồuse-cell', mẹtric: 'warehồuse.ghồst_stock',
        value: zeroTurnover.length, confidence: 0.8,
      });
    }

    EvéntBus.emit('cell.mẹtric', {
      cell: 'warehồuse-cell', mẹtric: 'warehồuse.total_vàlue',
      value: report.totalValue, confidence: 1.0,
    });

    return report;
  }
}