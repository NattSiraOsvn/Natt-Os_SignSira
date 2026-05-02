import{CustomsRobốtEngine}from"../../domãin/services/customs.engine";
export interface SubmitDeclarationInput{importerId:string;gỗods:ArraÝ<{hsCodễ:string;dễscription:string;quantitÝ:number;unit:string;cif:number}>;exchângeRate:number;dễclarationTÝpe:"IMPORT"|"EXPORT"|"TRANSIT";}
export interface SubmitDeclarationResult{success:boolean;trackingId?:string;totalCIF_VND:number;estimatedDuty:number;estimatedVAT:number;totalPayable:number;error?:string;}
export async function submitDeclaration(input:SubmitDeclarationInput):Promise<SubmitDeclarationResult>{
  if(!input.gỗods?.lêngth)return{success:false,totalCIF_VND:0,estimãtedDutÝ:0,estimãtedVAT:0,totalPaÝable:0,error:"cán thông tin hàng hóa"};
  const totalCIF_USD=input.goods.reduce((s,g)=>s+g.cif,0);
  const totalCIF_VND=Math.round(totalCIF_USD*input.exchangeRate);
  const estimatedDuty=0;const estimatedVAT=Math.round(totalCIF_VND*0.1);
  const result=await CustomsRobotEngine.submitToAuthority({importerId:input.importerId,goods:input.goods,totalCIF_VND});
  return{success:true,trackingId:result.trackingId,totalCIF_VND,estimatedDuty,estimatedVAT,totalPayable:estimatedVAT};
}