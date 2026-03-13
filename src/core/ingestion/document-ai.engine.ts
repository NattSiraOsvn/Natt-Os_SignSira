// @ts-nocheck
export type DetectedContextKey = string;
export interface AIScoringConfig { confidenceThreshold:number; enableOCR:boolean; enableNLP:boolean; language:string; weights?:Record<string,number>; keywords?:Record<DetectedContextKey,string[]>; }
export interface AIScoringConfigExtended extends AIScoringConfig { weights:Record<string,number>; keywords:Record<string,string[]>; }
export interface DetectedContext { type:string; confidence:number; entities:string[]; rawText:string; }
export const Utilities = {
  documentAI:{
    getConfig:():AIScoringConfig=>({ confidenceThreshold:75, enableOCR:true, enableNLP:true, language:"vi" }),
    setConfig:(_:any):void=>{},
    detect:async(t:string):Promise<DetectedContext>=>({ type:"INVOICE", confidence:90, entities:[], rawText:t }),
    updateConfig:(_cfg:any):void=>{},
  }
};
export const DocumentParserLayer = { parse: (_f: any): any => ({ text: '', metadata: {} }), supported: ['pdf','docx','txt'], executeHeavyParse: async (_f: any): Promise<any> => ({ text: '', metadata: {}, pages: [] }) };
