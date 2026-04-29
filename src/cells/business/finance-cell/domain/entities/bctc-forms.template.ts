// — BCTC forms pending typed integration
/**
 * bctc-forms.template.ts
 * 
 * Template BCTC theo TT200/2014/TT-BTC — extract từ BCTC thật Tâm Luxury 2025.
 * 4 báo cáo bắt buộc: CDKT (B01-DN), KQKD (B02-DN), LCTT (B03-DN), CDPS
 * + 3 bảng phụ: KHTSCD, CPCPB (TK242), TNDN
 * 
 * finance-cell + tax-cell + period-close-cell dùng templates này để generate output.
 */

// ═══════════ COMMON ═══════════

export interface BctcHeader {
  companyName: string;       // "cong TY TNHH tam LUXURY"
  address: string;           // "714-716 tran hung dao, phuong 02, quan 5, TP.HCM"
  mst: string;               // "0316379948"
  periodFrom: string;        // "01/01/2025"
  periodTo: string;          // "31/12/2025"
  currency: "VND" | "USD";
}

export interface BctcLine {
  label: string;             // tên chỉ tiêu
  code: string;              // mã số (01, 10, 100, ...)
  thuyetMinh?: string;       // V.I, V.04, VI.25...
  currentYear: number;
  priorYear: number;
  formula?: string;          // "100=110+120+130+140+150"
  level: 0 | 1 | 2;         // 0=heading, 1=group, 2=detail
}

// ═══════════ B01-DN: BẢNG CÂN ĐỐI KẾ TOÁN ═══════════

export const CDKT_TEMPLATE: Omit<BctcLine, "currentYear" | "priorYear">[] = [
  // === TÀI SẢN ===
  { label: "A. tai san ngen han", code: "100", formula: "100=110+120+130+140+150", level: 0 },
  { label: "I. tien va cac khoan tuong duong tien", code: "110", level: 1 },
  { label: "1. tien", code: "111", thuyetMinh: "V.I", level: 2 },
  { label: "2. cac khoan tuong duong tien", code: "112", thuyetMinh: "V.I", level: 2 },
  { label: "II. cac khoan dau tu tai chinh ngen han", code: "120", thuyetMinh: "V.02", level: 1 },
  { label: "1. chung khoan kinh doanh", code: "121", level: 2 },
  { label: "2. du phong giam gia CKKD (*)", code: "122", level: 2 },
  { label: "3. dau tu nam giu den ngay dao han", code: "123", level: 2 },
  { label: "III. cac khoan phai thu ngen han", code: "130", level: 1 },
  { label: "1. phai thu ngen han cua khach hang", code: "131", level: 2 },
  { label: "2. tra truoc cho ngui ban ngen han", code: "132", level: 2 },
  { label: "3. phai thu nau bo ngen han", code: "133", level: 2 },
  { label: "4. phai thu theo tien do khhdxd", code: "134", level: 2 },
  { label: "5. phai thu ve cho vay ngen han", code: "135", level: 2 },
  { label: "6. phai thu ngen han khac", code: "136", level: 2 },
  { label: "7. du phong phai thu ngen han kho đau (*)", code: "137", level: 2 },
  { label: "8. tai san thieu cho xu ly", code: "139", level: 2 },
  { label: "IV. hang ton kho", code: "140", level: 1 },
  { label: "1. hang ton kho", code: "141", thuyetMinh: "V.04", level: 2 },
  { label: "2. du phong giam gia HTK (*)", code: "149", level: 2 },
  { label: "V. tai san ngen han khac", code: "150", level: 1 },
  { label: "1. Chi phi tra truoc ngen han", code: "151", level: 2 },
  { label: "2. thue GTGT duoc khau tru", code: "152", level: 2 },
  { label: "3. thue va cac khoan phai thu nha nuoc", code: "153", thuyetMinh: "V.05", level: 2 },
  { label: "4. Giao dich mua ban lai trai phieu CP", code: "154", level: 2 },
  { label: "5. tai san ngen han khac", code: "155", level: 2 },

  { label: "B. tai san dai han", code: "200", formula: "200=210+220+230+240+250+260", level: 0 },
  { label: "I. cac khoan phai thu dai han", code: "210", level: 1 },
  { label: "1. phai thu dai han cua khach hang", code: "211", level: 2 },
  { label: "2. tra truoc cho ngui ban dai han", code: "212", level: 2 },
  { label: "3. von kinh doanh o don vi truc thuoc", code: "213", level: 2 },
  { label: "4. phai thu nau bo dai han", code: "214", level: 2 },
  { label: "5. phai thu ve cho vay dai han", code: "215", level: 2 },
  { label: "6. phai thu dai han khac", code: "216", level: 2 },
  { label: "7. du phong phai thu dai han kho đau (*)", code: "219", level: 2 },
  { label: "II. tai san co dinh", code: "220", level: 1 },
  { label: "1. tscd huu hinh", code: "221", level: 2 },
  { label: "- nguyen gia", code: "222", level: 2 },
  { label: "- gia tri hao mon luy ke (*)", code: "223", level: 2 },
  { label: "2. tscd thue tai chinh", code: "224", level: 2 },
  { label: "- nguyen gia", code: "225", level: 2 },
  { label: "- gia tri hao mon luy ke (*)", code: "226", level: 2 },
  { label: "3. tscd vo hinh", code: "227", level: 2 },
  { label: "- nguyen gia", code: "228", level: 2 },
  { label: "- gia tri hao mon luy ke (*)", code: "229", level: 2 },
  { label: "III. bat dong san dau tu", code: "230", thuyetMinh: "V.12", level: 1 },
  { label: "- nguyen gia", code: "231", level: 2 },
  { label: "- gia tri hao mon luy ke (*)", code: "232", level: 2 },
  { label: "IV. tai san do dang dai han", code: "240", level: 1 },
  { label: "1. Chi phi SXKD do dang dai han", code: "241", level: 2 },
  { label: "2. Chi phi XDCB do dang", code: "242", level: 2 },
  { label: "V. cac khoan dau tu tai chinh dai han", code: "250", level: 1 },
  { label: "1. dau tu vao cong ty con", code: "251", level: 2 },
  { label: "2. dau tu vao cong ty lien doanh/lien ket", code: "252", level: 2 },
  { label: "3. dau tu gop von vao don vi khac", code: "253", level: 2 },
  { label: "4. du phong dau tu tai chinh dai han (*)", code: "254", level: 2 },
  { label: "5. dau tu nam giu den ngay dao han", code: "255", level: 2 },
  { label: "VI. tai san dai han khac", code: "260", level: 1 },
  { label: "1. Chi phi tra truoc dai han", code: "261", level: 2 },
  { label: "2. tai san thue thu nhap hoan lai", code: "262", level: 2 },
  { label: "3. thiet bi, VTLP, phu tung thay the dai han", code: "263", level: 2 },
  { label: "4. tai san dai han khac", code: "268", level: 2 },
  { label: "tong cong tai san (270=100+200)", code: "270", formula: "270=100+200", level: 0 },

  // === NGUỒN VỐN ===
  { label: "C. no phai tra (300=310+330)", code: "300", formula: "300=310+330", level: 0 },
  { label: "I. no ngen han", code: "310", level: 1 },
  { label: "1. phai tra ngui ban ngen han", code: "311", level: 2 },
  { label: "2. ngui mua tra tien truoc ngen han", code: "312", level: 2 },
  { label: "3. thue va cac khoan phai nop NN", code: "313", level: 2 },
  { label: "4. phai tra ngui lao dong", code: "314", level: 2 },
  { label: "5. Chi phi phai tra ngen han", code: "315", level: 2 },
  { label: "6. phai tra nau bo ngen han", code: "316", level: 2 },
  { label: "7. phai tra theo tien do khhdxd", code: "317", level: 2 },
  { label: "8. Doanh thu chua thuc hien ngen han", code: "318", level: 2 },
  { label: "9. phai tra ngen han khac", code: "319", level: 2 },
  { label: "10. Vay va no thue tai chinh ngen han", code: "320", level: 2 },
  { label: "11. du phong phai tra ngen han", code: "321", level: 2 },
  { label: "12. quy khen thuong phuc loi", code: "322", level: 2 },
  { label: "13. quy binh on gia", code: "323", level: 2 },
  { label: "14. Giao dich mua ban lai trai phieu CP", code: "324", level: 2 },
  { label: "II. no dai han", code: "330", level: 1 },
  { label: "1. phai tra ngui ban dai han", code: "331", level: 2 },
  { label: "2. ngui mua tra tien truoc dai han", code: "332", level: 2 },
  { label: "3. Chi phi phai tra dai han", code: "333", level: 2 },
  { label: "4. phai tra nau bo ve von kinh doanh", code: "334", level: 2 },
  { label: "5. phai tra nau bo dai han", code: "335", level: 2 },
  { label: "6. Doanh thu chua thuc hien dai han", code: "336", level: 2 },
  { label: "7. phai tra dai han khac", code: "337", level: 2 },
  { label: "8. Vay va no thue tai chinh dai han", code: "338", level: 2 },
  { label: "9. trai phieu chuyen đau", code: "339", level: 2 },
  { label: "10. co phieu uu dai", code: "340", level: 2 },
  { label: "11. thue thu nhap hoan lai phai tra", code: "341", level: 2 },
  { label: "12. du phong phai tra dai han", code: "342", level: 2 },
  { label: "13. quy phat trien khoa hoc va cong nghe", code: "343", level: 2 },

  { label: "D. von chu so huu (400=410+430)", code: "400", formula: "400=410+430", level: 0 },
  { label: "I. von chu so huu", code: "410", level: 1 },
  { label: "1. von gop cua chu so huu", code: "411", level: 2 },
  { label: "- co phieu pho thong co quyen bieu quyet", code: "411a", level: 2 },
  { label: "- co phieu uu dai", code: "411b", level: 2 },
  { label: "2. thang du von co phan", code: "412", level: 2 },
  { label: "3. quyen chon chuyen đau trai phieu", code: "413", level: 2 },
  { label: "4. von khac cua chu so huu", code: "414", level: 2 },
  { label: "5. co phieu quy (*)", code: "415", level: 2 },
  { label: "6. chenh lech danh gia lai tai san", code: "416", level: 2 },
  { label: "7. chenh lech ty gia hau doai", code: "417", level: 2 },
  { label: "8. quy dau tu phat trien", code: "418", level: 2 },
  { label: "9. quy ho tro sap xep doanh nghiep", code: "419", level: 2 },
  { label: "10. quy khac thuoc von chu so huu", code: "420", level: 2 },
  { label: "11. LNST chua phan phau", code: "421", level: 2 },
  { label: "- LNST chua phan phau luy ke den cuoi ky truoc", code: "421a", level: 2 },
  { label: "- LNST chua phan phau ky nay", code: "421b", level: 2 },
  { label: "12. nguon von dau tu XDCB", code: "422", level: 2 },
  { label: "II. nguon kinh phi va quy khac", code: "430", level: 1 },
  { label: "1. nguon kinh phi", code: "431", level: 2 },
  { label: "2. nguon kinh phi da hinh thanh tscd", code: "432", level: 2 },
  { label: "tong cong nguon von (440=300+400)", code: "440", formula: "440=300+400", level: 0 },
];

// ═══════════ B02-DN: BÁO CÁO KẾT QUẢ KINH DOANH ═══════════

export const KQKD_TEMPLATE: Omit<BctcLine, "currentYear" | "priorYear">[] = [
  { label: "1. Doanh thu ban hang va CCDV", code: "01", thuyetMinh: "VI.25", level: 1 },
  { label: "2. cac khoan giam tru doanh thu", code: "02", level: 1 },
  { label: "3. Doanh thu thuan (10=01-02)", code: "10", formula: "10=01-02", level: 0 },
  { label: "4. gia von hang ban", code: "11", thuyetMinh: "VI.27", level: 1 },
  { label: "5. loi nhuan gop (20=10-11)", code: "20", formula: "20=10-11", level: 0 },
  { label: "6. Doanh thu hoat dong tai chinh", code: "21", thuyetMinh: "VI.26", level: 1 },
  { label: "7. Chi phi hoat dong tai chinh", code: "22", thuyetMinh: "VI.28", level: 1 },
  { label: "- Trong do: lai vay", code: "23", level: 2 },
  { label: "8. Chi phi ban hang", code: "25", level: 1 },
  { label: "9. Chi phi quan ly doanh nghiep", code: "26", level: 1 },
  { label: "10. LNTT tu hdkd (30=20+(21-22)-(25+26))", code: "30", formula: "30=20+(21-22)-(25+26)", level: 0 },
  { label: "11. Thu nhap khac", code: "31", level: 1 },
  { label: "12. Chi phi khac", code: "32", level: 1 },
  { label: "13. loi nhuan khac (40=31-32)", code: "40", formula: "40=31-32", level: 0 },
  { label: "14. tong LNKT truoc thue (50=30+40)", code: "50", formula: "50=30+40", level: 0 },
  { label: "15. Chi phi thue TNDN hien hanh", code: "51", thuyetMinh: "VI.30", level: 1 },
  { label: "16. Chi phi thue TNDN hoan lai", code: "52", thuyetMinh: "VI.30", level: 1 },
  { label: "17. LNST thu nhap DN (60=50-51-52)", code: "60", formula: "60=50-51-52", level: 0 },
  { label: "18. lai co ban tren co phieu", code: "70", level: 1 },
];

// ═══════════ B03-DN: LƯU CHUYỂN TIỀN TỆ (pp trực tiếp) ═══════════

export const LCTT_TEMPLATE: Omit<BctcLine, "currentYear" | "priorYear">[] = [
  { label: "I. luu chuyen tien tu hdsxkd", code: "I", level: 0 },
  { label: "1. tien thu ban hang, CCDV va DT khac", code: "01", level: 1 },
  { label: "2. tien chi tra cho ngui cung cap HH&DV", code: "02", level: 1 },
  { label: "3. tien chi tra cho ngui lao dong", code: "03", level: 1 },
  { label: "4. tien chi tra lai vay", code: "04", level: 1 },
  { label: "5. tien chi nop thue TNDN", code: "05", level: 1 },
  { label: "6. tien thu khac tu hdkd", code: "06", level: 1 },
  { label: "7. tien chi khac cho hdkd", code: "07", level: 1 },
  { label: "luu chuyen tien thuan tu hdsxkd", code: "20", formula: "20=01+02+03+04+05+06+07", level: 0 },

  { label: "II. luu chuyen tien tu hddt", code: "II", level: 0 },
  { label: "1. tien chi mua sam, XD tscd va TSDH khac", code: "21", level: 1 },
  { label: "2. tien thu thanh ly, nhuong ban tscd", code: "22", level: 1 },
  { label: "3. tien chi cho vay, mua CCNC", code: "23", level: 1 },
  { label: "4. tien thu hau cho vay, ban lai CCNC", code: "24", level: 1 },
  { label: "5. tien chi dau tu gop von vao dv khac", code: "25", level: 1 },
  { label: "6. tien thu hau dau tu gop von vao dv khac", code: "26", level: 1 },
  { label: "7. tien thu lai cho vay, co tuc va LN duoc chia", code: "27", level: 1 },
  { label: "luu chuyen tien thuan tu hddt", code: "30", formula: "30=21+22+23+24+25+26+27", level: 0 },

  { label: "III. luu chuyen tien tu hdtc", code: "III", level: 0 },
  { label: "1. tien thu tu phat hanh CP, nhan von gop", code: "31", level: 1 },
  { label: "2. tien chi tra von gop cho CSH, mua lai CP", code: "32", level: 1 },
  { label: "3. tien vay NH, DH nhan duoc", code: "33", level: 1 },
  { label: "4. tien chi tra no goc vay", code: "34", level: 1 },
  { label: "5. tien chi tra no thue tai chinh", code: "35", level: 1 },
  { label: "6. co tuc, LN da tra cho CSH", code: "36", level: 1 },
  { label: "luu chuyen tien thuan tu hdtc", code: "40", formula: "40=31+32+33+34+35+36", level: 0 },

  { label: "luu chuyen tien thuan trong ky (50=20+30+40)", code: "50", formula: "50=20+30+40", level: 0 },
  { label: "tien va tuong duong tien dau ky", code: "60", level: 0 },
  { label: "anh huong thay đau ty gia", code: "61", level: 1 },
  { label: "tien va tuong duong tien cuoi ky (70=50+60+61)", code: "70", thuyetMinh: "VII.34", formula: "70=50+60+61", level: 0 },
];

// ═══════════ CDPS: CÂN ĐỐI PHÁT SINH TÀI KHOẢN ═══════════

export interface CdpsLine {
  tkCode: string;            // "111", "1111", "112", "11211"...
  tkName: string;
  dauKyNo: number;
  dauKyCo: number;
  psNo: number;
  psCo: number;
  cuoiKyNo: number;
  cuoiKyCo: number;
}

/** Danh mục TK theo TT200 — dùng cho CDPS + Sổ cái */
export const CHART_OF_ACCOUNTS: Array<{ code: string; name: string; nature: "N" | "C" | "NC" }> = [
  { code: "111",  name: "tien mat", nature: "N" },
  { code: "1111", name: "tien viet Nam", nature: "N" },
  { code: "112",  name: "tien gui ngan hang", nature: "N" },
  { code: "131",  name: "phai thu cua khach hang", nature: "N" },
  { code: "138",  name: "phai thu khac", nature: "N" },
  { code: "1388", name: "phai thu khac", nature: "N" },
  { code: "152",  name: "nguyen lieu, vat lieu", nature: "N" },
  { code: "153",  name: "cong cu, dung cu", nature: "N" },
  { code: "154",  name: "Chi phi SXKD do dang", nature: "N" },
  { code: "155",  name: "thanh pham", nature: "N" },
  { code: "156",  name: "hang hoa", nature: "N" },
  { code: "211",  name: "tscd huu hinh", nature: "N" },
  { code: "214",  name: "Hao mon tscd", nature: "C" },
  { code: "241",  name: "XDCB do dang", nature: "N" },
  { code: "242",  name: "Chi phi tra truoc", nature: "N" },
  { code: "244",  name: "cam co, the chap, ky quy", nature: "N" },
  { code: "331",  name: "phai tra cho ngui ban", nature: "C" },
  { code: "333",  name: "thue va cac khoan phai nop NN", nature: "C" },
  { code: "33311",name: "thue GTGT dau ra", nature: "C" },
  { code: "33312",name: "thue GTGT hang nhap khau", nature: "C" },
  { code: "3334", name: "thue thu nhap doanh nghiep", nature: "C" },
  { code: "3335", name: "thue thu nhap ca nhan", nature: "C" },
  { code: "3339", name: "phi, le phi va cac khoan khac", nature: "C" },
  { code: "334",  name: "phai tra ngui lao dong", nature: "C" },
  { code: "335",  name: "Chi phi phai tra", nature: "C" },
  { code: "338",  name: "phai tra, phai nop khac", nature: "C" },
  { code: "3382", name: "Kinh phi cong doan", nature: "C" },
  { code: "3383", name: "bao hiem xa hau", nature: "C" },
  { code: "3387", name: "Doanh thu chua thuc hien", nature: "C" },
  { code: "341",  name: "Vay va no thue tai chinh", nature: "C" },
  { code: "411",  name: "von dau tu cua chu so huu", nature: "C" },
  { code: "421",  name: "LNST chua phan phau", nature: "NC" },
  { code: "4211", name: "LNST chua PP nam truoc", nature: "NC" },
  { code: "4212", name: "LNST chua PP nam nay", nature: "NC" },
  { code: "511",  name: "Doanh thu ban hang va CCDV", nature: "C" },
  { code: "5111", name: "DT ban hang hoa", nature: "C" },
  { code: "5112", name: "DT ban thanh pham", nature: "C" },
  { code: "5113", name: "DT cung cap dich vu", nature: "C" },
  { code: "515",  name: "DT hoat dong tai chinh", nature: "C" },
  { code: "521",  name: "cac khoan giam tru DT", nature: "N" },
  { code: "5213", name: "hang ban bi tra lai", nature: "N" },
  { code: "632",  name: "gia von hang ban", nature: "N" },
  { code: "635",  name: "Chi phi tai chinh", nature: "N" },
  { code: "641",  name: "Chi phi ban hang", nature: "N" },
  { code: "642",  name: "Chi phi QLDN", nature: "N" },
  { code: "711",  name: "Thu nhap khac", nature: "C" },
  { code: "811",  name: "Chi phi khac", nature: "N" },
  { code: "821",  name: "Chi phi thue TNDN", nature: "N" },
  { code: "8211", name: "CP thue TNDN hien hanh", nature: "N" },
  { code: "911",  name: "xac dinh KQKD", nature: "NC" },
];

// ═══════════ KHẤU HAO TSCĐ ═══════════

export interface KhtscdLine {
  maTs: string;              // "TSCD0001"
  tenTs: string;             // "may do kim cuong THERMO"
  doiTuongSd: string;        // "PSX", "CT", "VP", "BH"
  tkTs: string;              // "21112", "21113"
  tkCp: string;              // "154", "6414", "6424"
  tkHm: string;              // "2141"
  nguyenGiaDauNam: number;
  nguyenGiaCuoiNam: number;
  ngayMua: string;           // ISO date
  thoiGianKh: number;        // tháng (60, 72, 84, 120...)
  khCaNam: number;
  luyKeKh: number;
  giaTriConLaiDauNam: number;
  giaTriConLaiCuoiNam: number;
}

// ═══════════ CHI PHÍ CHỜ PHÂN BỔ (TK242) ═══════════

export interface CpcpbLine {
  maTs: string;
  tenTs: string;
  doiTuongSd: string;
  tkCp: string;              // "154", "6413", "6421", "6422", "6423"
  nguyenGiaDauNam: number;
  nguyenGiaCuoiNam: number;
  ngayMua: string;
  thoiGianPb: number;        // tháng
  pbCaNam: number;
  luyKePb: number;
  giaTriConLaiDauNam: number;
  giaTriConLaiCuoiNam: number;
}

// ═══════════ THUẾ TNDN ═══════════

export interface TndnCalculation {
  doanhThuBanHang: number;           // Mã 01
  gianTruDoanhThu: number;           // Mã 02
  doanhThuThuan: number;             // Mã 10
  giaVon: number;                    // Mã 11
  loiNhuanGop: number;               // Mã 20
  dtTaiChinh: number;                // Mã 21
  cpTaiChinh: number;                // Mã 22
  cpBanHang: number;                 // Mã 25
  cpQuanLy: number;                  // Mã 26
  lnThuanHdkd: number;              // Mã 30
  thuNhapKhac: number;               // Mã 31
  chiPhiKhac: number;                // Mã 32
  lnKhac: number;                    // Mã 40
  tongLnTruocThue: number;           // Mã 50
  chiPhiLoaiTru: number;             // CP không được trừ (TK811)
  thuNhapTinhThue: number;           // Mã 50 + CP loại trừ
  thueSuat: number;                  // 20%
  thueTndnPhatSinh: number;          // thuNhapTinhThue × thueSuat
  thueTruyThu?: number;              // QĐ truy thu (nếu có)
  tongThueTndn: number;              // phatSinh + truyThu
}

// ═══════════ LCTT TK-NỢ/TK-CÓ MAPPING ═══════════

/** Bảng đối ứng TK cho LCTT (từ sheet TknoTkco) */
export interface LcttTkMapping {
  key: string;               // "1111.131"
  tkNo: string;              // "1111"
  tkCo: string;              // "131"
  amount: number;
  period: "current" | "prior" | "cumulative";
}
