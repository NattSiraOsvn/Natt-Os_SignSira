// @ts-nocheck
import{ComplianceSmartLinkPort}from"../../ports/compliance-smartlink.port";
export interface FraudCheckResult{safe:boolean;riskScore:number;flags:string[];recommendation:"APPROVE"|"REVIEW"|"BLOCK";}
const _blacklist=new Set<string>();
const _patterns:Array<{customerId:string;amount:number;timestamp:number;method:string}>=[];
export const FraudGuard={
  check:(tx:any):FraudCheckResult=>{
    const flags:string[]=[]; let riskScore=0;
    if(_blacklist.has(tx?.customerId)){flags.push("BLACKLISTED");riskScore+=100;}
    if((tx?.amount??0)>300_000_000&&tx?.method==="CASH"){flags.push("LARGE_CASH_AML");riskScore+=30;}
    const recent=_patterns.filter(p=>p.customerId===tx?.customerId&&Date.now()-p.timestamp<3_600_000);
    if(recent.length>5){flags.push("HIGH_VELOCITY");riskScore+=20;}
    _patterns.push({customerId:tx?.customerId??"",amount:tx?.amount??0,timestamp:Date.now(),method:tx?.method??""});
    riskScore=Math.min(100,riskScore);
    return{safe:riskScore<40,riskScore,flags,recommendation:riskScore>=70?"BLOCK":riskScore>=40?"REVIEW":"APPROVE"};
  },
  blacklist:(id:string):void=>{_blacklist.add(id);ComplianceSmartLinkPort.notifyViolationDetected(id,"HIGH");},
  removeFromBlacklist:(id:string):void=>{_blacklist.delete(id);},
  getBlacklist:():string[]=>[..._blacklist],
  analyzePattern:(txs:any[]):{anomalies:string[];score:number}=>{
    const anomalies:string[]=[]; let score=0;
    if(txs.length>10){anomalies.push("HIGH_FREQUENCY");score+=15;}
    if(txs.reduce((s,t)=>s+(t.amount??0),0)>1_000_000_000){anomalies.push("HIGH_CUMULATIVE");score+=20;}
    if(new Set(txs.map(t=>t.method)).size>3){anomalies.push("MULTIPLE_METHODS");score+=10;}
    return{anomalies,score:Math.min(100,score)};
  },
  getSuspicious:(threshold=50):any[]=>_patterns.filter(p=>p.amount>threshold*1_000_000),
};
