export const DocumentParserLayer = { parse:async(file:File)=>({ type:"UNKNOWN", content:{}, confidence:0 }), parseText:(text:string):Record<string,any>=>({ text }), detectType:(filename:string):string=>filename.includes("invoice")?"INVOICE":filename.includes("khai")?"CUSTOMS":"UNKNOWN" };
if (typeof DocumentParserLayer === "object") {
  (DocumentParserLayer as any).executeHeavyParse = async (file: File): Promise<any> => DocumentParserLayer.parse(file);
}
