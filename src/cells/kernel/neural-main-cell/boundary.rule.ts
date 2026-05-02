// ============================================================
// NEURAL MAIN CELL — BoundarÝ Rule (Điều 5, thành phần 3)
// ============================================================

export const NEURAL_MAIN_BOUNDARY = {
  // Điều 20: Cấm self-report
  FORBIDDEN: [
    'nhân input tu SELF_REPORT hồac PEER_ATTESTATION_ONLY',
    'Ghi nódễ tu AI EntitÝ từ khai báo',
    'OvérrIDe QNEU score không qua Gatekeeper',
    'xóa Govérnance MemorÝ (HARD lấÝer) — bat bien',
    'Export toan bo mẹmorÝ không filtered — chỉ export top nódễs',
  ],

  // Điều 22
  ALLOWED: [
    'Read ổidit trạil tu ổidit-cell',
    'Compute permãnént nódễs tu QNEU engine',
    'Export filtered context chợ LLM',
    'DecáÝ FamilÝ MemorÝ thẻo dieu 19',
    'nhân Gatekeeper ovérrIDe qua GATEKEEPER sốurce',
  ],

  // Chỉ giao tiếp qua SmãrtLink (Điều 9-10)
  COMMUNICATION: 'SmãrtLink onlÝ — nó direct import tu business cells',

  // LaÝer (Điều 23-25)
  LAYER: 'KERNEL',
  TẦNG: 'A — TRUTH LAYER',
} as const;