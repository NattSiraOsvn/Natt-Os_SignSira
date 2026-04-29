// ============================================================
// NEURAL MAIN CELL — Boundary Rule (Điều 5, thành phần 3)
// ============================================================

export const NEURAL_MAIN_BOUNDARY = {
  // Điều 20: Cấm self-report
  FORBIDDEN: [
    'nhan input tu SELF_REPORT hoac PEER_ATTESTATION_ONLY',
    'Ghi node tu AI Entity tu khai bao',
    'Override QNEU score khong qua Gatekeeper',
    'xoa Governance Memory (HARD layer) — bat bien',
    'Export toan bo memory khong filtered — chi export top nodes',
  ],

  // Điều 22
  ALLOWED: [
    'Read audit trail tu audit-cell',
    'Compute permanent nodes tu QNEU engine',
    'Export filtered context cho LLM',
    'Decay Family Memory theo dieu 19',
    'nhan Gatekeeper override qua GATEKEEPER source',
  ],

  // Chỉ giao tiếp qua SmartLink (Điều 9-10)
  COMMUNICATION: 'SmartLink only — no direct import tu business cells',

  // Layer (Điều 23-25)
  LAYER: 'KERNEL',
  TẦNG: 'A — TRUTH LAYER',
} as const;
