// casting-cell/domain/services/casting.seed.ts
// Wave A — Load casting_batches_raw.json → populate batch history
// 200 lô đúc gần nhất, 5091 đơn trong lô

import type { TouchRecord } from '@/cells/infrastructure/smartlink-cell/domain/services/smartlink.engine';

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

// Registry lô đúc
const _batches     = new Map<string, RawBatch>();
const _orderToLap  = new Map<string, string>();   // maDon → lapId
const _touch: TouchRecord[] = [];

let _seeded = false;

export function seedCastingBatches(): void {
  if (_seeded) return;
  _seeded = true;

  let rawBatches: RawBatch[] = [];
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    rawBatches = require('../../data-raw/casting_batches_raw.json');
  } catch {
    console.warn('[casting-cell] casting_batches_raw.json not found');
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

// ── Public API cho CastingEngine ──
export const CastingDataStore = {
  getBatch:       (lapKey: string): RawBatch | undefined => _batches.get(lapKey),
  getLapForOrder: (maDon: string):  string | undefined   => _orderToLap.get(maDon),
  getAllBatches:  (): RawBatch[]                         => [..._batches.values()],

  // Tính tỷ lệ hao trung bình theo tuổi vàng (từ lịch sử thực tế)
  getAvgLossRate(tuoiVang: string): number {
    const relevant = [..._batches.values()].filter(b =>
      b.tuoiVang === tuoiVang && b.tyLeHao > 0
    );
    if (!relevant.length) return 0.015;   // default 1.5%
    const avg = relevant.reduce((s, b) => s + b.tyLeHao, 0) / relevant.length;
    return avg;
  },

  // Lô đúc theo tháng
  getBatchesByMonth(thang: string): RawBatch[] {
    return [..._batches.values()].filter(b => String(b.thang) === thang);
  },

  getHistory: (): TouchRecord[] => [..._touch],
};

// Auto-seed
seedCastingBatches();
