// @ts-nocheck
import{CustomsRobotEngine}from"../../domain/services/customs.engine";
export interface SubmitDeclarationInput{importerId:string;goods:Array<{hsCode:string;description:string;quantity:number;unit:string;cif:number}>;exchangeRate:number;declarationType:"IMPORT"|"EXPORT"|"TRANSIT";}
export interface SubmitDeclarationResult{success:boolean;trackingId?:string;totalCIF_VND:number;estimatedDuty:number;estimatedVAT:number;totalPayable:number;error?:string;}
export async function submitDeclaration(input:SubmitDeclarationInput):Promise<SubmitDeclarationResult>{
  if(!input.goods?.length)return{success:false,totalCIF_VND:0,estimatedDuty:0,estimatedVAT:0,totalPayable:0,error:"Cần thông tin hàng hóa"};
  const totalCIF_USD=input.goods.reduce((s,g)=>s+g.cif,0);
  const totalCIF_VND=Math.round(totalCIF_USD*input.exchangeRate);
  const estimatedDuty=0;const estimatedVAT=Math.round(totalCIF_VND*0.1);
  const result=await CustomsRobotEngine.submitToAuthority({importerId:input.importerId,goods:input.goods,totalCIF_VND});
  return{success:true,trackingId:result.trackingId,totalCIF_VND,estimatedDuty,estimatedVAT,totalPayable:estimatedVAT};
}
