// @ts-nocheck
import { HRSmartLinkPort } from "../../ports/hr-smartlink.port";
export interface Employee {
  id: string;
  fullName: string;
  position: string;
  department: string;
  baseSalary: number;
  startDate: string;
  status: "ACTIVE" | "ON_LEAVE" | "TERMINATED";
  taxCode?: string;
  insuranceCode?: string;
  dependents: number;
  bankAccount?: string;
}

export interface PayslipEntry {
  employeeId: string;
  month: string;
  baseSalary: number;
  allowances: number;
  bonus: number;
  grossIncome: number;
  bhxh: number;
  bhyt: number;
  bhtn: number;
  pit: number;
  netIncome: number;
}

const _employees = new Map<string, Employee>();

export const HREngine = {
  onboard: (emp: Omit<Employee, "id" | "status">): Employee => {
    const e: Employee = { ...emp, id: `EMP-${Date.now()}`, status: "ACTIVE" };
    _employees.set(e.id, e);
    HRSmartLinkPort.notifyOnboard(e.id);
    return e;
  },

  offboard: (id: string): void => {
    const e = _employees.get(id);
    if (e) { e.status = "TERMINATED"; _employees.set(id, e); HRSmartLinkPort.notifyOffboard(id); }
  },

  getEmployee: (id: string): Employee | null => _employees.get(id) ?? null,
  getAll: (): Employee[] => [..._employees.values()],
  getActive: (): Employee[] => [..._employees.values()].filter(e => e.status === "ACTIVE"),

  calculatePayslip: (employeeId: string, month: string, bonus = 0): PayslipEntry | null => {
    const emp = _employees.get(employeeId);
    if (!emp) return null;
    const gross = emp.baseSalary + bonus;
    const bhxh = Math.min(gross * 0.08, 1_728_000);
    const bhyt = Math.min(gross * 0.015, 324_000);
    const bhtn = Math.min(gross * 0.01, 174_000);
    const insurance = bhxh + bhyt + bhtn;
    const personal = 11_000_000;
    const dependent = emp.dependents * 4_400_000;
    const taxable = Math.max(0, gross - insurance - personal - dependent);
    const pit = taxable > 0 ? taxable * (taxable <= 5_000_000 ? 0.05 : 0.10) : 0;
    const result = {
      employeeId, month,
      baseSalary: emp.baseSalary, allowances: 0, bonus,
      grossIncome: gross, bhxh, bhyt, bhtn, pit,
      netIncome: gross - bhxh - bhyt - bhtn - pit,
    };
    HRSmartLinkPort.notifyPayslip(employeeId, month, result.netIncome);
    return result;
  },

  getDepartments: (): string[] => [...new Set([..._employees.values()].map(e => e.department))],
  getHeadcount: (): Record<string, number> => {
    const counts: Record<string, number> = {};
    [..._employees.values()].filter(e => e.status === "ACTIVE").forEach(e => {
      counts[e.department] = (counts[e.department] ?? 0) + 1;
    });
    return counts;
  },

  processPayroll: (emp: any, _rules?: any) => {
    const base=emp.baseSalary??0,days=emp.actualWorkDays??26,lunch=emp.allowanceLunch??0,ins=emp.insuranceSalary??0;
    const gross=(base/26*days)+lunch,insAmt=ins*0.105,taxable=Math.max(0,gross-insAmt-11000000-(emp.dependents??0)*4400000);
    const tax=taxable>5000000?taxable*0.05:0,kpi=emp.kpiPoints??80,bonus=gross*(kpi>=90?0.15:kpi>=80?0.1:0);
    return {id:emp.id??'',name:emp.name??emp.fullName??'',employeeCode:emp.employeeCode??emp.id??'',
      grossSalary:gross,netSalary:gross-insAmt-tax+bonus,insuranceEmployee:insAmt,
      personalTax:tax,taxableIncome:taxable,kpiPoints:kpi,performanceBonus:bonus};
  },

  processPayrollBatch: (list: any[], rules?: any) => list.map((e: any) => HREngine.processPayroll(e, rules)),
};
