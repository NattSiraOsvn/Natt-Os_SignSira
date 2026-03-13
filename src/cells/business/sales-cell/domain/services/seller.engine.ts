// @ts-nocheck
export interface Seller{id:string;name:string;branchCode:string;commissionRate:number;targetMonthly:number;status:"ACTIVE"|"ON_LEAVE"|"SUSPENDED";}
export interface SellerPerformance{sellerId:string;period:string;totalRevenue:number;totalOrders:number;commissionEarned:number;targetAchievement:number;rank:number;}
const _sellers=new Map<string,Seller>();
const _perfs:SellerPerformance[]=[];
export const SellerEngine={
  register:(data:Omit<Seller,"id"|"status">):Seller=>{
    const s:Seller={...data,id:`SEL-${Date.now()}`,status:"ACTIVE"};
    _sellers.set(s.id,s);return s;
  },
  getAll:():Seller[]=>[..._sellers.values()],
  getActive:():Seller[]=>[..._sellers.values()].filter(s=>s.status==="ACTIVE"),
  getByBranch:(b:string):Seller[]=>[..._sellers.values()].filter(s=>s.branchCode===b),
  calculateCommission:(idOrData:string|any,revenueOrPoints?:number):any=>{
    if(typeof idOrData==="object"){
      const d=idOrData;return Math.round(((d.shellRevenue??0)+(d.stoneRevenue??0))*(d.isReportedWithin24h?0.03:0.02));
    }
    const id=idOrData;const revenue=revenueOrPoints??0;
  },
  recordPerformance:(sellerId:string,period:string,revenue:number,orders:number):SellerPerformance=>{
    const s=_sellers.get(sellerId);
    const perf:SellerPerformance={sellerId,period,totalRevenue:revenue,totalOrders:orders,commissionEarned:s?Math.round(revenue*s.commissionRate):0,targetAchievement:s?(revenue/s.targetMonthly)*100:0,rank:0};
    _perfs.push(perf);return perf;
  },
  getLeaderboard:(period:string):SellerPerformance[]=>_perfs.filter(p=>p.period===period).sort((a,b)=>b.totalRevenue-a.totalRevenue).map((p,i)=>({...p,rank:i+1})),
  suspend:(id:string):void=>{const s=_sellers.get(id);if(s){s.status="SUSPENDED";_sellers.set(id,s);}},
  check24hRule:(timestampOrData:number|any):boolean=>{
    if(typeof timestampOrData==="number")return(Date.now()-timestampOrData)<86_400_000;
    return timestampOrData?.isReportedWithin24h===true;
  },
  isLeadInactive:(lastInteraction:number,thresholdDays=30):boolean=>(Date.now()-lastInteraction)>thresholdDays*86_400_000,
};

// ── Legacy compat ──
;(SellerEngine as any).check24hRule=(data:any):boolean=>{
  if(typeof data==="string")return false;
  return data?.isReportedWithin24h===true;
};
;(SellerEngine as any).isLeadInactive=(leadId:string,daysSince:number):boolean=>daysSince>30;
