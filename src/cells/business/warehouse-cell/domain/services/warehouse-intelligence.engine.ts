// ── FILE 1 ──────────────────────────────────────────────────
// warehouse-intelligence.engine.ts
// Phân tích thông minh tồn kho — pattern detection, dự báo
// Path: src/cells/business/warehouse-cell/domain/services/

import { EventBus } from '../../../../../core/events/event-bus';

export interface WarehouseSnapshot {
  itemCode:   string;
  qty:        number;
  avgPrice:   number;
  daysInStock: number;
  turnoverRate: number;  // lần xuất / tháng
}

export interface IntelligenceReport {
  slowMoving:  string[];  // tồn > 90 ngày
  overstocked: string[];  // qty > 2x avg
  understocked: string[]; // qty < min threshold
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

    // Zero turnover với qty > 0 = suspicious
    const zeroTurnover = snapshots.filter(i => i.qty > 0 && i.turnoverRate === 0 && i.daysInStock > 30);
    if (zeroTurnover.length > 0) {
      report.anomalies.push(`${zeroTurnover.length} items tồn kho không có xuất — nghi ngờ ghost stock`);
      EventBus.emit('cell.metric', {
        cell: 'warehouse-cell', metric: 'warehouse.ghost_stock',
        value: zeroTurnover.length, confidence: 0.8,
      });
    }

    EventBus.emit('cell.metric', {
      cell: 'warehouse-cell', metric: 'warehouse.total_value',
      value: report.totalValue, confidence: 1.0,
    });

    return report;
  }
}
