#!/usr/bin/env python3
"""
NATTCELL → GOLDMASTER MERGE — BATCH C (4 modules, 792L)
Heavy modules: production pipeline, logistics, event staging, idempotency.

Modules:
  10. productionSalesFlow (276L) — end-to-end import→produce→distribute→sell
  11. logisticsService (257L) — multi-carrier adapter (GHN, VTP, FedEx)
  12. EventStagingLayer REAL (156L) — replaces shim
  13. GlobalIdempotencyEnforcer (103L) — transaction ledger

FIXES APPLIED:
  - Import: blockchainService → blockchainservice (lowercase)
  - EventStagingLayer: replaces existing shim completely
  - No enum casing issues (these modules use matching enums)

NOTES:
  - EventStagingLayer + GlobalIdempotencyEnforcer use localStorage (browser-only)
  - productionSalesFlow depends on SalesCore (exists)
  - logisticsService depends on ShardingService (from blockchainservice, exists)

Run AFTER batch_b_merge.py succeeds with clean tsc.
"""

import os
import sys

GM = os.path.expanduser(
    "~/Desktop/HỒ SƠ SHTT NATT-OS BY NATTSIRA-OS/natt-os ver2goldmaster"
)

DRY_RUN = "--dry" in sys.argv


def write_file(rel_path: str, content: str, label: str):
    full = os.path.join(GM, rel_path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    if DRY_RUN:
        print(f"  [DRY] Would write {rel_path} ({len(content.splitlines())}L)")
        return
    with open(full, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"  ✅ {label} → {rel_path} ({len(content.splitlines())}L)")


def append_types(additions: str, label: str):
    types_path = os.path.join(GM, "types.ts")
    with open(types_path, "r", encoding="utf-8") as f:
        existing = f.read()
    first_type = additions.strip().split("\n")[0]
    if first_type in existing:
        print(f"  ⏭️  {label} — already in types.ts, skipping")
        return
    if DRY_RUN:
        print(f"  [DRY] Would append {label} to types.ts")
        return
    with open(types_path, "a", encoding="utf-8") as f:
        f.write("\n" + additions)
    print(f"  ✅ {label} appended to types.ts")


# ═══════════════════════════════════════════════════════════════
# MODULE 10: productionSalesFlow (276L)
# FIX: blockchainService → blockchainservice
# Types defined locally (ImportOrder, FinishedProduct, etc.)
# ═══════════════════════════════════════════════════════════════
def module_10_production_sales_flow():
    print("\n[10] productionSalesFlow")
    content = '''\
import {
  SalesChannel,
  WarehouseLocation,
  ProductType,
  OrderItem
} from '../types';
import { SalesCore } from './salesCore';
import { ShardingService } from './blockchainservice';

// ============================================================================
// 🏭 PRODUCTION & SALES FLOW DEFINITIONS
// Source: NATTCELL KERNEL
// ============================================================================

export interface ImportOrder {
  id: string;
  materialId: string;
  quantity: number;
  supplier: string;
  importTax: number;
  customsFee: number;
  warehouse: WarehouseLocation;
  status: 'PENDING' | 'CLEARED' | 'STORED';
  documents: string[];
  totalCost: number;
}

export interface FinishedProduct {
  id: string;
  sku: string;
  name: string;
  costPrice: number;
  marketPrice: number;
  qualityGrade: 'A' | 'B' | 'C';
  location: WarehouseLocation;
}

export interface DistributionPlanItem {
  product: FinishedProduct;
  destination: WarehouseLocation;
  quantity: number;
  transportId?: string;
}

export interface FlowLog {
  timestamp: number;
  step: string;
  detail: string;
  hash: string;
}

// ============================================================================
// ⚙️ FLOW ORCHESTRATOR
// ============================================================================

export class ProductionSalesFlow {
  private static instance: ProductionSalesFlow;
  private logs: FlowLog[] = [];
  private listeners: ((logs: FlowLog[]) => void)[] = [];

  static getInstance(): ProductionSalesFlow {
    if (!ProductionSalesFlow.instance) {
      ProductionSalesFlow.instance = new ProductionSalesFlow();
    }
    return ProductionSalesFlow.instance;
  }

  private log(step: string, detail: string) {
    const logEntry: FlowLog = {
      timestamp: Date.now(),
      step,
      detail,
      hash: ShardingService.generateShardHash({ step, detail, ts: Date.now() })
    };
    this.logs = [logEntry, ...this.logs];
    this.listeners.forEach(l => l(this.logs));
    console.log(`[FLOW] ${step}: ${detail}`);
  }

  public subscribe(listener: (logs: FlowLog[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public clearLogs() {
    this.logs = [];
    this.listeners.forEach(l => l(this.logs));
  }

  // --- CORE FLOW: FULL LIFECYCLE ---

  async fullFlow(rawMaterialId: string, quantity: number, targetChannel: SalesChannel): Promise<any> {
    this.clearLogs();
    this.log('INIT', `Khởi động quy trình End-to-End cho ${quantity}kg ${rawMaterialId}`);

    try {
      const importOrder = await this.importRawMaterial(rawMaterialId, quantity);
      const finishedProducts = await this.produceFinishedGoods(importOrder);
      await this.distributeToWarehouses(finishedProducts);
      const salesResult = await this.sellThroughChannels(finishedProducts, targetChannel);
      const financialReport = await this.calculateProfitAndCommission(importOrder, salesResult);

      this.log('COMPLETED', `Quy trình hoàn tất. Lợi nhuận ròng: ${financialReport.netProfit.toLocaleString()} VND`);
      return { importOrder, finishedProducts, salesResult, financialReport };
    } catch (error: any) {
      this.log('ERROR', `Quy trình thất bại: ${error.message}`);
      throw error;
    }
  }

  // --- STEP 1: IMPORT ---

  async importRawMaterial(materialId: string, quantity: number): Promise<ImportOrder> {
    this.log('IMPORT', `Đang đàm phán nhà cung cấp cho ${materialId}...`);
    await new Promise(r => setTimeout(r, 1000));

    const supplier = "Gold Corp Australia";
    const unitPrice = 1800000000;
    const rawCost = unitPrice * quantity;
    const importTax = rawCost * 0.01;
    const customsFee = 5000000;

    const order: ImportOrder = {
      id: `IMP-${Date.now()}`,
      materialId,
      quantity,
      supplier,
      importTax,
      customsFee,
      warehouse: WarehouseLocation.HCM_HEADQUARTER,
      status: 'CLEARED',
      documents: [`DOC-${Date.now()}-INV`, `DOC-${Date.now()}-CO`],
      totalCost: rawCost + importTax + customsFee
    };

    this.log('IMPORT', `Thông quan thành công. Tổng vốn: ${order.totalCost.toLocaleString()} VND.`);
    return order;
  }

  // --- STEP 2: PRODUCTION ---

  async produceFinishedGoods(importOrder: ImportOrder): Promise<FinishedProduct[]> {
    this.log('PRODUCTION', `Chuyển nguyên liệu vào dây chuyền sản xuất...`);
    await new Promise(r => setTimeout(r, 1500));

    const outputCount = Math.floor((importOrder.quantity * 1000) / 5);
    const productionCostPerUnit = 500000;
    const totalProductionCost = outputCount * productionCostPerUnit;
    const totalCost = importOrder.totalCost + totalProductionCost;
    const unitCost = totalCost / outputCount;

    this.log('PRODUCTION', `Hoàn thành đúc & chế tác. Sản lượng: ${outputCount} sản phẩm.`);
    this.log('QC', `Kiểm định chất lượng (Spectroscopy)... Đạt chuẩn 99.9%.`);

    const products: FinishedProduct[] = Array.from({ length: outputCount }).map((_, i) => ({
      id: `PROD-${importOrder.id}-${i}`,
      sku: `R-GOLD-18K-${i}`,
      name: `Nhẫn trơn 18K Standard`,
      costPrice: unitCost,
      marketPrice: unitCost * 1.3,
      qualityGrade: 'A' as const,
      location: WarehouseLocation.HCM_HEADQUARTER
    }));

    return products;
  }

  // --- STEP 3: DISTRIBUTION ---

  async distributeToWarehouses(products: FinishedProduct[]): Promise<void> {
    this.log('DISTRIBUTION', `Tính toán phương án điều phối kho...`);
    await new Promise(r => setTimeout(r, 1000));

    const total = products.length;
    const hcmCount = Math.floor(total * 0.5);
    const hnCount = Math.floor(total * 0.3);
    const dnCount = total - hcmCount - hnCount;

    products.slice(0, hcmCount).forEach(p => p.location = WarehouseLocation.HCM_HEADQUARTER);
    products.slice(hcmCount, hcmCount + hnCount).forEach(p => p.location = WarehouseLocation.HANOI_BRANCH);
    products.slice(hcmCount + hnCount).forEach(p => p.location = WarehouseLocation.DA_NANG_BRANCH);

    this.log('DISTRIBUTION', `Đã chuyển: ${hcmCount} về HCM, ${hnCount} ra Hà Nội, ${dnCount} về Đà Nẵng.`);
  }

  // --- STEP 4: SALES ---

  async sellThroughChannels(products: FinishedProduct[], _channel: SalesChannel): Promise<any> {
    this.log('SALES', `Kích hoạt chiến dịch bán hàng...`);
    await new Promise(r => setTimeout(r, 1200));

    const soldCount = Math.floor(products.length * 0.8);
    const soldItems = products.slice(0, soldCount);
    let totalRevenue = 0;

    const salesOrders = soldItems.map(p => {
      const orderItem: OrderItem = {
        productId: p.id,
        productCode: p.sku,
        productName: p.name,
        productType: ProductType.FINISHED_GOOD,
        sku: p.sku,
        quantity: 1,
        unitPrice: p.marketPrice,
        costPrice: p.costPrice,
        discount: 0,
        taxRate: 10,
        total: p.marketPrice,
        warehouseLocation: p.location
      };

      const pricing = SalesCore.calculatePricing([orderItem]);
      totalRevenue += pricing.totalAmount;
      return { p, pricing };
    });

    this.log('SALES', `Đã bán ${soldCount}/${products.length}. Doanh thu: ${totalRevenue.toLocaleString()} VND.`);
    return { soldCount, totalRevenue, salesOrders };
  }

  // --- STEP 5: FINANCIALS ---

  async calculateProfitAndCommission(importOrder: ImportOrder, salesResult: any): Promise<any> {
    this.log('FINANCE', `Tổng hợp báo cáo P&L...`);
    const { totalRevenue, salesOrders } = salesResult;
    const cogs = salesOrders.reduce((sum: number, item: any) => sum + item.pricing.costOfGoods, 0);
    const opex = totalRevenue * 0.1;
    const commission = totalRevenue * 0.02;
    const netProfit = totalRevenue - cogs - opex - commission;
    const margin = (netProfit / totalRevenue) * 100;

    this.log('FINANCE', `LỢI NHUẬN RÒNG: ${netProfit.toLocaleString()} VND (${margin.toFixed(2)}%)`);
    return { totalRevenue, cogs, opex, commission, netProfit, margin };
  }
}

export const FlowEngine = ProductionSalesFlow.getInstance();
'''
    write_file(
        "src/services/productionSalesFlow.ts",
        content,
        "productionSalesFlow"
    )


# ═══════════════════════════════════════════════════════════════
# MODULE 11: logisticsService (257L)
# FIX: blockchainService → blockchainservice
# ═══════════════════════════════════════════════════════════════
def module_11_logistics():
    print("\n[11] logisticsService")
    content = '''\
import { LogisticsSolution, TransferOrder, WarehouseLocation } from '../types';
import { ShardingService } from './blockchainservice';

// ============================================================================
// 🔌 LOGISTICS ADAPTER INTERFACES
// Source: NATTCELL KERNEL
// ============================================================================

interface APIQuoteRequest {
  fromDistrictId: number;
  toDistrictId: number;
  weightGram: number;
  insuranceValue: number;
  serviceId?: number;
}

interface LogisticsAdapter {
  providerId: string;
  providerName: string;
  serviceType: 'EXPRESS' | 'STANDARD' | 'AIR' | 'TRUCK';
  getLiveQuote(req: APIQuoteRequest): Promise<LogisticsSolution>;
  createOrder(orderData: any): Promise<string>;
}

// ============================================================================
// 🚚 GHN ADAPTER (Giao Hàng Nhanh)
// ============================================================================
class GHNAdapter implements LogisticsAdapter {
  providerId = 'GHN';
  providerName = 'Giao Hàng Nhanh';
  serviceType = 'EXPRESS' as const;

  async getLiveQuote(req: APIQuoteRequest): Promise<LogisticsSolution> {
    await new Promise(r => setTimeout(r, 150 + Math.random() * 250));
    const baseFee = 22000;
    const weightFee = Math.max(0, Math.ceil((req.weightGram - 2000) / 500)) * 5000;
    const insuranceFee = req.insuranceValue > 3000000 ? req.insuranceValue * 0.005 : 0;
    const totalFee = baseFee + weightFee + insuranceFee;

    return {
      partnerId: this.providerId,
      partnerName: this.providerName,
      serviceType: this.serviceType,
      cost: { shippingFee: baseFee + weightFee, insuranceFee, codFee: 0, fuelSurcharge: 0, total: totalFee },
      estimatedDelivery: Date.now() + (24 * 3600000),
      reliability: 94,
      totalCost: totalFee,
      score: 0,
      recommended: false
    };
  }

  async createOrder(_order: any): Promise<string> {
    await new Promise(r => setTimeout(r, 800));
    return `GHN${Date.now().toString().slice(-8)}`;
  }
}

// ============================================================================
// 📮 VIETTEL POST ADAPTER
// ============================================================================
class ViettelPostAdapter implements LogisticsAdapter {
  providerId = 'VTP';
  providerName = 'Viettel Post';
  serviceType = 'STANDARD' as const;

  async getLiveQuote(req: APIQuoteRequest): Promise<LogisticsSolution> {
    await new Promise(r => setTimeout(r, 200 + Math.random() * 300));
    const baseFee = 16500;
    const weightFee = Math.max(0, Math.ceil((req.weightGram - 2000) / 500)) * 3500;
    const insuranceFee = req.insuranceValue * 0.008;
    const totalFee = baseFee + weightFee + insuranceFee;

    return {
      partnerId: this.providerId,
      partnerName: this.providerName,
      serviceType: this.serviceType,
      cost: { shippingFee: baseFee + weightFee, insuranceFee, codFee: 0, fuelSurcharge: 0, total: totalFee },
      estimatedDelivery: Date.now() + (48 * 3600000),
      reliability: 96,
      totalCost: totalFee,
      score: 0,
      recommended: false
    };
  }

  async createOrder(_order: any): Promise<string> {
    return `VTP${Date.now().toString().slice(-9)}`;
  }
}

// ============================================================================
// ✈️ FEDEX ADAPTER (International)
// ============================================================================
class FedExAdapter implements LogisticsAdapter {
  providerId = 'FEDEX';
  providerName = 'FedEx International';
  serviceType = 'AIR' as const;

  async getLiveQuote(req: APIQuoteRequest): Promise<LogisticsSolution> {
    await new Promise(r => setTimeout(r, 600));
    const baseFee = 850000;
    const weightFee = Math.ceil(req.weightGram / 500) * 150000;
    const fuelSurcharge = (baseFee + weightFee) * 0.15;
    const totalFee = baseFee + weightFee + fuelSurcharge;

    return {
      partnerId: this.providerId,
      partnerName: this.providerName,
      serviceType: this.serviceType,
      cost: { shippingFee: baseFee + weightFee, insuranceFee: 0, codFee: 0, fuelSurcharge, total: totalFee },
      estimatedDelivery: Date.now() + (96 * 3600000),
      reliability: 99,
      totalCost: totalFee,
      score: 0,
      recommended: false
    };
  }

  async createOrder(_order: any): Promise<string> {
    return `FDX${Date.now().toString().slice(-10)}`;
  }
}

// ============================================================================
// 🧠 LOGISTICS ENGINE (CORE)
// ============================================================================
export class LogisticsEngine {
  private static instance: LogisticsEngine;
  private adapters: LogisticsAdapter[] = [
    new GHNAdapter(),
    new ViettelPostAdapter(),
    new FedExAdapter()
  ];

  public static getInstance() {
    if (!LogisticsEngine.instance) {
      LogisticsEngine.instance = new LogisticsEngine();
    }
    return LogisticsEngine.instance;
  }

  /**
   * AI Routing: Gọi đồng thời tất cả API để so sánh giá & thời gian
   */
  async selectOptimalLogistics(
    orderValue: number,
    weightGram: number,
    destination: string,
    isUrgent: boolean
  ): Promise<LogisticsSolution[]> {

    const toDistrictId = destination.includes('Hà Nội') ? 1001 : 1002;
    const fromDistrictId = 2001;

    const request: APIQuoteRequest = { fromDistrictId, toDistrictId, weightGram, insuranceValue: orderValue };

    const promises = this.adapters.map(adapter => adapter.getLiveQuote(request));
    const solutions = await Promise.all(promises);

    return solutions.map(sol => {
      const normCost = 1000000;
      const hours = (sol.estimatedDelivery - Date.now()) / 3600000;
      const scoreCost = Math.max(0, 100 - (sol.totalCost / normCost) * 50);
      const scoreTime = Math.max(0, 100 - (hours / 72) * 50);
      const wTime = isUrgent ? 0.7 : 0.3;
      const wCost = isUrgent ? 0.2 : 0.6;
      const wRel = 0.1;
      const finalScore = (scoreTime * wTime) + (scoreCost * wCost) + (sol.reliability * wRel);
      return { ...sol, score: finalScore };
    }).sort((a, b) => b.score - a.score)
      .map((s, i) => ({ ...s, recommended: i === 0 }));
  }

  /**
   * Vận chuyển nội bộ (Internal Transfer)
   */
  async createInternalTransfer(
    productId: string,
    productName: string,
    quantity: number,
    from: string,
    to: string
  ): Promise<TransferOrder> {
    const docHash = ShardingService.generateShardHash({ productId, from, to, ts: Date.now() });
    return {
      id: `TRF-${Date.now()}`,
      transferId: `INT-${Math.random().toString(36).substring(7).toUpperCase()}`,
      productId,
      productName,
      quantity,
      fromWarehouse: from,
      toWarehouse: to,
      transferDate: Date.now(),
      expectedDelivery: Date.now() + (48 * 3600000),
      status: 'PENDING',
      transportMethod: 'XE_CHUYEN_DUNG_OMEGA',
      documents: [docHash]
    };
  }
}

export const LogisticsCore = LogisticsEngine.getInstance();
'''
    write_file(
        "src/services/logisticsService.ts",
        content,
        "logisticsService"
    )


# ═══════════════════════════════════════════════════════════════
# MODULE 12: EventStagingLayer REAL (156L) — REPLACES SHIM
# FIX: blockchainService → blockchainservice
# ═══════════════════════════════════════════════════════════════
def module_12_event_staging():
    print("\n[12] EventStagingLayer (REAL — replaces shim)")
    content = '''\
import { ShardingService } from '../blockchainservice';

/**
 * 🛡️ EVENT STAGING LAYER (ESL) - CENTRAL EVENT STORE
 * Idempotency Key cấp độ bản ghi (Record Level).
 * Source: NATTCELL KERNEL (REAL implementation, replaces shim)
 */

export interface StagedEvent {
  id: string;
  eventId: string;
  idempotencyKey: string;
  payload: any;
  status: 'STAGED' | 'COMMITTED' | 'FAILED' | 'DUPLICATE_IGNORED';
  timestamp: number;
  metadata?: any;
}

class EventStagingLayerService {
  private static instance: EventStagingLayerService;
  private readonly STORAGE_KEY = 'OMEGA_ESL_LEDGER';
  private processedKeys: Set<string> = new Set();
  private stagingQueue: StagedEvent[] = [];

  private constructor() {
    this.hydrate();
  }

  public static getInstance(): EventStagingLayerService {
    if (!EventStagingLayerService.instance) {
      EventStagingLayerService.instance = new EventStagingLayerService();
    }
    return EventStagingLayerService.instance;
  }

  private hydrate() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        this.processedKeys = new Set(data.keys);
      }
    } catch (e) {
      console.warn("[ESL] Failed to hydrate staging ledger", e);
    }
  }

  private persist() {
    try {
      const data = {
        keys: Array.from(this.processedKeys),
        timestamp: Date.now()
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("[ESL] Persist failed", e);
    }
  }

  public generateIdempotencyKey(data: any, context: string): string {
    const cleanData = { ...data };
    delete cleanData.timestamp;
    delete cleanData.id;
    const stableString = JSON.stringify(cleanData, Object.keys(cleanData).sort());
    return ShardingService.generateShardHash({ content: stableString, context });
  }

  public isDuplicate(key: string): boolean {
    return this.processedKeys.has(key);
  }

  public stageEvent(payload: any, metadata?: any): StagedEvent {
    const context = metadata?.source || 'UNKNOWN_SOURCE';
    const idempotencyKey = this.generateIdempotencyKey(payload, context);

    if (this.isDuplicate(idempotencyKey)) {
      console.warn(`[ESL] Idempotency Check Failed! Key: ${idempotencyKey}`);
      return {
        id: `EVT-${Date.now()}`,
        eventId: `DUP-${idempotencyKey.substring(0, 8)}`,
        idempotencyKey,
        payload,
        status: 'DUPLICATE_IGNORED',
        timestamp: Date.now(),
        metadata
      };
    }

    const event: StagedEvent = {
      id: `EVT-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      eventId: `EID-${Date.now()}`,
      idempotencyKey,
      payload,
      status: 'STAGED',
      timestamp: Date.now(),
      metadata
    };

    this.stagingQueue.push(event);
    return event;
  }

  public commitEvent(eventId: string): void {
    const eventIndex = this.stagingQueue.findIndex(e => e.id === eventId);
    if (eventIndex !== -1) {
      const event = this.stagingQueue[eventIndex];
      event.status = 'COMMITTED';
      this.processedKeys.add(event.idempotencyKey);
      this.persist();
      this.stagingQueue.splice(eventIndex, 1);
      console.log(`[ESL] Event Committed & Key Locked: ${event.idempotencyKey}`);
    }
  }

  public rollbackEvent(eventId: string): void {
    const eventIndex = this.stagingQueue.findIndex(e => e.id === eventId);
    if (eventIndex !== -1) {
      this.stagingQueue[eventIndex].status = 'FAILED';
      console.warn(`[ESL] Event Rollback: ${eventId}`);
    }
  }

  public getQueue(): StagedEvent[] {
    return this.stagingQueue;
  }
}

export const StagingStore = EventStagingLayerService.getInstance();
'''
    write_file(
        "src/services/staging/EventStagingLayer.ts",
        content,
        "EventStagingLayer (REAL)"
    )


# ═══════════════════════════════════════════════════════════════
# MODULE 13: GlobalIdempotencyEnforcer (103L)
# No imports. Uses localStorage + crypto.subtle.
# ═══════════════════════════════════════════════════════════════
def module_13_idempotency():
    print("\n[13] GlobalIdempotencyEnforcer")
    content = '''\
/**
 * 🛡️ GLOBAL IDEMPOTENCY ENFORCER - PRODUCTION LEDGER
 * Đảm bảo tính duy nhất của giao dịch thông qua sổ cái lưu trữ bền vững.
 * Source: NATTCELL KERNEL
 * Note: Uses localStorage (browser) + crypto.subtle for hash generation.
 */
export class GlobalIdempotencyEnforcer {
  private static instance: GlobalIdempotencyEnforcer;
  private readonly STORAGE_KEY = 'NATT_OS_IDEMPOTENCY_LEDGER_V2';

  private constructor() {
    this.initLedger();
  }

  static getInstance(): GlobalIdempotencyEnforcer {
    if (!GlobalIdempotencyEnforcer.instance) {
      GlobalIdempotencyEnforcer.instance = new GlobalIdempotencyEnforcer();
    }
    return GlobalIdempotencyEnforcer.instance;
  }

  private initLedger() {
    if (!localStorage.getItem(this.STORAGE_KEY)) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify({}));
    }
  }

  async enforce(
    eventId: string,
    tenantId: string,
    serviceName: string,
    payload: any,
    ttlHours: number = 24
  ): Promise<{ isDuplicate: boolean; cachedResult?: any }> {
    const requestHash = await this.generateHash(eventId, tenantId, serviceName, payload);
    const ledger = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
    const now = Date.now();

    this.cleanup(ledger, now);

    if (ledger[requestHash]) {
      const entry = ledger[requestHash];
      if (entry.status === 'PROCESSED') {
        console.log(`[IDEMPOTENCY] Cache Hit: ${requestHash.substring(0, 8)}`);
        return { isDuplicate: true, cachedResult: entry.result_cache };
      }
      return { isDuplicate: true };
    }

    ledger[requestHash] = {
      event_id: eventId,
      tenant_id: tenantId,
      service_name: serviceName,
      status: 'PROCESSING',
      processed_at: now,
      expires_at: now + (ttlHours * 3600000)
    };

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(ledger));
    return { isDuplicate: false };
  }

  async setResult(
    eventId: string,
    tenantId: string,
    serviceName: string,
    payload: any,
    result: any
  ): Promise<void> {
    const requestHash = await this.generateHash(eventId, tenantId, serviceName, payload);
    const ledger = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');

    if (ledger[requestHash]) {
      ledger[requestHash].status = result?.status === 'FAILED' ? 'FAILED' : 'PROCESSED';
      ledger[requestHash].result_cache = result;
      ledger[requestHash].completed_at = Date.now();
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(ledger));
    }
  }

  private cleanup(ledger: any, now: number) {
    Object.keys(ledger).forEach(key => {
      if (ledger[key].expires_at < now) {
        delete ledger[key];
      }
    });
  }

  private async generateHash(...args: any[]): Promise<string> {
    const str = JSON.stringify(args);
    const msgBuffer = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
  }
}
'''
    write_file(
        "src/services/shared/GlobalIdempotencyEnforcer.ts",
        content,
        "GlobalIdempotencyEnforcer"
    )


# ═══════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════
def main():
    print("=" * 60)
    print("NATTCELL → GOLDMASTER MERGE — BATCH C")
    print("4 modules, ~792L real code")
    print("=" * 60)

    if not os.path.isdir(GM):
        print(f"\n❌ Goldmaster not found: {GM}")
        sys.exit(1)

    if DRY_RUN:
        print("\n🔍 DRY RUN — no files will be written\n")

    module_10_production_sales_flow()
    module_11_logistics()
    module_12_event_staging()
    module_13_idempotency()

    print("\n" + "=" * 60)
    print("BATCH C COMPLETE")
    print("=" * 60)
    print("\nVerify:")
    print("  cd goldmaster && npx tsc --noEmit 2>&1 | head -20")
    print("  npm run build")
    print()
    print("TOTAL NATTCELL MERGE: 13 modules across 3 batches")
    print("  Batch A: 5 modules (278L) — governance, recon, refund, orphan, linker")
    print("  Batch B: 4 modules (484L) — cost, auth, personnel, hr")
    print("  Batch C: 4 modules (792L) — production, logistics, staging, idempotency")
    print("  GRAND TOTAL: ~1,554L real business code")


if __name__ == "__main__":
    main()
