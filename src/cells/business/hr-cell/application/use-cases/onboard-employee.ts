//  — TODO: fix type errors, remove this pragma

import{HREngine,Employee}from"../../domain/services/hr.engine";
export interface OnboardEmployeeInput{fullName:string;position:string;department:string;baseSalary:number;startDate:string;taxCode?:string;insuranceCode?:string;dependents?:number;bankAccount?:string;}
export interface OnboardEmployeeResult{success:boolean;employee?:Employee;errors:string[];}
export function onboardEmployee(input:OnboardEmployeeInput):OnboardEmployeeResult{
  const errors:string[]=[];
  if(!input.fullName?.trim())errors.push("ho ten khong duoc de trong");
  if(!input.position?.trim())errors.push("chuc vu khong duoc de trong");
  if(!input.department?.trim())errors.push("phong ban khong duoc de trong");
  if(input.baseSalary<1_320_000)errors.push("luong co ban thap hon luong tau thieu vung");
  if(errors.length>0)return{success:false,errors};
  const employee=HREngine.onboard({...input,dependents:input.dependents??0});
  return{success:true,employee,errors:[]};
}
