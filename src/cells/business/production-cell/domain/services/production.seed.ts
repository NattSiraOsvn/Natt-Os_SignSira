// production-cell/domain/services/production.seed.ts
// Wave A — Load orders_raw.json → seed active orders vào FlowEngine context
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

// Map trạng thái từ sheet → ProductionStage của FlowEngine
const STAGE_MAP: Record<string, string> = {
  'CHƯA HT':       'DESIGN',
  'Chưa Đúc':      'MATERIAL_PREP',
  'Chờ Nguội 1':   'CASTING',
  'Đang Nguội 1':  'CASTING',
  'Chờ Nguội 2 ( Ráp)': 'FILING',
  'Chờ Nguội 3 ( Ráp)': 'FILING',
  'Chờ Hột':       'STONE_SETTING',
  'Đang Hột':      'STONE_SETTING',
  'Chờ NB 1':      'POLISHING',
  'Đang NB 1':     'POLISHING',
  'Chờ NB cuối':   'POLISHING',
  'Chờ Đá chủ':    'STONE_SETTING',
  'DỪNG':          'DESIGN',
};

let _seeded = false;

export function seedProductionOrders(): void {
  if (_seeded) return;
  _seeded = true;

  let rawOrders: RawOrder[] = [];
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    rawOrders = require('../../data-raw/orders_raw.json');
  } catch {
    console.warn('[production-cell] orders_raw.json not found — starting empty');
    return;
  }

  // Chỉ seed đơn CHƯA HT và còn trong xưởng
  const active = rawOrders.filter(o =>
    o.trangThai === 'CHƯA HT' && o.congDoan && o.congDoan !== 'HOÀN THÀNH'
  );

  active.forEach(o => {
    const stage = (STAGE_MAP[o.congDoan] ?? STAGE_MAP[o.trangThai] ?? 'DESIGN') as any;
    // Inject vào FlowEngine internal maps (qua advanceStage = tốn event, dùng trực tiếp)
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
