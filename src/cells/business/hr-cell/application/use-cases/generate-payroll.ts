//  — TODO: fix type errors, remove this pragma

import{HREngine,PayslipEntry}from"../../domain/services/hr.engine";
export interface GeneratePayrollInput{month:string;bonusMap?:Record<string,number>;}
export interface GeneratePayrollResult{success:boolean;payslips:PayslipEntry[];totalGross:number;totalNet:number;totalInsurance:number;totalPIT:number;employeeCount:number;errors:string[];}
export function generatePayroll(input:GeneratePayrollInput):GeneratePayrollResult{
  const active=HREngine.getActive();const payslips:PayslipEntry[]=[];const errors:string[]=[];
  for(const emp of active){const bonus=input.bonusMap?.[emp.id]??0;const slip=HREngine.calculatePayslip(emp.id,input.month,bonus);if(slip)payslips.push(slip);else errors.push(`khong tinh duoc: ${emp.id}`);}
  return{success:true,payslips,totalGross:payslips.reduce((s,p)=>s+p.grossIncome,0),totalNet:payslips.reduce((s,p)=>s+p.netIncome,0),totalInsurance:payslips.reduce((s,p)=>s+p.bhxh+p.bhyt+p.bhtn,0),totalPIT:payslips.reduce((s,p)=>s+p.pit,0),employeeCount:payslips.length,errors};
}
