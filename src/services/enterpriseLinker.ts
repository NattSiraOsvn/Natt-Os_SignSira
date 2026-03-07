export interface AggregatedReport { id:string; period:string; modules:string[]; data:Record<string,any>; generatedAt:number; records?:any[]; }
export const EnterpriseLinker = {
  aggregate:async(modules:string[],period:string):Promise<AggregatedReport>=>({ id:`RPT-${Date.now()}`, period, modules, data:{}, generatedAt:Date.now() }),
  linkCells:(_f:string,_t:string,_e:string):void=>{}, getLinkedData:(_:string):any[]=>[], 
  buildConsolidatedReport:async(year:number):Promise<AggregatedReport>=>({ id:`ANNUAL-${year}`, period:String(year), modules:[], data:{}, generatedAt:Date.now() }),
  generateMultiDimensionalReport:async(_period:string):Promise<AggregatedReport>=>({ id:`MDR-${Date.now()}`, period:_period, modules:[], data:{}, generatedAt:Date.now(), records:[] }),
};
