export interface PayrollResult {
  id: string; name: string; employeeCode?: string;
  grossSalary?: number; netSalary?: number;
  insuranceEmployee?: number; personalTax?: number;
  taxableIncome?: number; kpiPoints?: number;
  [key: string]: any;
}

export const HREngine = {
  processPayroll: (emp: any, _rules?: any): PayrollResult => {
    const base = emp.baseSalary ?? 0;
    const days = emp.actualWorkDays ?? 26;
    const lunch = emp.allowanceLunch ?? 0;
    const ins = emp.insuranceSalary ?? 0;
    const gross = (base / 26 * days) + lunch;
    const insAmt = ins * 0.105;
    const taxable = Math.max(0, gross - insAmt - 11000000 - (emp.dependents ?? 0) * 4400000);
    const tax = taxable > 5000000 ? taxable * 0.05 : 0;
    const net = gross - insAmt - tax;
    return {
      id: emp.id ?? '', name: emp.name ?? emp.fullName ?? '',
      employeeCode: emp.employeeCode ?? emp.id,
      grossSalary: gross, netSalary: net,
      insuranceEmployee: insAmt, personalTax: tax, taxableIncome: taxable,
      kpiPoints: emp.kpiPoints,
    };
  },
  processPayrollBatch: (list: any[], rules?: any): PayrollResult[] =>
    list.map(e => HREngine.processPayroll(e, rules)),
  getAllPayroll: (): any[] => [],
  exportPayroll: async (_: any): Promise<void> => {},
};
export default HREngine;
