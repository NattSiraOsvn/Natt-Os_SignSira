export interface AIScoringConfig { confidenceThreshold:number; enableOCR:boolean; enableNLP:boolean; language:string; }
export interface DetectedContext { type:string; confidence:number; entities:string[]; rawText:string; }
export const Utilities = { documentAI: { getConfig:():AIScoringConfig=>({ confidenceThreshold:75, enableOCR:true, enableNLP:true, language:"vi" }), setConfig:(_:any)=>{}, detect:async(t:string):Promise<DetectedContext>=>({ type:"INVOICE", confidence:90, entities:[], rawText:t }) } };

// Patch: extend AIScoringConfig với weights + keywords
export interface AIScoringConfigExtended extends AIScoringConfig {
  weights: Record<string, number>;
  keywords: Record<string, string[]>;
}
if (typeof Utilities === "object" && Utilities.documentAI) {
  (Utilities.documentAI as any).updateConfig = (_cfg: any): void => {};
}
