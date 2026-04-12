export interface GeminiResponse {
  text: string;
  citations?: string[];
  suggestedActions?: string[];
  isThinking?: boolean;
}

export const generatePersonaResponse = async (
  p: string, q: string,
  options?: { history?: any[]; useThinking?: boolean; useMaps?: boolean; file?: { data: string; mimeType: string } }
): Promise<GeminiResponse> => ({
  text: `[${p}] ${q.slice(0, 80)}`,
  citations: [],
  suggestedActions: [],
});

export const generateBlueprint   = async (d: string): Promise<string> => `# Blueprint\n${d}`;
export const speakText            = async (t: string) => {
  if ("speechSynthesis" in window) { const u = new SpeechSynthesisUtterance(t); u.lang = "vi"; window.speechSynthesis.speak(u); }
};
export const requestApiKey        = (): string | null => null;
export const extractGuarantyData  = async (_: string, _m?: string): Promise<any> => ({});
export const extractCCCDData      = async (_: string, _m?: string): Promise<any> => ({});
export const generateIdentityHash = (_d: any): string => '00000000000000000000000000000000';
export const generatePatentContent= async (c: string): Promise<string> => `# Patent\n${c}`;
