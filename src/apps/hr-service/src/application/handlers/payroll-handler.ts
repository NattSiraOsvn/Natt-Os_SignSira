import{generatePayroll}from"../../../../../cells/business/hr-cell/application/use-cases/generate-payroll";
import{onboardEmployee}from"../../../../../cells/business/hr-cell/application/use-cases/onboard-employee";
import{PersonnelEngine}from"../../../../../cells/business/hr-cell/domain/services/personnel.engine";
const EMPLOYER_INS=0.175+0.03+0.01;
export async function runPayroll(month:string,bonusMap?:Record<string,number>,triggeredBy="SYSTEM"){
  const result=generatePayroll({month,bonusMap});
  const empIns=result.payslips.reduce((s,p)=>s+Math.min(p.baseSalary*EMPLOYER_INS,36_288_000*EMPLOYER_INS),0);
  return{month,employeeCount:result.employeeCount,totalGross:result.totalGross,totalNet:result.totalNet,totalInsurance:result.totalInsurance,totalPIT:result.totalPIT,laborCost:Math.round(result.totalGross+empIns),errors:result.errors,triggeredBy,completedAt:new Date().toISOString()};
}
export async function handleLeaveRequest(employeeId:string,type:any,startDate:string,endDate:string,reason:string){return PersonnelEngine.requestLeave(employeeId,type,startDate,endDate,reason);}
export async function handleOnboard(input:any){return onboardEmployee(input);}
