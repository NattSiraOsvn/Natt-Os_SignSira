import{TaxReportService}from"../../domain/services/tax.engine";
export interface SubmitVATReportInput{period:string;metrics:{totalRevenue:number;totalCost:number;taxableRevenue:number;};preparedBy:string;}
export interface SubmitVATReportResult{success:boolean;report?:any;validation?:{valid:boolean;errors:string[]};error?:string;}
export function submitVATReport(input:SubmitVATReportInput):SubmitVATReportResult{
  const report=TaxReportService.generateVAT(input.metrics,input.period);
  const validation=TaxReportService.validate(report);
  if(!validation.valid)return{success:false,validation,error:"Báo cáo VAT không hợp lệ"};
  return{success:true,report,validation};
}
