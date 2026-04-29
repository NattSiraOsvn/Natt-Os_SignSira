export interface ProcessWarrantyClaimInput{warrantyId:string;customerId:string;claimType:"REPAIR"|"REPLACE"|"POLISH"|"RESIZE";issueDescription:string;receivedBy:string;}
export interface ProcessWarrantyClaimResult{success:boolean;claimId?:string;estimatedDays:number;isFree:boolean;estimatedCost:number;error?:string;}
const DAYS:Record<string,number>={REPAIR:5,REPLACE:10,POLISH:1,RESIZE:2};
export function processWarrantyClaim(input:ProcessWarrantyClaimInput):ProcessWarrantyClaimResult{
  if(!input.issueDescription?.trim())return{success:false,estimatedDays:0,isFree:false,estimatedCost:0,error:"can mo ta van de"};
  const isFree=["REPAIR","REPLACE"].includes(input.claimType);
  return{success:true,claimId:`CLM-${Date.now()}`,estimatedDays:DAYS[input.claimType]??5,isFree,estimatedCost:isFree?0:input.claimType==="POLISH"?200_000:300_000};
}
