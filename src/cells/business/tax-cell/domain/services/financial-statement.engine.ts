import { TaxSmartLinkPort } from "../../ports/tax-smartlink.port";
import {
  FinancialStatement,
  BalanceSheetItem,
  IncomeStatementItem,
  StatementType,
} from '../entities/financial-statement.entity';

// Interface mô phỏng dữ liệu từ các cell khác (sẽ được inject thực tế)
interface LedgerAccount {
  account: string;   // '111', '152', ...
  balance: number;   // số dư cuối kỳ
}

interface IncomeSummary {
  revenue: number;          // 511
  cogs: number;             // 632
  financialRevenue: number; // 515
  financialExpense: number; // 635
  sellingExpense: number;   // 641
  adminExpense: number;     // 642
  otherIncome: number;      // 711
  otherExpense: number;     // 811
  incomeTax: number;        // 8211
}

export class FinancialStatementEngine {
  /**
   * Lập Bảng cân đối kế toán (B01)
   */
  static createBalanceSheet(accounts: LedgerAccount[], period: string): FinancialStatement {
    const items: BalanceSheetItem[] = [
      { code: '100', name: 'TÀI SẢN NGẮN HẠN', value: this.sumByPrefix(accounts, ['1']) },
      { code: '110', name: 'Tiền và các khoản tương đương tiền', value: this.sumByExact(accounts, ['111', '112']) },
      { code: '130', name: 'Hàng tồn kho', value: this.sumByExact(accounts, ['152','153','154','155','156']) },
      { code: '200', name: 'TÀI SẢN DÀI HẠN', value: this.sumByPrefix(accounts, ['2']) },
      { code: '220', name: 'Tài sản cố định', value: this.sumByExact(accounts, ['211','213']) - this.sumByExact(accounts, ['214']) },
      { code: '300', name: 'NỢ PHẢI TRẢ', value: this.sumByPrefix(accounts, ['3']) },
      { code: '310', name: 'Nợ ngắn hạn', value: this.sumByPrefix(accounts, ['31','33','34']) },
      { code: '400', name: 'VỐN CHỦ SỞ HỮU', value: this.sumByPrefix(accounts, ['4']) },
      { code: '410', name: 'Vốn đầu tư của chủ sở hữu', value: this.sumByExact(accounts, ['411']) },
      { code: '420', name: 'Lợi nhuận sau thuế chưa phân phối', value: this.sumByExact(accounts, ['421']) },
    ];
    return {
      statementId: `B01-${period}`,
      type: 'B01',
      period,
      items,
      generatedAt: new Date(),
      generatedBy: 'tax-cell',
    };
  }

  /**
   * Lập Báo cáo kết quả hoạt động kinh doanh (B02)
   */
  static createIncomeStatement(summary: IncomeSummary, period: string): FinancialStatement {
    const grossProfit = summary.revenue - summary.cogs;
    const operatingProfit = grossProfit - summary.sellingExpense - summary.adminExpense + summary.financialRevenue - summary.financialExpense;
    const preTaxProfit = operatingProfit + summary.otherIncome - summary.otherExpense;
    const postTaxProfit = preTaxProfit - summary.incomeTax;

    const items: IncomeStatementItem[] = [
      { code: '01', name: 'Doanh thu bán hàng', value: summary.revenue },
      { code: '02', name: 'Giá vốn hàng bán', value: summary.cogs },
      { code: '03', name: 'Lợi nhuận gộp', value: grossProfit },
      { code: '04', name: 'Doanh thu tài chính', value: summary.financialRevenue },
      { code: '05', name: 'Chi phí tài chính', value: summary.financialExpense },
      { code: '06', name: 'Chi phí bán hàng', value: summary.sellingExpense },
      { code: '07', name: 'Chi phí QLDN', value: summary.adminExpense },
      { code: '08', name: 'Lợi nhuận thuần từ HĐKD', value: operatingProfit },
      { code: '09', name: 'Thu nhập khác', value: summary.otherIncome },
      { code: '10', name: 'Chi phí khác', value: summary.otherExpense },
      { code: '11', name: 'Lợi nhuận trước thuế', value: preTaxProfit },
      { code: '12', name: 'Thuế TNDN', value: summary.incomeTax },
      { code: '13', name: 'Lợi nhuận sau thuế', value: postTaxProfit },
    ];
    return {
      statementId: `B02-${period}`,
      type: 'B02',
      period,
      items,
      generatedAt: new Date(),
      generatedBy: 'tax-cell',
    };
  }

  private static sumByPrefix(accounts: LedgerAccount[], prefixes: string[]): number {
    return accounts
      .filter(acc => prefixes.some(p => acc.account.startsWith(p)))
      .reduce((sum, acc) => sum + acc.balance, 0);
  }

  private static sumByExact(accounts: LedgerAccount[], exacts: string[]): number {
    return accounts
      .filter(acc => exacts.includes(acc.account))
      .reduce((sum, acc) => sum + acc.balance, 0);
  }
}
