export * from '@/cells/business/hr-cell/domain/services/hr.engine';
export const HREngine = {
  processPayroll:(emp:any,_rules?:any)=>{
    const base=emp.baseSalary??0; const days=emp.actualWorkDays??26; const lunch=emp.allowanceLunch??0;
    const ins=emp.insuranceSalary??0; const gross=(base/26*days)+lunch; const insAmt=ins*0.105;
    const taxable=Math.max(0,gross-insAmt-11000000-(emp.dependents??0)*4400000);
    const tax=taxable>5000000?taxable*0.05:0;
    const kpiPoints=emp.kpiPoints??80; const perfBonus=gross*(kpiPoints>=90?0.15:kpiPoints>=80?0.1:0);
    return { id:emp.id??'', name:emp.name??emp.fullName??'', employeeCode:emp.employeeCode??emp.id??'',
      grossSalary:gross, netSalary:gross-insAmt-tax+perfBonus,
      insuranceEmployee:insAmt, personalTax:tax, taxableIncome:taxable,
      kpiPoints, performanceBonus:perfBonus };
  },
  processPayrollBatch:(list:any[],rules?:any)=>list.map((e:any)=>HREngine.processPayroll(e,rules)),
  getAllPayroll:():any[]=>[], exportPayroll:async(_:any):Promise<void>=>{},
};
