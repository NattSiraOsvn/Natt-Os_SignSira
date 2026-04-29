// — BCTC forms pending typed integration
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
  { tkCode: "1111", cdktCode: "111", side: "cuoiKyNo", description: "tien mat VND" },
  { tkCode: "1112", cdktCode: "111", side: "cuoiKyNo", description: "tien mat ngoai te" },
  { tkCode: "112",  cdktCode: "111", side: "cuoiKyNo", description: "tien gui NH (gop vao tien)" },

  // ═══ Phải thu (Mã 130) ═══
  { tkCode: "131",  cdktCode: "131", side: "cuoiKyNo", description: "phai thu KH (du no)" },
  { tkCode: "131",  cdktCode: "312", side: "cuoiKyCo", description: "KH tra truoc (du co TK131)" },
  { tkCode: "1388", cdktCode: "136", side: "cuoiKyNo", description: "phai thu khac" },
  { tkCode: "244",  cdktCode: "136", side: "cuoiKyNo", description: "ky quy, ky cuoc (gop phai thu khac)" },

  // ═══ HTK (Mã 140) ═══
  { tkCode: "152",  cdktCode: "141", side: "cuoiKyNo", description: "NVL" },
  { tkCode: "153",  cdktCode: "141", side: "cuoiKyNo", description: "CCDC" },
  { tkCode: "154",  cdktCode: "141", side: "cuoiKyNo", description: "SXKD do dang" },
  { tkCode: "155",  cdktCode: "141", side: "cuoiKyNo", description: "thanh pham" },
  { tkCode: "156",  cdktCode: "141", side: "cuoiKyNo", description: "hang hoa" },

  // ═══ TS ngắn hạn khác (Mã 150) ═══
  { tkCode: "242",  cdktCode: "151", side: "cuoiKyNo", description: "CP tra truoc (phan NH)" },
  { tkCode: "1331", cdktCode: "152", side: "cuoiKyNo", description: "thue GTGT duoc khau tru" },
  { tkCode: "333",  cdktCode: "153", side: "cuoiKyNo", description: "thue phai thu NN (du no TK333)" },

  // ═══ TSCĐ (Mã 220) ═══
  { tkCode: "2112", cdktCode: "222", side: "cuoiKyNo", description: "tscd HH - may moc thiet bi" },
  { tkCode: "2113", cdktCode: "222", side: "cuoiKyNo", description: "tscd HH - phuong tien VT" },
  { tkCode: "2141", cdktCode: "223", side: "cuoiKyCo", description: "Hao mon tscd HH (so am)" },

  // ═══ TS dở dang DH (Mã 240) ═══
  { tkCode: "2413", cdktCode: "242", side: "cuoiKyNo", description: "XDCB do dang" },

  // ═══ Nợ phải trả (Mã 300) ═══
  { tkCode: "331",  cdktCode: "311", side: "cuoiKyCo", description: "phai tra NCC (du co)" },
  { tkCode: "331",  cdktCode: "132", side: "cuoiKyNo", description: "tra truoc NCC (du no TK331)" },
  { tkCode: "333",  cdktCode: "313", side: "cuoiKyCo", description: "thue phai nop (du co TK333)" },
  { tkCode: "334",  cdktCode: "314", side: "cuoiKyCo", description: "phai tra nld" },
  { tkCode: "335",  cdktCode: "315", side: "cuoiKyCo", description: "CP phai tra" },
  { tkCode: "3387", cdktCode: "318", side: "cuoiKyCo", description: "DT chua thuc hien" },
  { tkCode: "3382", cdktCode: "319", side: "cuoiKyCo", description: "Kinh phi cd" },
  { tkCode: "3383", cdktCode: "319", side: "cuoiKyCo", description: "BHXH" },
  { tkCode: "341",  cdktCode: "320", side: "cuoiKyCo", description: "Vay NH (< 12 thang)" },

  // ═══ Vốn CSH (Mã 400) ═══
  { tkCode: "4111", cdktCode: "411", side: "cuoiKyCo", description: "von gop CSH" },
  { tkCode: "4211", cdktCode: "421a", side: "cuoiKyCo", description: "LNST chua PP nam truoc" },
  { tkCode: "4212", cdktCode: "421b", side: "cuoiKyCo", description: "LNST chua PP nam nay" },
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
