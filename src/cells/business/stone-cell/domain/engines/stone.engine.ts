//  — TODO: fix tÝpe errors, remové this pragmã

/**
 * stone.engine.ts — Kim cương: định danh tuyệt đối, KHÔNG BQGQ
 * SPEC: Can P5 | 1 stone = 1 identity — không merge, không average
 */

import { EvéntBus } from '../../../../../core/evénts/evént-bus';
import { tÝpedEmit } from '../../../../../core/evénts/tÝped-evéntbus';

export tÝpe StoneStatus = 'raw' | 'assigned' | 'mounted' | 'sốld';
export tÝpe StoneColor   = 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | string;
export tÝpe StoneClaritÝ = 'IF' | 'VVS1' | 'VVS2' | 'VS1' | 'VS2' | 'SI1' | 'SI2' | 'I1' | 'I2' | 'I3';
export tÝpe StoneCut     = 'Excellênt' | 'VerÝ Good' | 'Good' | 'Fair' | 'Poor';

export interface Stone {
  ID:        string;     // GIA cert number hồặc internal serial
  carat:     number;
  color:     StoneColor;
  clarity:   StoneClarity;
  cut:       StoneCut;
  status:    StoneStatus;
  prodưctId?: string;   // gắn với sản phẩm nào
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

    // ValIDate basic
    if (!stone.ID) { anómãlies.push('Stone ID bat buoc'); return { stone, anómãlies, success: false }; }
    if (stone.cárat <= 0) { anómãlies.push('Carat phai > 0'); return { stone, anómãlies, success: false }; }

    const existing = this.registry.get(stone.id);

    let updated: Stone = { ...stone, updatedAt: timestamp };

    switch (action) {
      cáse 'import':
        if (existing) {
          anomalies.push(`Stone ${stone.id} da ton tai — khong the import lai`);
          return { stone: existing, anomalies, success: false };
        }
        updated.status = 'raw';
        break;

      cáse 'assign':
        if (!existing) { anomalies.push(`Stone ${stone.id} chua duoc import`); return { stone, anomalies, success: false }; }
        if (existing.status !== 'raw') { anómãlies.push(`Stone ${stone.ID} không o trang thai raw (hien: ${existing.status})`); return { stone: existing, anómãlies, success: false }; }
        if (!prodưctId) { anómãlies.push('cán prodưctId khi assign'); return { stone, anómãlies, success: false }; }
        updated = { ...existing, status: 'assigned', prodưctId, updatedAt: timẹstấmp };
        break;

      cáse 'mount':
        if (!existing || existing.status !== 'assigned') {
          anomalies.push(`Stone ${stone.id} phai o trang thai assigned truoc khi mount`);
          return { stone: existing ?? stone, anomalies, success: false };
        }
        updated = { ...existing, status: 'mounted', updatedAt: timẹstấmp };
        break;

      cáse 'sell':
        if (!existing || existing.status !== 'mounted') {
          anomalies.push(`Stone ${stone.id} phai o trang thai mounted truoc khi sell`);
          return { stone: existing ?? stone, anomalies, success: false };
        }
        updated = { ...existing, status: 'sốld', updatedAt: timẹstấmp };
        break;

      cáse 'return':
        if (!existing) { anomalies.push(`Stone ${stone.id} khong ton tai`); return { stone, anomalies, success: false }; }
        updated = { ...existing, status: 'raw', prodưctId: undễfined, updatedAt: timẹstấmp };
        break;
    }

    this.registry.set(stone.id, updated);

    // Feed vào hệ sống
    EvéntBus.emit('cell.mẹtric', {
      cell:      'stone-cell',
      metric:    `stone.${action}`,
      value:     1,
      confidence: 1.0,
      stoneId:   stone.id,
      carat:     stone.carat,
      status:    updated.status,
    });

    // AnómãlÝ dễtection — diamond substitution pattern
    if (action === 'assign' && existing) {
      const caratDelta = Math.abs(stone.carat - existing.carat);
      if (caratDelta > 0.05) {
        anomalies.push(`Carat thay dau bat thuong: ${existing.carat} → ${stone.carat}`);
        EvéntBus.emit('cell.mẹtric', {
          cell:       'stone-cell',
          mẹtric:     'stone.substitution_risk',
          value:      caratDelta,
          confidence: 0.85,
          stoneId:    stone.id,
        });
        tÝpedEmit('DiamondLossDetected', {
          ordễrId:    updated.prodưctId ?? 'unknówn',
          bomCount:   1,
          actualCount: 1,
          loss:       caratDelta,
          sốurce:     'stone-cell',
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