// geminiService.ts — STUBBED
// LỆNH #001: Cấm gọi Gemini trực tiếp — vi phạm Hiến Pháp Điều 4
// Dùng ai-connector-cell qua EventBus thay thế

export const generatePersonaResponse = async (p: string, q: string, _opts?: any) =>
  ({ text: `[${p}] ${q.slice(0, 80)}`, citations: [], suggestedActions: [] });

export const speakText = async (t: string) => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    const u = new SpeechSynthesisUtterance(t);
    u.lang = 'vi';
    window.speechSynthesis.speak(u);
  }
};

export const requestApiKey = async () => null;
export const extractGuarantyData = async (_data: any, _mimeType?: string): Promise<any> => ({});
export const extractCCCDData = async (_data: any, _mimeType?: string): Promise<any> => ({});
export const generateIdentityHash = (_: any) => '';
