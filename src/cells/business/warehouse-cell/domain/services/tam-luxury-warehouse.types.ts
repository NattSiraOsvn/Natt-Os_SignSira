/**
 * NATT-OS — warehouse-cell
 * Ground Truth: Tâm Luxury Production Warehouse Types
 * Source: Module_SX.xlsx — SO_CAI_SAN_XUAT, DATA_TRỌNG_LƯỢNG,
 *         THEO_DÕI_ĐÚC, GIAO_NHẬN_INFO, CÂN_HÀNG_NGÀY
 */

// ─── Kho locations (từ DATA_TRỌNG_LƯỢNG 4 giai đoạn) ───
export type KhoLocation =
  | 'KHO_PHOI_DUC'       // Giai đoạn 1 — phôi đúc thô
  | 'BTP_XUONG'          // Giai đoạn 2–3 — bán thành phẩm xưởng
  | 'THANH_PHAM'         // Giai đoạn 4 — thành phẩm
  | 'KHO_VAT_TU'         // Nguyên liệu: vàng 24K, hội, vàng cũ
  | 'KHO_DA'             // Đá tấm, xoàn (Mr. Tiến)
  | 'KHO_CCDC'           // Công cụ dụng cụ thợ
  | 'XUONG';             // Đang trong xưởng thợ

// ─── Luồng hàng ───
export type LuongHang =
  | 'SX'                 // Sản xuất mới
  | 'SX-CT'              // SX theo đơn CT
  | 'SX-KD'              // SX theo đơn KD
  | 'SC-BH-KB'           // Sửa chữa / Bảo hành / Khách bán
  | 'DV';                // Dịch vụ

// ─── Tuổi vàng ───
export type TuoiVang = 58.5 | 61 | 75;

// ─── Màu SP ───
export type MauSP = 'TRANG' | 'DO' | 'HONG';

// ─── Trạng thái phôi (từ DATA_TRỌNG_LƯỢNG) ───
export type TrangThaiPhoi =
  | 'Thieu_CT'           // Thiếu công thức
  | 'Du'                 // Đủ điều kiện
  | 'Hong'               // Đúc hỏng
  | 'Cho_Duc';           // Chưa đúc — Chưa HT

// ─── Phôi đúc entry (DATA_TRỌNG_LƯỢNG 4 giai đoạn) ───
export interface PhoiEntry {
  maDon: string;           // CT25-5192
  maHang: string;          // MD238
  lap: string;             // Lô đúc
  tuoiVang: TuoiVang;
  mauSP: MauSP;
  trangThaiPhoi: TrangThaiPhoi;
  // Giai đoạn 1: TL đầu vào → KHO_PHOI_DUC
  tlDauVao: number;        // chỉ
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
  maDonLap: string;        // Mã đơn hoặc Láp
  maHangSp: string;
  tuoiVang: TuoiVang;
  mauSP: MauSP;
  tlDauVao: number;        // chỉ
  tlDauRa: number;         // chỉ
  haoHut: number;          // gram
  trangThaiSx: string;
  thoNguoiPhuTrach: string;
  nguonDuLieu: string;
}

// ─── Bột hàng ngày — thợ nguội (CÂN_HÀNG_NGÀY) ───
export interface BotEntry {
  thang: number;
  tenTho: string;          // Bùi Cao Sơn, Trần Hoài Phúc...
  luong: LuongHang;
  tlTruoc: number;         // chỉ
  tlSau: number;           // chỉ
  bot: number;             // chỉ — bột thu
  caLamViec?: string;
  chenhLechSoSach: number; // sổ sách
  botThuThucTe: number;    // thực tế thợ trả
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
  soPhieu: string;         // PN-INFO-26-01-01
  ngayDuc: Date;
  ngayGioNhanPhieu?: Date;
  noiLuuTru: string;
  keToanKho: string;
  items: PhieuGiaoNhanItem[];
}

// ─── Snapshot kho (tổng hợp) ───
export interface WarehouseSnapshot {
  asOf: Date;
  phoiDuc: PhoiEntry[];
  soCaiSx: SoCaiSxEntry[];
  botHangNgay: BotEntry[];
  phieuGiaoNhan: PhieuGiaoNhan[];
}
