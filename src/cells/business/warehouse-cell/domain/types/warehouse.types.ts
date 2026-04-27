/**
 * warehouse.types.ts
 * ──────────────────
 * Data model cho warehouse-cell — Reality Domain anchor.
 * Field names lấy trực tiếp từ Module_SX.xlsx production data.
 * Covers 7 KEY groups: Accountability, Weight/Variance, Time,
 * Classification/Risk, External Partners, KCS, Legal/Audit.
 *
 * Điều 4: Cell không gọi cell trực tiếp — chỉ qua EventBus.
 * VPSAS 12 đoạn 28: Giá đích danh cho trang sức không thể thay thế.
 */

// ─── ENUMS ───────────────────────────────────────────────────

export enum LuongHang {
  SX_CT   = 'SX-CT',       // Sản xuất công ty
  SX_KD   = 'SX-KD',       // Sản xuất kinh doanh
  SC_BH_KB = 'SC-BH-KB',   // Sửa chữa - Bảo hành - Khách bán
}

export enum CongDoan {
  DUC         = 'ĐÚC',
  NGUOI_1     = 'Nguội 1',
  NGUOI_2_RAP = 'Nguội 2 ( Ráp)',
  NGUOI_3_RAP = 'Nguội 3 ( Ráp)',
  NGUOI_SC    = 'Nguội sửa chữa',
  NAM         = 'NẠM',
  DANH_BONG   = 'ĐÁNH BÓNG',
  HOAN_THIEN  = 'HOÀN THIỆN',
  KCS         = 'KCS',
}

export enum TuoiVang {
  T75_TRANG = '75-TRẮNG',   // 18K trắng
  T75_DO    = '75-ĐỎ',      // 18K đỏ
  T75_HONG  = '75-HỒNG',    // 18K hồng
  T585_HONG = '58,5-HỒNG',  // 14K hồng
  T999      = '999',         // 24K
}

export enum TrangThaiPhoi {
  DU_CT   = 'Đủ CT',
  THIEU_CT = 'Thiếu CT',
}

export enum TrangThaiDon {
  CHO_DUC       = 'CHỜ ĐÚC',
  DANG_DUC      = 'ĐANG ĐÚC',
  KHO_PHOI_DUC  = 'KHO PHÔI ĐÚC',
  BTP_XUONG     = 'BTP XƯỞNG',
  DANG_NGUOI    = 'ĐANG NGUỘI',
  DANG_NAM      = 'ĐANG NẠM',
  KCS_CHECK     = 'KCS',
  THANH_PHAM    = 'THÀNH PHẨM',
  DA_GIAO       = 'ĐÃ GIAO',
}

export enum MucDoRuiRo {
  THAP    = 'THẤP',
  TRUNG   = 'TB',
  CAO     = 'CAO',
}

export enum ChungLoai {
  NHAN_NAM      = 'Nhẫn Nam',
  NHAN_NU       = 'Nhẫn Nữ',
  NHAN_KET      = 'Nhẫn Kết',
  DAY_NAM       = 'Dây Nam',
  DAY_NU        = 'Dây Nữ',
  MAT           = 'Mặt',
  BONG_TAI      = 'Bông Tai',
  LAC_NAM       = 'Lắc Nam-Cuban',
  LAC_NU        = 'Lắc Nữ',
  VONG          = 'Vòng',
}

export enum LoaiPhieu {
  DE_XUAT_DUC     = 'ĐXĐ',     // Phiếu đề xuất đúc
  PHIEU_NHAP_INFO = 'PN-INFO',  // Phiếu giao nhận INFO
  XUAT_KHO_NVL    = 'XK-NVL',   // Xuất kho nguyên vật liệu
  NHAP_KHO_TP     = 'NK-TP',    // Nhập kho thành phẩm
}

// ─── KEY 1: ACCOUNTABILITY — 6 vai trò per bước ─────────────

export interface AccountabilityChain {
  nguoiGiaoViec:     string;
  nguoiNhanViec:     string;
  nguoiKiemTra:      string;
  nguoiDuyet:        string;
  nguoiBanGiao:      string;
  nguoiNhanBanGiao:  string;
  timestamp:         number;
  congDoan:          CongDoan;
}

// ─── KEY 2: WEIGHT & VARIANCE — xương sống chống thất thoát ──

export interface WeightCheckpoint {
  congDoan:           CongDoan;
  tlTruocCongDoan:    number;   // Trọng lượng trước công đoạn (chỉ)
  tlSauCongDoan:      number;   // Trọng lượng sau công đoạn (chỉ)
  haoHutLyThuyet:     number;   // Hao hụt lý thuyết theo BOM (chỉ)
  haoHutThucTe:       number;   // Hao hụt thực tế đo được (chỉ)
  chenhLech:          number;   // tlTruocCongDoan - tlSauCongDoan - haoHutLyThuyet
  nguongChoPhep:      number;   // Ngưỡng cho phép per công đoạn (chỉ)
  botThuHoi:          number;   // Bụi vàng thu hồi (chỉ)
  timestamp:          number;
  nguoiCan:           string;
  caLamViec:          string;
}

/** Ngưỡng hao hụt chuẩn per công đoạn — từ BOM template thiên */
export const HAO_HUT_CHUAN: Record<CongDoan, { min: number; max: number }> = {
  [CongDoan.DUC]:         { min: 0.03, max: 0.05 },    // 3-5%
  [CongDoan.NGUOI_1]:     { min: 0.002, max: 0.004 },  // 0.2-0.4%
  [CongDoan.NGUOI_2_RAP]: { min: 0.002, max: 0.004 },
  [CongDoan.NGUOI_3_RAP]: { min: 0.002, max: 0.004 },
  [CongDoan.NGUOI_SC]:    { min: 0.002, max: 0.004 },
  [CongDoan.NAM]:         { min: 0.001, max: 0.002 },  // 0.1-0.2%
  [CongDoan.DANH_BONG]:   { min: 0.001, max: 0.002 },
  [CongDoan.HOAN_THIEN]:  { min: 0.000, max: 0.002 },  // 0-0.2%
  [CongDoan.KCS]:         { min: 0.000, max: 0.000 },
};

/** Ngưỡng hao hụt max per chủng loại sản phẩm (chỉ) — từ MasterSheet */
export const HAO_HUT_MAX_PER_CHUNG_LOAI: Partial<Record<ChungLoai, number>> = {
  [ChungLoai.NHAN_NAM]:  0.5,
  [ChungLoai.NHAN_NU]:   0.3,
  [ChungLoai.DAY_NAM]:   1.0,
  [ChungLoai.DAY_NU]:    1.0,
  [ChungLoai.MAT]:       0.7,
  [ChungLoai.BONG_TAI]:  0.3,
};

/** Ngưỡng cảnh báo chênh lệch vàng — từ BOM §VIII */
export const CHENH_LECH_THRESHOLDS = {
  DAT_CHUAN:    0.02,  // < 0.02 chỉ → xanh
  CANH_BAO:     0.10,  // 0.02 - 0.10 → vàng
  // > 0.10 → đỏ
} as const;

// ─── KEY 3: TIME / PROGRESS / DELAY ──────────────────────────

export interface TimeTracking {
  ngayNhanCongDoan:  number;
  ngayHoanCongDoan:  number | null;
  thoiGianXuLy:     number | null;  // milliseconds
  delay:            boolean;
  lyDoTre:          string | null;
}

// ─── KEY 4: ORDER CLASSIFICATION & RISK ──────────────────────

export interface OrderClassification {
  loaiDon:        'SX_THUONG' | 'GAP' | 'VIP' | 'KH_BAN';
  mucDoPhucTap:   'THAP' | 'TRUNG' | 'CAO';
  ruiRo:          MucDoRuiRo;
  uuTien:         number;  // 1 = highest
}

// ─── KEY 5: EXTERNAL PARTNERS ────────────────────────────────

export interface DoiTacNgoai {
  donViNgoai:          string;
  hinhThucGiao:        'KY_GUI' | 'GIA_CONG' | 'THUE';
  bienBanGiao:         string | null;  // document reference
  bienBanNhan:         string | null;
  trachNhiemMatHong:   string;
}

// ─── KEY 6: KCS / QUALITY ────────────────────────────────────

export interface KCSResult {
  ketQuaKCS:      'DAT' | 'KHONG_DAT';
  loiKCS:         'KY_THUAT' | 'VAT_LIEU' | 'THAO_TAC' | null;
  huongXuLy:      'SUA' | 'LAM_LAI' | 'HUY' | null;
  chiPhiPhatSinh: number;
  nguoiKCS:       string;
  timestamp:      number;
  trongLuongCuoi: number;  // TL cuối cùng after KCS
  dungSai:        number;  // dung sai cho phép
  trongLuongLech: number;  // lệch so với định mức
  daKiemDa:       boolean; // xác nhận viên đá đủ/thiếu
}

// ─── KEY 7: LEGAL / AUDIT ────────────────────────────────────

export interface LegalAuditStatus {
  hoSoDuChuan:       boolean;
  coTheGiaiTrinh:    boolean;
  nguyCoThue:        string | null;
  nguyCoTranhChap:   string | null;
}

// ─── PHIẾU ĐỀ XUẤT ĐÚC — from "IN ĐX ĐÚC" sheet ───────────

export interface PhieuDeXuatDuc {
  soPhieu:              string;          // ĐXĐ-21-1-26
  ngayDeXuat:           number;
  ngayDuc:              number | null;
  items: Array<{
    lap:                number;          // LÁP number
    maDon:              string;
    maHang:             string;
    luong:              LuongHang;
    tuoiVang:           TuoiVang;
    mauVang:            string;
    trongLuongSapYeuCau:   number;       // TL sáp yêu cầu
    trongLuongVangYeuCau:  number;       // TL vàng yêu cầu
  }>;
  nvlXuat: {
    vang24K:  { trongLuong: number; maSoLoNhap: string };
    hoi:      { trongLuong: number; maSoLoNhap: string };
    vangCu:   { trongLuong: number; mauVang: string; maSoLoNhap: string };
    tongTrongLuongXuat: number;  // Tổng trước đúc
  };
  sauDuc: {
    tongTrongLuongCayThong:  number;
    trongLuongPhoi:          number;
    trongLuongPhoiDu:        number;
    trongLuongDucHong:       number;
    trongLuongCuiTy:         number;
    bui:                     number;
  };
  tyLeVang24K:  number;
  tyLeHoi:      number;
}

// ─── PHIẾU GIAO NHẬN INFO — from "GIAO NHẬN INFO" sheet ─────

export interface PhieuGiaoNhanInfo {
  soPhieu:       string;          // PN-INFO-26-01-01
  ngayDuc:       number;
  ngayNhanPhieu: number;
  noiLuuTru:     string;          // 'Phòng Kho Sản xuất'
  keToanKho:     string;
  items: Array<{
    stt:          number;
    lap:          number;
    maDon:        string;
    maHang:       string;
    luongHang:    LuongHang;
    tuoiVang:     TuoiVang;
    mauSP:        string;
    trongLuong:   number;
    ghiChu:       string;
  }>;
}

// ─── DATA TRỌNG LƯỢNG — 4 giai đoạn per đơn ─────────────────

export interface DataTrongLuong {
  thang:          number;
  ngayLenMa:      number;
  maDon:          string;
  maHang:         string;
  tuoiVang:       number;           // 75, 58.5, 99.9
  lap:            number | null;
  maGop:          string;           // '75 TRẮNG'
  trangThaiPhoi:  TrangThaiPhoi;
  giaiDoan1: { trongLuong: number; kho: string };   // KHO PHÔI ĐÚC
  giaiDoan2: { ngay: number | null; trongLuong: number | null; kho: string | null };
  giaiDoan3: { ngay: number | null; trongLuong: number | null; kho: string | null };
  giaiDoan4: { trongLuong: number | null; kho: string | null };
  trongLuongFinal:     number | null;
  khoFinal:            string | null;
  tlThanhPhamCoDa:     number | null;
}

// ─── CÂN HÀNG NGÀY — per thợ per ngày ───────────────────────

export interface CanHangNgay {
  thang:          number;
  ngay:           number;
  hoVaTen:        string;
  luongHang:      LuongHang;
  trongLuongTruoc: number;         // TL trước cân
  trongLuongSau:   number;         // TL sau cân
  bot:             number;         // Bột thu
  caLamViec:       string;
  chenhLechSoSach:     number;     // Chêch lệch thợ phải trả sổ sách
  botThuThucTe:        number;     // Bột thu hàng ngày thực tế thợ trả
  tongChenhLechSoSach: number;
  tongBotThuHangNgay:  number;
  lech:                number;     // tongChenhLech - tongBotThu
  nguyenLieu: {
    tongDauNgay:     number;
    phatRa:          number;
    tonCuoiNgay:     number;
    suDung:          number;
  };
}

// ─── CÂN NGUYÊN LIỆU — per thợ per NL per ngày ─────────────

export interface CanNguyenLieu {
  thang:        number;
  ngay:         number;
  hoVaTen:      string;
  caLamViec:    string;
  nguyenLieu:   string;          // '75 Trắng', '75 Đỏ', '75 Hồng'
  sanXuat:  { truoc: number; sau: number; lech: number };
  suaChua:  { truoc: number; sau: number; lech: number };
  trangThai:    string;          // 'CÂN CUỐI NGÀY'
  ghiChu:       string;
}

// ─── SỔ GIAO THỢ — worker KPI tracking ──────────────────────

export interface SoGiaoTho {
  nhanVienNhap:   string;          // 'NGỌC'
  ngay:           number;
  maDon:          string;
  maHang:         string;
  chungLoai:      ChungLoai;
  luongHang:      LuongHang;
  maTho:          number;
  tenTho:         string;
  trangThai:      string;          // 'Xong Nguội sửa chữa'
  ghiChu:         string;
  congDoan:       CongDoan;
  phatSinh:       number | null;
  dinhMuc:        number | null;
  dinhMucSuaChua: number | null;
  tongTime:       number;          // total time
  quyVeNhomChuan: number;          // normalized KPI
}

// ─── BOM ĐÁ — from MR. TIẾN BẢNG IN ĐÁ ─────────────────────

export interface BOMDa {
  maDon:      string;
  maHang:     string;
  ngayIn:     number;
  ngayGiao:   number | null;
  items: Array<{
    stt:              number;
    loaiDa:           string;
    soLuong:          number;
    trongLuongPerVien: number;    // chỉ
    tongTrongLuong:    number;
    ghiChu:           string;
  }>;
}

// ─── SOÁT KHO — Gate 9 reconciliation ────────────────────────

export interface SoatKhoRecord {
  kyKiemTra:        'TUAN' | 'THANG';
  ngayKiemTra:      number;
  vangXuat:         number;
  vangThanhPham:    number;
  vangTon:          number;
  vangBuiThuGom:    number;
  chenhLech:        number;   // vangXuat - vangThanhPham - vangTon - vangBuiThuGom
  canhBao:          'XANH' | 'VANG' | 'DO';
  nguoiKiemTra:     string;
  donLech:          string[]; // Danh sách mã đơn có lệch
}

// ─── WAREHOUSE EVENT NAMES — for EventBus ────────────────────

export const WAREHOUSE_EVENTS = {
  NVL_XUAT_KHO:       'WAREHOUSE.NVL_XUAT_KHO',
  PHOI_NHAP_KHO:      'WAREHOUSE.PHOI_NHAP_KHO',
  CAN_HANG_RECORDED:  'WAREHOUSE.CAN_HANG_RECORDED',
  WEIGHT_ALERT:       'WAREHOUSE.WEIGHT_ALERT',
  GATE_passED:        'WAREHOUSE.GATE_passED',
  GATE_BLOCKED:       'WAREHOUSE.GATE_BLOCKED',
  TP_NHAP_KHO:        'WAREHOUSE.TP_NHAP_KHO',
  SOAT_KHO_COMPLETE:  'WAREHOUSE.SOAT_KHO_COMPLETE',
  HAO_HUT_VUOT_NGUONG: 'WAREHOUSE.HAO_HUT_VUOT_NGUONG',
} as const;
