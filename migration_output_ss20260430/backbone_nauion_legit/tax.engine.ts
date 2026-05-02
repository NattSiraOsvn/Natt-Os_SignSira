export interface TaxCalculation {
  baseAmount: number;
  vatRate: number;
  vatAmount: number;
  totalWithVAT: number;
  taxCode: string;
}

export interface VATReturn {
  period: string;
  outputVAT: number;
  inputVAT: number;
  vatPayable: number;
  filingDeadline: string;
  status: "DRAFT" | "FILED" | "PAID";
}

export interface PITRecord {
  employeeId: string;
  month: string;
  grossIncome: number;
  insurance: number;
  taxableIncome: number;
  personalDeduction: number;
  dependentDeduction: number;
  pitAmount: number;
}

// Biểu thuế TNCN theo TT111/2013
const PIT_BRACKETS = [
  { limit: 5_000_000, rate: 0.05 },
  { limit: 10_000_000, rate: 0.10 },
  { limit: 18_000_000, rate: 0.15 },
  { limit: 32_000_000, rate: 0.20 },
  { limit: 52_000_000, rate: 0.25 },
  { limit: 80_000_000, rate: 0.30 },
  { limit: Infinity, rate: 0.35 },
];

export const TaxEngine = {
  calculateVAT: (amount: number, rate = 0.10): TaxCalculation => ({
    baseAmount: amount,
    vatRate: rate,
    vatAmount: amount * rate,
    totalWithVAT: amount * (1 + rate),
    taxCode: rate === 0.10 ? "VAT10" : rate === 0.08 ? "VAT8" : "VAT0",
  }),

  calculatePIT: (grossIncome: number, dependents = 0): PITRecord => {
    const insurance = Math.min(grossIncome * 0.105, 2_268_000); // BHXH+BHYT+BHTN
    const personalDeduction = 11_000_000;
    const dependentDeduction = dependents * 4_400_000;
    const taxableIncome = Math.max(0, grossIncome - insurance - personalDeduction - dependentDeduction);

    let pitAmount = 0;
    let remaining = taxableIncome;
    let prev = 0;
    for (const bracket of PIT_BRACKETS) {
      const taxable = Math.min(remaining, bracket.limit - prev);
      if (taxable <= 0) break;
      pitAmount += taxable * bracket.rate;
      remaining -= taxable;
      prev = bracket.limit;
    }

    return {
      employeeId: "", month: new Date().toISOString().slice(0, 7),
      grossIncome, insurance, taxableIncome,
      personalDeduction, dependentDeduction, pitAmount,
    };
  },

  buildVATReturn: (outputVAT: number, inputVAT: number, period: string): VATReturn => {
    const [year, month] = period.split("-").map(Number);
    const deadline = new Date(year, month, 20).toISOString().split("T")[0];
    return {
      period, outputVAT, inputVAT,
      vatPayable: Math.max(0, outputVAT - inputVAT),
      filingDeadline: deadline,
      status: "DRAFT",
    };
  },

  // CIT provisional — 20% lợi nhuận tạm tính
  calculateCIT: (revenue: number, cost: number): number =>
    Math.max(0, (revenue - cost) * 0.20),
};

export const TaxReportService = {
  generateVAT:(metrics:any,period:string)=>({period,totalSales:metrics?.totalRevenue??0,vatCollected:(metrics?.totalRevenue??0)*0.1,vatPaid:0,vatDue:0,filingDeadline:new Date().toISOString().split("T")[0]}),
  generatePIT:(employeeId:string,year:number)=>({employeeId,year,grossIncome:0,taxableIncome:0,taxDue:0,taxPaid:0}),
  getDeadlines:()=>[{type:"VAT_MONTHLY",deadline:"20th of each month",penalty:"0.05%/day"}],
  validate:(_:any)=>({valid:true,errors:[]}),
  generateVATReport:(_data:any[],period:string):any=>({period}),
  generatePITReport:(_employees:any[],_period?:string):any=>({employees:_employees,total:0}),
};
