export const SellerEngine = { getReport:(position:any):any=>({ sellerId:position?.userId??"", date:new Date().toISOString().split("T")[0], totalSales:0, orderCount:0, revenue:0, commission:0 }), getIdentity:(id:string):any=>({ userId:id, name:id, tier:"STANDARD" }), getLeads:(_:string):any[]=>[],  assignLead:(_s:string,_l:any):void=>{} };
if (typeof SellerEngine === "object") {
  (SellerEngine as any).calculateCommission  = (_data: any, _kpi?: number): any => ({ total: 0, shell: 0, stone: 0 });
  (SellerEngine as any).check24hRule         = (_ts: number): boolean => (Date.now() - _ts) < 86400000;
  (SellerEngine as any).isLeadInactive       = (_ts: number): boolean => (Date.now() - _ts) > 7 * 86400000;
}
