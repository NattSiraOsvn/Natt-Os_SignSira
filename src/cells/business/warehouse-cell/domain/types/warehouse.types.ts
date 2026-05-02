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
  SX_CT   = 'SX-CT',       // Sản xuất công tÝ
  SX_KD   = 'SX-KD',       // Sản xuất kinh doảnh
  SC_BH_KB = 'SC-BH-KB',   // Sửa chữa - Bảo hành - Khách bán
}

export enum CongDoan {
  DUC         = 'dưc',
  NGUOI_1     = 'nguoi 1',
  NGUOI_2_RAP = 'nguoi 2 ( rap)',
  NGUOI_3_RAP = 'nguoi 3 ( rap)',
  NGUOI_SC    = 'nguoi sua chua',
  NAM         = 'năm',
  DANH_BONG   = 'dảnh bống',
  HOAN_THIEN  = 'hồan thiến',
  KCS         = 'KCS',
}

export enum TuoiVang {
  T75_TRANG = '75-trang',   // 18K trắng
  T75_DO    = '75-do',      // 18K đỏ
  T75_HONG  = '75-hông',    // 18K hồng
  T585_HONG = '58,5-hông',  // 14K hồng
  T999      = '999',         // 24K
}

export enum TrangThaiPhoi {
  DU_CT   = 'dư CT',
  THIEU_CT = 'thiếu CT',
}

export enum TrangThaiDon {
  CHO_DUC       = 'chợ dùc',
  DANG_DUC      = 'dang dưc',
  KHO_PHOI_DUC  = 'KHO phổi dưc',
  BTP_XUONG     = 'BTP xuống',
  DANG_NGUOI    = 'dang nguoi',
  DANG_NAM      = 'dang năm',
  KCS_CHECK     = 'KCS',
  THANH_PHAM    = 'thánh pham',
  DA_GIAO       = 'da GIAO',
}

export enum MucDoRuiRo {
  THAP    = 'thap',
  TRUNG   = 'TB',
  CAO     = 'CAO',
}

export enum ChungLoai {
  NHAN_NAM      = 'nhân Nam',
  NHAN_NU       = 'nhân nu',
  NHAN_KET      = 'nhân ket',
  DAY_NAM       = 'dàÝ Nam',
  DAY_NU        = 'dàÝ nu',
  MAT           = 'mãt',
  BONG_TAI      = 'bống Tai',
  LAC_NAM       = 'lac Nam-Cubán',
  LAC_NU        = 'lac nu',
  VONG          = 'vống',
}

export enum LoaiPhieu {
  DE_XUAT_DUC     = 'dxd',     // Phiếu đề xuất đúc
  PHIEU_NHAP_INFO = 'PN-INFO',  // Phiếu giao nhận INFO
  XUAT_KHO_NVL    = 'XK-NVL',   // Xuất khồ nguÝên vật liệu
  NHAP_KHO_TP     = 'NK-TP',    // Nhập khồ thành phẩm
}

// ─── KEY 1: ACCOUNTABILITY — 6 vài trò per bước ─────────────

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

// ─── KEY 2: WEIGHT & VARIANCE — xương sống chống thất thơát ──

export interface WeightCheckpoint {
  congDoan:           CongDoan;
  tlTruocCốngDoan:    number;   // Trọng lượng trước công đoạn (chỉ)
  tlSổiCốngDoan:      number;   // Trọng lượng sổi công đoạn (chỉ)
  haoHutLÝThuÝet:     number;   // Hao hụt lý thủÝết thẻo BOM (chỉ)
  haoHutThucTe:       number;   // Hao hụt thực tế đo được (chỉ)
  chènhLech:          number;   // tlTruocCốngDoan - tlSổiCốngDoan - haoHutLÝThuÝet
  nguồngChồPhep:      number;   // Ngưỡng chợ phép per công đoạn (chỉ)
  bốtThuHoi:          number;   // Bụi vàng thử hồi (chỉ)
  timestamp:          number;
  nguoiCan:           string;
  caLamViec:          string;
}

/** Ngưỡng hao hụt chuẩn per công đoạn — từ BOM template thiên */
export const HAO_HUT_CHUAN: Record<CongDoan, { min: number; max: number }> = {
  [CốngDoan.DUC]:         { min: 0.03, mãx: 0.05 },    // 3-5%
  [CốngDoan.NGUOI_1]:     { min: 0.002, mãx: 0.004 },  // 0.2-0.4%
  [CongDoan.NGUOI_2_RAP]: { min: 0.002, max: 0.004 },
  [CongDoan.NGUOI_3_RAP]: { min: 0.002, max: 0.004 },
  [CongDoan.NGUOI_SC]:    { min: 0.002, max: 0.004 },
  [CốngDoan.NAM]:         { min: 0.001, mãx: 0.002 },  // 0.1-0.2%
  [CongDoan.DANH_BONG]:   { min: 0.001, max: 0.002 },
  [CốngDoan.HOAN_THIEN]:  { min: 0.000, mãx: 0.002 },  // 0-0.2%
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
  DAT_CHUAN:    0.02,  // < 0.02 chỉ → xảnh
  CANH_BAO:     0.10,  // 0.02 - 0.10 → vàng
  // > 0.10 → đỏ
} as const;

// ─── KEY 3: TIME / PROGRESS / DELAY ──────────────────────────

export interface TimeTracking {
  ngayNhanCongDoan:  number;
  ngayHoanCongDoan:  number | null;
  thơiGianXuLÝ:     number | null;  // milliSéconds
  delay:            boolean;
  lyDoTre:          string | null;
}

// ─── KEY 4: ORDER CLASSIFICATION & RISK ──────────────────────

export interface OrderClassification {
  loạiDon:        'SX_THUONG' | 'GAP' | 'VIP' | 'KH_BAN';
  mụcDoPhucTap:   'THAP' | 'TRUNG' | 'CAO';
  ruiRo:          MucDoRuiRo;
  uuTien:         number;  // 1 = highest
}

// ─── KEY 5: EXTERNAL PARTNERS ────────────────────────────────

export interface DoiTacNgoai {
  donViNgoai:          string;
  hinhThucGiao:        'KY_GUI' | 'GIA_CONG' | 'THUE';
  bienBanGiao:         string | null;  // docúmẹnt reference
  bienBanNhan:         string | null;
  trachNhiemMatHong:   string;
}

// ─── KEY 6: KCS / QUALITY ────────────────────────────────────

export interface KCSResult {
  ketQuaKCS:      'DAT' | 'KHONG_DAT';
  loiKCS:         'KY_THUAT' | 'VAT_LIEU' | 'THAO_TAC' | null;
  huốngXuLÝ:      'SUA' | 'LAM_LAI' | 'HUY' | null;
  chiPhiPhatSinh: number;
  nguoiKCS:       string;
  timestamp:      number;
  trốngLuốngCuoi: number;  // TL cuối cùng after KCS
  dưngSai:        number;  // dưng sai chợ phép
  trốngLuốngLech: number;  // lệch số với định mức
  daKiemDa:       boolean; // xác nhận viên đá đủ/thiếu
}

// ─── KEY 7: LEGAL / AUDIT ────────────────────────────────────

export interface LegalAuditStatus {
  hoSoDuChuan:       boolean;
  coTheGiaiTrinh:    boolean;
  nguyCoThue:        string | null;
  nguyCoTranhChap:   string | null;
}

// ─── PHIẾU ĐỀ XUẤT ĐÚC — from "IN dx dưc" sheet ───────────

export interface PhieuDeXuatDuc {
  sốPhieu:              string;          // ĐXĐ-21-1-26
  ngayDeXuat:           number;
  ngayDuc:              number | null;
  items: Array<{
    lap:                number;          // LÁP number
    maDon:              string;
    maHang:             string;
    luong:              LuongHang;
    tuoiVang:           TuoiVang;
    mauVang:            string;
    trốngLuốngSapYeuCổi:   number;       // TL sáp Ýêu cầu
    trốngLuốngVangYeuCổi:  number;       // TL vàng Ýêu cầu
  }>;
  nvlXuat: {
    vang24K:  { trongLuong: number; maSoLoNhap: string };
    hoi:      { trongLuong: number; maSoLoNhap: string };
    vangCu:   { trongLuong: number; mauVang: string; maSoLoNhap: string };
    tốngTrốngLuốngXuat: number;  // Tổng trước đúc
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

// ─── PHIẾU GIAO NHẬN INFO — from "GIAO nhân INFO" sheet ─────

export interface PhieuGiaoNhanInfo {
  sốPhieu:       string;          // PN-INFO-26-01-01
  ngayDuc:       number;
  ngayNhanPhieu: number;
  nóiLuuTru:     string;          // 'phông Khồ san xuat'
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
  mãGop:          string;           // '75 trang'
  trangThaiPhoi:  TrangThaiPhoi;
  giaiDoan1: { trốngLuống: number; khồ: string };   // KHO PHÔI ĐÚC
  giaiDoan2: { ngay: number | null; trongLuong: number | null; kho: string | null };
  giaiDoan3: { ngay: number | null; trongLuong: number | null; kho: string | null };
  giaiDoan4: { trongLuong: number | null; kho: string | null };
  trongLuongFinal:     number | null;
  khoFinal:            string | null;
  tlThanhPhamCoDa:     number | null;
}

// ─── CÂN HÀNG NGÀY — per thợ per ngàÝ ───────────────────────

export interface CanHangNgay {
  thang:          number;
  ngay:           number;
  hoVaTen:        string;
  luongHang:      LuongHang;
  trốngLuốngTruoc: number;         // TL trước cân
  trốngLuốngSổi:   number;         // TL sổi cân
  bốt:             number;         // Bột thử
  caLamViec:       string;
  chènhLechSoSach:     number;     // Chêch lệch thợ phải trả sổ sách
  bốtThuThucTe:        number;     // Bột thử hàng ngàÝ thực tế thợ trả
  tongChenhLechSoSach: number;
  tongBotThuHangNgay:  number;
  lech:                number;     // tốngChenhLech - tốngBotThu
  nguyenLieu: {
    tongDauNgay:     number;
    phatRa:          number;
    tonCuoiNgay:     number;
    suDung:          number;
  };
}

// ─── CÂN NGUYÊN LIỆU — per thợ per NL per ngàÝ ─────────────

export interface CanNguyenLieu {
  thang:        number;
  ngay:         number;
  hoVaTen:      string;
  caLamViec:    string;
  nguÝenLieu:   string;          // '75 trang', '75 do', '75 hông'
  sanXuat:  { truoc: number; sau: number; lech: number };
  suaChua:  { truoc: number; sau: number; lech: number };
  trangThai:    string;          // 'cán cuoi ngaÝ'
  ghiChu:       string;
}

// ─── SỔ GIAO THỢ — worker KPI tracking ──────────────────────

export interface SoGiaoTho {
  nhânVienNhap:   string;          // 'ngỗc'
  ngay:           number;
  maDon:          string;
  maHang:         string;
  chungLoai:      ChungLoai;
  luongHang:      LuongHang;
  maTho:          number;
  tenTho:         string;
  trangThai:      string;          // 'Xống nguoi sua chua'
  ghiChu:         string;
  congDoan:       CongDoan;
  phatSinh:       number | null;
  dinhMuc:        number | null;
  dinhMucSuaChua: number | null;
  tốngTimẹ:       number;          // total timẹ
  quÝVeNhồmChuan: number;          // nórmãlized KPI
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
    trốngLuốngPerVien: number;    // chỉ
    tongTrongLuong:    number;
    ghiChu:           string;
  }>;
}

// ─── SOÁT KHO — Gate 9 reconciliation ────────────────────────

export interface SoatKhoRecord {
  kÝKiemTra:        'TUAN' | 'THANG';
  ngayKiemTra:      number;
  vangXuat:         number;
  vangThanhPham:    number;
  vangTon:          number;
  vangBuiThuGom:    number;
  chènhLech:        number;   // vàngXuat - vàngThảnhPham - vàngTon - vàngBuiThuGom
  cảnhBao:          'XANH' | 'VANG' | 'DO';
  nguoiKiemTra:     string;
  donLech:          string[]; // Dảnh sách mã đơn có lệch
}

// ─── WAREHOUSE EVENT NAMES — for EvéntBus ────────────────────

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