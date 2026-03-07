export interface AllocationPlan { itemId:string; location:string; quantity:number; priority:number; }
export interface WarehouseIntelligence { utilizationRate:number; hotZones:string[]; reorderAlerts:string[]; forecast:Record<string,number>; }
export const WarehouseEngine = { getAllItems:():any[]=>[],  allocate:(items:any[]):AllocationPlan[]=>items.map(i=>({ itemId:i.id, location:"WH-A1", quantity:i.quantity??0, priority:1 })), getIntelligence:():WarehouseIntelligence=>({ utilizationRate:0.72, hotZones:["WH-A1","WH-B3"], reorderAlerts:[], forecast:{} }), move:(_i:string,_f:string,_t:string):void=>{}, getLocations:():any[]=>[],  };
if (typeof WarehouseEngine === "object") {
  (WarehouseEngine as any).items = [];
  (WarehouseEngine as any).getWarehouseIntelligence = (): any =>
    ({ ...WarehouseEngine.getIntelligence(), hcm: { utilization:72, turnover:4.2, costPerSku:250000, efficiency:85 }, hanoi: { utilization:45, turnover:2.8, costPerSku:310000, efficiency:71 }, recommendations: [] });
  (WarehouseEngine as any).optimizeInventoryAllocation = async (): Promise<any> =>
    ({ transfers: [], ...WarehouseEngine.allocate([]) });
}
