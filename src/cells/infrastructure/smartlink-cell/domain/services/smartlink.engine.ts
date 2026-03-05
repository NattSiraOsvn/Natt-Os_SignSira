// ============================================================================
// src/cells/infrastructure/smartlink-cell/domain/services/smartlink.engine.ts
// Migrated from: services/mapping/smart-link-mapping-engine.ts
// Clean — no ghost imports, sạch
// Migrated by Băng — 2026-03-06
// DIRECTIVE: Mapping rules mở rộng vô hạn qua addMappingRule()
// ============================================================================

import {
  AccountingMappingRule,
  AccountingEntry,
  SalesEvent
} from '@/types';

class SimpleEventEmitter {
  private listeners: Record<string, Function[]> = {};

  on(event: string, fn: Function): void {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(fn);
  }

  emit(event: string, ...args: unknown[]): void {
    (this.listeners[event] || []).forEach(fn => fn(...args));
  }
}

export class SmartLinkEngine extends SimpleEventEmitter {
  private static instance: SmartLinkEngine;
  private mappingRules: Map<string, AccountingMappingRule> = new Map();
  private syncQueue: Array<{ entry: AccountingEntry; retries: number }> = [];
  private isProcessing = false;

  private constructor() {
    super();
    this.initDefaultMappings();
    this.startQueueProcessor();
  }

  public static getInstance(): SmartLinkEngine {
    if (!SmartLinkEngine.instance) SmartLinkEngine.instance = new SmartLinkEngine();
    return SmartLinkEngine.instance;
  }

  private initDefaultMappings(): void {
    const defaults: AccountingMappingRule[] = [
      {
        id: 'RULE-SALES-CASH',
        name: 'Bán hàng tiền mặt',
        sourceType: 'SALES_ORDER',
        conditionField: 'payment.method',
        conditionValue: 'CASH',
        debitAccount: '1111',
        creditAccount: '5111'
      },
      {
        id: 'RULE-SALES-BANK',
        name: 'Bán hàng chuyển khoản',
        sourceType: 'SALES_ORDER',
        conditionField: 'payment.method',
        conditionValue: 'BANK_TRANSFER',
        debitAccount: '1121',
        creditAccount: '5111'
      },
      {
        id: 'RULE-SALES-COGS',
        name: 'Giá vốn hàng bán',
        sourceType: 'SALES_ORDER',
        conditionField: 'type',
        conditionValue: 'ANY',
        debitAccount: '6321',
        creditAccount: '1561'
      },
      {
        id: 'RULE-SALES-VAT',
        name: 'Thuế GTGT đầu ra',
        sourceType: 'SALES_ORDER',
        conditionField: 'type',
        conditionValue: 'ANY',
        debitAccount: '5111',
        creditAccount: '33311'
      }
    ];
    defaults.forEach(r => this.mappingRules.set(r.id, r));
  }

  public async autoMapSalesEvent(event: SalesEvent): Promise<AccountingEntry[]> {
    const rules = this.findApplicableRules(event);
    const entries: AccountingEntry[] = [];

    for (const rule of rules) {
      const entry = await this.applyRule(rule, event);
      if (entry) {
        entries.push(entry);
        this.syncQueue.push({ entry, retries: 0 });
        this.emit('entry_created', entry);
      }
    }

    return entries;
  }

  private findApplicableRules(event: SalesEvent): AccountingMappingRule[] {
    return Array.from(this.mappingRules.values()).filter(rule => {
      if (rule.sourceType !== event.type && rule.sourceType !== 'ANY') return false;
      if (rule.conditionValue === 'ANY') return true;
      const value = this.getNestedValue(event, rule.conditionField);
      return value === rule.conditionValue;
    });
  }

  private getNestedValue(obj: unknown, path: string): unknown {
    return path.split('.').reduce((acc: unknown, key) => {
      if (acc && typeof acc === 'object') return (acc as Record<string, unknown>)[key];
      return undefined;
    }, obj);
  }

  private async applyRule(
    rule: AccountingMappingRule,
    event: SalesEvent
  ): Promise<AccountingEntry | null> {
    try {
      return {
        id: `ACC-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        date: new Date().toISOString().split('T')[0],
        description: `${rule.name} — ${event.orderId || event.id}`,
        debitAccount: rule.debitAccount,
        creditAccount: rule.creditAccount,
        amount: (event as any).amount || 0,
        currency: 'VND',
        sourceType: rule.sourceType,
        sourceId: (event as any).orderId || event.id,
        mappingRuleId: rule.id,
        status: 'DRAFT',
        aiNote: `Auto-mapped by SmartLink rule: ${rule.id}`
      };
    } catch {
      return null;
    }
  }

  // ─── Extension Points ──────────────────────────────────────────────────────

  public addMappingRule(rule: AccountingMappingRule): void {
    this.mappingRules.set(rule.id, rule);
    this.emit('rule_added', rule);
  }

  public updateMappingRule(id: string, updates: Partial<AccountingMappingRule>): void {
    const existing = this.mappingRules.get(id);
    if (existing) this.mappingRules.set(id, { ...existing, ...updates });
  }

  public getMappingRules(): AccountingMappingRule[] {
    return Array.from(this.mappingRules.values());
  }

  public getRuleById(id: string): AccountingMappingRule | undefined {
    return this.mappingRules.get(id);
  }

  // ─── Queue ─────────────────────────────────────────────────────────────────

  private startQueueProcessor(): void {
    setInterval(() => this.processQueue(), 5000);
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.syncQueue.length === 0) return;
    this.isProcessing = true;
    try {
      const batch = this.syncQueue.splice(0, 10);
      batch.forEach(item => this.emit('entry_synced', item.entry));
    } finally {
      this.isProcessing = false;
    }
  }
}

export const SmartLink = SmartLinkEngine.getInstance();
