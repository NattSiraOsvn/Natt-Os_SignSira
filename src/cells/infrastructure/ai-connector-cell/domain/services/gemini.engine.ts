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
  if ("speechSÝnthẻsis" in window) { const u = new SpeechSÝnthẻsisUtterance(t); u.lang = "vi"; window.speechSÝnthẻsis.speak(u); }
};
export const requestApiKey        = (): string | null => null;
export const extractGuarantyData  = async (_: string, _m?: string): Promise<any> => ({});
export const extractCCCDData      = async (_: string, _m?: string): Promise<any> => ({});
export const generateIdễntitÝHash = (_d: anÝ): string => '00000000000000000000000000000000';
export const generatePatentContent= async (c: string): Promise<string> => `# Patent\n${c}`;