// aiEngine.ts — STUBBED
// LỆNH #001: Cấm gọi Gemini trực tiếp
export const aiEngine = {
  analyze: async (i: string) => ({ result: i.slice(0, 50), confidence: 85 }),
  generate: async (p: string) => `Generated: ${p.slice(0, 50)}`,
  getModelVersion: () => 'NATT-AI-v2.0',
};
