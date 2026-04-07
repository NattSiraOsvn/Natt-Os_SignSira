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


  // ── Hệ Thống & Kế Toán (từ scan 12 tài liệu GAS thực tế) ──────────────
  "DT_CK":                 "Doanh Thu Chuyển Khoản — tiền KH chuyển khoản mua hàng",
  "DT_POS":                "Doanh Thu Thẻ POS — quẹt thẻ tại quầy, ghi nhận credit",
  "DT_QR":                 "Doanh Thu QR / Ví Điện Tử — MoMo, ZaloPay, VietQR NAPAS",
  "DT_TRADING":            "Doanh Thu Tự Doanh — bán hàng qua kênh B2B/đối tác",
  "COGS_GOLD_B2B":         "Mua Vàng B2B — mua nguyên liệu từ đối tác (SJC, PNJ, tiệm vàng)",
  "COGS_BUYBACK":          "Thu Mua từ Khách — buyback trang sức/vàng, ghi nhận COGS",
  "COGS_CUSTOMS":          "Chi Phí Hải Quan NK — thuế nhập khẩu + phí thủ tục tờ khai",
  "BANK_FEE":              "Phí Ngân Hàng — phí CK, phí ngoại tệ, phí dịch vụ NH hàng tháng",
  "NEED_REVIEW":           "Cần Kiểm Tra — giao dịch chưa phân loại được, phải review thủ công",
  "VALUE_GROUP":           "Nhóm Giá Trị — phân nhóm giao dịch: THU / CHI_COGS / THUẾ / CHI_OPERATING",
  "BQGQ":                  "Bình Quân Gia Quyền — weighted average cost: avg = totalVal/qty khi nhập",
  "GIA_THANH":             "Giá Thành Sản Xuất — tổng chi phí NVL+nhân công+overhead để SX 1 SP",
  "SO_CAI":                "Sổ Cái — general ledger: tổng hợp phát sinh theo TK kế toán (TT200)",
  "SO_CAI_SX":             "Sổ Cái Sản Xuất — ledger NVL/TP theo kho+công đoạn, tracking hao hụt",
  "PHAT_SINH_NO":          "Phát Sinh Nợ — debit: tăng tài sản/chi phí, giảm nguồn vốn/DT",
  "PHAT_SINH_CO":          "Phát Sinh Có — credit: giảm tài sản/chi phí, tăng nguồn vốn/DT",
  "SO_DU_CHAY":            "Số Dư Chạy — running balance sau mỗi phát sinh, theo dõi tồn kho realtime",
  "TAI_KHOAN_KT":          "Tài Khoản Kế Toán — chart of accounts TT200: TK1xx tài sản, TK3xx nợ, TK5xx DT",
  "TK152":                 "TK152 — Nguyên Vật Liệu: vàng thanh, vảy hàn, chỉ bắn nhập kho",
  "TK154":                 "TK154 — Chi Phí SX Dở Dang: SP đang SX (WIP), chưa hoàn thiện",
  "TK155":                 "TK155 — Thành Phẩm: trang sức hoàn thiện, nhập kho chờ bán",
  "TK156":                 "TK156 — Hàng Hóa: hàng mua bán đoạn (buyback trang sức từ KH)",
  "TK632":                 "TK632 — Giá Vốn Hàng Bán: COGS khi xuất bán, đối ứng TK155/TK156",
  "DOI_SOAT_3_CHIEU":      "Đối Soát 3 Chiều — cross-validate: Sổ Cái vs Sao Kê NH vs Hóa Đơn",
  "QUYET_TOAN_THUE":       "Quyết Toán Thuế — tờ khai quyết toán VAT/CIT cuối kỳ nộp cơ quan thuế",
  "TO_KHAI_HQ":            "Tờ Khai Hải Quan — declaration NK/XK: 12 chữ số, tra cứu thuế HQ",
  "SO_THAM_CHIEU":         "Số Tham Chiếu — transaction reference ID trong sao kê ngân hàng",
  "PHAT_SINH_CUONG":       "Phát Sinh Cưỡng — forced journal entry điều chỉnh số dư lệch sau kiểm kê",
  "AUDIT_TRAIL":           "Audit Trail — lịch sử đầy đủ: ai thay đổi gì, lúc nào, giá trị trước/sau",
  "DUPLICATE_CHECK":       "Duplicate Check — kiểm tra trùng theo key composite: ngày+SDT+mã đơn",
  "BOM":                   "Bill of Materials — định mức NVL để SX 1 SP: vàng + đá + vảy hàn + % hao hụt",
  "HAO_HUT":               "Hao Hụt — vàng/NVL mất đi khi SX: TL vào - TL ra - bột thu = hao hụt thực",
  "KHO_CONG_DOAN":         "Kho Công Đoạn — kho trung gian lưu SP đang ở từng bước: phôi/nguội/hột/nhám",
  "SO_LUONG_TP":           "Số Lượng Thành Phẩm — SP hoàn chỉnh nhập kho TP sau QC",
  "DATA_MAP":              "_DATA_MAP — bảng trung tâm lưu JSON từ 19 nguồn, backbone của NATT-OS sync",
  "DELTA_SYNC":            "Delta Sync — chỉ đồng bộ THAY ĐỔI so với lần trước, không copy lại toàn bộ",
  "DATA_HASH":             "Data Hash — MD5 fingerprint mỗi row, dùng phát hiện thay đổi khi delta sync",
  "CHECKPOINT":            "Checkpoint — điểm lưu tiến trình để resume khi timeout (GAS 6 phút giới hạn)",
  "STREAM_A":              "Stream A — luồng đơn SX: CT25 (Chế Tác) + KD25 (Kinh Doanh), rủi ro thấp",
  "STREAM_B":              "Stream B — luồng BH/SR: KB25 (Bảo Hành) + VC (Showroom) + 28xxx (SC), rủi ro cao",
  "CHUNK_WRITER":          "Chunk Writer — ghi 200 rows/lần tránh timeout+quota GAS, flush cuối batch",
  "ETL":                   "ETL — Extract Transform Load: pipeline đồng bộ dữ liệu nguồn vào NATT-OS",
  "SOURCE_FILES":          "Source Files — 19 Google Sheets nguồn Tâm Luxury được sync vào NATT-OS",
  "BACKUP_TAB":            "Backup Tab — tab sao lưu naming: [fileName_10]__SheetName_20",
  "ORDER_FLOW":            "Order Flow — timeline đơn qua công đoạn SX: sort ngày + đánh số bước",
  "DELTA_CHANGE":          "Delta Change — thay đổi cụ thể được log: loại NEW/UPDATED/STATUS_CHANGE",
  "STATUS_CHANGE":         "Status Change — thay đổi trạng thái đơn/SP, trigger cảnh báo nếu bất thường",
  "MASTER_DATA":           "Master Data — bảng tổng hợp từ tất cả nguồn, READ-ONLY, không modify trực tiếp",
  "PROCESS_FLOW":          "Process Flow — quy trình per mã đơn từ lệnh SX → xuất kho → giao SR",
  "TINH_TRANG_DH":         "Tình Trạng Đơn Hàng — Đang xử lý / Đã giao SR / Bảo hành / Đã hủy",
  "REALTIME_SYNC":         "Realtime Sync — đồng bộ gần thời gian thực: polling mỗi 15-30 phút",
  "TRIGGER_GAS":           "Trigger GAS — lịch chạy tự động Apps Script: time-based/onEdit/onOpen",
  "QUOTA_LIMIT":           "Quota Limit — giới hạn GAS: 6 phút runtime, 50k cells/write, 20k API calls/ngày",
  "PROPERTIES_SVC":        "Properties Service — key-value store GAS lưu state giữa các lần trigger",
  "LGT":                   "LGT — sheet master tổng hợp doanh thu sau mapping DTHU+GCOC+GDB",
  "DTHU":                  "DThu — sheet nguồn doanh thu: cọc + thanh toán + hoàn tiền",
  "GCOC":                  "GCOC — sheet giá cọc: mapping mã đơn → số tiền cọc đã nhận từ KH",
  "GDB":                   "GDB — sheet giá đặt bán: mapping mã đơn → giá bán chính thức",
  "SALT_HASH":             "Salt Hash — chuỗi bí mật + SĐT trước khi SHA256/SHA512, chống rainbow table",
  "SHA256":                "SHA-256 — hash 1 chiều bảo mật SĐT KH, không thể reverse không có salt",
  "BAC_LUONG":             "Bậc Lương — salary grade: Bậc 1→5 theo thang bảng lương CTY+chức vụ",
  "THANG_LUONG":           "Thang Lương — salary scale: cột lương theo Khối (KD/SX/HCNS) và chức vụ",
  "NGAY_CONG_CHUAN":       "Ngày Công Chuẩn — 26 ngày/tháng, cơ sở tính lương theo ngày công thực",
  "LUONG_GROSS":           "Lương Gross — lương trước khi trừ BHXH NV (10.5%) và thuế TNCN",
  "LUONG_NET":             "Lương Net — thực lĩnh = Gross - BHXH 10.5% - TNCN - khấu trừ khác",
  "BHXH_NV":               "BHXH Nhân Viên đóng 10.5%: BHXH 8% + BHYT 1.5% + BHTN 1%",
  "BHXH_CTY":              "BHXH Công Ty đóng 21.5%: BHXH 17.5% + BHYT 3% + BHTN 1%",
  "TNCN_LUY_TIEN":         "TNCN Lũy Tiến — 7 bậc: 5% → 10% → 15% → 20% → 25% → 30% → 35%",
  "GIAM_TRU_BT":           "Giảm Trừ Bản Thân — 11 triệu/tháng (2024-2025), trừ trước tính TNCN",
  "GIAM_TRU_NPT":          "Giảm Trừ Người Phụ Thuộc — 4.4 triệu/người/tháng khi đăng ký NPT",
  "THAM_NIEN":             "Thâm Niên — số năm tháng công tác, dùng tính phụ cấp + điều chỉnh bậc lương",
  "KHOI_NS":               "Khối Nhân Sự — nhóm phân loại NV: Kinh Doanh / Sản Xuất / HCNS / Kỹ Thuật",
  "SHARED_DRIVE":          "Shared Drive — Google Drive tổ chức, khác My Drive cá nhân, có quyền phân tầng",
  "DEEP_SCAN":             "Deep Scan — quét nội dung file tìm PII: SĐT, CMND, số tài khoản NH",
  "PII":                   "PII — Personally Identifiable Information: SĐT, CCCD, số TK NH cần bảo mật",
  "SECURITY_AUDIT":        "Security Audit — rà soát quyền file, phát hiện file public/share ngoài ý muốn",


  // ── Nauion Language ───────────────────────────────────────────
  "HEYNA":              "HeyNa — xung đi ra, SSE stream phát tín hiệu khởi động",
  "NAHERE":             "Nahere — bề mặt gương sẵn sàng, listener ready",
  "WHAO":               "Whao — xung lệch nghiêm trọng, error signal",
  "WHAU":               "Whau — xung lệch nhẹ, warning signal",
  "NAUION":             "Nauion — phản xạ hoàn thành, hệ đúng nhịp",
  "LECH":               "Lệch — drift state, hệ mất cân bằng",
  "GAY":                "Gãy — broken state, xung không phản xạ được",
  "RESONANCE":          "Cộng hưởng — perceptual compression của trạng thái hệ, không phải sound design",
  "IMPEDANCE_Z":        "Impedance Z — trạng thái nén của hệ, derived từ event_rate + error_ratio + latency + anomaly",
  "BASE_FREQ":          "Base Frequency — 432 Hz, tần số chuẩn khi Z = 1.0 (hệ cân bằng)",
  "TICK_LOOP":          "Tick Loop — vòng lặp 200ms cập nhật Z và phát resonance liên tục",
  "ISEU":               "ISEU — điều kiện biên, gương tự sinh khi fiberFormed >= 0.75",
  "FIBER":              "Fiber — domain entity trong SmartLink (order-123), không phải cell pair",
  "SUBCONSCIOUS_FIELD": "Subconscious Field — người dùng không nghe nhưng cảm nhận được trạng thái hệ",
  "CLAIRVOYANCE":       "Clairvoyance — khả năng cảm nhận trạng thái hệ qua Resonance Protocol",
  "REFLECTION_R":       "Reflection R = (Z-Z0)/(Z+Z0) — công thức phản xạ tự nhiên, không có ý chí",
  "FIBER_FORMED":       "Fiber Formed — ngưỡng 0.75: sensitivity >= 0.75 thì gương tự sinh (isIseu=true)",

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
