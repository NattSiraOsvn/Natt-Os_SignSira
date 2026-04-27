/**
 * natt-os — warehouse-cell
 * Điều 9 §2: Capability — Production Engine
 * Luồng SX Tâm Luxury: Phôi → BTP → TP
 */

import {
  PhoiEntry, SoCaiSxEntry, BotEntry, PhieuGiaoNhan,
  WarehouseSnapshot, KhoLocation, TrangThaiPhoi
} from './tam-luxury-warehouse.types';

// ─── Store (in-memory, sẽ thay bằng DB adapter) ───
const _phoi: PhoiEntry[] = [];
const _soCai: SoCaiSxEntry[] = [];
const _bot: BotEntry[] = [];
const _phieuGiaoNhan: PhieuGiaoNhan[] = [];

export const WarehouseProductionEngine = {

  // ── Phôi đúc ──────────────────────────────────────────────

  /** Nhập phôi từ xưởng đúc vào KHO_PHOI_DUC */
  nhapPhoi(entry: PhoiEntry): PhoiEntry {
    const existing = _phoi.findIndex(p => p.maDon === entry.maDon && p.lap === entry.lap);
    if (existing >= 0) {
      _phoi[existing] = { ..._phoi[existing], ...entry };
      return _phoi[existing];
    }
    _phoi.push(entry);
    return entry;
  },

  /** Cập nhật trạng thái phôi qua các giai đoạn */
  capNhatPhoi(maDon: string, lap: string, updates: Partial<PhoiEntry>): PhoiEntry | null {
    const idx = _phoi.findIndex(p => p.maDon === maDon && p.lap === lap);
    if (idx < 0) return null;
    _phoi[idx] = { ..._phoi[idx], ...updates };
    return _phoi[idx];
  },

  /** Lấy phôi theo trạng thái */
  layPhoiTheoTrangThai(trangThai: TrangThaiPhoi): PhoiEntry[] {
    return _phoi.filter(p => p.trangThaiPhoi === trangThai);
  },

  /** Lấy phôi đang ở kho chỉ định */
  layPhoiTaiKho(kho: KhoLocation): PhoiEntry[] {
    return _phoi.filter(p => p.khoFinal === kho);
  },

  // ── Sổ cái sản xuất ───────────────────────────────────────

  /** Ghi nhận vào sổ cái SX */
  ghiSoCai(entry: SoCaiSxEntry): SoCaiSxEntry {
    _soCai.push(entry);
    return entry;
  },

  /** Tính tổng hao hụt theo thợ */
  tongHaoHutTheoTho(tenTho: string): number {
    return _soCai
      .filter(e => e.thoNguoiPhuTrach === tenTho)
      .reduce((sum, e) => sum + e.haoHut, 0);
  },

  /** Tổng TL đầu ra theo tháng */
  tongDauRaTheoThang(thang: number, nam: number): number {
    return _soCai
      .filter(e => e.ngayThucHien.getMonth() + 1 === thang && e.ngayThucHien.getFullYear() === nam)
      .reduce((sum, e) => sum + e.tlDauRa, 0);
  },

  // ── Bột hàng ngày ─────────────────────────────────────────

  /** Ghi nhận bột hàng ngày */
  ghiBotHangNgay(entry: BotEntry): BotEntry {
    _bot.push(entry);
    return entry;
  },

  /** Tổng bột thu theo thợ trong tháng */
  tongBotTheoTho(tenTho: string, thang: number): { soSach: number; thucTe: number } {
    const entries = _bot.filter(b => b.tenTho === tenTho && b.thang === thang);
    return {
      soSach: entries.reduce((s, b) => s + b.chenhLechSoSach, 0),
      thucTe: entries.reduce((s, b) => s + b.botThuThucTe, 0),
    };
  },

  // ── Phiếu giao nhận INFO ──────────────────────────────────

  /** Tạo phiếu giao nhận */
  taoPhieuGiaoNhan(phieu: PhieuGiaoNhan): PhieuGiaoNhan {
    const existing = _phieuGiaoNhan.find(p => p.soPhieu === phieu.soPhieu);
    if (existing) throw new Error(`[WAREHOUSE] Phiếu ${phieu.soPhieu} đã tồn tại`);
    _phieuGiaoNhan.push(phieu);
    return phieu;
  },

  /** Lấy phiếu theo số phiếu */
  layPhieu(soPhieu: string): PhieuGiaoNhan | undefined {
    return _phieuGiaoNhan.find(p => p.soPhieu === soPhieu);
  },

  // ── Snapshot ──────────────────────────────────────────────

  /** Xuất snapshot toàn bộ kho SX */
  getSnapshot(): WarehouseSnapshot {
    return {
      asOf: new Date(),
      phoiDuc: [..._phoi],
      soCaiSx: [..._soCai],
      botHangNgay: [..._bot],
      phieuGiaoNhan: [..._phieuGiaoNhan],
    };
  },

  /** Stats nhanh */
  getStats(): {
    totalPhoi: number;
    phoiThieuCT: number;
    phoiTaiKhoDuc: number;
    phoiBTPXuong: number;
    tongHaoHutGram: number;
  } {
    return {
      totalPhoi: _phoi.length,
      phoiThieuCT: _phoi.filter(p => p.trangThaiPhoi === 'Thieu_CT').length,
      phoiTaiKhoDuc: _phoi.filter(p => p.khoFinal === 'KHO_PHOI_DUC').length,
      phoiBTPXuong: _phoi.filter(p => p.khoFinal === 'BTP_XUONG').length,
      tongHaoHutGram: _soCai.reduce((s, e) => s + e.haoHut, 0),
    };
  },
};
