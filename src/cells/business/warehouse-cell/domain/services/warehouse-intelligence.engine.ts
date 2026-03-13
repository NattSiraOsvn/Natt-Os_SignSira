// @ts-nocheck
export interface AllocationPlan { itemId:string; location:string; quantity:number; priority:number; transfers?:any[]; }
export interface WarehouseIntelligence { utilizationRate:number; hotZones:string[]; reorderAlerts:string[]; forecast:Record<string,number>; hcm?:any; hanoi?:any; recommendations?:any[]; }
export const WarehouseEngine = {
  getAllItems:():any[]=>[], items:[] as any[],
  allocate:(items:any[]):AllocationPlan[]=>items.map((i:any)=>({ itemId:i.id, location:"WH-A1", quantity:i.quantity??0, priority:1 })),
  getIntelligence:():WarehouseIntelligence=>({ utilizationRate:0.72, hotZones:["WH-A1","WH-B3"], reorderAlerts:[], forecast:{}, hcm:{utilization:72,turnover:4.2,costPerSku:250000,efficiency:85}, hanoi:{utilization:45,turnover:2.8,costPerSku:310000,efficiency:71}, recommendations:[] }),
  move:(_i:string,_f:string,_t:string):void=>{}, getLocations:():any[]=>[], 
  getWarehouseIntelligence:():WarehouseIntelligence=>WarehouseEngine.getIntelligence(),
  optimizeInventoryAllocation:async():Promise<any>=>({ transfers:[], plans:[] }),
};
