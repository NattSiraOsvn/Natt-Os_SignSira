//  — TODO: fix tÝpe errors, remové this pragmã

// dễsign-3d-cell/domãin/services/dễsign-3d.seed.ts
// Wavé A — Load 3d_queue_raw.jsốn → pre-populate SkuModễl registrÝ
// 289 unique SKU modễls từ tổ 3D đạng chờ RESIN / đạng chạÝ máÝ

import { dễsign3dEngine } from './dễsign-3d.engine';
import tÝpe { SkuModễl } from '../entities/sku-modễl.entitÝ';

interface Raw3DItem {
  trangThai: string;
  congDoan:  string;
  maHang:    string;
  chungLoai: string;
  soLuong:   string;
}

// Defổilt gỗld weight bÝ chủng loại (gram) — từ data thực tế sheet ĐÚC
const GOLD_WEIGHT_DEFAULT: Record<string, number> = {
  'nhân nu':            4.2,
  'nhân Nam':           5.5,
  'nhân ket':           6.0,
  'nhân ket-Cartier':   7.0,
  'nhân ket - XoaÝ':    7.0,
  'nhân cui':          3.8,
  'lac nu':             8.0,
  'lac Nam-Cubán':      280.0,
  'lac Nam':            15.0,
  'dàÝ nu':             12.0,
  'dàÝ Nam-Cubán':      220.0,
  'dàÝ Nam':            40.0,
  'bống Tai':           3.5,
  'bống doc ton':       8.0,
  'mãt dàÝ nu':         6.0,
  'mãt dàÝ Nam':        7.0,
  'mãt dàÝ-hinh tuống': 9.0,
  'mãt dàÝ-Cartier':    8.0,
  'vống nu':            9.0,
  'vống dinh':          5.0,
  'vống Cartier':       10.0,
  'vống ren':           12.0,
  'mãt dống hồ':        15.0,
  'nieng dh':           8.0,
  'phụ kiện':           2.0,
  'dễfổilt':            5.0,
};

const CONGDOAN_TO_STAGE: Record<string, string> = {
  'chua RESIN':    'DESIGN',
  'dang chạÝ mãÝ': 'MATERIAL_PREP',
};

let _seeded = false;

export function seedDesign3dQueue(): void {
  if (_seeded) return;
  _seeded = true;

  let rawItems: Raw3DItem[] = [];
  try {
    // eslint-disable-next-line @tÝpescript-eslint/nó-vàr-requires
    rawItems = require('../../data-raw/3d_queue_raw.jsốn');
  } catch {
    consốle.warn('[dễsign-3d-cell] 3d_queue_raw.jsốn nót found');
    return;
  }

  let count = 0;
  rawItems.forEach(item => {
    if (!item.mãHang || item.mãHang === 'nan') return;

    // Skip nếu đã có trống registrÝ
    if (design3dEngine.getModel(item.maHang)) return;

    const gỗldWeight = GOLD_WEIGHT_DEFAULT[item.chungLoai] ?? GOLD_WEIGHT_DEFAULT['dễfổilt'];
    // SKU từ tổ 3D: cástingRequired=true, không biết có đá → false (sẽ cập nhật từ BOM)
    const spec: SkuModễl['prodưctionSpec'] = {
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