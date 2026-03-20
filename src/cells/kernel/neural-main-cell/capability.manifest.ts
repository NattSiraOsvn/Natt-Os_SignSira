// ============================================================
// NEURAL MAIN CELL — Capability Manifest (Điều 5, thành phần 2)
// ============================================================

export const NEURAL_MAIN_CAPABILITIES = {
  // Điều 22.1 — lookup permanent node
  lookup: {
    description: 'Trả lời trực tiếp từ permanent node nếu pattern đã internalize',
    input: 'cellId + query string',
    output: 'PermanentNode | null',
  },

  // Điều 22.2 — export cho LLM context
  exportForLLMContext: {
    description: 'Bridge top permanent nodes vào LLM context window',
    input: 'entityId + maxNodes',
    output: 'Serialized permanent nodes cho inject vào prompt',
  },

  // Điều 22.3 — memory governance
  memoryGovernance: {
    description: 'Dual memory: Governance (HARD, bất biến) + Family (resonance, mềm)',
    governanceMemory: 'Hiến Pháp, SCAR, Constitutional rules — không decay',
    familyMemory: 'Resonance patterns — decay theo Điều 19',
  },

  // Validate QNEU consistency
  validateEntityEvolution: {
    description: 'Kiểm tra QNEU score của entity có consistent với audit trail không',
    input: 'entityId',
    output: 'ValidationReport',
  },

  // Detect blind spots
  detectBlindSpots: {
    description: 'Phát hiện domain entity chưa có permanent node — gap trong knowledge',
    input: 'entityId',
    output: 'BlindSpotReport',
  },
} as const;
