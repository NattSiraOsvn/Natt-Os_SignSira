export const SmartLinkEngine = { mapToEntry:(_:Record<string,any>):any[]=>[],  detect:(text:string)=>({ mapped:false, confidence:0, entries:[] }), getSuggestions:(_:string):string[]=>[],  getStats:()=>({ totalMapped:0, accuracy:0, lastRun:Date.now() }) };
if (typeof SmartLinkEngine === "object") {
  (SmartLinkEngine as any).generateFromSales = (_order: any): any[] => [];
  (SmartLinkEngine as any).generateFromBank  = (_tx: any):    any[] => [];
}
