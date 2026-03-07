export interface LogisticsSolution { provider:string; estimatedDays:number; cost:number; trackingId?:string; }
export const LogisticsCore = {
  calculateShipping:(from:string,to:string,weight:number):LogisticsSolution[]=>[ {provider:"GHN",estimatedDays:1,cost:weight*15000}, {provider:"GHTK",estimatedDays:2,cost:weight*12000} ],
  createTransferOrder:(from:string,to:string,items:any[])=>({ id:`TO-${Date.now()}`, from, to, items, status:"PENDING", createdAt:Date.now() }),
  trackOrder:(id:string)=>({ trackingId:id, status:"IN_TRANSIT", eta:"2 ngày" }),
};
if (typeof LogisticsCore === "object") {
  (LogisticsCore as any).selectOptimalLogistics  = async (_data: any): Promise<any[]> => LogisticsCore.calculateShipping("HCM","HN",1);
  (LogisticsCore as any).createInternalTransfer  = async (_from: string, _to: string, _items: any[]): Promise<any> =>
    LogisticsCore.createTransferOrder(_from, _to, _items);
}
