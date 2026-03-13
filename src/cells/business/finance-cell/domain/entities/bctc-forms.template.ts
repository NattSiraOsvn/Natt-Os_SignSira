// @ts-nocheck — BCTC forms pending typed integration
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
  companyName: string;       // "CÔNG TY TNHH TÂM LUXURY"
  address: string;           // "714-716 Trần Hưng Đạo, Phường 02, Quận 5, TP.HCM"
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
  { label: "A. TÀI SẢN NGẮN HẠN", code: "100", formula: "100=110+120+130+140+150", level: 0 },
  { label: "I. Tiền và các khoản tương đương tiền", code: "110", level: 1 },
  { label: "1. Tiền", code: "111", thuyetMinh: "V.I", level: 2 },
  { label: "2. Các khoản tương đương tiền", code: "112", thuyetMinh: "V.I", level: 2 },
  { label: "II. Các khoản đầu tư tài chính ngắn hạn", code: "120", thuyetMinh: "V.02", level: 1 },
  { label: "1. Chứng khoán kinh doanh", code: "121", level: 2 },
  { label: "2. Dự phòng giảm giá CKKD (*)", code: "122", level: 2 },
  { label: "3. Đầu tư nắm giữ đến ngày đáo hạn", code: "123", level: 2 },
  { label: "III. Các khoản phải thu ngắn hạn", code: "130", level: 1 },
  { label: "1. Phải thu ngắn hạn của khách hàng", code: "131", level: 2 },
  { label: "2. Trả trước cho người bán ngắn hạn", code: "132", level: 2 },
  { label: "3. Phải thu nội bộ ngắn hạn", code: "133", level: 2 },
  { label: "4. Phải thu theo tiến độ KHHĐXD", code: "134", level: 2 },
  { label: "5. Phải thu về cho vay ngắn hạn", code: "135", level: 2 },
  { label: "6. Phải thu ngắn hạn khác", code: "136", level: 2 },
  { label: "7. Dự phòng phải thu ngắn hạn khó đòi (*)", code: "137", level: 2 },
  { label: "8. Tài sản thiếu chờ xử lý", code: "139", level: 2 },
  { label: "IV. Hàng tồn kho", code: "140", level: 1 },
  { label: "1. Hàng tồn kho", code: "141", thuyetMinh: "V.04", level: 2 },
  { label: "2. Dự phòng giảm giá HTK (*)", code: "149", level: 2 },
  { label: "V. Tài sản ngắn hạn khác", code: "150", level: 1 },
  { label: "1. Chi phí trả trước ngắn hạn", code: "151", level: 2 },
  { label: "2. Thuế GTGT được khấu trừ", code: "152", level: 2 },
  { label: "3. Thuế và các khoản phải thu nhà nước", code: "153", thuyetMinh: "V.05", level: 2 },
  { label: "4. Giao dịch mua bán lại trái phiếu CP", code: "154", level: 2 },
  { label: "5. Tài sản ngắn hạn khác", code: "155", level: 2 },

  { label: "B. TÀI SẢN DÀI HẠN", code: "200", formula: "200=210+220+230+240+250+260", level: 0 },
  { label: "I. Các khoản phải thu dài hạn", code: "210", level: 1 },
  { label: "1. Phải thu dài hạn của khách hàng", code: "211", level: 2 },
  { label: "2. Trả trước cho người bán dài hạn", code: "212", level: 2 },
  { label: "3. Vốn kinh doanh ở đơn vị trực thuộc", code: "213", level: 2 },
  { label: "4. Phải thu nội bộ dài hạn", code: "214", level: 2 },
  { label: "5. Phải thu về cho vay dài hạn", code: "215", level: 2 },
  { label: "6. Phải thu dài hạn khác", code: "216", level: 2 },
  { label: "7. Dự phòng phải thu dài hạn khó đòi (*)", code: "219", level: 2 },
  { label: "II. Tài sản cố định", code: "220", level: 1 },
  { label: "1. TSCĐ hữu hình", code: "221", level: 2 },
  { label: "- Nguyên giá", code: "222", level: 2 },
  { label: "- Giá trị hao mòn lũy kế (*)", code: "223", level: 2 },
  { label: "2. TSCĐ thuê tài chính", code: "224", level: 2 },
  { label: "- Nguyên giá", code: "225", level: 2 },
  { label: "- Giá trị hao mòn lũy kế (*)", code: "226", level: 2 },
  { label: "3. TSCĐ vô hình", code: "227", level: 2 },
  { label: "- Nguyên giá", code: "228", level: 2 },
  { label: "- Giá trị hao mòn lũy kế (*)", code: "229", level: 2 },
  { label: "III. Bất động sản đầu tư", code: "230", thuyetMinh: "V.12", level: 1 },
  { label: "- Nguyên giá", code: "231", level: 2 },
  { label: "- Giá trị hao mòn lũy kế (*)", code: "232", level: 2 },
  { label: "IV. Tài sản dở dang dài hạn", code: "240", level: 1 },
  { label: "1. Chi phí SXKD dở dang dài hạn", code: "241", level: 2 },
  { label: "2. Chi phí XDCB dở dang", code: "242", level: 2 },
  { label: "V. Các khoản đầu tư tài chính dài hạn", code: "250", level: 1 },
  { label: "1. Đầu tư vào công ty con", code: "251", level: 2 },
  { label: "2. Đầu tư vào công ty liên doanh/liên kết", code: "252", level: 2 },
  { label: "3. Đầu tư góp vốn vào đơn vị khác", code: "253", level: 2 },
  { label: "4. Dự phòng đầu tư tài chính dài hạn (*)", code: "254", level: 2 },
  { label: "5. Đầu tư nắm giữ đến ngày đáo hạn", code: "255", level: 2 },
  { label: "VI. Tài sản dài hạn khác", code: "260", level: 1 },
  { label: "1. Chi phí trả trước dài hạn", code: "261", level: 2 },
  { label: "2. Tài sản thuế thu nhập hoãn lại", code: "262", level: 2 },
  { label: "3. Thiết bị, VTLP, phụ tùng thay thế dài hạn", code: "263", level: 2 },
  { label: "4. Tài sản dài hạn khác", code: "268", level: 2 },
  { label: "TỔNG CỘNG TÀI SẢN (270=100+200)", code: "270", formula: "270=100+200", level: 0 },

  // === NGUỒN VỐN ===
  { label: "C. NỢ PHẢI TRẢ (300=310+330)", code: "300", formula: "300=310+330", level: 0 },
  { label: "I. Nợ ngắn hạn", code: "310", level: 1 },
  { label: "1. Phải trả người bán ngắn hạn", code: "311", level: 2 },
  { label: "2. Người mua trả tiền trước ngắn hạn", code: "312", level: 2 },
  { label: "3. Thuế và các khoản phải nộp NN", code: "313", level: 2 },
  { label: "4. Phải trả người lao động", code: "314", level: 2 },
  { label: "5. Chi phí phải trả ngắn hạn", code: "315", level: 2 },
  { label: "6. Phải trả nội bộ ngắn hạn", code: "316", level: 2 },
  { label: "7. Phải trả theo tiến độ KHHĐXD", code: "317", level: 2 },
  { label: "8. Doanh thu chưa thực hiện ngắn hạn", code: "318", level: 2 },
  { label: "9. Phải trả ngắn hạn khác", code: "319", level: 2 },
  { label: "10. Vay và nợ thuê tài chính ngắn hạn", code: "320", level: 2 },
  { label: "11. Dự phòng phải trả ngắn hạn", code: "321", level: 2 },
  { label: "12. Quỹ khen thưởng phúc lợi", code: "322", level: 2 },
  { label: "13. Quỹ bình ổn giá", code: "323", level: 2 },
  { label: "14. Giao dịch mua bán lại trái phiếu CP", code: "324", level: 2 },
  { label: "II. Nợ dài hạn", code: "330", level: 1 },
  { label: "1. Phải trả người bán dài hạn", code: "331", level: 2 },
  { label: "2. Người mua trả tiền trước dài hạn", code: "332", level: 2 },
  { label: "3. Chi phí phải trả dài hạn", code: "333", level: 2 },
  { label: "4. Phải trả nội bộ về vốn kinh doanh", code: "334", level: 2 },
  { label: "5. Phải trả nội bộ dài hạn", code: "335", level: 2 },
  { label: "6. Doanh thu chưa thực hiện dài hạn", code: "336", level: 2 },
  { label: "7. Phải trả dài hạn khác", code: "337", level: 2 },
  { label: "8. Vay và nợ thuê tài chính dài hạn", code: "338", level: 2 },
  { label: "9. Trái phiếu chuyển đổi", code: "339", level: 2 },
  { label: "10. Cổ phiếu ưu đãi", code: "340", level: 2 },
  { label: "11. Thuế thu nhập hoãn lại phải trả", code: "341", level: 2 },
  { label: "12. Dự phòng phải trả dài hạn", code: "342", level: 2 },
  { label: "13. Quỹ phát triển khoa học và công nghệ", code: "343", level: 2 },

  { label: "D. VỐN CHỦ SỞ HỮU (400=410+430)", code: "400", formula: "400=410+430", level: 0 },
  { label: "I. Vốn chủ sở hữu", code: "410", level: 1 },
  { label: "1. Vốn góp của chủ sở hữu", code: "411", level: 2 },
  { label: "- Cổ phiếu phổ thông có quyền biểu quyết", code: "411a", level: 2 },
  { label: "- Cổ phiếu ưu đãi", code: "411b", level: 2 },
  { label: "2. Thặng dư vốn cổ phần", code: "412", level: 2 },
  { label: "3. Quyền chọn chuyển đổi trái phiếu", code: "413", level: 2 },
  { label: "4. Vốn khác của chủ sở hữu", code: "414", level: 2 },
  { label: "5. Cổ phiếu quỹ (*)", code: "415", level: 2 },
  { label: "6. Chênh lệch đánh giá lại tài sản", code: "416", level: 2 },
  { label: "7. Chênh lệch tỷ giá hối đoái", code: "417", level: 2 },
  { label: "8. Quỹ đầu tư phát triển", code: "418", level: 2 },
  { label: "9. Quỹ hỗ trợ sắp xếp doanh nghiệp", code: "419", level: 2 },
  { label: "10. Quỹ khác thuộc vốn chủ sở hữu", code: "420", level: 2 },
  { label: "11. LNST chưa phân phối", code: "421", level: 2 },
  { label: "- LNST chưa phân phối lũy kế đến cuối kỳ trước", code: "421a", level: 2 },
  { label: "- LNST chưa phân phối kỳ này", code: "421b", level: 2 },
  { label: "12. Nguồn vốn đầu tư XDCB", code: "422", level: 2 },
  { label: "II. Nguồn kinh phí và quỹ khác", code: "430", level: 1 },
  { label: "1. Nguồn kinh phí", code: "431", level: 2 },
  { label: "2. Nguồn kinh phí đã hình thành TSCĐ", code: "432", level: 2 },
  { label: "TỔNG CỘNG NGUỒN VỐN (440=300+400)", code: "440", formula: "440=300+400", level: 0 },
];

// ═══════════ B02-DN: BÁO CÁO KẾT QUẢ KINH DOANH ═══════════

export const KQKD_TEMPLATE: Omit<BctcLine, "currentYear" | "priorYear">[] = [
  { label: "1. Doanh thu bán hàng và CCDV", code: "01", thuyetMinh: "VI.25", level: 1 },
  { label: "2. Các khoản giảm trừ doanh thu", code: "02", level: 1 },
  { label: "3. Doanh thu thuần (10=01-02)", code: "10", formula: "10=01-02", level: 0 },
  { label: "4. Giá vốn hàng bán", code: "11", thuyetMinh: "VI.27", level: 1 },
  { label: "5. Lợi nhuận gộp (20=10-11)", code: "20", formula: "20=10-11", level: 0 },
  { label: "6. Doanh thu hoạt động tài chính", code: "21", thuyetMinh: "VI.26", level: 1 },
  { label: "7. Chi phí hoạt động tài chính", code: "22", thuyetMinh: "VI.28", level: 1 },
  { label: "- Trong đó: Lãi vay", code: "23", level: 2 },
  { label: "8. Chi phí bán hàng", code: "25", level: 1 },
  { label: "9. Chi phí quản lý doanh nghiệp", code: "26", level: 1 },
  { label: "10. LNTT từ HĐKD (30=20+(21-22)-(25+26))", code: "30", formula: "30=20+(21-22)-(25+26)", level: 0 },
  { label: "11. Thu nhập khác", code: "31", level: 1 },
  { label: "12. Chi phí khác", code: "32", level: 1 },
  { label: "13. Lợi nhuận khác (40=31-32)", code: "40", formula: "40=31-32", level: 0 },
  { label: "14. Tổng LNKT trước thuế (50=30+40)", code: "50", formula: "50=30+40", level: 0 },
  { label: "15. Chi phí thuế TNDN hiện hành", code: "51", thuyetMinh: "VI.30", level: 1 },
  { label: "16. Chi phí thuế TNDN hoãn lại", code: "52", thuyetMinh: "VI.30", level: 1 },
  { label: "17. LNST thu nhập DN (60=50-51-52)", code: "60", formula: "60=50-51-52", level: 0 },
  { label: "18. Lãi cơ bản trên cổ phiếu", code: "70", level: 1 },
];

// ═══════════ B03-DN: LƯU CHUYỂN TIỀN TỆ (pp trực tiếp) ═══════════

export const LCTT_TEMPLATE: Omit<BctcLine, "currentYear" | "priorYear">[] = [
  { label: "I. LƯU CHUYỂN TIỀN TỪ HĐSXKD", code: "I", level: 0 },
  { label: "1. Tiền thu bán hàng, CCDV và DT khác", code: "01", level: 1 },
  { label: "2. Tiền chi trả cho người cung cấp HH&DV", code: "02", level: 1 },
  { label: "3. Tiền chi trả cho người lao động", code: "03", level: 1 },
  { label: "4. Tiền chi trả lãi vay", code: "04", level: 1 },
  { label: "5. Tiền chi nộp thuế TNDN", code: "05", level: 1 },
  { label: "6. Tiền thu khác từ HĐKD", code: "06", level: 1 },
  { label: "7. Tiền chi khác cho HĐKD", code: "07", level: 1 },
  { label: "Lưu chuyển tiền thuần từ HĐSXKD", code: "20", formula: "20=01+02+03+04+05+06+07", level: 0 },

  { label: "II. LƯU CHUYỂN TIỀN TỪ HĐĐT", code: "II", level: 0 },
  { label: "1. Tiền chi mua sắm, XD TSCĐ và TSDH khác", code: "21", level: 1 },
  { label: "2. Tiền thu thanh lý, nhượng bán TSCĐ", code: "22", level: 1 },
  { label: "3. Tiền chi cho vay, mua CCNC", code: "23", level: 1 },
  { label: "4. Tiền thu hồi cho vay, bán lại CCNC", code: "24", level: 1 },
  { label: "5. Tiền chi đầu tư góp vốn vào ĐV khác", code: "25", level: 1 },
  { label: "6. Tiền thu hồi đầu tư góp vốn vào ĐV khác", code: "26", level: 1 },
  { label: "7. Tiền thu lãi cho vay, cổ tức và LN được chia", code: "27", level: 1 },
  { label: "Lưu chuyển tiền thuần từ HĐĐT", code: "30", formula: "30=21+22+23+24+25+26+27", level: 0 },

  { label: "III. LƯU CHUYỂN TIỀN TỪ HĐTC", code: "III", level: 0 },
  { label: "1. Tiền thu từ phát hành CP, nhận vốn góp", code: "31", level: 1 },
  { label: "2. Tiền chi trả vốn góp cho CSH, mua lại CP", code: "32", level: 1 },
  { label: "3. Tiền vay NH, DH nhận được", code: "33", level: 1 },
  { label: "4. Tiền chi trả nợ gốc vay", code: "34", level: 1 },
  { label: "5. Tiền chi trả nợ thuê tài chính", code: "35", level: 1 },
  { label: "6. Cổ tức, LN đã trả cho CSH", code: "36", level: 1 },
  { label: "Lưu chuyển tiền thuần từ HĐTC", code: "40", formula: "40=31+32+33+34+35+36", level: 0 },

  { label: "Lưu chuyển tiền thuần trong kỳ (50=20+30+40)", code: "50", formula: "50=20+30+40", level: 0 },
  { label: "Tiền và tương đương tiền đầu kỳ", code: "60", level: 0 },
  { label: "Ảnh hưởng thay đổi tỷ giá", code: "61", level: 1 },
  { label: "Tiền và tương đương tiền cuối kỳ (70=50+60+61)", code: "70", thuyetMinh: "VII.34", formula: "70=50+60+61", level: 0 },
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
  { code: "111",  name: "Tiền mặt", nature: "N" },
  { code: "1111", name: "Tiền Việt Nam", nature: "N" },
  { code: "112",  name: "Tiền gửi ngân hàng", nature: "N" },
  { code: "131",  name: "Phải thu của khách hàng", nature: "N" },
  { code: "138",  name: "Phải thu khác", nature: "N" },
  { code: "1388", name: "Phải thu khác", nature: "N" },
  { code: "152",  name: "Nguyên liệu, vật liệu", nature: "N" },
  { code: "153",  name: "Công cụ, dụng cụ", nature: "N" },
  { code: "154",  name: "Chi phí SXKD dở dang", nature: "N" },
  { code: "155",  name: "Thành phẩm", nature: "N" },
  { code: "156",  name: "Hàng hóa", nature: "N" },
  { code: "211",  name: "TSCĐ hữu hình", nature: "N" },
  { code: "214",  name: "Hao mòn TSCĐ", nature: "C" },
  { code: "241",  name: "XDCB dở dang", nature: "N" },
  { code: "242",  name: "Chi phí trả trước", nature: "N" },
  { code: "244",  name: "Cầm cố, thế chấp, ký quỹ", nature: "N" },
  { code: "331",  name: "Phải trả cho người bán", nature: "C" },
  { code: "333",  name: "Thuế và các khoản phải nộp NN", nature: "C" },
  { code: "33311",name: "Thuế GTGT đầu ra", nature: "C" },
  { code: "33312",name: "Thuế GTGT hàng nhập khẩu", nature: "C" },
  { code: "3334", name: "Thuế thu nhập doanh nghiệp", nature: "C" },
  { code: "3335", name: "Thuế thu nhập cá nhân", nature: "C" },
  { code: "3339", name: "Phí, lệ phí và các khoản khác", nature: "C" },
  { code: "334",  name: "Phải trả người lao động", nature: "C" },
  { code: "335",  name: "Chi phí phải trả", nature: "C" },
  { code: "338",  name: "Phải trả, phải nộp khác", nature: "C" },
  { code: "3382", name: "Kinh phí công đoàn", nature: "C" },
  { code: "3383", name: "Bảo hiểm xã hội", nature: "C" },
  { code: "3387", name: "Doanh thu chưa thực hiện", nature: "C" },
  { code: "341",  name: "Vay và nợ thuê tài chính", nature: "C" },
  { code: "411",  name: "Vốn đầu tư của chủ sở hữu", nature: "C" },
  { code: "421",  name: "LNST chưa phân phối", nature: "NC" },
  { code: "4211", name: "LNST chưa PP năm trước", nature: "NC" },
  { code: "4212", name: "LNST chưa PP năm nay", nature: "NC" },
  { code: "511",  name: "Doanh thu bán hàng và CCDV", nature: "C" },
  { code: "5111", name: "DT bán hàng hóa", nature: "C" },
  { code: "5112", name: "DT bán thành phẩm", nature: "C" },
  { code: "5113", name: "DT cung cấp dịch vụ", nature: "C" },
  { code: "515",  name: "DT hoạt động tài chính", nature: "C" },
  { code: "521",  name: "Các khoản giảm trừ DT", nature: "N" },
  { code: "5213", name: "Hàng bán bị trả lại", nature: "N" },
  { code: "632",  name: "Giá vốn hàng bán", nature: "N" },
  { code: "635",  name: "Chi phí tài chính", nature: "N" },
  { code: "641",  name: "Chi phí bán hàng", nature: "N" },
  { code: "642",  name: "Chi phí QLDN", nature: "N" },
  { code: "711",  name: "Thu nhập khác", nature: "C" },
  { code: "811",  name: "Chi phí khác", nature: "N" },
  { code: "821",  name: "Chi phí thuế TNDN", nature: "N" },
  { code: "8211", name: "CP thuế TNDN hiện hành", nature: "N" },
  { code: "911",  name: "Xác định KQKD", nature: "NC" },
];

// ═══════════ KHẤU HAO TSCĐ ═══════════

export interface KhtscdLine {
  maTs: string;              // "TSCD0001"
  tenTs: string;             // "Máy đo kim cương THERMO"
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
