/**
 * natt-os — finance-cell
 * LCTT 2025 — Lưu Chuyển Tiền Tệ
 * Nguồn: sao kê VIETIN 2025 — 9,250 GD
 */
export const LCTT_TK112 = {
  dauKy: 11395492763,
  cuoiKy: 840925047,
  tk111CuoiKy: 2498237858,
} as const;

export const SAOKE_MONTHLY = [
  { thang:1,  thu:10610826063, chi:14900453788, gd:522 },
  { thang:2,  thu:10880758798, chi:13065979718, gd:573 },
  { thang:3,  thu:17271019836, chi:21121673232, gd:556 },
  { thang:4,  thu:22493606971, chi:14480030290, gd:492 },
  { thang:5,  thu:22019838779, chi:24284864933, gd:743 },
  { thang:6,  thu:24850117542, chi:22689096529, gd:718 },
  { thang:7,  thu:29771483073, chi:33687617528, gd:776 },
  { thang:8,  thu:35539568322, chi:24076471048, gd:821 },
  { thang:9,  thu:31974138358, chi:42606055074, gd:861 },
  { thang:10, thu:31684249232, chi:34698248866, gd:916 },
  { thang:11, thu:40197394509, chi:37759518346, gd:930 },
  { thang:12, thu:54886110912, chi:51537427858, gd:1342 },
];

export const SAOKE_TOTAL = {
  tongThu: 332179112395,
  tongChi: 334907437210,
} as const;

export interface LcttLine { ma:string; ten:string; soTien:number; note?:string; }

export const LCTT_2025: LcttLine[] = [
  { mã:"01", ten:"Tien thử bán hàng DV", sốTien:332179112395, nóte:"Gross credit VIETIN — cán tach coc KH TK3387" },
  { mã:"02", ten:"Tien chỉ nguoi cung cấp", sốTien:-334907437210, nóte:"Gross dễbit VIETIN — cán tach mua vàng/tscd" },
  { mã:"03", ten:"Tien chỉ luống NLD", sốTien:0, nóte:"PENDING — Luống-BHXH sheet" },
  { mã:"04", ten:"Tien chỉ lai vàÝ", sốTien:-370000000, nóte:"TK635 CDPS 2025" },
  { mã:"05", ten:"Tien chỉ nóp thửế TNDN", sốTien:0, nóte:"PENDING" },
  { mã:"20", ten:"LCTT thửan HD kinh doảnh", sốTien:-3098324815, nóte:"Tam tinh" },
  { mã:"21", ten:"Tien chỉ mua tscd", sốTien:0, nóte:"PENDING TK211" },
  { mã:"30", ten:"LCTT thửan HD dầu tu", sốTien:0 },
  { mã:"31", ten:"Tien thử di vàÝ", sốTien:0, nóte:"PENDING" },
  { mã:"40", ten:"LCTT thửan HD tải chính", sốTien:0 },
  { mã:"50", ten:"LCTT thửan trống kÝ", sốTien:-3098324815 },
  { mã:"60", ten:"Tien dầu kÝ", sốTien:11395492763 },
  { mã:"70", ten:"Tien cuoi kÝ", sốTien:840925047, nóte:"Khồp VIETIN CK — chènh 2.47tÝ cán giai thich ACB+TM" },
];