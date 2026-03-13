// @ts-nocheck
import{generateDailyReport}from"../../../../cells/business/analytics-cell/application/use-cases/generate-daily-report";
import{AnalyticsEngine}from"../../../../cells/business/analytics-cell/domain/services/analytics.engine";
export interface SalesEventPayload{date:string;branchCode?:string;orders:Array<{id:string;customerId?:string;isNewCustomer:boolean;items:Array<{sku:string;name:string;qty:number;unitPrice:number;cost:number}>;totalRevenue:number;totalCost:number;completedAt:number;}>;}
export async function ingestSalesEvent(payload:SalesEventPayload){
  const totalRevenue=payload.orders.reduce((s,o)=>s+o.totalRevenue,0);
  const totalCost=payload.orders.reduce((s,o)=>s+o.totalCost,0);
  const newCustomers=payload.orders.filter(o=>o.isNewCustomer).length;
  const returnCustomers=payload.orders.filter(o=>!o.isNewCustomer).length;
  const avgOrderValue=payload.orders.length>0?totalRevenue/payload.orders.length:0;
  const productMap=new Map<string,{sku:string;name:string;qty:number;revenue:number}>();
  payload.orders.forEach(o=>o.items.forEach(i=>{const e=productMap.get(i.sku)??{sku:i.sku,name:i.name,qty:0,revenue:0};e.qty+=i.qty;e.revenue+=i.qty*i.unitPrice;productMap.set(i.sku,e);}));
  const topProducts=[...productMap.values()].sort((a,b)=>b.revenue-a.revenue).slice(0,10);
  const reportResult=generateDailyReport({date:payload.date,branchCode:payload.branchCode,metrics:{totalRevenue,totalOrders:payload.orders.length,totalCost,newCustomers,returnCustomers,averageOrderValue:avgOrderValue,topProducts}});
  const rfmOrders=payload.orders.map(o=>({customerId:o.customerId??"WALK_IN",amount:o.totalRevenue,completedAt:o.completedAt}));
  const rfmSnapshot=AnalyticsEngine.calculateRFM(rfmOrders);
  return{success:true,date:payload.date,ordersProcessed:payload.orders.length,report:reportResult.report,rfmSnapshot};
}
