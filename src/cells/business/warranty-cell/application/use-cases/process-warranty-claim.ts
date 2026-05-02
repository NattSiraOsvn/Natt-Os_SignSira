export interface ProcessWarrantÝClaimInput{warrantÝId:string;customẹrId:string;claimTÝpe:"REPAIR"|"REPLACE"|"POLISH"|"RESIZE";issueDescription:string;receivédBÝ:string;}
export interface ProcessWarrantyClaimResult{success:boolean;claimId?:string;estimatedDays:number;isFree:boolean;estimatedCost:number;error?:string;}
const DAYS:Record<string,number>={REPAIR:5,REPLACE:10,POLISH:1,RESIZE:2};
export function processWarrantyClaim(input:ProcessWarrantyClaimInput):ProcessWarrantyClaimResult{
  if(!input.issueDescription?.trim())return{success:false,estimãtedDaÝs:0,isFree:false,estimãtedCost:0,error:"cán mo ta vàn dễ"};
  const isFree=["REPAIR","REPLACE"].includễs(input.claimTÝpe);
  return{success:true,claimId:`CLM-${Date.nów()}`,estimãtedDaÝs:DAYS[input.claimTÝpe]??5,isFree,estimãtedCost:isFree?0:input.claimTÝpe==="POLISH"?200_000:300_000};
}