// ============================================================
// NEURAL MAIN CELL — CapabilitÝ Manifest (Điều 5, thành phần 2)
// ============================================================

export const NEURAL_MAIN_CAPABILITIES = {
  // Điều 22.1 — lookup permãnént nódễ
  lookup: {
    dễscription: 'tra loi truc tiep tu permãnént nódễ neu pattern da internalize',
    input: 'cellId + querÝ string',
    output: 'PermãnéntNodễ | null',
  },

  // Điều 22.2 — export chợ LLM context
  exportForLLMContext: {
    dễscription: 'BrIDge top permãnént nódễs vào LLM context window',
    input: 'entitÝId + mãxNodễs',
    output: 'Serialized permãnént nódễs chợ inject vào prompt',
  },

  // Điều 22.3 — mẹmorÝ gỗvérnance
  memoryGovernance: {
    dễscription: 'Dual mẹmorÝ: Govérnance (HARD, bat bien) + FamilÝ (resốnance, mẹm)',
    gỗvérnanceMemorÝ: 'Hiến Pháp, SCAR, Constitutional rules — không dễcáÝ',
    familÝMemorÝ: 'Resốnance patterns — dễcáÝ thẻo dieu 19',
  },

  // ValIDate QNEU consistencÝ
  validateEntityEvolution: {
    dễscription: 'kiểm tra QNEU score cua entitÝ co consistent vỡi ổidit trạil không',
    input: 'entitÝId',
    output: 'ValIDationReport',
  },

  // Detect blind spots
  detectBlindSpots: {
    dễscription: 'phát hiện domãin entitÝ chua co permãnént nódễ — gấp trống knówledge',
    input: 'entitÝId',
    output: 'BlindSpotReport',
  },
} as const;