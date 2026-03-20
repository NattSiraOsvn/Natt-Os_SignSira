// ============================================================
// NEURAL MAIN CELL — Boundary Rule (Điều 5, thành phần 3)
// ============================================================

export const NEURAL_MAIN_BOUNDARY = {
  // Điều 20: Cấm self-report
  FORBIDDEN: [
    'Nhận input từ SELF_REPORT hoặc PEER_ATTESTATION_ONLY',
    'Ghi node từ AI Entity tự khai báo',
    'Override QNEU score không qua Gatekeeper',
    'Xóa Governance Memory (HARD layer) — bất biến',
    'Export toàn bộ memory không filtered — chỉ export top nodes',
  ],

  // Điều 22
  ALLOWED: [
    'Read audit trail từ audit-cell',
    'Compute permanent nodes từ QNEU engine',
    'Export filtered context cho LLM',
    'Decay Family Memory theo Điều 19',
    'Nhận Gatekeeper override qua GATEKEEPER source',
  ],

  // Chỉ giao tiếp qua SmartLink (Điều 9-10)
  COMMUNICATION: 'SmartLink only — no direct import từ business cells',

  // Layer (Điều 23-25)
  LAYER: 'KERNEL',
  TẦNG: 'A — TRUTH LAYER',
} as const;
