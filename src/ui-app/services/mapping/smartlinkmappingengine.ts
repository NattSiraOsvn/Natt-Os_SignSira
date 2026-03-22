
import {
  AccountingEntry,
  AccountingMappingRule,
  SalesEvent
} from '../../types';

// Simple Event Emitter implementation for browser environment
class SimpleEventEmitter {
  private listeners: Record<string, Function[]> = {};

  on(event: string, listener: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);
  }

  emit(event: string, ...args: any[]) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(listener => listener(...args));
    }
  }

  removeAllListeners() {
    this.listeners = {};
  }
}

export class SmartLinkMappingEngine extends SimpleEventEmitter {
  private static instance: SmartLinkMappingEngine;
  private mappingRules: Map<string, AccountingMappingRule> = new Map();
  private syncQueue: Array<{entry: AccountingEntry, retries: number}> = [];
  private isProcessing: boolean = false;
  
  private constructor() {
    super();
    this.initializeDefaultMappings();
    this.startQueueProcessor();
  }
  
  public static getInstance(): SmartLinkMappingEngine {
    if (!SmartLinkMappingEngine.instance) {
      SmartLinkMappingEngine.instance = new SmartLinkMappingEngine();
    }
    return SmartLinkMappingEngine.instance;
  }
  
  private initializeDefaultMappings(): void {
    const defaultRules: AccountingMappingRule[] = [
      {
        id: 'REVENUE_MAPPING',
        name: 'Doanh thu bán hàng',
        description: 'Ánh xạ doanh thu từ đơn hàng sang tài khoản kế toán',
        source: { system: 'SALES', entity: 'SalesOrder', eventType: 'ORDER_CREATED' },
        sourceField: 'pricing.totalAmount',
        destination: { system: 'ACCOUNTING', entity: 'JournalEntry', accountType: 'REVENUE' },
        destinationField: 'debit_accounts.revenue',
        mappingType: 'DIRECT',
        transformation: (value: number) => ({
          debit: '131',
          credit: '511',
          amount: value,
          taxCode: '01GTGT',
          description: 'Doanh thu bán hàng hóa'
        }),
        autoPost: true,
        enabled: true,
        priority: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'COGS_MAPPING',
        name: 'Giá vốn hàng bán',
        description: 'Ánh xạ giá vốn khi xuất kho',
        source: { system: 'INVENTORY', entity: 'StockOut', eventType: 'ORDER_FULFILLED' },
        sourceField: 'pricing.costOfGoods',
        destination: { system: 'ACCOUNTING', entity: 'JournalEntry', accountType: 'COGS' },
        destinationField: 'accounts.cogs',
        mappingType: 'DIRECT',
        transformation: (value: number) => ({
          debit: '632',
          credit: '156',
          amount: value,
          description: 'Giá vốn hàng bán'
        }),
        autoPost: true,
        enabled: true,
        priority: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    defaultRules.forEach(rule => this.addMappingRule(rule));
  }
  
  public async autoMapSalesEvent(event: SalesEvent): Promise<AccountingEntry[]> {
    const entries: AccountingEntry[] = [];
    
    try {
      const applicableRules = this.findApplicableRules(event);
      
      for (const rule of applicableRules) {
        const mappedEntries = await this.applyMappingRule(rule, event);
        entries.push(...mappedEntries);
      }
      
      this.emit('entriesMapped', { event, entries });
      
      if (entries.length > 0) {
        // In a real app, this would call an API
        entries.forEach(e => e.status = 'POSTED');
      }
      
    } catch (error) {
      console.error('Error in autoMapSalesEvent:', error);
      this.emit('mappingError', { event, error });
    }
    
    return entries;
  }
  
  private findApplicableRules(event: SalesEvent): AccountingMappingRule[] {
    const applicable: AccountingMappingRule[] = [];
    
    for (const rule of this.mappingRules.values()) {
      if (!rule.enabled) continue;
      
      // Simplified matching logic for demo
      if (rule.source.system === 'SALES' && event.type === 'ORDER_CREATED') {
         applicable.push(rule);
      }
    }
    return applicable.sort((a, b) => b.priority - a.priority);
  }
  
  private async applyMappingRule(
    rule: AccountingMappingRule, 
    event: SalesEvent
  ): Promise<AccountingEntry[]> {
    // Mock extraction
    let value = 0;
    if (rule.id === 'REVENUE_MAPPING') value = event.order?.pricing?.totalAmount || 0;
    if (rule.id === 'COGS_MAPPING') value = event.order?.pricing?.costOfGoods || 0;

    try {
      const result = rule.transformation(value);
      return [this.createAccountingEntry(result, rule, event)];
    } catch (error) {
      console.error(`Error applying rule ${rule.id}:`, error);
      throw error;
    }
  }
  
  private createAccountingEntry(
    data: any,
    rule: AccountingMappingRule,
    event: SalesEvent,
    index: number = 0
  ): AccountingEntry {
    const journalId = `JRN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    return {
      journalId,
      transactionDate: new Date(),
      description: data.description || `Auto-mapped from ${event.type}`,
      entries: [{
        accountNumber: data.debit || '',
        accountName: 'Auto Account', // In real app, fetch name
        debit: data.amount || 0,
        credit: 0,
        currency: 'VND'
      }, {
        accountNumber: data.credit || '',
        accountName: 'Auto Account',
        debit: 0,
        credit: data.amount || 0,
        currency: 'VND'
      }],
      referenceId: rule.id,
      referenceType: 'MAPPING_RULE',
      reference: {
        ruleId: rule.id,
        eventType: event.type
      },
      status: rule.autoPost ? 'POSTED' : 'DRAFT',
      createdAt: new Date(),
      journalType: rule.destination.accountType as any
    };
  }
  
  // Public API methods
  public addMappingRule(rule: AccountingMappingRule): void {
    this.mappingRules.set(rule.id, rule);
    this.emit('ruleAdded', rule);
  }
  
  public updateMappingRule(id: string, updates: Partial<AccountingMappingRule>): void {
    const rule = this.mappingRules.get(id);
    if (rule) {
      const updatedRule = { ...rule, ...updates, updatedAt: new Date() };
      this.mappingRules.set(id, updatedRule);
      this.emit('ruleUpdated', updatedRule);
    }
  }
  
  public getMappingRules(): AccountingMappingRule[] {
    return Array.from(this.mappingRules.values());
  }
  
  public getRuleById(id: string): AccountingMappingRule | undefined {
    return this.mappingRules.get(id);
  }
  
  public async testMappingRule(ruleId: string, testData: any): Promise<any> {
    const rule = this.getRuleById(ruleId);
    if (!rule) throw new Error(`Rule ${ruleId} not found`);
    return rule.transformation(testData.value, testData.context);
  }
  
  private startQueueProcessor(): void {
    setInterval(() => {
      this.processQueue();
    }, 5000); 
  }
  
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.syncQueue.length === 0) return;
    this.isProcessing = true;
    // Simulate processing
    setTimeout(() => { this.isProcessing = false; }, 500);
  }
}
