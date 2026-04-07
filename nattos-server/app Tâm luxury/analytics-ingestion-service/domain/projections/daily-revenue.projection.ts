export interface DailyRevenueProjection{date:string;branchCode?:string;totalRevenue:number;totalOrders:number;grossMargin:number;grossMarginRate:number;newCustomers:number;returnCustomers:number;topSku:string;topSkuRevenue:number;createdAt:number;}
const _store=new Map<string,DailyRevenueProjection>();
export const DailyRevenueProjectionStore={
  upsert:(proj:Omit<DailyRevenueProjection,"createdAt">):void=>{_store.set(`${proj.date}-${proj.branchCode??"ALL"}`,{...proj,createdAt:Date.now()});},
  getByDate:(date:string):DailyRevenueProjection[]=>[..._store.values()].filter(p=>p.date===date),
  getByBranch:(branch:string,from:string,to:string):DailyRevenueProjection[]=>[..._store.values()].filter(p=>p.branchCode===branch&&p.date>=from&&p.date<=to).sort((a,b)=>a.date.localeCompare(b.date)),
  getMonthly:(ym:string)=>{
    const ps=[..._store.values()].filter(p=>p.date.startsWith(ym));
    if(!ps.length)return{totalRevenue:0,totalOrders:0,avgMargin:0};
    return{totalRevenue:ps.reduce((s,p)=>s+p.totalRevenue,0),totalOrders:ps.reduce((s,p)=>s+p.totalOrders,0),avgMargin:ps.reduce((s,p)=>s+p.grossMarginRate,0)/ps.length};
  },
};
