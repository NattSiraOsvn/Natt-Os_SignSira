import { SalesSmartLinkPort } from "../../ports/sales-smartlink.port";
export const SalesCore = {
  generateEntries:(_:any):any[]=>[], calculateTax:(amount:number,rate=0.1):number=>amount*rate,
  applyDiscount:(amount:number,discount:number):number=>amount*(1-discount),
  getAggregated:(period:string)=>({ revenue:0, cost:0, profit:0, period }),
  createSalesOrder:(data:any,..._rest:any[]):any=>{ const o={ id:`ORD-${Date.now()}`, ...data, status:"PENDING" }; SalesSmartLinkPort.notifyOrderCreated(o.id, o.amount??0); return o; },
};
