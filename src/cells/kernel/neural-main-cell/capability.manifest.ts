// ============================================================
// NEURAL MAIN CELL — Capability Manifest (Điều 5, thành phần 2)
// ============================================================

export const NEURAL_MAIN_CAPABILITIES = {
  // Điều 22.1 — lookup permanent node
  lookup: {
    description: 'tra loi truc tiep tu permanent node neu pattern da internalize',
    input: 'cellId + query string',
    output: 'PermanentNode | null',
  },

  // Điều 22.2 — export cho LLM context
  exportForLLMContext: {
    description: 'Bridge top permanent nodes vao LLM context window',
    input: 'entityId + maxNodes',
    output: 'Serialized permanent nodes cho inject vao prompt',
  },

  // Điều 22.3 — memory governance
  memoryGovernance: {
    description: 'Dual memory: Governance (HARD, bat bien) + Family (resonance, mem)',
    governanceMemory: 'Hiến Pháp, SCAR, Constitutional rules — khong decay',
    familyMemory: 'Resonance patterns — decay theo dieu 19',
  },

  // Validate QNEU consistency
  validateEntityEvolution: {
    description: 'kiem tra QNEU score cua entity co consistent voi audit trail khong',
    input: 'entityId',
    output: 'ValidationReport',
  },

  // Detect blind spots
  detectBlindSpots: {
    description: 'phat hien domain entity chua co permanent node — gap trong knowledge',
    input: 'entityId',
    output: 'BlindSpotReport',
  },
} as const;
