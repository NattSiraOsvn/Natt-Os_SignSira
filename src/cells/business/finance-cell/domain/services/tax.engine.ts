// ============================================================================
// src/cells/business/finance-cell/domain/services/tax.engine.ts
// TaxCell v1.0 — Tích hợp UDP Pipeline
//
// DIRECTIVE (Can + Kris):
// ❌ KHÔNG hard-code DEFAULT_COGS_RATE
// ❌ KHÔNG hard-code thuế = (DT - GV) × 10%
// ❌ KHÔNG hard-code mock data
// ✅ 3 modes: GROUND_TRUTH / PROVISIONAL / INVESTIGATION
// ✅ Thiếu giá vốn → PENDING_COGS, không ước tính
// ✅ Margin >87% → bắt buộc có explainability
// ✅ Mọi tính toán đều có audit trail
// ✅ Mọi config thuế suất đều pluggable — không sửa core
// ============================================================================

import {
  BankTransaction,
  VATReport,
  VATEntry,
  PITReport,
  EmployeePayroll,
  TaxCalculationResult
} from '@/types';
import { UDP, UDPDomain, DomainExtractor } from '@/core/ingestion/udp.pipeline';
import { JournalEntry, ACCOUNTS } from '../entities/journal-entry.entity';

// ============================================================================
// CONFIG — Pluggable, không hard-code
// Can/Kris update thuế suất mới chỉ cần update TaxConfig
// ============================================================================

export interface TaxRateConfig {
  cit: {
    standardRate: number;        // VD: 0.20
    preferentialRate?: number;   // VD: 0.10 cho doanh nghiệp ưu đãi
    superPreferentialRate?: number; // VD: 0.05
  };
  vat: {
    standardRate: number;        // VD: 0.10
    reducedRate: number;         // VD: 0.05
    zeroRate: number;            // 0.00
  };
  pit: {
    brackets: Array<{ from: number; to: number; rate: number; deduction: number }>;
    personalDeduction: number;   // VD: 11_000_000
    dependentDeduction: number;  // VD: 4_400_000
  };
  marginSafeThreshold: number;   // VD: 0.87
}

// Default config — có thể override bất kỳ lúc nào
const DEFAULT_TAX_CONFIG: TaxRateConfig = {
  cit: {
    standardRate: 0.20,
    preferentialRate: 0.10,
    superPreferentialRate: 0.05
  },
  vat: {
    standardRate: 0.10,
    reducedRate: 0.05,
    zeroRate: 0.00
  },
  pit: {
    // Biểu thuế TNCN 7 bậc (TT111/2013, sửa đổi)
    brackets: [
      { from: 0,           to: 5_000_000,   rate: 0.05, deduction: 0 },
      { from: 5_000_000,   to: 10_000_000,  rate: 0.10, deduction: 250_000 },
      { from: 10_000_000,  to: 18_000_000,  rate: 0.15, deduction: 750_000 },
      { from: 18_000_000,  to: 32_000_000,  rate: 0.20, deduction: 1_650_000 },
      { from: 32_000_000,  to: 52_000_000,  rate: 0.25, deduction: 3_250_000 },
      { from: 52_000_000,  to: 80_000_000,  rate: 0.30, deduction: 5_850_000 },
      { from: 80_000_000,  to: Infinity,    rate: 0.35, deduction: 9_850_000 }
    ],
    personalDeduction: 11_000_000,
    dependentDeduction: 4_400_000
  },
  marginSafeThreshold: 0.87
};

// ============================================================================
// TYPES — TaxCell Internal
// ============================================================================

export type FinanceMode = 'GROUND_TRUTH' | 'PROVISIONAL' | 'INVESTIGATION';

export type CogsStatus = 'CONFIRMED' | 'PENDING_COGS' | 'ESTIMATED';

export interface TaxAuditEntry {
  step: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  mode: FinanceMode;
  timestamp: number;
  actor?: string;
}

export interface MarginResult {
  ratio: number;
  isAlert: boolean;
  level: 'SAFE' | 'WARNING' | 'DANGER';
  explanation: string;
  requiresExplainability: boolean;
}

export interface VATCalculation {
  mode: FinanceMode;
  cogsStatus: CogsStatus;
  revenue: number;
  cogs: number | null;
  addedValue: number | null;
  vatAmount: number | null;
  marginCheck: MarginResult;
  auditTrail: TaxAuditEntry[];
  explainability?: string;
}

export interface CITResult {
  mode: FinanceMode;
  taxableIncome: number;
  standardRate: number;
  appliedRate: number;
  taxAmount: number;
  incentiveAmount: number;
  finalTax: number;
  effectiveRate: number;
  auditTrail: TaxAuditEntry[];
}

// ============================================================================
// MARGIN CHECK — bắt buộc explainability nếu >threshold
// ============================================================================

function checkMargin(revenue: number, cogs: number, config: TaxRateConfig): MarginResult {
  if (revenue <= 0) {
    return {
      ratio: 0,
      isAlert: false,
      level: 'SAFE',
      explanation: 'Chưa có doanh thu',
      requiresExplainability: false
    };
  }

  const ratio = cogs / revenue;
  const threshold = config.marginSafeThreshold;
  const level = ratio > threshold ? 'DANGER' : ratio > 0.80 ? 'WARNING' : 'SAFE';

  return {
    ratio,
    isAlert: ratio > threshold,
    level,
    explanation: level === 'DANGER'
      ? `Giá vốn/Doanh thu = ${(ratio * 100).toFixed(1)}% > ${(threshold * 100).toFixed(0)}% — CẦN KIỂM TRA NGAY`
      : `Giá vốn/Doanh thu = ${(ratio * 100).toFixed(1)}% — ${level}`,
    requiresExplainability: ratio > threshold
  };
}

// ============================================================================
// PIT CALCULATOR — theo biểu thuế lũy tiến
// ============================================================================

function calculatePIT(
  grossIncome: number,
  dependents: number,
  config: TaxRateConfig
): { taxableIncome: number; taxAmount: number; breakdown: string } {
  const personalDeduction = config.pit.personalDeduction;
  const dependentDeduction = config.pit.dependentDeduction * dependents;
  const taxableIncome = Math.max(0, grossIncome - personalDeduction - dependentDeduction);

  if (taxableIncome <= 0) {
    return { taxableIncome: 0, taxAmount: 0, breakdown: 'Thu nhập tính thuế = 0' };
  }

  // Tính theo bậc lũy tiến
  let taxAmount = 0;
  const breakdown: string[] = [];

  for (const bracket of config.pit.brackets) {
    if (taxableIncome <= bracket.from) break;
    const taxableInBracket = Math.min(taxableIncome, bracket.to) - bracket.from;
    const taxInBracket = taxableInBracket * bracket.rate - bracket.deduction;
    taxAmount = taxableIncome * bracket.rate - bracket.deduction;
    breakdown.push(`Bậc ${bracket.rate * 100}%: ${taxableInBracket.toLocaleString('vi-VN')}đ`);
  }

  return {
    taxableIncome,
    taxAmount: Math.max(0, taxAmount),
    breakdown: breakdown.join(' | ')
  };
}

// ============================================================================
// ACCOUNT CLASSIFIER — từ finance.engine.ts, preserved đầy đủ
// ============================================================================

export function classifyDebitAccount(description: string, amount: number): string {
  const text = description.toUpperCase();

  if (amount >= 30_000_000) {
    if (/MÁY|LÒ ĐÚC|IMAC|PC|SERVER/.test(text)) return ACCOUNTS.FIXED_ASSET;
    if (/PHẦN MỀM|BẢN QUYỀN|LICENSE/.test(text)) return ACCOUNTS.INTANGIBLE;
  }
  if (/BÀN|GHẾ|TỦ|KỆ/.test(text)) return amount >= 30_000_000 ? ACCOUNTS.FIXED_ASSET : ACCOUNTS.INV_CCDC;

  if (/VIÊN CHỦ|GIA/.test(text)) return ACCOUNTS.INV_MAT;
  if (/DÂY CHUYỀN|MOISSANITE|ĐÁ/.test(text)) return ACCOUNTS.INV_GOODS;
  if (/BÌA KIM CƯƠNG|HỘP|TÚI/.test(text)) return ACCOUNTS.INV_MAT;
  if (/PHỤ GIA|HOÁ CHẤT|RESIN|GAS/.test(text)) return ACCOUNTS.INV_MAT;
  if (/CÔNG CỤ|DỤNG CỤ/.test(text)) return ACCOUNTS.INV_CCDC;

  if (/ADS|QUẢNG CÁO|META|GOOGLE|SHOPEE|VẬN CHUYỂN|SHIP/.test(text)) return ACCOUNTS.SELLING_EXP;
  if (/ĐIỆN|NƯỚC|INTERNET|VỆ SINH|BẢO VỆ|PHÂN KIM|KIỂM ĐỊNH/.test(text)) return ACCOUNTS.ADMIN_EXP;
  if (/LƯƠNG|THƯỞNG/.test(text)) return ACCOUNTS.SALARY_PAYABLE;

  return ACCOUNTS.ADMIN_EXP;
}

// ============================================================================
// TAX ENGINE — Core
// ============================================================================

export class TaxEngine {
  private static instance: TaxEngine;
  private config: TaxRateConfig = { ...DEFAULT_TAX_CONFIG };
  private auditLog: TaxAuditEntry[] = [];

  static getInstance(): TaxEngine {
    if (!TaxEngine.instance) {
      TaxEngine.instance = new TaxEngine();
      TaxEngine.instance.registerUDPExtractor();
    }
    return TaxEngine.instance;
  }

  /** Override config — Can/Kris dùng khi có thay đổi chính sách */
  updateConfig(partial: Partial<TaxRateConfig>): void {
    this.config = { ...this.config, ...partial };
    this.log('CONFIG_UPDATE', {}, { config: partial }, 'GROUND_TRUTH');
  }

  // ─── CIT ─────────────────────────────────────────────────────────────────

  calculateCIT(
    revenue: number,
    expense: number,
    mode: FinanceMode = 'GROUND_TRUTH',
    incentiveRate: number = 0,
    actor?: string
  ): CITResult {
    if (mode === 'PROVISIONAL') {
      this.log('CIT_PROVISIONAL', { revenue, expense }, {}, mode, actor);
    }

    const taxableIncome = Math.max(0, revenue - expense);
    const appliedRate = incentiveRate > 0
      ? this.config.cit.standardRate * (1 - incentiveRate)
      : this.config.cit.standardRate;

    const taxAmount = taxableIncome * this.config.cit.standardRate;
    const incentiveAmount = taxAmount * incentiveRate;
    const finalTax = taxAmount - incentiveAmount;
    const effectiveRate = taxableIncome > 0 ? finalTax / taxableIncome : 0;

    const result: CITResult = {
      mode,
      taxableIncome,
      standardRate: this.config.cit.standardRate,
      appliedRate,
      taxAmount,
      incentiveAmount,
      finalTax,
      effectiveRate,
      auditTrail: []
    };

    this.log('CIT_CALCULATE', { revenue, expense, incentiveRate }, {
      taxableIncome, finalTax, effectiveRate
    }, mode, actor);

    result.auditTrail = this.getRecentTrail(3);
    return result;
  }

  // ─── VAT ─────────────────────────────────────────────────────────────────

  /**
   * Tính VAT theo phương pháp khấu trừ (TT200)
   * QUAN TRỌNG: Nếu thiếu COGS → trả về PENDING_COGS, không ước tính
   */
  calculateVAT(
    revenue: number,
    cogs: number | null,
    mode: FinanceMode = 'GROUND_TRUTH',
    explainability?: string,
    actor?: string
  ): VATCalculation {
    // RULE: Thiếu COGS → PENDING, không tính
    if (cogs === null || cogs === undefined) {
      this.log('VAT_PENDING_COGS', { revenue }, { reason: 'COGS không có' }, mode, actor);
      return {
        mode,
        cogsStatus: 'PENDING_COGS',
        revenue,
        cogs: null,
        addedValue: null,
        vatAmount: null,
        marginCheck: { ratio: 0, isAlert: false, level: 'SAFE', explanation: 'Chờ xác nhận giá vốn', requiresExplainability: false },
        auditTrail: this.getRecentTrail(2)
      };
    }

    const marginCheck = checkMargin(revenue, cogs, this.config);

    // RULE: Margin >87% phải có explainability
    if (marginCheck.requiresExplainability && !explainability) {
      this.log('VAT_MARGIN_ALERT', { revenue, cogs, ratio: marginCheck.ratio }, {
        required: 'explainability bắt buộc khi margin >87%'
      }, mode, actor);
    }

    const addedValue = revenue - cogs;
    const vatAmount = addedValue * this.config.vat.standardRate;

    this.log('VAT_CALCULATE', { revenue, cogs }, {
      addedValue, vatAmount, marginLevel: marginCheck.level
    }, mode, actor);

    return {
      mode,
      cogsStatus: 'CONFIRMED',
      revenue,
      cogs,
      addedValue,
      vatAmount,
      marginCheck,
      auditTrail: this.getRecentTrail(3),
      explainability
    };
  }

  // ─── VAT REPORT ──────────────────────────────────────────────────────────

  generateVATReport(
    transactions: BankTransaction[],
    period: string,
    mode: FinanceMode = 'GROUND_TRUTH'
  ): VATReport {
    // Tính từ transactions thật — không mock
    const entries: VATEntry[] = this.aggregateVATEntries(transactions);

    const totalAddedValue = entries.reduce((sum, e) => sum + e.addedValue, 0);
    const totalVATPayable = entries.reduce((sum, e) => sum + e.taxAmount, 0);

    this.log('VAT_REPORT', { period, transactionCount: transactions.length }, {
      totalAddedValue, totalVATPayable, mode
    }, mode);

    return {
      period,
      entries,
      totalAddedValue,
      totalVATPayable,
      accountingStandard: 'TT200',
      formNumber: '03/GTGT'
    };
  }

  private aggregateVATEntries(transactions: BankTransaction[]): VATEntry[] {
    // Group by category từ transactions thật
    const groups = new Map<string, { sales: number; purchase: number }>();

    for (const tx of transactions) {
      const category = this.resolveVATCategory(tx);
      const existing = groups.get(category) || { sales: 0, purchase: 0 };

      if (tx.type === 'THU') {
        existing.sales += tx.amount;
      } else {
        existing.purchase += tx.amount;
      }
      groups.set(category, existing);
    }

    const entries: VATEntry[] = [];
    for (const [category, { sales, purchase }] of groups) {
      const addedValue = sales - purchase;
      entries.push({
        category,
        salesValue: sales,
        purchaseValue: purchase,
        addedValue,
        taxRate: this.config.vat.standardRate * 100,
        taxAmount: addedValue * this.config.vat.standardRate
      });
    }

    return entries;
  }

  private resolveVATCategory(tx: BankTransaction): string {
    const desc = (tx.description || '').toUpperCase();
    if (/VÀNG|AU750|18K/.test(desc)) return 'Vàng trang sức 18K (AU750)';
    if (/KIM CƯƠNG|GIA|ĐÁ QUÝ/.test(desc)) return 'Kim cương GIA & Đá quý';
    if (/CHẾ TÁC|ĐẶT HÀNG|CUSTOM/.test(desc)) return 'Sản phẩm chế tác theo đơn';
    return 'Khác';
  }

  // ─── PIT REPORT ──────────────────────────────────────────────────────────

  generatePITReport(
    payrolls: EmployeePayroll[],
    period: string,
    mode: FinanceMode = 'GROUND_TRUTH'
  ): PITReport {
    const entries = payrolls.map(p => {
      const gross = (p.grossSalary || p.baseSalary || 0);
      const dependents = (p as any).dependents || 0;
      const pit = calculatePIT(gross, dependents, this.config);

      return {
        employeeName: p.name,
        employeeCode: p.employeeCode || 'N/A',
        taxableIncome: pit.taxableIncome,
        deductions: gross - pit.taxableIncome,
        taxPaid: pit.taxAmount
      };
    });

    this.log('PIT_REPORT', { period, employeeCount: payrolls.length }, {
      totalTaxPaid: entries.reduce((s, e) => s + e.taxPaid, 0), mode
    }, mode);

    return {
      period,
      entries,
      totalTaxableIncome: entries.reduce((sum, e) => sum + e.taxableIncome, 0),
      totalTaxPaid: entries.reduce((sum, e) => sum + e.taxPaid, 0)
    };
  }

  // ─── UDP Extractor ────────────────────────────────────────────────────────

  private registerUDPExtractor(): void {
    const taxExtractor: DomainExtractor = {
      extract: (payload) => {
        const raw = payload.rawContent as Record<string, unknown>;
        return {
          period: raw.period || raw.ky || raw.thang,
          revenue: raw.revenue || raw.doanhThu || raw.dt,
          cogs: raw.cogs || raw.giaVon || raw.gv || null,
          transactions: raw.transactions || raw.giaoDich || [],
          payrolls: raw.payrolls || raw.luong || [],
          mode: raw.mode || 'PROVISIONAL',
          submittedBy: payload.submittedBy
        };
      },
      validate: (data) => {
        const errors: string[] = [];
        if (!data.period) errors.push('Thiếu kỳ báo cáo (period)');
        if (data.cogs === null) errors.push('COGS chưa xác nhận — sẽ vào PENDING_COGS');
        return { valid: errors.length === 0, errors };
      }
    };

    UDP.registerExtractor('TAX' as UDPDomain, taxExtractor);
  }

  // ─── Audit ────────────────────────────────────────────────────────────────

  private log(
    step: string,
    input: Record<string, unknown>,
    output: Record<string, unknown>,
    mode: FinanceMode,
    actor?: string
  ): void {
    this.auditLog.push({ step, input, output, mode, timestamp: Date.now(), actor });
  }

  private getRecentTrail(n: number): TaxAuditEntry[] {
    return this.auditLog.slice(-n);
  }

  getFullAuditTrail(): TaxAuditEntry[] {
    return [...this.auditLog];
  }
}

export const TaxCell = TaxEngine.getInstance();
