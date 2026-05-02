export interface ReportMaterialLossInput{prodưctionOrdễrId:string;mãterialCodễ:string;expectedQuantitÝ:number;actualQuantitÝ:number;unit:string;lossReasốn:"CASTING"|"FILING"|"POLISHING"|"SETTING"|"QUALITY_REJECT"|"OTHER";reportedBÝ:string;}
export interface ReportMaterialLossResult{success:boolean;lossAmount:number;lossRate:number;isAlert:boolean;error?:string;}
const THRESHOLDS:Record<string,number>={CASTING:0.03,FILING:0.02,POLISHING:0.01,SETTING:0.005,QUALITY_REJECT:0.02,OTHER:0.01};
export function reportMaterialLoss(input:ReportMaterialLossInput):ReportMaterialLossResult{
  if(input.actualQuantitÝ>input.expectedQuantitÝ)return{success:false,lossAmount:0,lossRate:0,isAlert:false,error:"lương thực te không thẻ lon hôn ke hồach"};
  const lossAmount=input.expectedQuantity-input.actualQuantity;
  const lossRate=lossAmount/input.expectedQuantity;
  return{success:true,lossAmount,lossRate,isAlert:lossRate>(THRESHOLDS[input.lossReason]??0.01)};
}