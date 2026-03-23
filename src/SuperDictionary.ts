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


  // ── Luồng Sản Xuất Tâm Luxury (từ scan sheets thực tế) ──────────────
  "LUONG_HANG":                    "Luồng hàng — SX (sản xuất mới) hoặc SC-BH-KB (sửa chữa/bảo hành/không bán)",
  "LUONG_SX":                    "Luồng SX — đơn hàng sản xuất mới, mã CT25/KD25, có BOM đầy đủ",
  "LUONG_SC":                    "Luồng SC — sửa chữa/bảo hành, mã 28xxx, không có BOM chuẩn",
  "SC_BH_KB":                    "SC-BH-KB — Sửa Chữa + Bảo Hành + Không Bán, luồng rủi ro cao cần giám sát",
  "CONG_DOAN":                    "Công đoạn — bước SX: Đúc→Nguội1→Nguội2(Ráp)→Hột→NB1→ĐáChủ→NB cuối→Xi",
  "NGUOI_1":                    "Nguội 1 — gia công thô sau đúc: cắt, giũa, làm sạch phôi",
  "NGUOI_2_RAP":                    "Nguội 2 (Ráp) — ráp các chi tiết thành sản phẩm hoàn chỉnh",
  "NGUOI_3_RAP":                    "Nguội 3 (Ráp) — ráp phức tạp, chi tiết nhiều lớp",
  "NB1":                    "NB1 — Nhám Bóng lần 1, đánh nhám trước khi gắn đá",
  "NB_CUOI":                    "NB cuối — Nhám Bóng cuối cùng trước QC xuất xưởng",
  "LAP_DUC":                    "Láp đúc — một mẻ đúc vàng ra phôi, mã Láp = số thứ tự mẻ đúc",
  "KEO_LAP":                    "Kéo Láp — kéo phôi sau đúc về hình dạng cần thiết",
  "PHOI":                    "Phôi — sản phẩm vàng ngay sau đúc, chưa gia công (chưa nguội, chưa đá)",
  "VAY_HAN":                    "Vảy hàn — hợp kim hàn nối chi tiết trang sức, 3 loại: Nhẹ/Nặng/Đỏ",
  "VAY_HAN_NHE":                    "Vảy Hàn Nhẹ (VHN) — nhiệt độ chảy thấp, tuổi vàng ~43-46%",
  "VAY_HAN_NANG":                    "Vảy Hàn Nặng — nhiệt độ chảy cao, tuổi vàng ~50-54%",
  "VAY_HAN_DO":                    "Vảy Hàn Đỏ — dùng cho rose gold, tuổi ~46-50%",
  "CHI_BAN":                    "Chỉ bắn — sợi vàng nhỏ hàn điểm, tuổi = tuổi SP (75 hoặc 58.5)",
  "GIAC_50":                    "Giác 50 — vàng 50% dùng mối hàn không cần tuổi cao",
  "VAT_TU_PHU":                    "Vật tư phụ — vảy hàn + chỉ bắn + giác 50, giao per thợ per ca",
  "75_TRANG":                    "75 Trắng — vàng trắng 18K (750‰), nguyên liệu phụ chính",
  "75_DO":                    "75 Đỏ — vàng đỏ 18K (750‰)",
  "75_HONG":                    "75 Hồng — vàng hồng 18K / rose gold (750‰)",
  "585_HONG":                    "58.5 Hồng — vàng hồng 14K (585‰)",
  "BOT_THU":                    "Bột thu — bụi vàng thu hồi từ tay/bàn/dụng cụ sau gia công",
  "CAN_HANG_NGAY":                    "Cân hàng ngày — cân bột per thợ per ca: TL trước, TL sau, bột thu thực tế",
  "CAN_NGUYEN_LIEU":                    "Cân nguyên liệu — theo dõi vật tư phụ đầu/cuối ngày per thợ per luồng SX/SC",
  "CHECH_LECH":                    "Chêch lệch — difference sổ sách vs thực tế, chỉ số phát hiện thất thoát",
  "BOT_THU_THUC_TE":                    "Bột thu thực tế — bột thợ thực sự trả, đối chiếu với sổ sách",
  "NAU_HEO":                    "Nấu heo — nấu chảy bụi vàng thu hồi trong lò, chuẩn bị phân kim",
  "PHAN_KIM":                    "Phân kim — tách vàng nguyên chất từ hỗn hợp sau nấu heo",
  "PHO_VANG":                    "PHỔ vàng — % vàng qua quang phổ spectrometry: chuẩn 75% = 18K OK",
  "QUY_750":                    "Quy 750 — đổi TL về chuẩn 18K: TL × PHỔ% / 75. VD: 10 chỉ×50%/75=6.67 chỉ",
  "NHAP_KHO_PHAN_KIM":                    "Nhập kho phân kim — vàng sạch sau phân kim nhập kho nguyên liệu",
  "LO_NAU":                    "Lò nấu heo — thiết bị nung chảy bụi vàng, hoạt động theo phê duyệt BGĐ",
  "KIM_CUONG_TAM":                    "Kim cương tấm — đá nhỏ 0.7-4.8mm gắn trang trí (≠ viên chủ)",
  "VIEN_CHU":                    "Viên chủ — kim cương trung tâm (center stone), mã VC+số, giá trị cao",
  "DA_CHU":                    "Đá chủ — viên chủ gắn trong ổ chủ trên sản phẩm",
  "XOAN":                    "Xoàn — từ nghề gọi kim cương tấm (colloquial jewelry term)",
  "RD":                    "RD — Round Diamond, kim cương tròn, phổ biến nhất",
  "BG":                    "BG — Baguette, kim cương hình chữ nhật",
  "SIZE_DA":                    "Size đá — kích thước mm: RD-0.7 → RD-4.8+. Mỗi size có giá khác nhau",
  "MA_GOM":                    "Mã gộp — nhóm size đá: RD-1,1-T, BG-2030-T, dùng quản lý tồn kho",
  "BANG_IN_DA":                    "Bảng in đá — BOM đá tấm per đơn: loại + số viên + TL/viên, in cho thợ hột",
  "SO_LUONG_DA_THO":                    "Số lượng đá thợ làm — thợ tự khai, chưa có QC đếm realtime (lỗ hổng)",
  "XN_DAILY":                    "X-N Daily — xuất nhập kim cương tấm hàng ngày, theo dõi per mã đơn",
  "DINH_MUC_DA_BE":                    "Định mức đá bể — số viên cho phép bể/mất per size (VD 200 viên/1 viên bể)",
  "DIEU_PHOI":                    "Điều phối — quản lý luồng đơn hàng vào/ra xưởng, track công đoạn",
  "QTSX":                    "QTSX — Quy Trình Sản Xuất, 15 công đoạn chuẩn Tâm Luxury",
  "DH_HANG_NGAY":                    "ĐH hàng ngày — đơn hàng ngày: mã đơn, ngày vào xưởng, ngày cần giao",
  "TONG_HOP_CHO":                    "Tổng hợp chờ — SP đang chờ tại từng công đoạn (Nguội1/2/3, Hột, NB)",
  "TRANG_THAI":                    "Trạng thái SP — Xong công đoạn / Đang làm / Chờ / Đã giao SR",
  "DA_GIAO_SR":                    "Đã giao SR — Showroom đã nhận, bước cuối luồng SX",
  "NGAY_CAN_GIAO":                    "Ngày cần giao — deadline KH, theo dõi thời gian còn lại trên QTSX",
  "DANG_LUU_KHO_SX":                    "Đang lưu kho SX — SP tạm kho xưởng chờ công đoạn tiếp theo",
  "TEST_TRUNG_DON":                    "Test trùng đơn — check đơn bị nhập 2 lần trong hệ thống",
  "CT25":                    "CT25 — mã đơn showroom 2025: CT25-XXXX (Công Ty)",
  "KD25":                    "KD25 — mã đơn kinh doanh 2025: KD25-XXXX",
  "MA_28XXX":                    "Mã 28xxx — mã đơn SC/BH/KB 5 chữ số, không truy vết đầy đủ (lỗ hổng)",
  "MA_HANG":                    "Mã hàng — product code theo thiết kế: NNA384, LT343, BT1400...",
  "MA_THO":                    "Mã thợ — mã nhận diện thợ trong hệ thống theo dõi SX",
  "CHUNG_LOAI":                    "Chủng loại — phân loại SP: Nhẫn Nữ, Vòng Nữ, Lắc, Bông Tai, Mặt Dây...",
  "PTD":                    "PTD — Phổ Thông Đặt, loại đơn hàng thông thường",
  "DH_DAI_HAN":                    "ĐH Dài Hạn — đơn hàng dài hạn, thường là KH lớn/sỉ",
  "TUOI_VANG":                    "Tuổi vàng — hàm lượng Au: 999.9/24K, 750/18K, 585/14K, 416/10K",
  "MAU_SP":                    "Màu SP — màu vàng: Trắng (white gold), Vàng, Đỏ, Hồng (rose gold)",
  "KY_HIEU_LO":                    "Ký hiệu lô — mã lô NL nhập kho: AU251202, PK251201, AU25=năm 2025",
  "AU_VANG":                    "AU — ký hiệu hóa học Vàng (Aurum), AU25 = lô vàng năm 2025",
  "KHO_PHOI_DUC":                    "Kho phôi đúc — lưu phôi sau đúc trước khi giao thợ nguội",
  "GIAO_NHAN_THO":                    "Giao nhận thợ — sổ giao nhận hằng ngày: SP + NL giao/nhận per thợ",
  "PHAT_HANG":                    "Phát hàng — xuất SP/NL cho thợ, ghi TL giao/trả",
  "TON_DAU":                    "Tồn đầu — số dư đầu kỳ (đầu ngày/tháng)",
  "DANGG_DO":                    "Dang dở — WIP (Work In Progress), SP đang làm chưa hoàn thiện",
  "DU_TRA_PSX":                    "Dư trả PSX — vàng/NL thừa thợ trả lại Phòng SX",
  "DU_TRA_SR":                    "Dư trả SR — vàng/NL thừa thợ trả lại Showroom/bộ phận khác",
  "THO_NGUOI":                    "Thợ nguội — tay nghề gia công kim loại: cắt/giũa/hàn/ráp",
  "THO_HOT":                    "Thợ hột — tay nghề gắn kim cương/đá quý",
  "THO_NHAM":                    "Thợ nhám — tay nghề đánh nhám và đánh bóng bề mặt",
  "TO_TRUONG_NGUOI":                    "Tổ trưởng nguội — team leader tổ nguội, chịu trách nhiệm TL giao nhận",
  "CA_LAM_VIEC":                    "Ca làm việc — ca sáng/chiều/tối, gắn với cân NL hàng ngày",
  "NHOM_CHUAN":                    "Nhóm chuẩn — quy đổi năng suất về đơn vị chuẩn để so sánh KPI",
  "DINH_MUC":                    "Định mức — tiêu chuẩn thời gian/vàng/đá per SP, dùng tính KPI thợ",
  "SU_KIEN_DA":                    "Sự kiện đá — INFO/BẢO HÀNH/MẤT/MƯỢN/TRẢ MƯỢN trong theo dõi đá tấm",
  "KPI_NGUOI":                    "KPI nguội — năng suất thợ nguội tính theo nhóm chuẩn, dùng tính lương",
  "BAO_CAO_THANG":                    "Báo cáo tháng — tổng hợp bột thu/chêch lệch/bột sau nấu per thợ per tháng",
  "SO_GIAO_THO":                    "Sổ giao thợ — theo dõi phát hàng per công đoạn, truy vết per đơn",
  "DATA_GIAO_NHAN":                    "Data giao nhận — bảng phát hàng: TL giao SP + NL + TL nhận về TP/dang dở",

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
