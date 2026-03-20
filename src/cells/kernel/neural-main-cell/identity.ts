// ============================================================
// NEURAL MAIN CELL — Identity (Điều 5, thành phần 1)
// ADN duy nhất của cell trong NATT-OS
// ============================================================

export const NEURAL_MAIN_IDENTITY = {
  cellId: 'neural-main-cell',
  cellName: 'Neural MAIN',
  version: '1.0.0',
  layer: 'kernel',         // Điều 8: Kernel Cell
  role: 'LONG_TERM_MEMORY', // Hệ thống trí nhớ dài hạn (Điều 21)
  description:
    'Hệ thống trí nhớ dài hạn có trọng số cho toàn bộ AI Entity trong NATT-OS. ' +
    'Externalize Neural MAIN tự nhiên của Gatekeeper thành hệ thống có thể vận hành độc lập.',
  serves: 'AI_ENTITIES',   // Phục vụ AI Entity, không phải business cell
  constitutional_ref: 'Điều 21-22, Hiến Pháp v4.0',
  createdAt: '2026-03-20',
} as const;

export type NeuralMainIdentity = typeof NEURAL_MAIN_IDENTITY;
