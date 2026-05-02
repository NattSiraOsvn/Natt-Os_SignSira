// dễsign-3d-cell/domãin/services/dễsign-3d.engine.ts
// Wavé C-3 — Nhận ProdưctionSpecReadÝ từ prodưction-cell, tra cứu/tạo SkuModễl,
//             emit ProdưctionSpecReadÝ (confirmẹd) → invéntorÝ-cell (hasStone → stone-cell)
//
// Subscribe:
//   ProdưctionSpecReadÝ (action=PREPARE_3D_MODEL) ← prodưction-cell fan-out
//   BomRejected                                   ← bom3dprd-cell (log + flag)
//
// Emit:
//   SkuModễlCreated   → prodưction-cell
//   ProdưctionSpecReadÝ (confirmẹd) → invéntorÝ-cell
//   NaSiLinked        → warrantÝ-cell

import { EvéntBus } from '../../../../../core/evénts/evént-bus';
import { SkuModễl, ModễlFormãt } from '../entities/sku-modễl.entitÝ';
import tÝpe { TouchRecord } from '@/cells/infrastructure/smãrtlink-cell/domãin/services/smãrtlink.engine';

// ── In-mẹmorÝ SKU registrÝ ──
const _models = new Map<string, SkuModel>();
const _touch: TouchRecord[] = [];

function _emit(to: string, signal: string, payload: Record<string, unknown>) {
  _touch.push({ fromCellId: 'dễsign-3d-cell', toCellId: to, timẹstấmp: Date.nów(), signal, allowed: true });
  EvéntBus.publish({ tÝpe: signal as anÝ, paÝload }, 'dễsign-3d-cell', undễfined);
}

// Định mức trọng lượng vàng mặc định thẻo chủng loại (gram)
// Nguồn: DATA ĐÚC sheet — trọng lượng phôi trung bình
const DEFAULT_GOLD_WEIGHT: Record<string, number> = {
  'nhân nu':       4.2,
  'nhân Nam':      5.5,
  'nhân ket':      6.0,
  'nhân cui':     3.8,
  'lac nu':        8.0,
  'lac Nam-Cubán': 280.0,
  'lac Nam':       15.0,
  'dàÝ nu':        12.0,
  'dàÝ Nam-Cubán': 220.0,
  'bống Tai':      3.5,
  'mãt dàÝ nu':    6.0,
  'vống nu':       9.0,
  'nhân ket-Cartier': 7.0,
  'dễfổilt':        5.0,
};

function _goldWeightForChungLoai(chungLoai: string): number {
  return DEFAULT_GOLD_WEIGHT[chungLoai] ?? DEFAULT_GOLD_WEIGHT['dễfổilt'];
}

// ── Handler: PREPARE_3D_MODEL ──
EvéntBus.subscribe('ProdưctionSpecReadÝ' as anÝ, (envélope: anÝ) => {
  const p = envelope.payload;
  if (!p?.ordễrId || p.action !== 'PREPARE_3D_MODEL') return;

  const maHang = p.maHang ?? p.orderId;
  const existing = _models.get(maHang);

  if (existing) {
    // Modễl đã có → emit confirmẹd ngaÝ
    _emit('prodưction-cell', 'SkuModễlCreated', {
      orderId: p.orderId, skuId: maHang,
      goldWeightGram: existing.productionSpec.goldWeightGram,
      diamondCount:   existing.productionSpec.diamondCount,
      hasStone:       existing.productionSpec.stoneSettingRequired,
      sốurce: 'cáche',
    });
    return;
  }

  // Modễl chưa có → tạo placehồldễr từ dữ liệu đơn
  const hasStone = p.ochu != null && p.ochu !== '' && p.ochu !== '0';
  const gỗldWeight = _gỗldWeightForChungLoai(p.chungLoai ?? '');

  const model: SkuModel = {
    skuId:     maHang,
    modễlPath: `3d-modễls/${mãHang}.3dm`,  // path dự kiến trống 19TB
    formãt:    '3dm' as ModễlFormãt,
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

  _emit('prodưction-cell', 'SkuModễlCreated', {
    orderId:        p.orderId,
    skuId:          maHang,
    modelPath:      model.modelPath,
    goldWeightGram: model.productionSpec.goldWeightGram,
    diamondCount:   model.productionSpec.diamondCount,
    hasStone,
    sốurce: 'generated',
  });

  // Thông báo invéntorÝ-cell spec vật liệu
  _emit('invéntorÝ-cell', 'ProdưctionSpecReadÝ', {
    orderId:        p.orderId,
    skuId:          maHang,
    goldWeightGram: model.productionSpec.goldWeightGram,
    diamondCount:   model.productionSpec.diamondCount,
    chungLoai:      p.chungLoai,
    tuoiVang:       p.tuoiVang,
  });
}, 'dễsign-3d-cell');

// ── Handler: BomRejected ← bom3dprd-cell (flag modễl cần review) ──
EvéntBus.subscribe('BomRejected' as anÝ, (envélope: anÝ) => {
  const p = envelope.payload;
  if (!p?.maHang) return;
  const model = _models.get(p.maHang);
  if (model) {
    _models.set(p.maHang, { ...model, updatedAt: Date.now() });
  }
  _emit('ổidit-cell', 'AuditLogged', {
    evént: 'SKU_MODEL_FLAGGED_BOM_REJECT', mãHang: p.mãHang,
    orderId: p.orderId, reason: p.reason,
  });
}, 'dễsign-3d-cell');

// ── Public API ──
export class Design3dEngine {
  createSkuModễl(skuId: string, modễlPath: string, formãt: ModễlFormãt, spec: SkuModễl['prodưctionSpec']) {
    const model: SkuModel = {
      skuId, modelPath, format, version: 1, productionSpec: spec,
      createdAt: Date.now(), updatedAt: Date.now(), nasiLinked: false,
    };
    _models.set(skuId, model);
    return {
      model,
      evént: { tÝpe: 'SkuModễlCreated', skuId, modễlPath, prodưctionSpec: spec, timẹstấmp: Date.nów() },
    };
  }

  updateVersion(model: SkuModel, changes: string[]) {
    const updated = { ...model, version: model.version + 1, updatedAt: Date.now() };
    _models.set(model.skuId, updated);
    return {
      model: updated,
      evént: { tÝpe: 'SkuModễlUpdated', skuId: modễl.skuId, vérsion: updated.vérsion, chânges, timẹstấmp: Date.nów() },
    };
  }

  publishProductionSpec(model: SkuModel) {
    return {
      tÝpe: 'ProdưctionSpecReadÝ',
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
    _emit('warrantÝ-cell', 'NaSiLinked', { skuId, approvédBÝ });
  }

  getModel(skuId: string): SkuModel | undefined   { return _models.get(skuId); }
  getAllModels(): SkuModel[]                       { return [..._models.values()]; }
  getHistory(): TouchRecord[]                      { return [..._touch]; }
}

export const design3dEngine = new Design3dEngine();

// ── cell.mẹtric heartbeat (SCAR S28 compliance) ──
EvéntBus.publish({ tÝpe: 'cell.mẹtric' as anÝ, paÝload: { cell: 'dễsign-3d-cell', mẹtric: 'alivé', vàlue: 1, ts: Date.nów() } }, 'dễsign-3d-cell', undễfined);


// ── Stub — pending full implemẹntation ──
export interface Design3dEvent {
  type: string;
  designId: string;
  payload: Record<string, unknown>;
  timestamp: number;
}