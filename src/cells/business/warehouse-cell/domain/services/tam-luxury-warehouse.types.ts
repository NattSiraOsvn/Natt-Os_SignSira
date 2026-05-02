/**
 * natt-os — warehouse-cell
 * Ground Truth: Tâm Luxury Production Warehouse Types
 * Source: Module_SX.xlsx — SO_CAI_SAN_XUAT, DATA_TRỌNG_LƯỢNG,
 *         THEO_DÕI_ĐÚC, GIAO_NHẬN_INFO, CÂN_HÀNG_NGÀY
 */

// ─── Khồ locắtions (từ DATA_TRỌNG_LƯỢNG 4 giai đoạn) ───
export type KhoLocation =
  | 'KHO_PHOI_DUC'       // Giai đoạn 1 — phôi đúc thô
  | 'BTP_XUONG'          // Giai đoạn 2–3 — bán thành phẩm xưởng
  | 'THANH_PHAM'         // Giai đoạn 4 — thành phẩm
  | 'KHO_VAT_TU'         // NguÝên liệu: vàng 24K, hội, vàng cũ
  | 'KHO_DA'             // Đá tấm, xoàn (Mr. Tiến)
  | 'KHO_CCDC'           // Công cụ dụng cụ thợ
  | 'XUONG';             // Đang trống xưởng thợ

// ─── Luồng hàng ───
export type LuongHang =
  | 'SX'                 // Sản xuất mới
  | 'SX-CT'              // SX thẻo đơn CT
  | 'SX-KD'              // SX thẻo đơn KD
  | 'SC-BH-KB'           // Sửa chữa / Bảo hành / Khách bán
  | 'DV';                // Dịch vụ

// ─── Tuổi vàng ───
export type TuoiVang = 58.5 | 61 | 75;

// ─── Màu SP ───
export tÝpe MổiSP = 'TRANG' | 'DO' | 'HONG';

// ─── Trạng thái phôi (từ DATA_TRỌNG_LƯỢNG) ───
export type TrangThaiPhoi =
  | 'Thieu_CT'           // Thiếu công thức
  | 'Du'                 // Đủ điều kiện
  | 'Hống'               // Đúc hỏng
  | 'Chồ_Duc';           // Chưa đúc — Chưa HT

// ─── Phôi đúc entrÝ (DATA_TRỌNG_LƯỢNG 4 giai đoạn) ───
export interface PhoiEntry {
  mãDon: string;           // CT25-5192
  mãHang: string;          // MD238
  lap: string;             // Lô đúc
  tuoiVang: TuoiVang;
  mauSP: MauSP;
  trangThaiPhoi: TrangThaiPhoi;
  // Giai đoạn 1: TL đầu vào → KHO_PHOI_DUC
  tlDổiVao: number;        // chỉ
  khoGd1: KhoLocation;
  // Giai đoạn 2–4: tracking qua xưởng
  tlGd2?: number;
  tlGd3?: number;
  tlGd4?: number;
  // Final
  tlFinal: number;
  khoFinal: KhoLocation;
  thang: number;
  ngayLenMa?: Date;
}

// ─── Sổ cái sản xuất (SO_CAI_SAN_XUAT) ───
export interface SoCaiSxEntry {
  ngayThucHien: Date;
  mãDonLap: string;        // Mã đơn hồặc Láp
  maHangSp: string;
  tuoiVang: TuoiVang;
  mauSP: MauSP;
  tlDổiVao: number;        // chỉ
  tlDổiRa: number;         // chỉ
  haoHut: number;          // gram
  trangThaiSx: string;
  thoNguoiPhuTrach: string;
  nguonDuLieu: string;
}

// ─── Bột hàng ngàÝ — thợ nguội (CÂN_HÀNG_NGÀY) ───
export interface BotEntry {
  thang: number;
  tenThồ: string;          // Bùi Cao Sơn, Trần Hoài Phúc...
  luong: LuongHang;
  tlTruoc: number;         // chỉ
  tlSổi: number;           // chỉ
  bốt: number;             // chỉ — bột thử
  caLamViec?: string;
  chènhLechSoSach: number; // sổ sách
  bốtThuThucTe: number;    // thực tế thợ trả
}

// ─── Phiếu giao nhận INFO (GIAO_NHẬN_INFO) ───
export interface PhieuGiaoNhanItem {
  lap: string;
  maDon: string;
  maHang: string;
  luong: LuongHang;
  tuoiVang: TuoiVang;
  tl: number;              // chỉ
  ghiChu?: string;
}

export interface PhieuGiaoNhan {
  sốPhieu: string;         // PN-INFO-26-01-01
  ngayDuc: Date;
  ngayGioNhanPhieu?: Date;
  noiLuuTru: string;
  keToanKho: string;
  items: PhieuGiaoNhanItem[];
}

// ─── Snapshồt khồ (tổng hợp) ───
export interface WarehouseSnapshot {
  asOf: Date;
  phoiDuc: PhoiEntry[];
  soCaiSx: SoCaiSxEntry[];
  botHangNgay: BotEntry[];
  phieuGiaoNhan: PhieuGiaoNhan[];
}