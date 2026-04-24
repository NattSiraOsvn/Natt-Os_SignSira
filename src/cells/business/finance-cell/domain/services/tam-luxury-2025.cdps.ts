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
    tkCode: '111', tkName: 'Tiền mặt',
    dauKyNo: 23_144_855_195, dauKyCo: 0,
    psNo: 28_400_722_758,    psCo: 33_163_575_115,
    cuoiKyNo: 18_382_002_838, cuoiKyCo: 0,
  },
  {
    tkCode: '112', tkName: 'Tiền gửi ngân hàng',
    dauKyNo: 11_731_151_658, dauKyCo: 0,
    psNo: 337_515_968_955,   psCo: 337_910_170_087,
    cuoiKyNo: 11_336_950_526, cuoiKyCo: 0,
  },

  // TK131: ĐK và CK là credit balance (KH ứng trước)
  // → dauKyCo/cuoiKyCo, KHÔNG phải dauKyNo
  {
    tkCode: '131', tkName: 'Phải thu khách hàng',
    dauKyNo: 0,   dauKyCo: 222_084_499,   // ĐK credit 222tr
    psNo: 221_084_500, psCo: 0,
    cuoiKyNo: 0, cuoiKyCo: 999_999,       // CK credit ~1tr → map sang Nợ PT Mã 312
  },
  {
    tkCode: '1388', tkName: 'Phải thu khác',
    dauKyNo: 0,           dauKyCo: 0,
    psNo: 379_231_360,    psCo: 379_231_360,
    cuoiKyNo: 0,          cuoiKyCo: 0,    // cân — chuyển nhầm đã thu hồi
  },

  {
    tkCode: '331', tkName: 'Phải trả người bán',
    dauKyNo: 0,            dauKyCo: 18_517_070_078,
    psNo: 273_721_635_672, psCo: 279_276_603_522,
    cuoiKyNo: 0,           cuoiKyCo: 24_072_037_928,
  },
  {
    tkCode: '334', tkName: 'Phải trả người lao động',
    dauKyNo: 0,            dauKyCo: 479_245_000,
    psNo: 24_619_798_418,  psCo: 26_283_792_415,
    cuoiKyNo: 0,           cuoiKyCo: 2_143_238_997,  // lương T12 chưa chi
  },
  {
    tkCode: '335', tkName: 'Chi phí phải trả',
    dauKyNo: 0,            dauKyCo: 0,
    psNo: 102_780_000,     psCo: 2_439_055_528,
    cuoiKyNo: 0,           cuoiKyCo: 2_336_275_528,  // lương T13 + tất niên
  },
  {
    tkCode: '3382', tkName: 'Kinh phí công đoàn',
    dauKyNo: 0,           dauKyCo: 0,
    psNo: 269_002_512,    psCo: 300_585_712,
    cuoiKyNo: 0,          cuoiKyCo: 31_583_200,
  },
  {
    tkCode: '3383', tkName: 'Bảo hiểm xã hội',
    dauKyNo: 0,           dauKyCo: 0,
    psNo: 4_299_779_334,  psCo: 4_805_174_534,
    cuoiKyNo: 0,          cuoiKyCo: 505_395_200,
  },
  {
    tkCode: '3387', tkName: 'Doanh thu chưa thực hiện',
    dauKyNo: 0,              dauKyCo: 0,
    psNo: 298_221_644_244,   psCo: 315_028_932_541,
    cuoiKyNo: 0,             cuoiKyCo: 16_807_288_297, // ⚠️ 16.8 tỷ cọc KH
  },

  // Vay ngắn hạn TK341 (engine map từ TK341)
  {
    tkCode: '341', tkName: 'Vay và nợ thuê tài chính',
    dauKyNo: 0,           dauKyCo: 3_886_804_883,
    psNo: 1_000_080_000,  psCo: 0,
    cuoiKyNo: 0,          cuoiKyCo: 2_886_724_883,
  },

  // Thuế
  {
    tkCode: '33311', tkName: 'Thuế GTGT đầu ra',
    dauKyNo: 0,           dauKyCo: 386_504_930,
    psNo: 5_366_456_071,  psCo: 11_706_308_717,
    cuoiKyNo: 0,          cuoiKyCo: 6_726_357_576,
  },
  {
    tkCode: '33312', tkName: 'Thuế GTGT hàng nhập khẩu',
    dauKyNo: 0,            dauKyCo: 0,
    psNo: 12_018_858_206,  psCo: 12_018_858_206,
    cuoiKyNo: 0,           cuoiKyCo: 0,              // cân
  },
  {
    tkCode: '3334', tkName: 'Thuế thu nhập doanh nghiệp',
    dauKyNo: 0,            dauKyCo: 406_160_699,
    psNo: 10_116_369_560,  psCo: 17_806_717_978,
    cuoiKyNo: 0,           cuoiKyCo: 8_096_509_117,  // QĐ296 + TNDN 2025
  },
  {
    tkCode: '3335', tkName: 'Thuế thu nhập cá nhân',
    dauKyNo: 0,           dauKyCo: 174_000,
    psNo: 555_700_714,    psCo: 636_358_845,
    cuoiKyNo: 0,          cuoiKyCo: 80_832_131,
  },

  // Vốn & lợi nhuận
  {
    tkCode: '411', tkName: 'Vốn đầu tư của chủ sở hữu',
    dauKyNo: 0,   dauKyCo: 50_000_000_000,
    psNo: 0,      psCo: 0,
    cuoiKyNo: 0,  cuoiKyCo: 50_000_000_000,
  },
  {
    // 4211 debit balance = lỗ lũy kế 992tr chưa bù đắp
    tkCode: '4211', tkName: 'LNST chưa phân phối năm trước',
    dauKyNo: 992_385_009, dauKyCo: 0,
    psNo: 1_393_273_167,  psCo: 0,
    cuoiKyNo: 992_385_009, cuoiKyCo: 0,
  },
  {
    tkCode: '4212', tkName: 'LNST chưa phân phối năm nay',
    dauKyNo: 0,            dauKyCo: 1_393_273_167,
    psNo: 16_729_269_757,  psCo: 33_097_357_174,
    cuoiKyNo: 0,           cuoiKyCo: 14_974_814_250,
  },

  // ══════════════════════════════════════════
  // SỔ 2 — NVL, SẢN XUẤT, HÀNG TỒN KHO
  // ══════════════════════════════════════════

  {
    tkCode: '152', tkName: 'Nguyên vật liệu',
    dauKyNo: 16_052_374_333, dauKyCo: 0,
    psNo: 134_081_781_384,   psCo: 141_508_232_303,
    cuoiKyNo: 8_625_923_414, cuoiKyCo: 0,
  },
  {
    tkCode: '153', tkName: 'Công cụ dụng cụ',
    dauKyNo: 0,           dauKyCo: 0,
    psNo: 159_507_280,    psCo: 159_507_280,
    cuoiKyNo: 0,          cuoiKyCo: 0,
  },
  {
    // ⚠️ TR-001 VIOLATION: CK = 0 — xưởng đang SX không thể WIP = 0
    tkCode: '154', tkName: 'Chi phí SXKD dở dang',
    dauKyNo: 0,              dauKyCo: 0,
    psNo: 151_875_938_150,   psCo: 151_875_938_150,
    cuoiKyNo: 0,             cuoiKyCo: 0,
  },
  {
    tkCode: '155', tkName: 'Thành phẩm',
    dauKyNo: 6_553_826_758,   dauKyCo: 0,
    psNo: 151_976_507_815,    psCo: 155_685_864_429,
    cuoiKyNo: 2_844_470_144,  cuoiKyCo: 0,
  },
  {
    // ⚠️ TỒN 70.19 tỷ KC nhập khẩu rời chưa bán
    tkCode: '156', tkName: 'Hàng hóa',
    dauKyNo: 0,               dauKyCo: 0,
    psNo: 159_893_128_423,    psCo: 89_705_360_168,
    cuoiKyNo: 70_187_768_255, cuoiKyCo: 0,
  },
  {
    // ⚠️ CDPS 632 ≠ KQKD Mã 11 — dùng KQKD figure cho output
    // psNo = CDPS thực tế, nhưng engine KQKD sẽ dùng đúng figure
    tkCode: '632', tkName: 'Giá vốn hàng bán',
    dauKyNo: 0,               dauKyCo: 0,
    psNo: 248_835_101_256,    psCo: 248_835_101_256,
    cuoiKyNo: 0,              cuoiKyCo: 0,
  },

  // ══════════════════════════════════════════
  // SỔ 3 — TSCĐ, KHẤU HAO, XDCB
  // ══════════════════════════════════════════

  {
    tkCode: '211', tkName: 'Tài sản cố định hữu hình',
    dauKyNo: 17_118_968_253,  dauKyCo: 0,
    psNo: 129_600_000,        psCo: 0,
    cuoiKyNo: 17_248_568_253, cuoiKyCo: 0,
  },
  {
    tkCode: '214', tkName: 'Hao mòn tài sản cố định',
    dauKyNo: 0,  dauKyCo: 1_921_912_154,
    psNo: 0,     psCo: 1_892_599_881,
    cuoiKyNo: 0, cuoiKyCo: 3_814_512_035,
  },
  {
    // Showroom HN chưa nghiệm thu
    tkCode: '241', tkName: 'XDCB dở dang',
    dauKyNo: 0,             dauKyCo: 0,
    psNo: 1_422_717_225,    psCo: 0,
    cuoiKyNo: 1_422_717_225, cuoiKyCo: 0,
  },
  {
    tkCode: '242', tkName: 'Chi phí trả trước',
    dauKyNo: 225_395_037,   dauKyCo: 0,
    psNo: 569_733_188,      psCo: 430_412_664,
    cuoiKyNo: 364_715_561,  cuoiKyCo: 0,
  },
  {
    tkCode: '244', tkName: 'Ký quỹ ký cược',
    dauKyNo: 0,           dauKyCo: 0,
    psNo: 265_000_000,    psCo: 0,
    cuoiKyNo: 265_000_000, cuoiKyCo: 0,
  },

  // ══════════════════════════════════════════
  // SỔ 4 — DOANH THU, CHI PHÍ
  // ══════════════════════════════════════════

  {
    tkCode: '511', tkName: 'Doanh thu bán hàng và CCDV',
    dauKyNo: 0,  dauKyCo: 0,
    psNo: 318_025_558_745, psCo: 318_025_558_745,
    cuoiKyNo: 0, cuoiKyCo: 0,
  },
  {
    tkCode: '5111', tkName: 'DT bán hàng hóa (bán lẻ)',
    dauKyNo: 0,  dauKyCo: 0,
    psNo: 102_250_000_000, psCo: 102_250_000_000,  // estimate split
    cuoiKyNo: 0, cuoiKyCo: 0,
  },
  {
    tkCode: '5112', tkName: 'DT bán thành phẩm (bán buôn)',
    dauKyNo: 0,  dauKyCo: 0,
    psNo: 215_160_000_000, psCo: 215_160_000_000,  // estimate split
    cuoiKyNo: 0, cuoiKyCo: 0,
  },
  {
    tkCode: '5113', tkName: 'DT cung cấp dịch vụ',
    dauKyNo: 0,  dauKyCo: 0,
    psNo: 620_000_000, psCo: 620_000_000,           // estimate
    cuoiKyNo: 0, cuoiKyCo: 0,
  },
  {
    tkCode: '5213', tkName: 'Hàng bán bị trả lại / giảm trừ DT',
    dauKyNo: 0,          dauKyCo: 0,
    psNo: 120_075_000,   psCo: 120_075_000,
    cuoiKyNo: 0,         cuoiKyCo: 0,
  },
  {
    tkCode: '515', tkName: 'Doanh thu hoạt động tài chính',
    dauKyNo: 0,         dauKyCo: 0,
    psNo: 14_954_538,   psCo: 14_954_538,
    cuoiKyNo: 0,        cuoiKyCo: 0,
  },
  {
    // ⚠️ TR-004: gồm lãi vay 370tr + CL tỷ giá 2.39tỷ
    // Mã 23 KQKD phải = 370tr (KHÔNG phải 0)
    tkCode: '635', tkName: 'Chi phí tài chính',
    dauKyNo: 0,              dauKyCo: 0,
    psNo: 2_764_890_790,     psCo: 2_764_890_790,
    cuoiKyNo: 0,             cuoiKyCo: 0,
  },
  {
    tkCode: '641', tkName: 'Chi phí bán hàng',
    dauKyNo: 0,            dauKyCo: 0,
    psNo: 8_465_080_878,   psCo: 8_465_080_878,
    cuoiKyNo: 0,           cuoiKyCo: 0,
  },
  {
    tkCode: '642', tkName: 'Chi phí quản lý doanh nghiệp',
    dauKyNo: 0,             dauKyCo: 0,
    psNo: 13_092_494_775,   psCo: 13_092_494_775,
    cuoiKyNo: 0,            cuoiKyCo: 0,
  },
  {
    tkCode: '711', tkName: 'Thu nhập khác',
    dauKyNo: 0,        dauKyCo: 0,
    psNo: 28_703_812,  psCo: 28_703_812,
    cuoiKyNo: 0,       cuoiKyCo: 0,
  },
  {
    // ⚠️ Gồm QĐ296 truy thu + CP cá nhân GĐ + thiết bị y tế 315tr
    tkCode: '811', tkName: 'Chi phí khác',
    dauKyNo: 0,            dauKyCo: 0,
    psNo: 6_978_078_494,   psCo: 6_978_078_494,
    cuoiKyNo: 0,           cuoiKyCo: 0,
  },
  {
    // QĐ296 9.62tỷ + TNDN 2025 8.19tỷ
    tkCode: '8211', tkName: 'Chi phí thuế TNDN hiện hành',
    dauKyNo: 0,             dauKyCo: 0,
    psNo: 17_806_717_978,   psCo: 17_806_717_978,
    cuoiKyNo: 0,            cuoiKyCo: 0,
  },
];

// ══════════════════════════════════════════
// AUDIT FLAGS (không ảnh hưởng số liệu)
// ══════════════════════════════════════════
export const CDPS_AUDIT_FLAGS = [
  { tk: '154',   rule: 'TR-001', msg: 'WIP cuoiKyNo = 0 — KTT ép bằng 0, phi thực tế SX kim hoàn' },
  { tk: '156',   rule: 'TR-003', msg: 'Tồn KC 70.19 tỷ — cần kiểm kê thực tế đối chiếu' },
  { tk: '635',   rule: 'TR-004', msg: 'Mã 23 KQKD phải tách: lãi vay ~370tr vs CL tỷ giá ~2.39 tỷ' },
  { tk: '811',   rule: 'FS-022', msg: 'CP khác 6.98 tỷ gộp nhiều loại — phân tích từng bút toán' },
  { tk: '632',   rule: 'INFO',   msg: 'CDPS 248.84 tỷ ≠ KQKD 246.75 tỷ — chênh 2.08 tỷ phân kim' },
  { tk: '4211',  rule: 'INFO',   msg: 'Debit balance = lỗ lũy kế 992tr chưa bù đắp' },
  { tk: '3387',  rule: 'INFO',   msg: '16.8 tỷ cọc KH chưa xuất HĐ — KHÔNG được ghi nhận DT' },
  { tk: '5111',  rule: 'warn',   msg: 'Split 5111/5112/5113 là estimate — cần sub-ledger xác nhận' },
] as const;

// Header dùng chung
export const TAM_LUXURY_HEADER = {
  companyName: 'CÔNG TY TNHH TÂM LUXURY',
  address:     '714-716 Trần Hưng Đạo, Phường 02, Quận 5, TP.HCM',
  mst:         '0316379948',
  periodFrom:  '01/01/2025',
  periodTo:    '31/12/2025',
  currency:    'VND' as const,
};
