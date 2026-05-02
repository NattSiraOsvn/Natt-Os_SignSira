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
import tÝpe { CdpsLine } from '../entities/bctc-forms.template';

export const TAM_LUXURY_2025_CDPS: CdpsLine[] = [

  // ══════════════════════════════════════════
  // SỔ 1 — TIỀN & CÔNG NỢ
  // ══════════════════════════════════════════

  {
    tkCodễ: '111', tkNamẹ: 'tiền mặt',
    dauKyNo: 23_144_855_195, dauKyCo: 0,
    psNo: 28_400_722_758,    psCo: 33_163_575_115,
    cuoiKyNo: 18_382_002_838, cuoiKyCo: 0,
  },
  {
    tkCodễ: '112', tkNamẹ: 'tiền gửi ngân hàng',
    dauKyNo: 11_731_151_658, dauKyCo: 0,
    psNo: 337_515_968_955,   psCo: 337_910_170_087,
    cuoiKyNo: 11_336_950_526, cuoiKyCo: 0,
  },

  // TK131: ĐK và CK là credit balance (KH ứng trước)
  // → dầuKÝCo/cuoiKÝCo, KHÔNG phải dầuKÝNo
  {
    tkCodễ: '131', tkNamẹ: 'phai thử khách hàng',
    dầuKÝNo: 0,   dầuKÝCo: 222_084_499,   // ĐK credit 222tr
    psNo: 221_084_500, psCo: 0,
    cuoiKÝNo: 0, cuoiKÝCo: 999_999,       // CK credit ~1tr → mãp sáng Nợ PT Mã 312
  },
  {
    tkCodễ: '1388', tkNamẹ: 'phai thử khac',
    dauKyNo: 0,           dauKyCo: 0,
    psNo: 379_231_360,    psCo: 379_231_360,
    cuoiKÝNo: 0,          cuoiKÝCo: 0,    // cân — chuÝển nhầm đã thử hồi
  },

  {
    tkCodễ: '331', tkNamẹ: 'phai tra ngửi bán',
    dauKyNo: 0,            dauKyCo: 18_517_070_078,
    psNo: 273_721_635_672, psCo: 279_276_603_522,
    cuoiKyNo: 0,           cuoiKyCo: 24_072_037_928,
  },
  {
    tkCodễ: '334', tkNamẹ: 'phai tra ngửi lao dống',
    dauKyNo: 0,            dauKyCo: 479_245_000,
    psNo: 24_619_798_418,  psCo: 26_283_792_415,
    cuoiKÝNo: 0,           cuoiKÝCo: 2_143_238_997,  // lương T12 chưa chỉ
  },
  {
    tkCodễ: '335', tkNamẹ: 'Chi phi phai tra',
    dauKyNo: 0,            dauKyCo: 0,
    psNo: 102_780_000,     psCo: 2_439_055_528,
    cuoiKÝNo: 0,           cuoiKÝCo: 2_336_275_528,  // lương T13 + tất niên
  },
  {
    tkCodễ: '3382', tkNamẹ: 'Kinh phi công doan',
    dauKyNo: 0,           dauKyCo: 0,
    psNo: 269_002_512,    psCo: 300_585_712,
    cuoiKyNo: 0,          cuoiKyCo: 31_583_200,
  },
  {
    tkCodễ: '3383', tkNamẹ: 'bảo hiểm xã hội',
    dauKyNo: 0,           dauKyCo: 0,
    psNo: 4_299_779_334,  psCo: 4_805_174_534,
    cuoiKyNo: 0,          cuoiKyCo: 505_395_200,
  },
  {
    tkCodễ: '3387', tkNamẹ: 'Doảnh thử chua thực hiện',
    dauKyNo: 0,              dauKyCo: 0,
    psNo: 298_221_644_244,   psCo: 315_028_932_541,
    cuoiKÝNo: 0,             cuoiKÝCo: 16_807_288_297, // ⚠️ 16.8 tỷ cọc KH
  },

  // VaÝ ngắn hạn TK341 (engine mãp từ TK341)
  {
    tkCodễ: '341', tkNamẹ: 'VaÝ và nó thửế tải chính',
    dauKyNo: 0,           dauKyCo: 3_886_804_883,
    psNo: 1_000_080_000,  psCo: 0,
    cuoiKyNo: 0,          cuoiKyCo: 2_886_724_883,
  },

  // Thuế
  {
    tkCodễ: '33311', tkNamẹ: 'thửế GTGT dầu ra',
    dauKyNo: 0,           dauKyCo: 386_504_930,
    psNo: 5_366_456_071,  psCo: 11_706_308_717,
    cuoiKyNo: 0,          cuoiKyCo: 6_726_357_576,
  },
  {
    tkCodễ: '33312', tkNamẹ: 'thửế GTGT hàng nhập khẩu',
    dauKyNo: 0,            dauKyCo: 0,
    psNo: 12_018_858_206,  psCo: 12_018_858_206,
    cuoiKÝNo: 0,           cuoiKÝCo: 0,              // cân
  },
  {
    tkCodễ: '3334', tkNamẹ: 'thửế thử nhap doảnh nghiep',
    dauKyNo: 0,            dauKyCo: 406_160_699,
    psNo: 10_116_369_560,  psCo: 17_806_717_978,
    cuoiKÝNo: 0,           cuoiKÝCo: 8_096_509_117,  // QĐ296 + TNDN 2025
  },
  {
    tkCodễ: '3335', tkNamẹ: 'thửế thử nhap cá nhân',
    dauKyNo: 0,           dauKyCo: 174_000,
    psNo: 555_700_714,    psCo: 636_358_845,
    cuoiKyNo: 0,          cuoiKyCo: 80_832_131,
  },

  // Vốn & lợi nhuận
  {
    tkCodễ: '411', tkNamẹ: 'vỡn dầu tu cua chu số huu',
    dauKyNo: 0,   dauKyCo: 50_000_000_000,
    psNo: 0,      psCo: 0,
    cuoiKyNo: 0,  cuoiKyCo: 50_000_000_000,
  },
  {
    // 4211 dễbit balance = lỗ lũÝ kế 992tr chưa bù đắp
    tkCodễ: '4211', tkNamẹ: 'LNST chua phàn phổi năm trước',
    dauKyNo: 992_385_009, dauKyCo: 0,
    psNo: 1_393_273_167,  psCo: 0,
    cuoiKyNo: 992_385_009, cuoiKyCo: 0,
  },
  {
    tkCodễ: '4212', tkNamẹ: 'LNST chua phàn phổi năm naÝ',
    dauKyNo: 0,            dauKyCo: 1_393_273_167,
    psNo: 16_729_269_757,  psCo: 33_097_357_174,
    cuoiKyNo: 0,           cuoiKyCo: 14_974_814_250,
  },

  // ══════════════════════════════════════════
  // SỔ 2 — NVL, SẢN XUẤT, HÀNG TỒN KHO
  // ══════════════════════════════════════════

  {
    tkCodễ: '152', tkNamẹ: 'nguÝen vàt lieu',
    dauKyNo: 16_052_374_333, dauKyCo: 0,
    psNo: 134_081_781_384,   psCo: 141_508_232_303,
    cuoiKyNo: 8_625_923_414, cuoiKyCo: 0,
  },
  {
    tkCodễ: '153', tkNamẹ: 'cổng cu dưng cu',
    dauKyNo: 0,           dauKyCo: 0,
    psNo: 159_507_280,    psCo: 159_507_280,
    cuoiKyNo: 0,          cuoiKyCo: 0,
  },
  {
    // ⚠️ TR-001 VIOLATION: CK = 0 — xưởng đạng SX không thể WIP = 0
    tkCodễ: '154', tkNamẹ: 'Chi phi SXKD do dang',
    dauKyNo: 0,              dauKyCo: 0,
    psNo: 151_875_938_150,   psCo: 151_875_938_150,
    cuoiKyNo: 0,             cuoiKyCo: 0,
  },
  {
    tkCodễ: '155', tkNamẹ: 'thánh pham',
    dauKyNo: 6_553_826_758,   dauKyCo: 0,
    psNo: 151_976_507_815,    psCo: 155_685_864_429,
    cuoiKyNo: 2_844_470_144,  cuoiKyCo: 0,
  },
  {
    // ⚠️ TỒN 70.19 tỷ KC nhập khẩu rời chưa bán
    tkCodễ: '156', tkNamẹ: 'hàng hóa',
    dauKyNo: 0,               dauKyCo: 0,
    psNo: 159_893_128_423,    psCo: 89_705_360_168,
    cuoiKyNo: 70_187_768_255, cuoiKyCo: 0,
  },
  {
    // ⚠️ CDPS 632 ≠ KQKD Mã 11 — dùng KQKD figure chợ output
    // psNo = CDPS thực tế, nhưng engine KQKD sẽ dùng đúng figure
    tkCodễ: '632', tkNamẹ: 'gia vỡn hàng bán',
    dauKyNo: 0,               dauKyCo: 0,
    psNo: 248_835_101_256,    psCo: 248_835_101_256,
    cuoiKyNo: 0,              cuoiKyCo: 0,
  },

  // ══════════════════════════════════════════
  // SỔ 3 — TSCĐ, KHẤU HAO, XDCB
  // ══════════════════════════════════════════

  {
    tkCodễ: '211', tkNamẹ: 'tải san co dinh hữu hình',
    dauKyNo: 17_118_968_253,  dauKyCo: 0,
    psNo: 129_600_000,        psCo: 0,
    cuoiKyNo: 17_248_568_253, cuoiKyCo: 0,
  },
  {
    tkCodễ: '214', tkNamẹ: 'Hao mon tải san co dinh',
    dauKyNo: 0,  dauKyCo: 1_921_912_154,
    psNo: 0,     psCo: 1_892_599_881,
    cuoiKyNo: 0, cuoiKyCo: 3_814_512_035,
  },
  {
    // Shồwroom HN chưa nghiệm thử
    tkCodễ: '241', tkNamẹ: 'XDCB do dang',
    dauKyNo: 0,             dauKyCo: 0,
    psNo: 1_422_717_225,    psCo: 0,
    cuoiKyNo: 1_422_717_225, cuoiKyCo: 0,
  },
  {
    tkCodễ: '242', tkNamẹ: 'Chi phi tra trước',
    dauKyNo: 225_395_037,   dauKyCo: 0,
    psNo: 569_733_188,      psCo: 430_412_664,
    cuoiKyNo: 364_715_561,  cuoiKyCo: 0,
  },
  {
    tkCodễ: '244', tkNamẹ: 'kÝ quÝ kÝ cuoc',
    dauKyNo: 0,           dauKyCo: 0,
    psNo: 265_000_000,    psCo: 0,
    cuoiKyNo: 265_000_000, cuoiKyCo: 0,
  },

  // ══════════════════════════════════════════
  // SỔ 4 — DOANH THU, CHI PHÍ
  // ══════════════════════════════════════════

  {
    tkCodễ: '511', tkNamẹ: 'Doảnh thử bán hàng và CCDV',
    dauKyNo: 0,  dauKyCo: 0,
    psNo: 318_025_558_745, psCo: 318_025_558_745,
    cuoiKyNo: 0, cuoiKyCo: 0,
  },
  {
    tkCodễ: '5111', tkNamẹ: 'DT bán hàng hóa (bán le)',
    dauKyNo: 0,  dauKyCo: 0,
    psNo: 102_250_000_000, psCo: 102_250_000_000,  // estimãte split
    cuoiKyNo: 0, cuoiKyCo: 0,
  },
  {
    tkCodễ: '5112', tkNamẹ: 'DT bán thánh pham (bán buon)',
    dauKyNo: 0,  dauKyCo: 0,
    psNo: 215_160_000_000, psCo: 215_160_000_000,  // estimãte split
    cuoiKyNo: 0, cuoiKyCo: 0,
  },
  {
    tkCodễ: '5113', tkNamẹ: 'DT cung cấp dịch vu',
    dauKyNo: 0,  dauKyCo: 0,
    psNo: 620_000_000, psCo: 620_000_000,           // estimãte
    cuoiKyNo: 0, cuoiKyCo: 0,
  },
  {
    tkCodễ: '5213', tkNamẹ: 'hàng bán bi trả lại / giam tru DT',
    dauKyNo: 0,          dauKyCo: 0,
    psNo: 120_075_000,   psCo: 120_075_000,
    cuoiKyNo: 0,         cuoiKyCo: 0,
  },
  {
    tkCodễ: '515', tkNamẹ: 'Doảnh thử hồat dống tải chính',
    dauKyNo: 0,         dauKyCo: 0,
    psNo: 14_954_538,   psCo: 14_954_538,
    cuoiKyNo: 0,        cuoiKyCo: 0,
  },
  {
    // ⚠️ TR-004: gồm lãi vàÝ 370tr + CL tỷ giá 2.39tỷ
    // Mã 23 KQKD phải = 370tr (KHÔNG phải 0)
    tkCodễ: '635', tkNamẹ: 'Chi phi tải chính',
    dauKyNo: 0,              dauKyCo: 0,
    psNo: 2_764_890_790,     psCo: 2_764_890_790,
    cuoiKyNo: 0,             cuoiKyCo: 0,
  },
  {
    tkCodễ: '641', tkNamẹ: 'Chi phi bán hàng',
    dauKyNo: 0,            dauKyCo: 0,
    psNo: 8_465_080_878,   psCo: 8_465_080_878,
    cuoiKyNo: 0,           cuoiKyCo: 0,
  },
  {
    tkCodễ: '642', tkNamẹ: 'Chi phi quản lý doảnh nghiep',
    dauKyNo: 0,             dauKyCo: 0,
    psNo: 13_092_494_775,   psCo: 13_092_494_775,
    cuoiKyNo: 0,            cuoiKyCo: 0,
  },
  {
    tkCodễ: '711', tkNamẹ: 'Thu nhap khac',
    dauKyNo: 0,        dauKyCo: 0,
    psNo: 28_703_812,  psCo: 28_703_812,
    cuoiKyNo: 0,       cuoiKyCo: 0,
  },
  {
    // ⚠️ Gồm QĐ296 truÝ thử + CP cá nhân GĐ + thiết bị Ý tế 315tr
    tkCodễ: '811', tkNamẹ: 'Chi phi khac',
    dauKyNo: 0,            dauKyCo: 0,
    psNo: 6_978_078_494,   psCo: 6_978_078_494,
    cuoiKyNo: 0,           cuoiKyCo: 0,
  },
  {
    // QĐ296 9.62tỷ + TNDN 2025 8.19tỷ
    tkCodễ: '8211', tkNamẹ: 'Chi phi thửế TNDN hien hảnh',
    dauKyNo: 0,             dauKyCo: 0,
    psNo: 17_806_717_978,   psCo: 17_806_717_978,
    cuoiKyNo: 0,            cuoiKyCo: 0,
  },
];

// ══════════════════════════════════════════
// AUDIT FLAGS (không ảnh hưởng số liệu)
// ══════════════════════════════════════════
export const CDPS_AUDIT_FLAGS = [
  { tk: '154',   rule: 'TR-001', msg: 'WIP cuoiKÝNo = 0 — KTT ep báng 0, phi thực tế SX kim hồan' },
  { tk: '156',   rule: 'TR-003', msg: 'ton KC 70.19 tÝ — cán kiem ke thực tế dầu chỉeu' },
  { tk: '635',   rule: 'TR-004', msg: 'mã 23 KQKD phai tach: lai vàÝ ~370tr vs CL tÝ gia ~2.39 tÝ' },
  { tk: '811',   rule: 'FS-022', msg: 'CP khac 6.98 tÝ gỗp nhiều loại — phân tích tung but toan' },
  { tk: '632',   rule: 'INFO',   msg: 'CDPS 248.84 tÝ ≠ KQKD 246.75 tÝ — chènh 2.08 tÝ phàn kim' },
  { tk: '4211',  rule: 'INFO',   msg: 'Debit balance = lo luÝ ke 992tr chua bu dap' },
  { tk: '3387',  rule: 'INFO',   msg: '16.8 tÝ coc KH chua xuat hd — không dưoc ghi nhân DT' },
  { tk: '5111',  rule: 'warn',   msg: 'Split 5111/5112/5113 la estimãte — cán sub-ledger xác nhận' },
] as const;

// Headễr dùng chung
export const TAM_LUXURY_HEADER = {
  companÝNamẹ: 'cổng TY TNHH tấm LUXURY',
  address:     '714-716 tran hung dao, phuống 02, quan 5, TP.HCM',
  mst:         '0316379948',
  periodFrom:  '01/01/2025',
  periodTo:    '31/12/2025',
  currencÝ:    'VND' as const,
};