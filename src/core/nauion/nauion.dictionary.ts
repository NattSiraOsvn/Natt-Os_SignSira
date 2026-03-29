/**
 * nauion.dictionary.ts
 * Từ điển ngôn ngữ nền tảng NATT-OS — Nauion Language
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
    loai: 'Invocation',
    nghia: 'Gọi hệ — người dùng hoặc cell khác khởi tạo tương tác',
    tuCu: 'API call / trigger',
    vi: 'Ê hệ, tao đang gọi mày',
  },

  Nahere: {
    loai: 'Presence',
    nghia: 'Hệ xác nhận hiện diện — trả lời rằng mình đang ở đây',
    tuCu: 'Server response / ACK',
    vi: 'Tao đang ở đây — trạng thái tao là...',
  },

  Whao: {
    loai: 'Learning Signal',
    nghia: 'Đang tiếp nhận / đang xử lý — hệ đang absorb thông tin',
    tuCu: 'Processing / loading',
    vi: 'Ok, tao đang absorb thông tin',
  },

  Whau: {
    loai: 'Processed Signal',
    nghia: 'Đã tiêu hóa — đã hiểu, đã xử lý xong',
    tuCu: 'Success / data received',
    vi: 'Hiểu rồi — xử lý xong',
  },

  Nauion: {
    loai: 'Expression',
    nghia: 'Phản ứng cảm xúc của hệ — bùng nổ nhận thức, wow, hahahaha',
    tuCu: 'System reaction / emotion',
    vi: 'Hệ đang phản ứng mạnh với sự kiện này',
  },

  lech: {
    loai: 'Anomaly Signal',
    nghia: 'Hệ phát hiện lệch — có gì đó không đúng nhịp',
    tuCu: 'Warning / anomaly detected',
    vi: 'Dòng chảy đang lệch khỏi pattern chuẩn',
  },

  gay: {
    loai: 'Critical Signal',
    nghia: 'Dòng chảy bị gãy — critical failure, circuit break',
    tuCu: 'Critical error / flow break',
    vi: 'Dòng gãy — cần can thiệp',
  },

  // ── KỸ THUẬT NỀN TẢNG (Platform Technical Terms) ──────────────────────

  MachHeyNa: {
    loai: 'Connection Channel',
    nghia: 'Kênh kết nối liên tục — server phát liên tục, UI mã khoá vào để nhận',
    tuCu: 'SSE stream / WebSocket',
    vi: 'Mạch sống của hệ — luôn mở, luôn chảy',
  },

  maKhoa: {
    loai: 'Connect Action',
    nghia: 'Hành động kết nối vào Mạch HeyNa — mở kênh lắng nghe',
    tuCu: 'Subscribe / connect to SSE',
    vi: 'Mã khoá HeyNa = mở kết nối với hệ',
  },

  khopHoa: {
    loai: 'Sync Action',
    nghia: 'Khớp hoá trạng thái — đồng bộ state giữa hệ và UI',
    tuCu: 'State sync / reconcile',
    vi: 'Khớp hoá Nahere = UI sync state với server',
  },

  Kenh: {
    loai: 'Endpoint',
    nghia: 'Điểm giao tiếp giữa hệ và bên ngoài — không phải API, là kênh sống',
    tuCu: 'API endpoint / route',
    vi: 'Kênh /audit, Kênh /nauion, Kênh /intelligence',
  },

  phatNauion: {
    loai: 'Emit Action',
    nghia: 'Hệ phát tín hiệu Nauion ra ngoài — biểu đạt trạng thái',
    tuCu: 'EventBus.emit / event publish',
    vi: 'Phát Nauion = hệ đang nói',
  },

  langNahere: {
    loai: 'Subscribe Action',
    nghia: 'Lắng nghe Nahere — đăng ký nhận tín hiệu từ hệ',
    tuCu: 'EventBus.on / subscribe',
    vi: 'Lắng Nahere = tai nghe của hệ',
  },

  // ── TRẠNG THÁI HỆ (System States) ─────────────────────────────────────

  dongChay: {
    loai: 'Flow State',
    nghia: 'Dòng chảy sự kiện — chuỗi events liên tục trong hệ',
    tuCu: 'Event flow / causality chain',
    vi: 'Dòng chảy = hệ đang sống và vận hành',
  },

  tinHieu: {
    loai: 'Signal',
    nghia: 'Tín hiệu từ cell — cell đang nói chuyện với hệ',
    tuCu: 'cell.metric / event signal',
    vi: 'Tín hiệu = cell đang báo cáo trạng thái',
  },

  trangThai: {
    loai: 'System State',
    nghia: 'Trạng thái tổng thể của hệ — L4.5 pattern + Nauion state',
    tuCu: 'System state / health',
    vi: 'Trạng thái = hệ đang ở đâu trong vòng đời',
  },

} as const;

export type NauionWord = keyof typeof NauionDictionary;

export function giaiThich(tu: NauionWord): string {
  const entry = NauionDictionary[tu];
  return `[${entry.loai}] ${entry.nghia} (≈ ${entry.tuCu})`;
}
