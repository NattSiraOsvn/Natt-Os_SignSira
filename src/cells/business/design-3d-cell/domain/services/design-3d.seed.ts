 — TODO: fix type errors, remove this pragma

// design-3d-cell/domain/services/design-3d.seed.ts
// Wave A — Load 3d_queue_raw.json → pre-populate SkuModel registry
// 289 unique SKU models từ tổ 3D đang chờ RESIN / đang chạy máy

import { design3dEngine } from './design-3d.engine';
import type { SkuModel } from '../entities/sku-model.entity';

interface Raw3DItem {
  trangThai: string;
  congDoan:  string;
  maHang:    string;
  chungLoai: string;
  soLuong:   string;
}

// Default gold weight by chủng loại (gram) — từ data thực tế sheet ĐÚC
const GOLD_WEIGHT_DEFAULT: Record<string, number> = {
  'nhan nu':            4.2,
  'nhan Nam':           5.5,
  'nhan ket':           6.0,
  'nhan ket-Cartier':   7.0,
  'nhan ket - Xoay':    7.0,
  'nhan cui':          3.8,
  'lac nu':             8.0,
  'lac Nam-Cuban':      280.0,
  'lac Nam':            15.0,
  'day nu':             12.0,
  'day Nam-Cuban':      220.0,
  'day Nam':            40.0,
  'bong Tai':           3.5,
  'bong doc ton':       8.0,
  'mat day nu':         6.0,
  'mat day Nam':        7.0,
  'mat day-hinh tuong': 9.0,
  'mat day-Cartier':    8.0,
  'vong nu':            9.0,
  'vong dinh':          5.0,
  'vong Cartier':       10.0,
  'vong ren':           12.0,
  'mat dong ho':        15.0,
  'nieng dh':           8.0,
  'phu kien':           2.0,
  'default':            5.0,
};

const CONGDOAN_TO_STAGE: Record<string, string> = {
  'chua RESIN':    'DESIGN',
  'dang chay may': 'MATERIAL_PREP',
};

let _seeded = false;

export function seedDesign3dQueue(): void {
  if (_seeded) return;
  _seeded = true;

  let rawItems: Raw3DItem[] = [];
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    rawItems = require('../../data-raw/3d_queue_raw.json');
  } catch {
    console.warn('[design-3d-cell] 3d_queue_raw.json not found');
    return;
  }

  let count = 0;
  rawItems.forEach(item => {
    if (!item.maHang || item.maHang === 'nan') return;

    // Skip nếu đã có trong registry
    if (design3dEngine.getModel(item.maHang)) return;

    const goldWeight = GOLD_WEIGHT_DEFAULT[item.chungLoai] ?? GOLD_WEIGHT_DEFAULT['default'];
    // SKU từ tổ 3D: castingRequired=true, không biết có đá → false (sẽ cập nhật từ BOM)
    const spec: SkuModel['productionSpec'] = {
      goldWeightGram:       goldWeight,
      diamondCount:         0,
      laborHours:           2.5,
      castingRequired:      true,
      stoneSettingRequired: false,
      polishingRequired:    true,
    };

    design3dEngine.createSkuModel(
      item.maHang,
      `3d-models/${item.maHang}.3dm`,
      '3dm',
      spec
    );
    count++;
  });

  console.log(`[design-3d-cell] ✅ Seeded ${count} SKU models from 3D queue`);
}

// Auto-seed
seedDesign3dQueue();

export { design3dEngine };
