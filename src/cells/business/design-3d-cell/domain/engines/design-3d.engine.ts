// design-3d-cell/domain/services/design-3d.engine.ts
// Wave C-3 — Nhận ProductionSpecReady từ production-cell, tra cứu/tạo SkuModel,
//             emit ProductionSpecReady (confirmed) → inventory-cell (hasStone → stone-cell)
//
// Subscribe:
//   ProductionSpecReady (action=PREPARE_3D_MODEL) ← production-cell fan-out
//   BomRejected                                   ← bom3dprd-cell (log + flag)
//
// Emit:
//   SkuModelCreated   → production-cell
//   ProductionSpecReady (confirmed) → inventory-cell
//   NaSiLinked        → warranty-cell

import { EventBus } from '@/core/events/event-bus';
import { SkuModel, ModelFormat } from '../entities/sku-model.entity';
import type { TouchRecord } from '@/cells/infrastructure/smartlink-cell/domain/services/smartlink.engine';

// ── In-memory SKU registry ──
const _models = new Map<string, SkuModel>();
const _touch: TouchRecord[] = [];

function _emit(to: string, signal: string, payload: Record<string, unknown>) {
  _touch.push({ fromCellId: 'design-3d-cell', toCellId: to, timestamp: Date.now(), signal, allowed: true });
  EventBus.publish({ type: signal as any, payload }, 'design-3d-cell', undefined);
}

// Định mức trọng lượng vàng mặc định theo chủng loại (gram)
// Nguồn: DATA ĐÚC sheet — trọng lượng phôi trung bình
const DEFAULT_GOLD_WEIGHT: Record<string, number> = {
  'Nhẫn Nữ':       4.2,
  'Nhẫn Nam':      5.5,
  'Nhẫn Kết':      6.0,
  'Nhẫn Cưới':     3.8,
  'Lắc Nữ':        8.0,
  'Lắc Nam-Cuban': 280.0,
  'Lắc Nam':       15.0,
  'Dây Nữ':        12.0,
  'Dây Nam-Cuban': 220.0,
  'Bông Tai':      3.5,
  'Mặt Dây Nữ':    6.0,
  'Vòng Nữ':       9.0,
  'Nhẫn Kết-Cartier': 7.0,
  'default':        5.0,
};

function _goldWeightForChungLoai(chungLoai: string): number {
  return DEFAULT_GOLD_WEIGHT[chungLoai] ?? DEFAULT_GOLD_WEIGHT['default'];
}

// ── Handler: PREPARE_3D_MODEL ──
EventBus.subscribe('ProductionSpecReady' as any, (envelope: any) => {
  const p = envelope.payload;
  if (!p?.orderId || p.action !== 'PREPARE_3D_MODEL') return;

  const maHang = p.maHang ?? p.orderId;
  const existing = _models.get(maHang);

  if (existing) {
    // Model đã có → emit confirmed ngay
    _emit('production-cell', 'SkuModelCreated', {
      orderId: p.orderId, skuId: maHang,
      goldWeightGram: existing.productionSpec.goldWeightGram,
      diamondCount:   existing.productionSpec.diamondCount,
      hasStone:       existing.productionSpec.stoneSettingRequired,
      source: 'cache',
    });
    return;
  }

  // Model chưa có → tạo placeholder từ dữ liệu đơn
  const hasStone = p.ochu != null && p.ochu !== '' && p.ochu !== '0';
  const goldWeight = _goldWeightForChungLoai(p.chungLoai ?? '');

  const model: SkuModel = {
    skuId:     maHang,
    modelPath: `3d-models/${maHang}.3dm`,  // path dự kiến trong 19TB
    format:    '3dm' as ModelFormat,
    version:   1,
    productionSpec: {
      goldWeightGram:         goldWeight,
      diamondCount:           hasStone ? 1 : 0,
      laborHours:             2.5,
      castingRequired:        true,
      stoneSettingRequired:   hasStone,
      polishingRequired:      true,
    },
    createdAt:   Date.now(),
    updatedAt:   Date.now(),
    nasiLinked:  false,
  };
  _models.set(maHang, model);

  _emit('production-cell', 'SkuModelCreated', {
    orderId:        p.orderId,
    skuId:          maHang,
    modelPath:      model.modelPath,
    goldWeightGram: model.productionSpec.goldWeightGram,
    diamondCount:   model.productionSpec.diamondCount,
    hasStone,
    source: 'generated',
  });

  // Thông báo inventory-cell spec vật liệu
  _emit('inventory-cell', 'ProductionSpecReady', {
    orderId:        p.orderId,
    skuId:          maHang,
    goldWeightGram: model.productionSpec.goldWeightGram,
    diamondCount:   model.productionSpec.diamondCount,
    chungLoai:      p.chungLoai,
    tuoiVang:       p.tuoiVang,
  });
}, 'design-3d-cell');

// ── Handler: BomRejected ← bom3dprd-cell (flag model cần review) ──
EventBus.subscribe('BomRejected' as any, (envelope: any) => {
  const p = envelope.payload;
  if (!p?.maHang) return;
  const model = _models.get(p.maHang);
  if (model) {
    _models.set(p.maHang, { ...model, updatedAt: Date.now() });
  }
  _emit('audit-cell', 'AuditLogged', {
    event: 'SKU_MODEL_FLAGGED_BOM_REJECT', maHang: p.maHang,
    orderId: p.orderId, reason: p.reason,
  });
}, 'design-3d-cell');

// ── Public API ──
export class Design3dEngine {
  createSkuModel(skuId: string, modelPath: string, format: ModelFormat, spec: SkuModel['productionSpec']) {
    const model: SkuModel = {
      skuId, modelPath, format, version: 1, productionSpec: spec,
      createdAt: Date.now(), updatedAt: Date.now(), nasiLinked: false,
    };
    _models.set(skuId, model);
    return {
      model,
      event: { type: 'SkuModelCreated', skuId, modelPath, productionSpec: spec, timestamp: Date.now() },
    };
  }

  updateVersion(model: SkuModel, changes: string[]) {
    const updated = { ...model, version: model.version + 1, updatedAt: Date.now() };
    _models.set(model.skuId, updated);
    return {
      model: updated,
      event: { type: 'SkuModelUpdated', skuId: model.skuId, version: updated.version, changes, timestamp: Date.now() },
    };
  }

  publishProductionSpec(model: SkuModel) {
    return {
      type: 'ProductionSpecReady',
      skuId:          model.skuId,
      goldWeightGram: model.productionSpec.goldWeightGram,
      diamondCount:   model.productionSpec.diamondCount,
      laborHours:     model.productionSpec.laborHours,
      timestamp:      Date.now(),
    };
  }

  linkNaSi(skuId: string, approvedBy: string): void {
    const model = _models.get(skuId);
    if (!model) return;
    _models.set(skuId, { ...model, nasiLinked: true, approvedBy, updatedAt: Date.now() });
    _emit('warranty-cell', 'NaSiLinked', { skuId, approvedBy });
  }

  getModel(skuId: string): SkuModel | undefined   { return _models.get(skuId); }
  getAllModels(): SkuModel[]                       { return [..._models.values()]; }
  getHistory(): TouchRecord[]                      { return [..._touch]; }
}

export const design3dEngine = new Design3dEngine();

// ── cell.metric heartbeat (SCAR S28 compliance) ──
EventBus.publish({ type: 'cell.metric' as any, payload: { cell: 'design-3d-cell', metric: 'alive', value: 1, ts: Date.now() } }, 'design-3d-cell', undefined);
