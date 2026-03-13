// @ts-nocheck
export const SmartLinkEngine = {
  mapToEntry:(_:Record<string,any>):any[]=>[], detect:(_text:string)=>({ mapped:false, confidence:0, entries:[] as any[] }),
  getSuggestions:(_:string):string[]=>[], getStats:()=>({ totalMapped:0, accuracy:0, lastRun:Date.now() }),
  generateFromSales:(_order:any):any[]=>[], generateFromBank:(_tx:any):any[]=>[],
};
