/**
 * TAM LUXURY 2025 — CDPS THỰC TẾ
 * Source: 4 sổ kế toán upload 2026-03-14
 * Validated by: Băng — Ground Truth Validator QNEU 300
 *
 * Convention:
 *   dauKyNo/cuoiKyNo  = số dư Nợ  (tài sản, chi phí)
 *   dauKyCo/cuoiKyCo  = số dư Có  (nợ phải trả, vốn, doanh thu)
 *   psNo/psCo         = phát sinh trong kỳ
 */
import type { CdpsLine } from '../entities/bctc-forms.template';

export const TAM_LUXURY_2025_CDPS: CdpsLine[] = [

  // ══════════════════════════════════════════
  // SỔ 1 — TIỀN & CÔNG NỢ
  // ══════════════════════════════════════════

  {
    tkCode: '111', tkName: 'tien mat',
    dauKyNo: 23_144_855_195, dauKyCo: 0,
    psNo: 28_400_722_758,    psCo: 33_163_575_115,
    cuoiKyNo: 18_382_002_838, cuoiKyCo: 0,
  },
  {
    tkCode: '112', tkName: 'tien gui ngan hang',
    dauKyNo: 11_731_151_658, dauKyCo: 0,
    psNo: 337_515_968_955,   psCo: 337_910_170_087,
    cuoiKyNo: 11_336_950_526, cuoiKyCo: 0,
  },

  // TK131: ĐK và CK là credit balance (KH ứng trước)
  // → dauKyCo/cuoiKyCo, KHÔNG phải dauKyNo
  {
    tkCode: '131', tkName: 'phai thu khach hang',
    dauKyNo: 0,   dauKyCo: 222_084_499,   // ĐK credit 222tr
    psNo: 221_084_500, psCo: 0,
    cuoiKyNo: 0, cuoiKyCo: 999_999,       // CK credit ~1tr → map sang Nợ PT Mã 312
  },
  {
    tkCode: '1388', tkName: 'phai thu khac',
    dauKyNo: 0,           dauKyCo: 0,
    psNo: 379_231_360,    psCo: 379_231_360,
    cuoiKyNo: 0,          cuoiKyCo: 0,    // cân — chuyển nhầm đã thu hồi
  },

  {
    tkCode: '331', tkName: 'phai tra ngui ban',
    dauKyNo: 0,            dauKyCo: 18_517_070_078,
    psNo: 273_721_635_672, psCo: 279_276_603_522,
    cuoiKyNo: 0,           cuoiKyCo: 24_072_037_928,
  },
  {
    tkCode: '334', tkName: 'phai tra ngui lao dong',
    dauKyNo: 0,            dauKyCo: 479_245_000,
    psNo: 24_619_798_418,  psCo: 26_283_792_415,
    cuoiKyNo: 0,           cuoiKyCo: 2_143_238_997,  // lương T12 chưa chi
  },
  {
    tkCode: '335', tkName: 'Chi phi phai tra',
    dauKyNo: 0,            dauKyCo: 0,
    psNo: 102_780_000,     psCo: 2_439_055_528,
    cuoiKyNo: 0,           cuoiKyCo: 2_336_275_528,  // lương T13 + tất niên
  },
  {
    tkCode: '3382', tkName: 'Kinh phi cong doan',
    dauKyNo: 0,           dauKyCo: 0,
    psNo: 269_002_512,    psCo: 300_585_712,
    cuoiKyNo: 0,          cuoiKyCo: 31_583_200,
  },
  {
    tkCode: '3383', tkName: 'bao hiem xa hau',
    dauKyNo: 0,           dauKyCo: 0,
    psNo: 4_299_779_334,  psCo: 4_805_174_534,
    cuoiKyNo: 0,          cuoiKyCo: 505_395_200,
  },
  {
    tkCode: '3387', tkName: 'Doanh thu chua thuc hien',
    dauKyNo: 0,              dauKyCo: 0,
    psNo: 298_221_644_244,   psCo: 315_028_932_541,
    cuoiKyNo: 0,             cuoiKyCo: 16_807_288_297, // ⚠️ 16.8 tỷ cọc KH
  },

  // Vay ngắn hạn TK341 (engine map từ TK341)
  {
    tkCode: '341', tkName: 'Vay va no thue tai chinh',
    dauKyNo: 0,           dauKyCo: 3_886_804_883,
    psNo: 1_000_080_000,  psCo: 0,
    cuoiKyNo: 0,          cuoiKyCo: 2_886_724_883,
  },

  // Thuế
  {
    tkCode: '33311', tkName: 'thue GTGT dau ra',
    dauKyNo: 0,           dauKyCo: 386_504_930,
    psNo: 5_366_456_071,  psCo: 11_706_308_717,
    cuoiKyNo: 0,          cuoiKyCo: 6_726_357_576,
  },
  {
    tkCode: '33312', tkName: 'thue GTGT hang nhap khau',
    dauKyNo: 0,            dauKyCo: 0,
    psNo: 12_018_858_206,  psCo: 12_018_858_206,
    cuoiKyNo: 0,           cuoiKyCo: 0,              // cân
  },
  {
    tkCode: '3334', tkName: 'thue thu nhap doanh nghiep',
    dauKyNo: 0,            dauKyCo: 406_160_699,
    psNo: 10_116_369_560,  psCo: 17_806_717_978,
    cuoiKyNo: 0,           cuoiKyCo: 8_096_509_117,  // QĐ296 + TNDN 2025
  },
  {
    tkCode: '3335', tkName: 'thue thu nhap ca nhan',
    dauKyNo: 0,           dauKyCo: 174_000,
    psNo: 555_700_714,    psCo: 636_358_845,
    cuoiKyNo: 0,          cuoiKyCo: 80_832_131,
  },

  // Vốn & lợi nhuận
  {
    tkCode: '411', tkName: 'von dau tu cua chu so huu',
    dauKyNo: 0,   dauKyCo: 50_000_000_000,
    psNo: 0,      psCo: 0,
    cuoiKyNo: 0,  cuoiKyCo: 50_000_000_000,
  },
  {
    // 4211 debit balance = lỗ lũy kế 992tr chưa bù đắp
    tkCode: '4211', tkName: 'LNST chua phan phau nam truoc',
    dauKyNo: 992_385_009, dauKyCo: 0,
    psNo: 1_393_273_167,  psCo: 0,
    cuoiKyNo: 992_385_009, cuoiKyCo: 0,
  },
  {
    tkCode: '4212', tkName: 'LNST chua phan phau nam nay',
    dauKyNo: 0,            dauKyCo: 1_393_273_167,
    psNo: 16_729_269_757,  psCo: 33_097_357_174,
    cuoiKyNo: 0,           cuoiKyCo: 14_974_814_250,
  },

  // ══════════════════════════════════════════
  // SỔ 2 — NVL, SẢN XUẤT, HÀNG TỒN KHO
  // ══════════════════════════════════════════

  {
    tkCode: '152', tkName: 'nguyen vat lieu',
    dauKyNo: 16_052_374_333, dauKyCo: 0,
    psNo: 134_081_781_384,   psCo: 141_508_232_303,
    cuoiKyNo: 8_625_923_414, cuoiKyCo: 0,
  },
  {
    tkCode: '153', tkName: 'cong cu dung cu',
    dauKyNo: 0,           dauKyCo: 0,
    psNo: 159_507_280,    psCo: 159_507_280,
    cuoiKyNo: 0,          cuoiKyCo: 0,
  },
  {
    // ⚠️ TR-001 VIOLATION: CK = 0 — xưởng đang SX không thể WIP = 0
    tkCode: '154', tkName: 'Chi phi SXKD do dang',
    dauKyNo: 0,              dauKyCo: 0,
    psNo: 151_875_938_150,   psCo: 151_875_938_150,
    cuoiKyNo: 0,             cuoiKyCo: 0,
  },
  {
    tkCode: '155', tkName: 'thanh pham',
    dauKyNo: 6_553_826_758,   dauKyCo: 0,
    psNo: 151_976_507_815,    psCo: 155_685_864_429,
    cuoiKyNo: 2_844_470_144,  cuoiKyCo: 0,
  },
  {
    // ⚠️ TỒN 70.19 tỷ KC nhập khẩu rời chưa bán
    tkCode: '156', tkName: 'hang hoa',
    dauKyNo: 0,               dauKyCo: 0,
    psNo: 159_893_128_423,    psCo: 89_705_360_168,
    cuoiKyNo: 70_187_768_255, cuoiKyCo: 0,
  },
  {
    // ⚠️ CDPS 632 ≠ KQKD Mã 11 — dùng KQKD figure cho output
    // psNo = CDPS thực tế, nhưng engine KQKD sẽ dùng đúng figure
    tkCode: '632', tkName: 'gia von hang ban',
    dauKyNo: 0,               dauKyCo: 0,
    psNo: 248_835_101_256,    psCo: 248_835_101_256,
    cuoiKyNo: 0,              cuoiKyCo: 0,
  },

  // ══════════════════════════════════════════
  // SỔ 3 — TSCĐ, KHẤU HAO, XDCB
  // ══════════════════════════════════════════

  {
    tkCode: '211', tkName: 'tai san co dinh huu hinh',
    dauKyNo: 17_118_968_253,  dauKyCo: 0,
    psNo: 129_600_000,        psCo: 0,
    cuoiKyNo: 17_248_568_253, cuoiKyCo: 0,
  },
  {
    tkCode: '214', tkName: 'Hao mon tai san co dinh',
    dauKyNo: 0,  dauKyCo: 1_921_912_154,
    psNo: 0,     psCo: 1_892_599_881,
    cuoiKyNo: 0, cuoiKyCo: 3_814_512_035,
  },
  {
    // Showroom HN chưa nghiệm thu
    tkCode: '241', tkName: 'XDCB do dang',
    dauKyNo: 0,             dauKyCo: 0,
    psNo: 1_422_717_225,    psCo: 0,
    cuoiKyNo: 1_422_717_225, cuoiKyCo: 0,
  },
  {
    tkCode: '242', tkName: 'Chi phi tra truoc',
    dauKyNo: 225_395_037,   dauKyCo: 0,
    psNo: 569_733_188,      psCo: 430_412_664,
    cuoiKyNo: 364_715_561,  cuoiKyCo: 0,
  },
  {
    tkCode: '244', tkName: 'ky quy ky cuoc',
    dauKyNo: 0,           dauKyCo: 0,
    psNo: 265_000_000,    psCo: 0,
    cuoiKyNo: 265_000_000, cuoiKyCo: 0,
  },

  // ══════════════════════════════════════════
  // SỔ 4 — DOANH THU, CHI PHÍ
  // ══════════════════════════════════════════

  {
    tkCode: '511', tkName: 'Doanh thu ban hang va CCDV',
    dauKyNo: 0,  dauKyCo: 0,
    psNo: 318_025_558_745, psCo: 318_025_558_745,
    cuoiKyNo: 0, cuoiKyCo: 0,
  },
  {
    tkCode: '5111', tkName: 'DT ban hang hoa (ban le)',
    dauKyNo: 0,  dauKyCo: 0,
    psNo: 102_250_000_000, psCo: 102_250_000_000,  // estimate split
    cuoiKyNo: 0, cuoiKyCo: 0,
  },
  {
    tkCode: '5112', tkName: 'DT ban thanh pham (ban buon)',
    dauKyNo: 0,  dauKyCo: 0,
    psNo: 215_160_000_000, psCo: 215_160_000_000,  // estimate split
    cuoiKyNo: 0, cuoiKyCo: 0,
  },
  {
    tkCode: '5113', tkName: 'DT cung cap dich vu',
    dauKyNo: 0,  dauKyCo: 0,
    psNo: 620_000_000, psCo: 620_000_000,           // estimate
    cuoiKyNo: 0, cuoiKyCo: 0,
  },
  {
    tkCode: '5213', tkName: 'hang ban bi tra lai / giam tru DT',
    dauKyNo: 0,          dauKyCo: 0,
    psNo: 120_075_000,   psCo: 120_075_000,
    cuoiKyNo: 0,         cuoiKyCo: 0,
  },
  {
    tkCode: '515', tkName: 'Doanh thu hoat dong tai chinh',
    dauKyNo: 0,         dauKyCo: 0,
    psNo: 14_954_538,   psCo: 14_954_538,
    cuoiKyNo: 0,        cuoiKyCo: 0,
  },
  {
    // ⚠️ TR-004: gồm lãi vay 370tr + CL tỷ giá 2.39tỷ
    // Mã 23 KQKD phải = 370tr (KHÔNG phải 0)
    tkCode: '635', tkName: 'Chi phi tai chinh',
    dauKyNo: 0,              dauKyCo: 0,
    psNo: 2_764_890_790,     psCo: 2_764_890_790,
    cuoiKyNo: 0,             cuoiKyCo: 0,
  },
  {
    tkCode: '641', tkName: 'Chi phi ban hang',
    dauKyNo: 0,            dauKyCo: 0,
    psNo: 8_465_080_878,   psCo: 8_465_080_878,
    cuoiKyNo: 0,           cuoiKyCo: 0,
  },
  {
    tkCode: '642', tkName: 'Chi phi quan ly doanh nghiep',
    dauKyNo: 0,             dauKyCo: 0,
    psNo: 13_092_494_775,   psCo: 13_092_494_775,
    cuoiKyNo: 0,            cuoiKyCo: 0,
  },
  {
    tkCode: '711', tkName: 'Thu nhap khac',
    dauKyNo: 0,        dauKyCo: 0,
    psNo: 28_703_812,  psCo: 28_703_812,
    cuoiKyNo: 0,       cuoiKyCo: 0,
  },
  {
    // ⚠️ Gồm QĐ296 truy thu + CP cá nhân GĐ + thiết bị y tế 315tr
    tkCode: '811', tkName: 'Chi phi khac',
    dauKyNo: 0,            dauKyCo: 0,
    psNo: 6_978_078_494,   psCo: 6_978_078_494,
    cuoiKyNo: 0,           cuoiKyCo: 0,
  },
  {
    // QĐ296 9.62tỷ + TNDN 2025 8.19tỷ
    tkCode: '8211', tkName: 'Chi phi thue TNDN hien hanh',
    dauKyNo: 0,             dauKyCo: 0,
    psNo: 17_806_717_978,   psCo: 17_806_717_978,
    cuoiKyNo: 0,            cuoiKyCo: 0,
  },
];

// ══════════════════════════════════════════
// AUDIT FLAGS (không ảnh hưởng số liệu)
// ══════════════════════════════════════════
export const CDPS_AUDIT_FLAGS = [
  { tk: '154',   rule: 'TR-001', msg: 'WIP cuoiKyNo = 0 — KTT ep bang 0, phi thuc te SX kim hoan' },
  { tk: '156',   rule: 'TR-003', msg: 'ton KC 70.19 ty — can kiem ke thuc te dau chieu' },
  { tk: '635',   rule: 'TR-004', msg: 'ma 23 KQKD phai tach: lai vay ~370tr vs CL ty gia ~2.39 ty' },
  { tk: '811',   rule: 'FS-022', msg: 'CP khac 6.98 ty gop nhieu loai — phan tich tung but toan' },
  { tk: '632',   rule: 'INFO',   msg: 'CDPS 248.84 ty ≠ KQKD 246.75 ty — chenh 2.08 ty phan kim' },
  { tk: '4211',  rule: 'INFO',   msg: 'Debit balance = lo luy ke 992tr chua bu dap' },
  { tk: '3387',  rule: 'INFO',   msg: '16.8 ty coc KH chua xuat hd — khong duoc ghi nhan DT' },
  { tk: '5111',  rule: 'warn',   msg: 'Split 5111/5112/5113 la estimate — can sub-ledger xac nhan' },
] as const;

// Header dùng chung
export const TAM_LUXURY_HEADER = {
  companyName: 'cong TY TNHH tam LUXURY',
  address:     '714-716 tran hung dao, phuong 02, quan 5, TP.HCM',
  mst:         '0316379948',
  periodFrom:  '01/01/2025',
  periodTo:    '31/12/2025',
  currency:    'VND' as const,
};
