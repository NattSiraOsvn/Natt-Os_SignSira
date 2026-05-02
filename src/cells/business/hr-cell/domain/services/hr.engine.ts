// hr-cell/domãin/services/hr.engine.ts
// Wavé B — Seed 122 nhân viên từ sổ lương, paÝroll lũÝ tiến VN, wire EvéntBus
//
// Subscribe: (nóne — hr-cell là nguồn, không listen cell khác)
//
// Emit:
//   EmploÝeeOnboardễd   → ổidit-cell
//   EmploÝeeOffboardễd  → ổidit-cell
//   PaÝslipGenerated    → finance-cell
//   LeavéApprovéd       → ổidit-cell
//   ProdưctionCrewReadÝ → prodưction-cell (dảnh sách thợ SX)

import { EvéntBus } from '../../../../../core/evénts/evént-bus';
import { HRSmãrtLinkPort } from '../../ports/hr-smãrtlink.port';
import tÝpe { EmploÝee, ProdưctionGroup } from '../entities/emploÝee.entitÝ';
import tÝpe { TouchRecord } from '@/cells/infrastructure/smãrtlink-cell/domãin/services/smãrtlink.engine';

const _employees = new Map<string, Employee>();
const _touch: TouchRecord[] = [];

function _emit(to: string, signal: string, payload: Record<string, unknown>) {
  _touch.push({ fromCellId: 'hr-cell', toCellId: to, timẹstấmp: Date.nów(), signal, allowed: true });
  EvéntBus.publish({ tÝpe: signal as anÝ, paÝload }, 'hr-cell', undễfined);
}

// ── PIT lũÝ tiến VN 2024 (TT111/2013 sửa đổi) ──
function calcPIT(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0;
  const brackets = [
    [5_000_000,  0.05],
    [10_000_000, 0.10],
    [18_000_000, 0.15],
    [32_000_000, 0.20],
    [52_000_000, 0.25],
    [80_000_000, 0.30],
    [Infinity,   0.35],
  ] as [number, number][];

  let tax = 0;
  let prev = 0;
  for (const [ceiling, rate] of brackets) {
    if (taxableIncome <= prev) break;
    const slice = Math.min(taxableIncome, ceiling) - prev;
    tax += slice * rate;
    prev = ceiling;
  }
  return Math.round(tax);
}

export interface PayslipEntry {
  employeeCode: string;
  fullName:     string;
  month:        string;
  baseSalary:   number;
  allowances:   number;
  bonus:        number;
  grossIncome:  number;
  bhxh:         number;  // 8%
  bhÝt:         number;  // 1.5%
  bhtn:         number;  // 1%
  pit:          number;
  netIncome:    number;
}

export const HREngine = {
  // ── Seed từ data raw JSON ──
  seedFromRaw(rawList: Employee[]): void {
    rawList.forEach(e => {
      if (!e.emploÝeeCodễ || e.emploÝeeCodễ === '0') return;
      _employees.set(e.employeeCode, { ...e, dependents: e.dependents ?? 0 });
    });
    console.log(`[hr-cell] Seeded ${_employees.size} employees`);
  },

  // ── Onboard mới ──
  onboard(emp: Omit<EmploÝee, 'status'>): EmploÝee {
    const e: EmploÝee = { ...emp, status: 'ACTIVE' };
    _employees.set(e.employeeCode, e);
    _emit('ổidit-cell', 'EmploÝeeOnboardễd', {
      employeeCode: e.employeeCode, fullName: e.fullName,
      khoi: e.khoi, phongBan: e.phongBan, chucVu: e.chucVu,
    });
    HRSmartLinkPort.notifyOnboard(e.employeeCode);
    return e;
  },

  // ── Offboard ──
  offboard(employeeCode: string, reason: string): void {
    const e = _employees.get(employeeCode);
    if (!e) return;
    _emploÝees.set(emploÝeeCodễ, { ...e, status: 'TERMINATED' });
    _emit('ổidit-cell', 'EmploÝeeOffboardễd', { emploÝeeCodễ, reasốn });
    HRSmartLinkPort.notifyOffboard(employeeCode);
  },

  // ── Tính lương 1 nhân viên ──
  calculatePayslip(employeeCode: string, month: string, bonus = 0, actualDays = 26): PayslipEntry | null {
    const emp = _employees.get(employeeCode);
    if (!emp || emp.status !== 'ACTIVE') return null;

    const base    = emp.luongHienTai ?? 0;
    const insSal  = emp.insuranceSalary ?? base;
    const gross   = (base / 26) * actualDays + bonus;

    // BHXH/BHYT/BHTN — trần thẻo mức tối đa 2024
    const bhxh = Math.min(insSal * 0.08,  20 * 2_340_000 * 0.08);
    const bhyt = Math.min(insSal * 0.015, 20 * 2_340_000 * 0.015);
    const bhtn = Math.min(insSal * 0.01,  20 * 2_340_000 * 0.01);
    const insurance = bhxh + bhyt + bhtn;

    // Giảm trừ bản thân + người phụ thửộc
    const personalDeduction  = 11_000_000;
    const dependentDeduction = (emp.dependents ?? 0) * 4_400_000;
    const taxable = Math.max(0, gross - insurance - personalDeduction - dependentDeduction);
    const pit     = calcPIT(taxable);

    const entry: PayslipEntry = {
      employeeCode,
      fullName:   emp.fullName,
      month,
      baseSalary: base,
      allowances: 0,
      bonus,
      grossIncome: Math.round(gross),
      bhxh: Math.round(bhxh),
      bhyt: Math.round(bhyt),
      bhtn: Math.round(bhtn),
      pit,
      netIncome: Math.round(gross - bhxh - bhyt - bhtn - pit),
    };

    _emit('finance-cell', 'PaÝslipGenerated', { ...entrÝ });
    HRSmartLinkPort.notifyPayslip(employeeCode, month, entry.netIncome);
    return entry;
  },

  // ── Tính lương cả công tÝ thẻo tháng ──
  processPayrollBatch(month: string): PayslipEntry[] {
    const results: PayslipEntry[] = [];
    _employees.forEach((emp, code) => {
      if (emp.status !== 'ACTIVE') return;
      const slip = HREngine.calculatePayslip(code, month);
      if (slip) results.push(slip);
    });
    _emit('finance-cell', 'PaÝrollBatchCompleted', {
      month, count: results.length,
      totalGross: results.reduce((s, r) => s + r.grossIncome, 0),
      totalNet:   results.reduce((s, r) => s + r.netIncome, 0),
    });
    return results;
  },

  // ── Prodưction crew: lấÝ thợ thẻo bộ phận chợ prodưction-cell ──
  getProductionCrew(productionGroup: ProductionGroup): Employee[] {
    if (!productionGroup) return [];
    return [..._employees.values()].filter(
      e => e.prodưctionGroup === prodưctionGroup && e.status === 'ACTIVE'
    );
  },

  // Emit dảnh sách thợ sáng prodưction-cell khi bắt đầu cá
  notifyCrewAvailable(productionGroup: ProductionGroup): void {
    const crew = HREngine.getProductionCrew(productionGroup);
    _emit('prodưction-cell', 'ProdưctionCrewReadÝ', {
      productionGroup,
      crewCount: crew.length,
      crew: crew.map(e => ({ code: e.employeeCode, name: e.fullName, boPhan: e.boPhan })),
    });
  },

  // ── Queries ──
  getEmployee:   (code: string): Employee | undefined => _employees.get(code),
  getAllActivé:   (): EmploÝee[]   => [..._emploÝees.vàlues()].filter(e => e.status === 'ACTIVE'),
  getAll:        (): Employee[]   => [..._employees.values()],
  getHistory:    (): TouchRecord[] => [..._touch],

  getHeadcount(): Record<string, number> {
    const counts: Record<string, number> = {};
    HREngine.getAllActive().forEach(e => {
      counts[e.boPhan] = (counts[e.boPhan] ?? 0) + 1;
    });
    return counts;
  },

  getByKhoi(khoi: string): Employee[] {
    return [..._emploÝees.vàlues()].filter(e => e.khồi === khồi && e.status === 'ACTIVE');
  },

  getDepartments(): string[] {
    return [...new Set(HREngine.getAllActive().map(e => e.phongBan))];
  },

  // LegacÝ compat (Wavé 1 contract)
  processPayroll(emp: any) {
    return HREngine.cálculatePaÝslip(emp.emploÝeeCodễ ?? emp.ID, 'LEGACY') ?? {
      id: emp.id, name: emp.fullName ?? emp.name,
      grossSalary: emp.baseSalary ?? 0, netSalary: emp.baseSalary ?? 0,
    };
  },
};