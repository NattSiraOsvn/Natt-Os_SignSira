/**
 * NATT-OS — finance-cell
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
  { ma:"01", ten:"Tien thu ban hang DV", soTien:332179112395, note:"Gross credit VIETIN — can tach coc KH TK3387" },
  { ma:"02", ten:"Tien chi nguoi cung cap", soTien:-334907437210, note:"Gross debit VIETIN — can tach mua vang/TSCĐ" },
  { ma:"03", ten:"Tien chi luong NLD", soTien:0, note:"PENDING — Luong-BHXH sheet" },
  { ma:"04", ten:"Tien chi lai vay", soTien:-370000000, note:"TK635 CDPS 2025" },
  { ma:"05", ten:"Tien chi nop thue TNDN", soTien:0, note:"PENDING" },
  { ma:"20", ten:"LCTT thuan HD kinh doanh", soTien:-3098324815, note:"Tam tinh" },
  { ma:"21", ten:"Tien chi mua TSCĐ", soTien:0, note:"PENDING TK211" },
  { ma:"30", ten:"LCTT thuan HD dau tu", soTien:0 },
  { ma:"31", ten:"Tien thu di vay", soTien:0, note:"PENDING" },
  { ma:"40", ten:"LCTT thuan HD tai chinh", soTien:0 },
  { ma:"50", ten:"LCTT thuan trong ky", soTien:-3098324815 },
  { ma:"60", ten:"Tien dau ky", soTien:11395492763 },
  { ma:"70", ten:"Tien cuoi ky", soTien:840925047, note:"Khop VIETIN CK — chenh 2.47ty can giai thich ACB+TM" },
];
