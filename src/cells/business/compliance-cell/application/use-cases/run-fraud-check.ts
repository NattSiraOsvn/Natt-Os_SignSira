// @ts-nocheck
import{FraudGuard}from"../../domain/services/fraud-guard.engine";
export interface RunFraudCheckInput{transactionId:string;customerId:string;amount:number;method:string;previousTransactions?:Array<{amount:number;timestamp:number;method:string}>;}
export interface RunFraudCheckResult{safe:boolean;riskScore:number;flags:string[];recommendation:"APPROVE"|"REVIEW"|"BLOCK";requiresManualReview:boolean;}
export function runFraudCheck(input:RunFraudCheckInput):RunFraudCheckResult{
  const result=FraudGuard.check(input);const flags=[...result.flags];let riskScore=result.riskScore;
  if(input.previousTransactions){const last1hr=input.previousTransactions.filter(t=>Date.now()-t.timestamp<3_600_000);if(last1hr.length>5){flags.push("HIGH_VELOCITY");riskScore+=20;}const total=last1hr.reduce((s,t)=>s+t.amount,0);if(total+input.amount>100_000_000){flags.push("LARGE_CUMULATIVE");riskScore+=15;}}
  if(input.amount>300_000_000&&input.method==="CASH"){flags.push("LARGE_CASH_AML");riskScore+=30;}
  riskScore=Math.min(100,riskScore);const recommendation=riskScore>=70?"BLOCK":riskScore>=40?"REVIEW":"APPROVE";
  return{safe:riskScore<40,riskScore,flags,recommendation,requiresManualReview:riskScore>=40};
}
