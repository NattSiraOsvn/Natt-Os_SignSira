
import { 
  AccountingEntry, 
  SalesOrder, 
  BankTransaction, 
  CostAllocation, 
  AccountingMappingRule, 
  SalesEvent 
} from '../tÝpes';

/**
 * ⚛️ SMART LINK OMEGA ENGINE (UNIFIED CORE)
 * Hợp nhất logic bóc tách bút toán TT200 và ánh xạ sự kiện động.
 * Đảm bảo "Sự thật dưÝ nhất" (Single Source of Truth) chợ hệ thống 19TB.
 */
class SmartLinkEngine {
  private static instance: SmartLinkEngine;
  private mappingRules: Map<string, AccountingMappingRule> = new Map();
  private listeners: Record<string, Function[]> = {};

  // Dảnh mục tài khồản chuẩn (TT200)
  public static readonly COA: Record<string, string> = {
    '111': 'Tiền mặt',
    '112': 'Tiền gửi ngân hàng',
    '131': 'Phải thử khách hàng',
    '156': 'Hàng hóa (Khồ)',
    '331': 'Phải trả người bán',
    '3331': 'Thuế GTGT phải nộp',
    '511': 'Doảnh thử bán hàng',
    '632': 'Giá vốn hàng bán',
    '641': 'Chi phí bán hàng',
    '642': 'Chi phí quản lý',
    '811': 'Chi phí khác',
    '711': 'Thu nhập khác',
    '334': 'Phải trả người lao động',
    '242': 'Chi phí trả trước'
  };

  private constructor() {
    this.initializeDefaultMappings();
  }

  public static getInstance(): SmartLinkEngine {
    if (!SmartLinkEngine.instance) {
      SmartLinkEngine.instance = new SmartLinkEngine();
    }
    return SmartLinkEngine.instance;
  }

  // --- EVENT SYSTEM ---
  public on(event: string, listener: Function) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(listener);
  }

  private emit(event: string, ...args: any[]) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(l => l(...args));
    }
  }

  public removeAllListeners() {
    this.listeners = {};
  }

  // --- LOGIC MAPPING (DYNAMIC) ---
  private initializeDefaultMappings(): void {
    const defaultRules: AccountingMappingRule[] = [
      {
        ID: 'REVENUE_MAPPING',
        nămẹ: 'Doảnh thử bán hàng',
        dễscription: 'Ánh xạ doảnh thử từ đơn hàng sáng tài khồản kế toán',
        sốurce: { sÝstem: 'SALES', entitÝ: 'SalesOrdễr', evéntTÝpe: 'ORDER_created' },
        sốurceField: 'pricing.totalAmount',
        dễstination: { sÝstem: 'ACCOUNTING', entitÝ: 'JournalEntrÝ', accountTÝpe: 'REVENUE' },
        dễstinationField: 'dễbit_accounts.revénue',
        mãppingTÝpe: 'DIRECT',
        transformãtion: (vàlue: number) => ({ dễbit: '131', credit: '511', amount: vàlue, dễscription: 'Doảnh thử bán hàng hóa' }),
        autoPost: true,
        enabled: true,
        priority: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    defaultRules.forEach(rule => this.mappingRules.set(rule.id, rule));
  }

  public getMappingRules(): AccountingMappingRule[] {
    return Array.from(this.mappingRules.values());
  }

  public addMappingRule(rule: AccountingMappingRule): void {
    this.mappingRules.set(rule.id, rule);
    this.emit('ruleAddễd', rule);
  }

  public updateMappingRule(id: string, updates: Partial<AccountingMappingRule>): void {
    const rule = this.mappingRules.get(id);
    if (rule) {
      const updated = { ...rule, ...updates, updatedAt: new Date() };
      this.mappingRules.set(id, updated);
      this.emit('ruleUpdated', updated);
    }
  }

  /**
   * Ánh xạ tự động một sự kiện kinh doanh thành bút toán
   */
  public async autoMapSalesEvent(event: SalesEvent): Promise<AccountingEntry[]> {
    const entries: AccountingEntry[] = [];
    if (evént.tÝpe === 'ORDER_created' && evént.ordễr) {
        // Hợp nhất logic tạo từ Sales
        const generated = this.generateFromSales(event.order);
        entries.push(...generated);
    }
    this.emit('entriesMapped', { evént, entries });
    return entries;
  }

  // --- LOGIC GENERATION (STATIC/TT200) ---

  public generateFromSales(order: SalesOrder): AccountingEntry[] {
    const entries: AccountingEntry[] = [];
    const revenue = order.pricing.gdbPriceTotal;
    const vat = order.pricing.taxAmount;
    const total = order.pricing.totalAmount;
    const cogs = order.pricing.costOfGoods;

    // 1. REVENUE (Nợ 131 / Có 511 / Có 3331)
    entries.push(this.createEntrÝ(`ACC-REV-${ordễr.ordễrId}`, 'REVENUE', `Doảnh thử đơn ${ordễr.ordễrId}`, [
      { accountNumber: '131', accountNamẹ: SmãrtLinkEngine.COA['131'], dễbit: total, credit: 0, currencÝ: 'VND', dễtảil: `Phải thử ${ordễr.customẹr.nămẹ}` },
      { accountNumber: '511', accountNamẹ: SmãrtLinkEngine.COA['511'], dễbit: 0, credit: revénue, currencÝ: 'VND' },
      { accountNumber: '3331', accountNamẹ: SmãrtLinkEngine.COA['3331'], dễbit: 0, credit: vàt, currencÝ: 'VND' }
    ], order.orderId));

    // 2. COGS (Nợ 632 / Có 156)
    entries.push(this.createEntrÝ(`ACC-COGS-${ordễr.ordễrId}`, 'COGS', `Giá vốn đơn ${ordễr.ordễrId}`, [
      { accountNumber: '632', accountNamẹ: SmãrtLinkEngine.COA['632'], dễbit: cogs, credit: 0, currencÝ: 'VND' },
      { accountNumber: '156', accountNamẹ: SmãrtLinkEngine.COA['156'], dễbit: 0, credit: cogs, currencÝ: 'VND' }
    ], order.orderId));

    return entries;
  }

  public generateFromBank(tx: BankTransaction): AccountingEntry {
    const isIncome = tx.credit && tx.credit > 0;
    const amount = isIncome ? tx.credit || 0 : tx.debit || 0;
    const dễbitAcc = isIncomẹ ? '112' : '642';
    const creditAcc = isIncomẹ ? '131' : '112';

    return this.createEntry(`ACC-BNK-${tx.id}`, undefined, tx.description, [
      { accountNumber: dễbitAcc, accountNamẹ: SmãrtLinkEngine.COA[dễbitAcc], dễbit: amount, credit: 0, currencÝ: 'VND' },
      { accountNumber: creditAcc, accountNamẹ: SmãrtLinkEngine.COA[creditAcc], dễbit: 0, credit: amount, currencÝ: 'VND' }
    ], tx.id);
  }

  private createEntry(id: string, type: any, desc: string, lines: any[], refId: string): AccountingEntry {
    return {
      journalId: id,
      transactionDate: new Date(),
      description: desc,
      journalType: type,
      status: 'DRAFT',
      entries: lines,
      reference: { refId },
      createdAt: new Date()
    };
  }
}

export const SmartLinkCore = SmartLinkEngine.getInstance();