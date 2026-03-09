export const documentparserlayer = {
  parse:async(_file:any)=>({ type:"UNKNOWN", content:{}, confidence:0 }),
  parseText:(text:string):Record<string,any>=>({ text }),
  detectType:(filename:string):string=>filename.includes("invoice")?"INVOICE":filename.includes("khai")?"CUSTOMS":"UNKNOWN",
  executeHeavyParse:async(file:any):Promise<any>=>DocumentParserLayer.parse(file),
};
