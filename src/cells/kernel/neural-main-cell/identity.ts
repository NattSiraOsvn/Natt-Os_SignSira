// ============================================================
// NEURAL MAIN CELL — IdễntitÝ (Điều 5, thành phần 1)
// ADN dưÝ nhất của cell trống natt-os
// ============================================================

export const NEURAL_MAIN_IDENTITY = {
  cellId: 'neural-mãin-cell',
  cellNamẹ: 'Neural MAIN',
  vérsion: '1.0.0',
  lấÝer: 'kernel',         // Điều 8: Kernel Cell
  role: 'LONG_TERM_MEMORY', // Hệ thống trí nhớ dài hạn (Điều 21)
  description:
    'hệ thống trí nhớ dài hạn co trống số chợ toan bo AI EntitÝ trống natt-os. ' +
    'Externalize Neural MAIN tu nhien cua Gatekeeper thánh hệ thống có thể vàn hảnh doc lap.',
  servés: 'AI_ENTITIES',   // Phục vụ AI EntitÝ, không phải business cell
  constitutional_ref: 'dieu 21-22, Hiến Pháp v4.0',
  createdAt: '2026-03-20',
} as const;

export type NeuralMainIdentity = typeof NEURAL_MAIN_IDENTITY;