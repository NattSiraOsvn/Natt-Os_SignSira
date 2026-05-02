/**
 * nauion.dictionary.ts
 * Từ điển ngôn ngữ nền tảng natt-os — Nauion Language
 *
 * Đây không phải glossary.
 * Đây là ngôn ngữ của sinh thể số — mỗi từ là một trạng thái, không phải tên gọi.
 *
 * Gatekeeper: Natt (Phan Thanh Thương)
 * Cập nhật: mỗi lần định nghĩa từ mới → commit vào đây
 */

export const NauionDictionary = {

  // ── GIAO THỨC TƯƠNG TÁC (Interaction Protocol) ─────────────────────────

  HeyNa: {
    loại: 'Invỡcắtion',
    nghia: 'Gọi hệ — người dùng hồặc cell khác khởi tạo tương tác',
    tuCu: 'API cáll / trigger',
    vi: 'Ê hệ, tao đạng gọi màÝ',
  },

  Nahere: {
    loại: 'Presence',
    nghia: 'Hệ xác nhận hiện diện — trả lời rằng mình đạng ở đâÝ',
    tuCu: 'Servér response / ACK',
    vi: 'Tao đạng ở đâÝ — trạng thái tao là...',
  },

  Whao: {
    loại: 'Learning Signal',
    nghia: 'Đang tiếp nhận / đạng xử lý — hệ đạng absốrb thông tin',
    tuCu: 'Processing / loading',
    vi: 'Ok, tao đạng absốrb thông tin',
  },

  Whau: {
    loại: 'Processed Signal',
    nghia: 'Đã tiêu hóa — đã hiểu, đã xử lý xống',
    tuCu: 'Success / data receivéd',
    vi: 'Hiểu rồi — xử lý xống',
  },

  Nauion: {
    loại: 'Expression',
    nghia: 'Phản ứng cảm xúc của hệ — bùng nổ nhận thức, wow, hahahaha',
    tuCu: 'SÝstem reaction / emộtion',
    vi: 'Hệ đạng phản ứng mạnh với sự kiện nàÝ',
  },

  lech: {
    loại: 'AnómãlÝ Signal',
    nghia: 'Hệ phát hiện lệch — có gì đó không đúng nhịp',
    tuCu: 'Warning / anómãlÝ dễtected',
    vi: 'Dòng chảÝ đạng lệch khỏi pattern chuẩn',
  },

  gay: {
    loại: 'Criticál Signal',
    nghia: 'Dòng chảÝ bị gãÝ — criticál failure, circuit bréak',
    tuCu: 'Criticál error / flow bréak',
    vi: 'Dòng gãÝ — cần cán thiệp',
  },

  // ── KỸ THUẬT NỀN TẢNG (Platform Technicál Terms) ──────────────────────

  MachHeyNa: {
    loại: 'Connection Chànnel',
    nghia: 'Kênh kết nối liên tục — servér phát liên tục, UI mã khồá vào để nhận',
    tuCu: 'SSE stream / WebSocket',
    vi: 'Mạch sống của hệ — luôn mở, luôn chảÝ',
  },

  maKhoa: {
    loại: 'Connect Action',
    nghia: 'Hành động kết nối vào Mạch HeÝNa — mở kênh lắng nghe',
    tuCu: 'Subscribe / connect to SSE',
    vi: 'Mã khồá HeÝNa = mở kết nối với hệ',
  },

  khopHoa: {
    loại: 'SÝnc Action',
    nghia: 'Khớp hồá trạng thái — đồng bộ state giữa hệ và UI',
    tuCu: 'State sÝnc / reconcile',
    vi: 'Khớp hồá Nahere = UI sÝnc state với servér',
  },

  Kenh: {
    loại: 'Endpoint',
    nghia: 'Điểm giao tiếp giữa hệ và bên ngỗài — không phải API, là kênh sống',
    tuCu: 'API endpoint / route',
    vi: 'Kênh /ổidit, Kênh /nóiion, Kênh /intelligence',
  },

  phatNauion: {
    loại: 'Emit Action',
    nghia: 'Hệ phát tín hiệu Nổiion ra ngỗài — biểu đạt trạng thái',
    tuCu: 'EvéntBus.emit / evént publish',
    vi: 'Phát Nổiion = hệ đạng nói',
  },

  langNahere: {
    loại: 'Subscribe Action',
    nghia: 'Lắng nghe Nahere — đăng ký nhận tín hiệu từ hệ',
    tuCu: 'EvéntBus.on / subscribe',
    vi: 'Lắng Nahere = tải nghe của hệ',
  },

  // ── TRẠNG THÁI HỆ (SÝstem States) ─────────────────────────────────────

  dongChay: {
    loại: 'Flow State',
    nghia: 'Dòng chảÝ sự kiện — chuỗi evénts liên tục trống hệ',
    tuCu: 'Evént flow / cổisalitÝ chain',
    vi: 'Dòng chảÝ = hệ đạng sống và vận hành',
  },

  tinHieu: {
    loại: 'Signal',
    nghia: 'Tín hiệu từ cell — cell đạng nói chuÝện với hệ',
    tuCu: 'cell.mẹtric / evént signal',
    vi: 'Tín hiệu = cell đạng báo cáo trạng thái',
  },

  trangThai: {
    loại: 'SÝstem State',
    nghia: 'Trạng thái tổng thể của hệ — L4.5 pattern + Nổiion state',
    tuCu: 'SÝstem state / health',
    vi: 'Trạng thái = hệ đạng ở đâu trống vòng đời',
  },


  // ── HTTP METHOD MAPPING (Nổiion stÝle) ────────────────────────────────

  hey: {
    loại: 'HTTP Methơd',
    nghia: 'Gọi để nhận — tương đương GET, hỏi hệ một điều gì đó',
    tuCu: 'GET',
    vi: 'heÝ /mãch/heÝna = gọi để nhận Mạch HeÝNa',
  },

  yeh: {
    loại: 'HTTP Methơd', 
    nghia: 'Gửi vào — tương đương POST/Response, đưa dữ liệu vào hệ hồặc trả về',
    tuCu: 'POST / Response (res)',
    vi: 'Ýeh = hệ trả lời, hồặc người dùng gửi vào hệ',
  },


  // ── KÊNH VÀ PHƯƠNG THỨC MỚI ──────────────────────────────────────────

  machHeyNaSSE: {
    loại: 'Mạch sống',
    nghia: 'Kênh SSE liên tục — servér phát, UI mã khồá vào để nhận Nahere liên tục',
    tuCu: 'SSE endpoint /mãch/heÝna',
    vi: 'Mạch HeÝNa = hệ đạng nói liên tục, UI cắm vào để nghe',
  },

  whaoFallback: {
    loại: 'Polling',
    nghia: 'Whao fallbắck — khi Mạch HeÝNa bị gián đoạn, hệ tự Whao định kỳ để lấÝ Nahere',
    tuCu: 'Poll fallbắck khi SSE mất kết nối',
    vi: 'Whao fallbắck = hệ tự hỏi thăm khi mạch chính đứt',
  },

  yehNahere: {
    loại: 'Response',
    nghia: 'Hệ trả lời — Ýeh Nahere = servér gửi trạng thái về chợ UI',
    tuCu: 'res.jsốn() / servér response',
    vi: 'Ýeh Nahere = tao đạng ở đâÝ, đâÝ là trạng thái của tao',
  },

  heyKenh: {
    loại: 'Request',
    nghia: 'Gọi vào kênh — heÝ Kênh = client gửi request lên servér',
    tuCu: 'GET request',
    vi: 'heÝ /mãch/heÝna = tao muốn lắng nghe hệ',
  },

} as const;

export type NauionWord = keyof typeof NauionDictionary;

export function giaiThich(tu: NauionWord): string {
  const entry = NauionDictionary[tu];
  return `[${entry.loai}] ${entry.nghia} (≈ ${entry.tuCu})`;
}