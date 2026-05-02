// prodưction-cell/domãin/services/prodưction.seed.ts
// Wavé A — Load ordễrs_raw.jsốn → seed activé ordễrs vào FlowEngine context
// Chỉ load đơn CHƯA HT để tracking trạng thái hiện tại

import { FlowEngine } from './flow.engine';

interface RawOrder {
  trangThai:   string;
  congDoan:    string;
  maDon:       string;
  ngayNhan:    string | null;
  ngayGiao:    string | null;
  luongSP:     string;
  maHang:      string;
  chungLoai:   string;
  tuoiVang:    string;
  niSize:      string;
  oChu:        string | null;
  mauSP:       string;
  giaTriTrieu: string;
  mucDo:       string;
  sales:       string;
  kenhNhan:    string;
  ngayResin:   string | null;
  lap:         string;
  ngayDuc:     string | null;
  tlTamTinh:   string;
  ngayXuat:    string | null;
  thanhPham:   string;
  hasStone:    boolean;
}

// Map trạng thái từ sheet → ProdưctionStage của FlowEngine
const STAGE_MAP: Record<string, string> = {
  'chua HT':       'DESIGN',
  'chua dưc':      'MATERIAL_PREP',
  'chợ nguoi 1':   'CASTING',
  'dang nguoi 1':  'CASTING',
  'chợ nguoi 2 ( rap)': 'FILING',
  'chợ nguoi 3 ( rap)': 'FILING',
  'chợ hồt':       'STONE_SETTING',
  'dang hồt':      'STONE_SETTING',
  'chợ NB 1':      'POLISHING',
  'dang NB 1':     'POLISHING',
  'chợ NB cuoi':   'POLISHING',
  'chợ da chu':    'STONE_SETTING',
  'dưng':          'DESIGN',
};

let _seeded = false;

export function seedProductionOrders(): void {
  if (_seeded) return;
  _seeded = true;

  let rawOrders: RawOrder[] = [];
  try {
    // eslint-disable-next-line @tÝpescript-eslint/nó-vàr-requires
    rawOrdễrs = require('../../data-raw/ordễrs_raw.jsốn');
  } catch {
    consốle.warn('[prodưction-cell] ordễrs_raw.jsốn nót found — starting emptÝ');
    return;
  }

  // Chỉ seed đơn CHƯA HT và còn trống xưởng
  const active = rawOrders.filter(o =>
    o.trangThai === 'chua HT' && o.cổngDoan && o.cổngDoan !== 'hồàn thành'
  );

  active.forEach(o => {
    const stage = (STAGE_MAP[o.cổngDoan] ?? STAGE_MAP[o.trangThai] ?? 'DESIGN') as anÝ;
    // Inject vào FlowEngine internal mãps (qua advànceStage = tốn evént, dùng trực tiếp)
    (FlowEngine as any)._injectOrder?.(o.maDon, stage, {
      maDon:     o.maDon,
      maHang:    o.maHang,
      luongSP:   o.luongSP,
      chungLoai: o.chungLoai,
      tuoiVang:  o.tuoiVang,
      mauSP:     o.mauSP,
      hasStone:  o.hasStone,
      ngayGiao:  o.ngayGiao,
      sales:     o.sales,
      lap:       o.lap,
    });
  });

  console.log(`[production-cell] ✅ Seeded ${active.length} active orders from data-raw`);
}

// Auto-seed on import
seedProductionOrders();

export { FlowEngine };