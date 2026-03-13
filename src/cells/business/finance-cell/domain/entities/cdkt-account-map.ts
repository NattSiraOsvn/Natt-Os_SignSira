// @ts-nocheck — BCTC forms pending typed integration
/**
 * cdkt-account-map.ts
 * 
 * Ánh xạ TK sổ cái → mã chỉ tiêu CDKT (B01-DN).
 * Extract từ BCTC thật Tâm Luxury 2025.
 * 
 * Quy tắc:
 * - TK dư Nợ → Tài sản (bên trái CDKT)
 * - TK dư Có → Nguồn vốn (bên phải CDKT)
 * - TK lưỡng tính (131, 331, 333, 421): kiểm tra dư Nợ/Có → phân loại
 */

export interface CdktAccountMapping {
  tkCode: string;
  cdktCode: string;
  side: "dauKyNo" | "dauKyCo" | "cuoiKyNo" | "cuoiKyCo";
  description: string;
}

/**
 * CDKT mapping chuẩn — 1 TK có thể map vào nhiều mã CDKT
 * tùy theo dư Nợ hay dư Có
 */
export const CDKT_ACCOUNT_MAP: CdktAccountMapping[] = [
  // ═══ Tiền (Mã 110) ═══
  { tkCode: "1111", cdktCode: "111", side: "cuoiKyNo", description: "Tiền mặt VND" },
  { tkCode: "1112", cdktCode: "111", side: "cuoiKyNo", description: "Tiền mặt ngoại tệ" },
  { tkCode: "112",  cdktCode: "111", side: "cuoiKyNo", description: "Tiền gửi NH (gộp vào Tiền)" },

  // ═══ Phải thu (Mã 130) ═══
  { tkCode: "131",  cdktCode: "131", side: "cuoiKyNo", description: "Phải thu KH (dư Nợ)" },
  { tkCode: "131",  cdktCode: "312", side: "cuoiKyCo", description: "KH trả trước (dư Có TK131)" },
  { tkCode: "1388", cdktCode: "136", side: "cuoiKyNo", description: "Phải thu khác" },
  { tkCode: "244",  cdktCode: "136", side: "cuoiKyNo", description: "Ký quỹ, ký cược (gộp phải thu khác)" },

  // ═══ HTK (Mã 140) ═══
  { tkCode: "152",  cdktCode: "141", side: "cuoiKyNo", description: "NVL" },
  { tkCode: "153",  cdktCode: "141", side: "cuoiKyNo", description: "CCDC" },
  { tkCode: "154",  cdktCode: "141", side: "cuoiKyNo", description: "SXKD dở dang" },
  { tkCode: "155",  cdktCode: "141", side: "cuoiKyNo", description: "Thành phẩm" },
  { tkCode: "156",  cdktCode: "141", side: "cuoiKyNo", description: "Hàng hóa" },

  // ═══ TS ngắn hạn khác (Mã 150) ═══
  { tkCode: "242",  cdktCode: "151", side: "cuoiKyNo", description: "CP trả trước (phần NH)" },
  { tkCode: "1331", cdktCode: "152", side: "cuoiKyNo", description: "Thuế GTGT được khấu trừ" },
  { tkCode: "333",  cdktCode: "153", side: "cuoiKyNo", description: "Thuế phải thu NN (dư Nợ TK333)" },

  // ═══ TSCĐ (Mã 220) ═══
  { tkCode: "2112", cdktCode: "222", side: "cuoiKyNo", description: "TSCĐ HH - Máy móc thiết bị" },
  { tkCode: "2113", cdktCode: "222", side: "cuoiKyNo", description: "TSCĐ HH - Phương tiện VT" },
  { tkCode: "2141", cdktCode: "223", side: "cuoiKyCo", description: "Hao mòn TSCĐ HH (số âm)" },

  // ═══ TS dở dang DH (Mã 240) ═══
  { tkCode: "2413", cdktCode: "242", side: "cuoiKyNo", description: "XDCB dở dang" },

  // ═══ Nợ phải trả (Mã 300) ═══
  { tkCode: "331",  cdktCode: "311", side: "cuoiKyCo", description: "Phải trả NCC (dư Có)" },
  { tkCode: "331",  cdktCode: "132", side: "cuoiKyNo", description: "Trả trước NCC (dư Nợ TK331)" },
  { tkCode: "333",  cdktCode: "313", side: "cuoiKyCo", description: "Thuế phải nộp (dư Có TK333)" },
  { tkCode: "334",  cdktCode: "314", side: "cuoiKyCo", description: "Phải trả NLĐ" },
  { tkCode: "335",  cdktCode: "315", side: "cuoiKyCo", description: "CP phải trả" },
  { tkCode: "3387", cdktCode: "318", side: "cuoiKyCo", description: "DT chưa thực hiện" },
  { tkCode: "3382", cdktCode: "319", side: "cuoiKyCo", description: "Kinh phí CĐ" },
  { tkCode: "3383", cdktCode: "319", side: "cuoiKyCo", description: "BHXH" },
  { tkCode: "341",  cdktCode: "320", side: "cuoiKyCo", description: "Vay NH (< 12 tháng)" },

  // ═══ Vốn CSH (Mã 400) ═══
  { tkCode: "4111", cdktCode: "411", side: "cuoiKyCo", description: "Vốn góp CSH" },
  { tkCode: "4211", cdktCode: "421a", side: "cuoiKyCo", description: "LNST chưa PP năm trước" },
  { tkCode: "4212", cdktCode: "421b", side: "cuoiKyCo", description: "LNST chưa PP năm nay" },
];

/**
 * Tâm Luxury 2025 — Số thực tế để cross-check
 */
export const TAM_LUXURY_2025_REFERENCE = {
  cdkt: {
    tongTaiSan: 127_863_604_181,
    tongNguonVon: 127_863_604_181,
    tien: 30_718_953_364,
    htk: 81_658_161_813,
    tscd: 13_434_056_218,
    xdcb: 1_422_717_225,
    vonGop: 50_000_000_000,
    lnstChuaPp: 13_982_429_241,
    noNcc: 24_072_037_928,
    dtChuaThucHien: 16_807_288_297,
  },
  kqkd: {
    doanhThu: 318_025_558_745,
    gianTruDt: 7_235_454_869,
    dtThuan: 310_790_103_876,
    giaVon: 246_751_685_061,
    lnGop: 64_038_418_815,
    cpBanHang: 8_465_080_878,
    cpQuanLy: 13_092_494_775,
    lnTruocThue: 32_781_532_228,
    thueTndn: 17_806_717_978,
    lnSauThue: 14_974_814_250,
  },
  tndn: {
    chiPhiLoaiTru: 8_175_978_494,
    thuNhapTinhThue: 40_957_510_722,
    thueSuatApDung: 0.20,
    thueTndnPhatSinh: 8_191_502_144,
    thueTruyThuQd296: 9_615_215_834,
    tongThue: 17_806_717_978,
  },
};
