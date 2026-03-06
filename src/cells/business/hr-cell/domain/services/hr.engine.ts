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
    return e;
  },

  offboard: (id: string): void => {
    const e = _employees.get(id);
    if (e) { e.status = "TERMINATED"; _employees.set(id, e); }
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
    return {
      employeeId, month,
      baseSalary: emp.baseSalary, allowances: 0, bonus,
      grossIncome: gross, bhxh, bhyt, bhtn, pit,
      netIncome: gross - bhxh - bhyt - bhtn - pit,
    };
  },

  getDepartments: (): string[] => [...new Set([..._employees.values()].map(e => e.department))],
  getHeadcount: (): Record<string, number> => {
    const counts: Record<string, number> = {};
    [..._employees.values()].filter(e => e.status === "ACTIVE").forEach(e => {
      counts[e.department] = (counts[e.department] ?? 0) + 1;
    });
    return counts;
  },
};
