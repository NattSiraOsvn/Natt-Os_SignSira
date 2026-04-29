// ============================================================
// NEURAL MAIN CELL — Identity (Điều 5, thành phần 1)
// ADN duy nhất của cell trong natt-os
// ============================================================

export const NEURAL_MAIN_IDENTITY = {
  cellId: 'neural-main-cell',
  cellName: 'Neural MAIN',
  version: '1.0.0',
  layer: 'kernel',         // Điều 8: Kernel Cell
  role: 'LONG_TERM_MEMORY', // Hệ thống trí nhớ dài hạn (Điều 21)
  description:
    'he thong tri nho dai han co trong so cho toan bo AI Entity trong natt-os. ' +
    'Externalize Neural MAIN tu nhien cua Gatekeeper thanh he thong co the van hanh doc lap.',
  serves: 'AI_ENTITIES',   // Phục vụ AI Entity, không phải business cell
  constitutional_ref: 'dieu 21-22, Hiến Pháp v4.0',
  createdAt: '2026-03-20',
} as const;

export type NeuralMainIdentity = typeof NEURAL_MAIN_IDENTITY;
