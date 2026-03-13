// @ts-nocheck
/**
 * SUPER DICTIONARY — Tầng A Ground Truth
 * Từ điển toàn hệ thống: thuật ngữ kỹ thuật + nghiệp vụ + pháp lý
 * Điều 3: GT = DB + Audit + Event + Dictionary
 */

export const SUPER_DICTIONARY: Record<string, string> = {
  // ── NATT-OS Core ──────────────────────────────────────────────
  "NATT-OS":          "Distributed Living Organism Architecture — kiến trúc sinh vật phân tán",
  "NATT-CELL":        "Tế bào sống trong NATT-OS với 6 thành phần bắt buộc",
  "GATEKEEPER":       "Tế bào chủ quyền — quyết định cuối cùng trong hệ thống",
  "QNEU":             "Quantum Neural Evolution Unit — đơn vị đo tiến hóa AI Entity",
  "SMARTLINK":        "Sợi dẫn truyền thần kinh tồn tại thường trực, nhạy dần theo vết hằn",
  "GROUND_TRUTH":     "src/types.ts + constants.ts + SuperDictionary.ts — nguồn sự thật duy nhất",
  "WAVE":             "Thứ tự sinh của tế bào: Wave1=Kernel, Wave2=Infra, Wave3=Business",
  "IMMUNE_SYSTEM":    "Hệ kỷ luật của NATT-OS — phát hiện và loại bỏ tế bào bệnh",
  "VIET_HANG":        "Vết hằn — frequency imprint tạo permanent node trong QNEU",

  // ── Business Domain ───────────────────────────────────────────
  "TAM_LUXURY":       "Tâm Luxury — công ty sản xuất trang sức vàng cao cấp Việt Nam",
  "TAXCELL":          "Module thuế tích hợp: PIT/VAT/CIT theo chuẩn TT200",
  "TT200":            "Thông tư 200 — chuẩn kế toán doanh nghiệp Việt Nam",
  "EINVOICE":         "Hóa đơn điện tử — Nghị định 123/2020/NĐ-CP",
  "PIT":              "Personal Income Tax — Thuế thu nhập cá nhân",
  "VAT":              "Value Added Tax — Thuế giá trị gia tăng (10% VN)",
  "CIT":              "Corporate Income Tax — Thuế thu nhập doanh nghiệp (20% VN)",
  "HS_CODE":          "Harmonized System Code — mã hàng hóa xuất nhập khẩu",
  "VANG_9999":        "Vàng nguyên chất 99.99% — tiêu chuẩn trang sức cao cấp",
  "GIA_VANG":         "Giá vàng — tính theo chỉ (3.75g), cập nhật real-time",
  "CHI_VANG":         "Đơn vị đo vàng Việt Nam — 1 chỉ = 3.75 gram",
  "PHAT_SINH":        "Phát sinh — transaction/entry trong sổ kế toán",
  "SO_SACH":          "Sổ sách kế toán — books of accounts",
  "PHIEU_THU":        "Phiếu thu — receipt voucher",
  "PHIEU_CHI":        "Phiếu chi — payment voucher",
  "PHIEU_NHAP":       "Phiếu nhập kho — warehouse receipt",
  "PHIEU_XUAT":       "Phiếu xuất kho — warehouse issue",
  "HOA_DON":          "Hóa đơn — invoice",
  "BIEN_LAI":         "Biên lai — receipt",
  "KE_TOAN":          "Kế toán — accounting",
  "KIEM_TOAN":        "Kiểm toán — audit",
  "QUYET_TOAN":       "Quyết toán — final settlement/year-end closing",
  "TAM_UNG":          "Tạm ứng — advance payment",
  "CONG_NO":          "Công nợ — debt/receivables/payables",
  "TON_KHO":          "Tồn kho — inventory on hand",
  "GIA_VON":          "Giá vốn — cost of goods sold (COGS)",
  "LOI_NHUAN":        "Lợi nhuận — profit/margin",
  "DOANH_THU":        "Doanh thu — revenue",
  "CHI_PHI":          "Chi phí — expense/cost",
  "NGAN_SACH":        "Ngân sách — budget",
  "THANH_TOAN":       "Thanh toán — payment",
  "CHUYEN_KHOAN":     "Chuyển khoản — bank transfer",
  "TIEN_MAT":         "Tiền mặt — cash",

  // ── Production ────────────────────────────────────────────────
  "CASTING":          "Đúc khuôn — jewelry casting process",
  "COLD_WORK":        "Nguội — cold-working metal process",
  "STONE_SETTING":    "Chầu đá / cẩn đá — gemstone setting",
  "FINISHING":        "Hoàn thiện — surface finishing/polishing",
  "QC":               "Quality Control — kiểm soát chất lượng",
  "CAD":              "Computer-Aided Design — thiết kế máy tính",
  "CAM":              "Computer-Aided Manufacturing — gia công máy tính",
  "SKU":              "Stock Keeping Unit — mã quản lý hàng tồn kho",
  "LOT":              "Lô hàng — production batch",

  // ── HR / Personnel ────────────────────────────────────────────
  "LUONG":            "Lương — salary/wage",
  "THUONG":           "Thưởng — bonus",
  "KPI":              "Key Performance Indicator — chỉ số hiệu suất",
  "HOA_HONG":         "Hoa hồng — commission",
  "NV_CHINH_THUC":    "Nhân viên chính thức — full-time employee",
  "CONG_TAC_VIEN":    "Cộng tác viên — collaborator/freelancer",
  "NGAY_CONG":        "Ngày công — workday",
  "BẢNG_LUONG":       "Bảng lương — payroll sheet",

  // ── Governance ────────────────────────────────────────────────
  "DIEU":             "Điều — Article (of Constitution)",
  "TANG_A":           "Tầng A — Ground Truth layer",
  "TANG_B":           "Tầng B — Kernel layer",
  "VI_PHAM":          "Vi phạm — violation",
  "CLEANUP":          "Dọn dẹp — constitutional cleanup process",
  "COMMIT":           "Commit — git commit với message chuẩn",
  "FREEZE":           "Freeze — đóng băng baseline trước khi fix",

  // ── SmartLink ─────────────────────────────────────────────────
  "SIGNAL":           "Tín hiệu — event signal trong SmartLink",
  "IMPULSE":          "Xung — SmartLink impulse (signal + context + state + data)",
  "AMPLITUDE":        "Biên độ — signal amplitude trong SmartLink",
  "LATENCY":          "Độ trễ — signal latency",
  "NODE":             "Nút — permanent node sau frequency imprint",
  "SYNAPSE":          "Synapse — kết nối giữa 2 SmartLink nodes",
};

export type DictionaryKey = keyof typeof SUPER_DICTIONARY;

export const SuperDictionary = {
  /** Tra cứu thuật ngữ */
  lookup: (term: string): string | undefined =>
    SUPER_DICTIONARY[term] ?? SUPER_DICTIONARY[term.toUpperCase()],

  /** Tìm kiếm theo từ khóa */
  search: (query: string): Array<{ key: string; value: string }> => {
    const q = query.toLowerCase();
    return Object.entries(SUPER_DICTIONARY)
      .filter(([k, v]) => k.toLowerCase().includes(q) || v.toLowerCase().includes(q))
      .map(([key, value]) => ({ key, value }));
  },

  /** Alias cho search */
  searchTerm: (query: string) => SuperDictionary.search(query),

  /** Lấy tất cả keys */
  keys: (): string[] => Object.keys(SUPER_DICTIONARY),

  /** Tổng số entries */
  size: (): number => Object.keys(SUPER_DICTIONARY).length,

  /** Export toàn bộ dictionary */
  export: (): Record<string, string> => ({ ...SUPER_DICTIONARY }),
};

export default SuperDictionary;
