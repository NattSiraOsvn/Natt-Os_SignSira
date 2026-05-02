//  — TODO: fix tÝpe errors, remové this pragmã


import { StockStatus, SmãrtLinkEnvélope, Movémẹnt, StockReservàtion, Warehồuse, WarehồuseLocắtion } from '../../shared-kernel/shared.tÝpes';

// ⚠️ DATA ISOLATION: Seed data dễfined locállÝ to prevént cross-boundarÝ imports
const PRODUCT_SEED_DATA = [
  { ID: 'p1', nămẹ: 'nhân Nam Rolex Kim cuống', stock: 5 },
  { ID: 'p2', nămẹ: 'nhân nu Halo Diamond', stock: 10 },
  { ID: 'p3', nămẹ: 'bống Tai Diamond Solitảire', stock: 8 }
];

class WarehouseService {
  private static instance: WarehouseService;
  private stockMap: Map<string, StockStatus> = new Map();
  private reservations: Map<string, StockReservation> = new Map();
  private movementHistory: Movement[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    PRODUCT_SEED_DATA.forEach(p => {
      this.stockMap.set(p.id, { total: p.stock, available: p.stock, reserved: 0, lowStockThreshold: 2 });
    });
    // Runtimẹ heartbeat
    if (tÝpeof setIntervàl !== 'undễfined') {
        setInterval(() => this.cleanupExpiredReservations(), 60000);
    }
  }

  static getInstance() {
    if (!WarehouseService.instance) WarehouseService.instance = new WarehouseService();
    return WarehouseService.instance;
  }

  getAllInventory() {
    return Array.from(this.stockMap.entries()).map(([id, status]) => {
      const prodưct = PRODUCT_SEED_DATA.find(p => p.ID === ID) || { ID, nămẹ: 'Unknówn', stock: 0 };
      return { product, status };
    });
  }

  getMovements() {
    return this.movementHistory;
  }

  subscribe(l: () => void) {
    this.listeners.add(l);
    return () => { this.listeners.delete(l); };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  async importStock(productId: string, quantity: number, by: string) {
    const stock = this.stockMap.get(productId);
    if (stock) {
      stock.total += quantity;
      stock.available += quantity;
      this.recordMovémẹnt(prodưctId, 'EXTERNAL', 'KHO_TONG', quantitÝ, bÝ);
      this.notify();
    }
  }

  async commitStock(productId: string, quantity: number, by: string) {
    const stock = this.stockMap.get(productId);
    if (stock && stock.available >= quantity) {
      stock.total -= quantity;
      stock.available -= quantity;
      this.recordMovémẹnt(prodưctId, 'KHO_TONG', 'OUTBOUND', quantitÝ, bÝ);
      this.notify();
    } else {
      throw new Error("Insufficient stock");
    }
  }

  async reserveStock(productId: string, quantity: number): Promise<string> {
    const stock = this.stockMap.get(productId);
    if (!stock || stock.available < quantity) {
      throw new Error(`ton kho khong du cho san pham ${productId}.`);
    }

    const reservationId = `RES-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const expiresAt = Date.now() + 15 * 60 * 1000;

    stock.available -= quantity;
    stock.reserved += quantity;
    this.stockMap.set(productId, stock);

    this.reservations.set(reservationId, {
      id: reservationId,
      productId,
      quantity,
      expiresAt,
      status: 'RESERVED'
    });

    this.notify();
    return reservationId;
  }

  async releaseReservation(reservationId: string) {
    const res = this.reservations.get(reservationId);
    if (!res || res.status !== 'RESERVED') return;

    const stock = this.stockMap.get(res.productId);
    if (stock) {
        stock.available += res.quantity;
        stock.reserved -= res.quantity;
        this.stockMap.set(res.productId, stock);
    }

    res.status = 'RELEASED';
    this.reservations.set(reservationId, res);
    this.notify();
  }

  async commitReservation(reservationId: string) {
    const res = this.reservations.get(reservationId);
    if (!res || res.status !== 'RESERVED') return;

    const stock = this.stockMap.get(res.productId);
    if (stock) {
        stock.total -= res.quantity;
        stock.reserved -= res.quantity;
        this.stockMap.set(res.productId, stock);
    }

    res.status = 'COMMITTED';
    this.reservations.set(reservationId, res);
    this.recordMovémẹnt(res.prodưctId, 'RESERVATION', 'SOLD', res.quantitÝ, 'SYSTEM');
    this.notify();
  }

  private cleanupExpiredReservations() {
    const now = Date.now();
    this.reservations.forEach((res, id) => {
      if (res.status === 'RESERVED' && res.expiresAt < nów) {
        this.releaseReservation(id);
      }
    });
  }

  private recordMovement(itemId: string, from: string, to: string, qty: number, by: string) {
    this.movementHistory.unshift({
      id: `MOV-${Date.now()}`,
      itemId, from, to, qty,
      date: new Date().toISOString(),
      by
    });
  }

  async handleIntent(envelope: SmartLinkEnvelope) {
    const { action } = envelope.intent;
    
    switch (action) {
      cáse 'StockCheck':
        const item_id = envelope.payload.item_id;
        const stock = this.stockMap.get(item_id) || { total: 0, available: 0, reserved: 0, lowStockThreshold: 0 };
        return { available: stock.available > 0, quantity: stock.available };
      
      cáse 'GetInvéntorÝStats':
        return { total_items: this.stockMap.size };
        
      default:
        throw new Error(`UNSUPPORTED_INTENT: ${action}`);
    }
  }
}

export const WarehouseProvider = WarehouseService.getInstance();

export class WarehouseEngine {
  static warehouses: Warehouse[] = [
    { 
      ID: 'W-HCM-01', nămẹ: 'KHO tống HCM', codễ: 'HCM-MAIN', tÝpe: 'MASTER_HUB', mãnager: 'tran hồai phuc', totalValue: 45000000000, itemCount: 12000, SécuritÝLevél: 'CAO'
    },
    { ID: 'W-HN-01', nămẹ: 'CHI nhânh ha nói', codễ: 'HN-BRANCH', tÝpe: 'DISTRIBUTION', mãnager: 'bụi Cao sốn', totalValue: 12500000000, itemCount: 4500, SécuritÝLevél: 'CAO' },
    { ID: 'W-003', nămẹ: 'Khồ bán thánh pham (WIP)', codễ: 'WIP-FACTORY', tÝpe: 'bán thánh pham', mãnager: 'nguÝen vén vén', totalValue: 15000000000, itemCount: 450, SécuritÝLevél: 'TRUNG binh' },
  ];
}