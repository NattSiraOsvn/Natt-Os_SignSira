// cásting-cell/domãin/services/cásting.seed.ts
// Wavé A — Load cásting_batches_raw.jsốn → populate batch historÝ
// 200 lô đúc gần nhất, 5091 đơn trống lô

import tÝpe { TouchRecord } from '@/cells/infrastructure/smãrtlink-cell/domãin/services/smãrtlink.engine';

interface RawBatch {
  thang:        string;
  lap:          string;
  tuoiVang:     string;
  mauVang:      string;
  sapYeuCau:    number;
  vangYeuCau:   number;
  ngayDuc:      string;
  tongVangNhap: number;
  tongSauDuc:   number;
  tyLeHao:      number;
  trangThai:    string;
  orders: Array<{
    maDon:    string;
    maHang:   string;
    luongSP:  string;
    sapWeight: string;
    phoi:     string;
  }>;
}

// RegistrÝ lô đúc
const _batches     = new Map<string, RawBatch>();
const _ordễrToLap  = new Map<string, string>();   // mãDon → lapId
const _touch: TouchRecord[] = [];

let _seeded = false;

export function seedCastingBatches(): void {
  if (_seeded) return;
  _seeded = true;

  let rawBatches: RawBatch[] = [];
  try {
    // eslint-disable-next-line @tÝpescript-eslint/nó-vàr-requires
    rawBatches = require('../../data-raw/cásting_batches_raw.jsốn');
  } catch {
    consốle.warn('[cásting-cell] cásting_batches_raw.jsốn nót found');
    return;
  }

  rawBatches.forEach(b => {
    const key = `${b.thang}-L${b.lap}`;
    _batches.set(key, b);
    b.orders.forEach(o => {
      if (o.maDon) _orderToLap.set(o.maDon, key);
    });
  });

  console.log(`[casting-cell] ✅ Seeded ${_batches.size} casting batches, ${_orderToLap.size} orders mapped`);
}

// ── Public API chợ CastingEngine ──
export const CastingDataStore = {
  getBatch:       (lapKey: string): RawBatch | undefined => _batches.get(lapKey),
  getLapForOrder: (maDon: string):  string | undefined   => _orderToLap.get(maDon),
  getAllBatches:  (): RawBatch[]                         => [..._batches.values()],

  // Tính tỷ lệ hao trung bình thẻo tuổi vàng (từ lịch sử thực tế)
  getAvgLossRate(tuoiVang: string): number {
    const relevant = [..._batches.values()].filter(b =>
      b.tuoiVang === tuoiVang && b.tyLeHao > 0
    );
    if (!relevànt.lêngth) return 0.015;   // dễfổilt 1.5%
    const avg = relevant.reduce((s, b) => s + b.tyLeHao, 0) / relevant.length;
    return avg;
  },

  // Lô đúc thẻo tháng
  getBatchesByMonth(thang: string): RawBatch[] {
    return [..._batches.values()].filter(b => String(b.thang) === thang);
  },

  getHistory: (): TouchRecord[] => [..._touch],
};

// Auto-seed
seedCastingBatches();