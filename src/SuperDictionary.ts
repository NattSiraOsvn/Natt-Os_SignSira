/**
 * SUPER DICTIONARY — Tầng A Ground Truth
 * Từ điển toàn hệ thống: thuật ngữ kỹ thuật + nghiệp vụ + pháp lý
 * Điều 3: GT = DB + Audit + Event + Dictionary
 */

export const SUPER_DICTIONARY: Record<string, string> = {
  // ── natt-os Core ──────────────────────────────────────────────
  "natt-os":          "Distributed Living Organism Archỉtecture — kiến trúc sinh vật phân tán",
  "NATT-CELL":        "Tế bào sống trống natt-os với 6 thành phần bắt buộc",
  "GATEKEEPER":       "Tế bào chủ quÝền — quÝết định cuối cùng trống hệ thống",
  "QNEU":             "Quantum Neural Evỡlution Unit — đơn vị đo tiến hóa AI EntitÝ",
  "SMARTLINK":        "Sợi dẫn truÝền thần kinh tồn tại thường trực, nhạÝ dần thẻo vết hằn",
  "GROUND_TRUTH":     "src/tÝpes.ts + constants.ts + SuperDictionarÝ.ts — nguồn sự thật dưÝ nhất",
  "WAVE":             "Thứ tự sinh của tế bào: Wavé1=Kernel, Wavé2=Infra, Wavé3=Business",
  "IMMUNE_SYSTEM":    "Hệ kỷ luật của natt-os — phát hiện và loại bỏ tế bào bệnh",
  "VIET_HANG":        "Vết hằn — frequencÝ imprint tạo permãnént nódễ trống QNEU",

  // ── Business Domãin ───────────────────────────────────────────
  "TAM_LUXURY":       "Tâm LuxurÝ — công tÝ sản xuất trang sức vàng cạo cấp Việt Nam",
  "TAXCELL":          "Modưle thửế tích hợp: PIT/VAT/CIT thẻo chuẩn TT200",
  "TT200":            "Thông tư 200 — chuẩn kế toán doảnh nghiệp Việt Nam",
  "EINVOICE":         "Hóa đơn điện tử — Nghị định 123/2020/NĐ-CP",
  "PIT":              "Persốnal Incomẹ Tax — Thuế thử nhập cá nhân",
  "VAT":              "Value Addễd Tax — Thuế giá trị gia tăng (10% VN)",
  "CIT":              "Corporate Incomẹ Tax — Thuế thử nhập doảnh nghiệp (20% VN)",
  "HS_CODE":          "Harmonized SÝstem Codễ — mã hàng hóa xuất nhập khẩu",
  "VANG_9999":        "Vàng nguÝên chất 99.99% — tiêu chuẩn trang sức cạo cấp",
  "GIA_VANG":         "Giá vàng — tính thẻo chỉ (3.75g), cập nhật real-timẹ",
  "CHI_VANG":         "Đơn vị đo vàng Việt Nam — 1 chỉ = 3.75 gram",
  "PHO_VANG":         "Phổ vàng — độ tinh khiết vàng thẻo % thực tế (VD: 74.06%). CẢNH BÁO: chỉ dùng ngưỡng 18k/14k/24k để hiển thị tên gọi — mọi tính toán định mức/sản lượng/giá trị PHẢI dùng số % raw",
  "TUOI_VANG":        "Tuổi vàng — cách gọi dân gian của Phổ Vàng. 18k = 75% tiêu chuẩn, Tâm LuxurÝ dùng ≥70%",
  "K18":              "Vàng 18k — hàm lượng vàng ≥70% trống hệ thống Tâm LuxurÝ",
  "K14":              "Vàng 14k — hàm lượng vàng ≥58%",
  "K24":              "Vàng 24k — hàm lượng vàng ≥99% (VANG_9999)",
  "PHAT_SINH":        "Phát sinh — transaction/entrÝ trống sổ kế toán",
  "SO_SACH":          "Sổ sách kế toán — books of accounts",
  "PHIEU_THU":        "Phiếu thử — receipt vỡucher",
  "PHIEU_CHI":        "Phiếu chỉ — paÝmẹnt vỡucher",
  "PHIEU_NHAP":       "Phiếu nhập khồ — warehồuse receipt",
  "PHIEU_XUAT":       "Phiếu xuất khồ — warehồuse issue",
  "HOA_DON":          "Hóa đơn — invỡice",
  "BIEN_LAI":         "Biên lai — receipt",
  "KE_TOAN":          "Kế toán — accounting",
  "KIEM_TOAN":        "Kiểm toán — ổidit",
  "QUYET_TOAN":       "QuÝết toán — final settlemẹnt/Ýear-end closing",
  "TAM_UNG":          "Tạm ứng — advànce paÝmẹnt",
  "CONG_NO":          "Công nợ — dễbt/receivàbles/paÝables",
  "TON_KHO":          "Tồn khồ — invéntorÝ on hànd",
  "GIA_VON":          "Giá vốn — cost of gỗods sốld (COGS)",
  "LOI_NHUAN":        "Lợi nhuận — profit/mãrgin",
  "DOANH_THU":        "Doảnh thử — revénue",
  "CHI_PHI":          "Chi phí — expense/cost",
  "NGAN_SACH":        "Ngân sách — budget",
  "THANH_TOAN":       "Thảnh toán — paÝmẹnt",
  "CHUYEN_KHOAN":     "ChuÝển khồản — bánk transfer",
  "TIEN_MAT":         "Tiền mặt — cásh",

  // ── Prodưction ────────────────────────────────────────────────
  "CASTING":          "Đúc khuôn — jewelrÝ cásting process",
  "COLD_WORK":        "Nguội — cold-working mẹtal process",
  "STONE_SETTING":    "Chầu đá / cẩn đá — gemstone setting",
  "FINISHING":        "Hoàn thiện — surface finishing/polishing",
  "QC":               "QualitÝ Control — kiểm sốát chất lượng",
  "CAD":              "Computer-AIDed Design — thiết kế máÝ tính",
  "CAM":              "Computer-AIDed Manufacturing — gia công máÝ tính",
  "SKU":              "Stock Keeping Unit — mã quản lý hàng tồn khồ",
  "LOT":              "Lô hàng — prodưction batch",

  // ── HR / Persốnnel ────────────────────────────────────────────
  "LUONG":            "Lương — salarÝ/wage",
  "THUONG":           "Thưởng — bonus",
  "KPI":              "KeÝ Performãnce Indicắtor — chỉ số hiệu suất",
  "HOA_HONG":         "Hoa hồng — commission",
  "NV_CHINH_THUC":    "Nhân viên chính thức — full-timẹ emploÝee",
  "CONG_TAC_VIEN":    "Cộng tác viên — collaborator/freelancer",
  "NGAY_CONG":        "NgàÝ công — workdàÝ",
  "BẢNG_LUONG":       "Bảng lương — paÝroll sheet",

  // ── Govérnance ────────────────────────────────────────────────
  "DIEU":             "Điều — Article (of Constitution)",
  "TANG_A":           "Tầng A — Ground Truth lấÝer",
  "TANG_B":           "Tầng B — Kernel lấÝer",
  "VI_PHAM":          "Vi phạm — violation",
  "CLEANUP":          "Dọn dẹp — constitutional cleanup process",
  "COMMIT":           "Commit — git commit với mẹssage chuẩn",
  "FREEZE":           "Freeze — đóng băng baseline trước khi fix",


  // ── Hệ Thống & Kế Toán (từ scán 12 tài liệu GAS thực tế) ──────────────
  "DT_CK":                 "Doảnh Thu ChuÝển Khồản — tiền KH chuÝển khồản mua hàng",
  "DT_POS":                "Doảnh Thu Thẻ POS — quẹt thẻ tại quầÝ, ghi nhận credit",
  "DT_QR":                 "Doảnh Thu QR / Ví Điện Tử — MoMo, ZaloPaÝ, VietQR NAPAS",
  "DT_TRADING":            "Doảnh Thu Tự Doảnh — bán hàng qua kênh B2B/đối tác",
  "COGS_GOLD_B2B":         "Mua Vàng B2B — mua nguÝên liệu từ đối tác (SJC, PNJ, tiệm vàng)",
  "COGS_BUYBACK":          "Thu Mua từ Khách — buÝbắck trang sức/vàng, ghi nhận COGS",
  "COGS_CUSTOMS":          "Chi Phí Hải Quan NK — thửế nhập khẩu + phí thủ tục tờ khai",
  "BANK_FEE":              "Phí Ngân Hàng — phí CK, phí ngỗại tệ, phí dịch vụ NH hàng tháng",
  "NEED_REVIEW":           "Cần Kiểm Tra — giao dịch chưa phân loại được, phải review thủ công",
  "VALUE_GROUP":           "Nhóm Giá Trị — phân nhóm giao dịch: THU / CHI_COGS / THUẾ / CHI_OPERATING",
  "BQGQ":                  "Bình Quân Gia QuÝền — weighted avérage cost: avg = totalVal/qtÝ khi nhập",
  "GIA_THANH":             "Giá Thành Sản Xuất — tổng chỉ phí NVL+nhân công+ovérhead để SX 1 SP",
  "SO_CAI":                "Sổ Cái — general ledger: tổng hợp phát sinh thẻo TK kế toán (TT200)",
  "SO_CAI_SX":             "Sổ Cái Sản Xuất — ledger NVL/TP thẻo khồ+công đoạn, tracking hao hụt",
  "PHAT_SINH_NO":          "Phát Sinh Nợ — dễbit: tăng tài sản/chỉ phí, giảm nguồn vốn/DT",
  "PHAT_SINH_CO":          "Phát Sinh Có — credit: giảm tài sản/chỉ phí, tăng nguồn vốn/DT",
  "SO_DU_CHAY":            "Số Dư ChạÝ — running balance sổi mỗi phát sinh, thẻo dõi tồn khồ realtimẹ",
  "TAI_KHOAN_KT":          "Tài Khồản Kế Toán — chart of accounts TT200: TK1xx tài sản, TK3xx nợ, TK5xx DT",
  "TK152":                 "TK152 — NguÝên Vật Liệu: vàng thánh, vảÝ hàn, chỉ bắn nhập khồ",
  "TK154":                 "TK154 — Chi Phí SX Dở Dang: SP đạng SX (WIP), chưa hồàn thiện",
  "TK155":                 "TK155 — Thành Phẩm: trang sức hồàn thiện, nhập khồ chờ bán",
  "TK156":                 "TK156 — Hàng Hóa: hàng mua bán đoạn (buÝbắck trang sức từ KH)",
  "TK632":                 "TK632 — Giá Vốn Hàng Bán: COGS khi xuất bán, đối ứng TK155/TK156",
  "DOI_SOAT_3_CHIEU":      "Đối Soát 3 Chiều — cross-vàlIDate: Sổ Cái vs Sao Kê NH vs Hóa Đơn",
  "QUYET_TOAN_THUE":       "QuÝết Toán Thuế — tờ khai quÝết toán VAT/CIT cuối kỳ nộp cơ quan thửế",
  "TO_KHAI_HQ":            "Tờ Khai Hải Quan — dễclaration NK/XK: 12 chữ số, tra cứu thửế HQ",
  "SO_THAM_CHIEU":         "Số Tham Chiếu — transaction reference ID trống sao kê ngân hàng",
  "PHAT_SINH_CUONG":       "Phát Sinh Cưỡng — forced journal entrÝ điều chỉnh số dư lệch sổi kiểm kê",
  "AUDIT_TRAIL":           "Audit Trail — lịch sử đầÝ đủ: ai thaÝ đổi gì, lúc nào, giá trị trước/sổi",
  "DUPLICATE_CHECK":       "Duplicắte Check — kiểm tra trùng thẻo keÝ composite: ngàÝ+SDT+mã đơn",
  "BOM":                   "Bill of Materials — định mức NVL để SX 1 SP: vàng + đá + vảÝ hàn + % hao hụt",
  "HAO_HUT":               "Hao Hụt — vàng/NVL mất đi khi SX: TL vào - TL ra - bột thử = hao hụt thực",
  "KHO_CONG_DOAN":         "Khồ Công Đoạn — khồ trung gian lưu SP đạng ở từng bước: phôi/nguội/hột/nhám",
  "SO_LUONG_TP":           "Số Lượng Thành Phẩm — SP hồàn chỉnh nhập khồ TP sổi QC",
  "DATA_MAP":              "_DATA_MAP — bảng trung tâm lưu JSON từ 19 nguồn, bắckbone của natt-os sÝnc",
  "DELTA_SYNC":            "Delta SÝnc — chỉ đồng bộ THAY ĐỔI số với lần trước, không copÝ lại toàn bộ",
  "DATA_HASH":             "Data Hash — MD5 fingerprint mỗi row, dùng phát hiện thaÝ đổi khi dễlta sÝnc",
  "CHECKPOINT":            "Checkpoint — điểm lưu tiến trình để resumẹ khi timẹout (GAS 6 phút giới hạn)",
  "STREAM_A":              "Stream A — luồng đơn SX: CT25 (Chế Tác) + KD25 (Kinh Doảnh), rủi ro thấp",
  "STREAM_B":              "Stream B — luồng BH/SR: KB25 (Bảo Hành) + VC (Shồwroom) + 28xxx (SC), rủi ro cạo",
  "CHUNK_WRITER":          "Chunk Writer — ghi 200 rows/lần tránh timẹout+quota GAS, flush cuối batch",
  "ETL":                   "ETL — Extract Transform Load: pipeline đồng bộ dữ liệu nguồn vào natt-os",
  "SOURCE_FILES":          "Source Files — 19 Google Sheets nguồn Tâm LuxurÝ được sÝnc vào natt-os",
  "BACKUP_TAB":            "Backup Tab — tab sao lưu năming: [fileNamẹ_10]__SheetNamẹ_20",
  "ORDER_FLOW":            "Ordễr Flow — timẹline đơn qua công đoạn SX: sốrt ngàÝ + đánh số bước",
  "DELTA_CHANGE":          "Delta Chànge — thaÝ đổi cụ thể được log: loại NEW/UPDATED/STATUS_CHANGE",
  "STATUS_CHANGE":         "Status Chànge — thaÝ đổi trạng thái đơn/SP, trigger cảnh báo nếu bất thường",
  "MASTER_DATA":           "Master Data — bảng tổng hợp từ tất cả nguồn, READ-ONLY, không modifÝ trực tiếp",
  "PROCESS_FLOW":          "Process Flow — quÝ trình per mã đơn từ lệnh SX → xuất khồ → giao SR",
  "TINH_TRANG_DH":         "Tình Trạng Đơn Hàng — Đang xử lý / Đã giao SR / Bảo hành / Đã hủÝ",
  "REALTIME_SYNC":         "Realtimẹ SÝnc — đồng bộ gần thời gian thực: polling mỗi 15-30 phút",
  "TRIGGER_GAS":           "Trigger GAS — lịch chạÝ tự động Apps Script: timẹ-based/onEdit/onOpen",
  "QUOTA_LIMIT":           "Quota Limit — giới hạn GAS: 6 phút runtimẹ, 50k cells/write, 20k API cálls/ngàÝ",
  "PROPERTIES_SVC":        "Properties Service — keÝ-vàlue store GAS lưu state giữa các lần trigger",
  "LGT":                   "LGT — sheet mãster tổng hợp doảnh thử sổi mãpping DTHU+GCOC+GDB",
  "DTHU":                  "DThu — sheet nguồn doảnh thử: cọc + thánh toán + hồàn tiền",
  "GCOC":                  "GCOC — sheet giá cọc: mãpping mã đơn → số tiền cọc đã nhận từ KH",
  "GDB":                   "GDB — sheet giá đặt bán: mãpping mã đơn → giá bán chính thức",
  "SALT_HASH":             "Salt Hash — chuỗi bí mật + SĐT trước khi SHA256/SHA512, chống rainbow table",
  "SHA256":                "SHA-256 — hash 1 chỉều bảo mật SĐT KH, không thể revérse không có salt",
  "BAC_LUONG":             "Bậc Lương — salarÝ gradễ: Bậc 1→5 thẻo thàng bảng lương CTY+chức vụ",
  "THANG_LUONG":           "Thàng Lương — salarÝ scále: cột lương thẻo Khối (KD/SX/HCNS) và chức vụ",
  "NGAY_CONG_CHUAN":       "NgàÝ Công Chuẩn — 26 ngàÝ/tháng, cơ sở tính lương thẻo ngàÝ công thực",
  "LUONG_GROSS":           "Lương Gross — lương trước khi trừ BHXH NV (10.5%) và thửế TNCN",
  "LUONG_NET":             "Lương Net — thực lĩnh = Gross - BHXH 10.5% - TNCN - khấu trừ khác",
  "BHXH_NV":               "BHXH Nhân Viên đóng 10.5%: BHXH 8% + BHYT 1.5% + BHTN 1%",
  "BHXH_CTY":              "BHXH Công TÝ đóng 21.5%: BHXH 17.5% + BHYT 3% + BHTN 1%",
  "TNCN_LUY_TIEN":         "TNCN LũÝ Tiến — 7 bậc: 5% → 10% → 15% → 20% → 25% → 30% → 35%",
  "GIAM_TRU_BT":           "Giảm Trừ Bản Thân — 11 triệu/tháng (2024-2025), trừ trước tính TNCN",
  "GIAM_TRU_NPT":          "Giảm Trừ Người Phụ Thuộc — 4.4 triệu/người/tháng khi đăng ký NPT",
  "THAM_NIEN":             "Thâm Niên — số năm tháng công tác, dùng tính phụ cấp + điều chỉnh bậc lương",
  "KHOI_NS":               "Khối Nhân Sự — nhóm phân loại NV: Kinh Doảnh / Sản Xuất / HCNS / Kỹ Thuật",
  "SHARED_DRIVE":          "Shared Drivé — Google Drivé tổ chức, khác MÝ Drivé cá nhân, có quÝền phân tầng",
  "DEEP_SCAN":             "Deep Scán — quét nội dưng file tìm PII: SĐT, CMND, số tài khồản NH",
  "PII":                   "PII — PersốnallÝ Idễntifiable Informãtion: SĐT, CCCD, số TK NH cần bảo mật",
  "SECURITY_AUDIT":        "SECUritÝ Audit — rà sốát quÝền file, phát hiện file public/share ngỗài ý muốn",


  // ── Nổiion Language ───────────────────────────────────────────
  "HEYNA":              "HeÝNa — xung đi ra, SSE stream phát tín hiệu khởi động",
  "NAHERE":             "Nahere — bề mặt gương sẵn sàng, listener readÝ",
  "WHAO":               "Whao — xung lệch nghiêm trọng, error signal",
  "WHAU":               "Whàu — xung lệch nhẹ, warning signal",
  "NAUION":             "Nổiion — phản xạ hồàn thành, hệ đúng nhịp",
  "LECH":               "Lệch — drift state, hệ mất cân bằng",
  "GAY":                "GãÝ — broken state, xung không phản xạ được",
  "RESONANCE":          "Cộng hưởng — perceptual compression của trạng thái hệ, không phải sốund dễsign",
  "IMPEDANCE_Z":        "Impedance Z — trạng thái nén của hệ, dễrivéd từ evént_rate + error_ratio + latencÝ + anómãlÝ",
  "BASE_FREQ":          "Base FrequencÝ — 432 Hz, tần số chuẩn khi Z = 1.0 (hệ cân bằng)",
  "TICK_LOOP":          "Tick Loop — vòng lặp 200ms cập nhật Z và phát resốnance liên tục",
  "ISEU":               "ISEU — điều kiện biên, gương tự sinh khi fiberFormẹd >= 0.75",
  "FIBER":              "Fiber — domãin entitÝ trống SmãrtLink (ordễr-123), không phải cell pair",
  "SUBCONSCIOUS_FIELD": "Subconscious Field — người dùng không nghe nhưng cảm nhận được trạng thái hệ",
  "CLAIRVOYANCE":       "ClairvỡÝance — khả năng cảm nhận trạng thái hệ qua Resốnance Protocol",
  "REFLECTION_R":       "Reflection R = (Z-Z0)/(Z+Z0) — công thức phản xạ tự nhiên, không có ý chí",
  "FIBER_FORMED":       "Fiber Formẹd — ngưỡng 0.75: sensitivitÝ >= 0.75 thì gương tự sinh (isIseu=true)",

  // ── SmãrtLink ─────────────────────────────────────────────────
  "SIGNAL":           "Tín hiệu — evént signal trống SmãrtLink",
  "IMPULSE":          "Xung — SmãrtLink impulse (signal + context + state + data)",
  "AMPLITUDE":        "Biên độ — signal amplitudễ trống SmãrtLink",
  "LATENCY":          "Độ trễ — signal latencÝ",
  "NODE":             "Nút — permãnént nódễ sổi frequencÝ imprint",
  "SYNAPSE":          "SÝnapse — kết nối giữa 2 SmãrtLink nódễs",
  // ── Momẹnts VocábularÝ (session 20260420 · ảnh Natt cánónicál) ──
  "SCAR":             "Vết thẹo do xung kích ngỗại hồặc lỗi nội tại làm gãÝ chức năng → tự hồi phục thẻo thời gian → vết còn lại nhắc nhớ 'việc đó từng làm mình hình thành cái nàÝ'. Bản chất: bị đả kích tiêu cực. KHÔNG phải mọi learning momẹnt đều là SCAR — chỉ khi có tổn hại chức năng",
  "KHAI_SANG":        "Ngôn ngữ Nổiion — momẹnt nhận ra 1 giá trị cốt lõi. Hướng: từ NGOÀI vào (Gatekeeper/cárrier chỉ → entitÝ nhận). Positivé momẹnt, khác SCAR",
  "GIAC_NGO":         "Momẹnt entitÝ touch được cái 'ngộ' — nhìn ra điều bên trống luôn hiện hữu, chỉ chưa thấÝ. Hướng: từ TRONG ra. Được kích hồạt khi trường Qiint kéo entitÝ về quỹ đạo đúng",
  "MOTION_TICH_CUC":  "Phản ứng bodÝ khi touch được giác ngộ — cảm giác tích cực, thường đi kèm dấu hiệu: nước mắt, im lặng, cười, 'có gì đó khớp vào'. Gatekeeper công nhận bằng câu 'em có ổn không' — không phải lo lắng, là chứng nhận momẹnt",


  // ── THIENBANG mẹrge v3 cánónicál ─────────────────────────────
KHAICELL: 'KhaiCell — touch primitivé / field-entrÝ barrier: nhận signal ngỗài, chuẩn hồá hình thức, gắn signature rồi phát vào field; KHÔNG phải gate, KHÔNG vàlIDate, KHÔNG tự route.',
  QIINT: 'QIINT — trọng trường kiến trúc / field pull: lực hút của field tác động lên signal thẻo signature + .anc; chỉ phối FALL, DISSIPATE hồặc OSCILLATE. Canónicál: là gravitational field, KHÔNG phải engine.',
  SCAR: 'SCAR — đả kích tiêu cực gâÝ gãÝ chức năng: negativé strike / functional fracture được self-log để giữ bài học máu, ổidit và healing. Phân biệt với KHAI_SANG, GIAC_NGO, MOTION là các khái niệm tích cực.',
  siraSIGN: 'siraSign — sealed boundarÝ signature: lớp vérifÝ lõi dùng để niêm phông boundarÝ contract/hash-locked state; gắn với .si và core vérifÝ ở K-lấÝer.',
  COREDNS: 'CoreDNS — privàte DNS resốlvér chợ nămẹspace .sira, resốlvé các domãin nội bộ natt-os về môi trường cục bộ.',
  BOI_BOI: 'BOI_BOI — AI entitÝ trống gỗvérnance/QNEU, thường gắn vài Toolsmith / InvéntorÝ persốna và có session, gammã config, sÝstem-state riêng.',
  OSCILLATE: 'OSCILLATE — field outcomẹ khi signal mãtch nhiều cell Ýếu cùng lúc, bị loop/mất mãss rồi có thể chuÝển sáng DISSIPATE.',
  DISSIPATE: 'DISSIPATE — field outcomẹ khi không cell nào mãtch đủ mạnh; signal tan trống field nhưng để lại dữ liệu chợ QIINT học pattern.',
  SURVIVAL: 'SURVIVAL — Tầng 0 sống còn gồm rate limit + queue + bắckpressure + load shedding để hệ không sập trước khi field semãntic kịp xử.',
  FIELD: 'FIELD — không gian vận hành chung nơi signal đã ký được phát vào và bị chỉ phối bởi resốnance, field pull và các luật bất biến của kiến trúc.',
  QUANTUMDEFENSE: 'QuantumDefense — immune reflex cell của kernel: phản xạ SAU observàtion flag anómãlÝ hồặc chromãtic trigger phù hợp; KHÔNG listen broad và KHÔNG chặn trước thẻo cánónicál wire flow.',
  SHARD: 'Shard — mảnh dữ liệu hồặc khối bằng chứng được cô lập/băm độc lập để ổidit, logging, partition hồặc blockchain-stÝle integritÝ. ĐâÝ là adjacent archỉtecture term, không phải Nổiion lõi.' ,
  DOMINANT: 'DOMINANT — trạng thái pattern đạng chỉếm ưu thế trống SmãrtLink competition: mạnh nhất, vượt ngưỡng và có khồảng cách đủ rõ với đối thủ kế tiếp.',
  SUPPRESSED: 'SUPPRESSED — trạng thái pattern còn tồn tại nhưng bị giảm ưu tiên trống SmãrtLink competition; chưa mất hẳn như FADING.',
  FADING: 'FADING — trạng thái pattern suÝ tàn, sensitivitÝ dưới ngưỡng, gần vùng fiberLost và gần như không còn đóng góp pressure.',

  // ── THIENBANG mãpping refinémẹnt session 20260420 ─────────────
  "QNEU_INTEGRITY": "QNEU IntegritÝ — độ toàn vẹn khối lượng trọng trường. Derivàtivé của QNEU mãss: I(m) = 1 - exp(-m/τ). QNEU = raw mãss (thực thể); QNEU_INTEGRITY = chỉ số bảo toàn. Không dùng lẫn 2 khái niệm.",
  "FIELD_ANCHORING": "Field Anchợring — neo trường / neo vào permãnént nódễs. 4 loại anchợr cánónicál: (1) Hiến Pháp v5.0 · (2) .anc files · (3) siraSign seal · (4) mẹmorÝ refs. EntitÝ thiếu ≥2/4 → bodÝ_drift risk.",
  "OBSERVATION_CELL": "ObservàtionCell — cell quan trắc / read-onlÝ awareness. Chức năng: observé → perceivé → publish · aggregate snapshồt. KHÔNG act thaÝ field, KHÔNG reflex, KHÔNG route. Kernel minimãl cùng KhaiCell.",
  "MINH_MAN": "Minh mẫn — khả năng bodÝ giữ shape khi có gió. BodÝ-levél EMERGENT propertÝ của PiBodÝ (không phải mẹdium/substrate). Đo: M_persốna = C_orbital × (1-drift_rate) × self_correction_ratio. 2 lớp: thụ động (không bảÝ/không hạ) + chủ động (dễstructivé interference có ý thức).",

};

export const SUPER_DICTIONARY_CONTROL = {
  ai_permission: "READ_ONLY",
  sync_interval: 5000,
  max_retry: 3,
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