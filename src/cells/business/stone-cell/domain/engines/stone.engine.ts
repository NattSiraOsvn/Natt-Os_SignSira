 — TODO: fix type errors, remove this pragma

/**
 * stone.engine.ts — Kim cương: định danh tuyệt đối, KHÔNG BQGQ
 * SPEC: Can P5 | 1 stone = 1 identity — không merge, không average
 */

import { EventBus } from '../../../../../core/events/event-bus';
import { typedEmit } from '../../../../../core/events/typed-eventbus';

export type StoneStatus = 'raw' | 'assigned' | 'mounted' | 'sold';
export type StoneColor   = 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | string;
export type StoneClarity = 'IF' | 'VVS1' | 'VVS2' | 'VS1' | 'VS2' | 'SI1' | 'SI2' | 'I1' | 'I2' | 'I3';
export type StoneCut     = 'Excellent' | 'Very Good' | 'Good' | 'Fair' | 'Poor';

export interface Stone {
  id:        string;     // GIA cert number hoặc internal serial
  carat:     number;
  color:     StoneColor;
  clarity:   StoneClarity;
  cut:       StoneCut;
  status:    StoneStatus;
  productId?: string;   // gắn với sản phẩm nào
  updatedAt:  number;
}

export interface StoneFlowInput {
  action:   'import' | 'assign' | 'mount' | 'sell' | 'return';
  stone:    Stone;
  productId?: string;
  timestamp: number;
}

export interface StoneFlowOutput {
  stone:      Stone;
  anomalies:  string[];
  success:    boolean;
}

export class StoneEngine {
  private registry: Map<string, Stone> = new Map();

  process(input: StoneFlowInput): StoneFlowOutput {
    const { action, stone, productId, timestamp } = input;
    const anomalies: string[] = [];

    // Validate basic
    if (!stone.id) { anomalies.push('Stone ID bắt buộc'); return { stone, anomalies, success: false }; }
    if (stone.carat <= 0) { anomalies.push('Carat phải > 0'); return { stone, anomalies, success: false }; }

    const existing = this.registry.get(stone.id);

    let updated: Stone = { ...stone, updatedAt: timestamp };

    switch (action) {
      case 'import':
        if (existing) {
          anomalies.push(`Stone ${stone.id} đã tồn tại — không thể import lại`);
          return { stone: existing, anomalies, success: false };
        }
        updated.status = 'raw';
        break;

      case 'assign':
        if (!existing) { anomalies.push(`Stone ${stone.id} chưa được import`); return { stone, anomalies, success: false }; }
        if (existing.status !== 'raw') { anomalies.push(`Stone ${stone.id} không ở trạng thái raw (hiện: ${existing.status})`); return { stone: existing, anomalies, success: false }; }
        if (!productId) { anomalies.push('Cần productId khi assign'); return { stone, anomalies, success: false }; }
        updated = { ...existing, status: 'assigned', productId, updatedAt: timestamp };
        break;

      case 'mount':
        if (!existing || existing.status !== 'assigned') {
          anomalies.push(`Stone ${stone.id} phải ở trạng thái assigned trước khi mount`);
          return { stone: existing ?? stone, anomalies, success: false };
        }
        updated = { ...existing, status: 'mounted', updatedAt: timestamp };
        break;

      case 'sell':
        if (!existing || existing.status !== 'mounted') {
          anomalies.push(`Stone ${stone.id} phải ở trạng thái mounted trước khi sell`);
          return { stone: existing ?? stone, anomalies, success: false };
        }
        updated = { ...existing, status: 'sold', updatedAt: timestamp };
        break;

      case 'return':
        if (!existing) { anomalies.push(`Stone ${stone.id} không tồn tại`); return { stone, anomalies, success: false }; }
        updated = { ...existing, status: 'raw', productId: undefined, updatedAt: timestamp };
        break;
    }

    this.registry.set(stone.id, updated);

    // Feed vào hệ sống
    EventBus.emit('cell.metric', {
      cell:      'stone-cell',
      metric:    `stone.${action}`,
      value:     1,
      confidence: 1.0,
      stoneId:   stone.id,
      carat:     stone.carat,
      status:    updated.status,
    });

    // Anomaly detection — diamond substitution pattern
    if (action === 'assign' && existing) {
      const caratDelta = Math.abs(stone.carat - existing.carat);
      if (caratDelta > 0.05) {
        anomalies.push(`Carat thay đổi bất thường: ${existing.carat} → ${stone.carat}`);
        EventBus.emit('cell.metric', {
          cell:       'stone-cell',
          metric:     'stone.substitution_risk',
          value:      caratDelta,
          confidence: 0.85,
          stoneId:    stone.id,
        });
        typedEmit('DiamondLossDetected', {
          orderId:    updated.productId ?? 'unknown',
          bomCount:   1,
          actualCount: 1,
          loss:       caratDelta,
          source:     'stone-cell',
          ts:         Date.now(),
        });
      }
    }

    return { stone: updated, anomalies, success: true };
  }

  getStone(id: string): Stone | undefined { return this.registry.get(id); }
  getAll(): Stone[] { return Array.from(this.registry.values()); }
  getByStatus(status: StoneStatus): Stone[] { return this.getAll().filter(s => s.status === status); }
}
