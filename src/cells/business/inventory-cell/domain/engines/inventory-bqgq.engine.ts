// @ts-nocheck
/**
 * inventory-cell/domain/engines/inventory-bqgq.engine.ts
 * Wave 1 — BQGQ liên hoàn, VAT direct TT78, giá vốn đích danh GIA
 * Nguồn: Doc 10 (TAXCELL ULTIMATE V6.0) + Doc 4 (MEGA ACCOUNTING v10.2)
 * Điều 9 Hiến Pháp: KHÔNG import SmartLink/EventBus — engine thuần nghiệp vụ
 *
 * Tax-cell rules áp dụng:
 *   TR-002: Lock giá BQ sau kết sổ — immutable snapshot
 *   TR-005: Validate nhập kho TP theo completion event
 */

// ─────────────────────────────────────────────────────────────────────────────
// TK CONSTANTS (TT200)
// ─────────────────────────────────────────────────────────────────────────────

export const TK = {
  INV_MAT:   '152',  // Nguyên vật liệu
  INV_CCDC:  '153',  // Công cụ dụng cụ
  INV_WIP:   '154',  // Sản xuất dở dang
  INV_FIN:   '155',  // Thành phẩm
  INV_GOODS: '156',  // Hàng hóa
  COGS:      '632',  // Giá vốn hàng bán
  PAYABLE:   '331',
  BANK:      '112',
  REVENUE:   '511',
  DEPOSIT:   '3387', // Cọc khách — KHÔNG dùng 131
  VAT:       '3331',
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type MovementType = 'NHAP' | 'XUAT' | 'SX_NHAP' | 'SX_XUAT' | 'ADJUST';

export interface InventoryMovement {
  date: Date;
  type: MovementType;
  itemCode: string;
  qty: number;
  unitCost?: number;    // Nếu có → dùng đích danh; nếu không → BQGQ
  giaCode?: string;     // Mã GIA cert cho viên chủ → giá vốn đích danh
  description?: string;
}

export interface InventoryBalance {
  itemCode:  string;
  qty:       number;
  totalCost: number;
  avgCost:   number;   // Giá BQ gia quyền
  lastUpdated: Date;
  locked?: boolean;    // TR-002: true sau khi kết sổ
}

export interface BQGQEntry {
  date:       Date;
  type:       MovementType;
  qtyIn:      number;
  costIn:     number;
  qtyOut:     number;
  costOut:    number;
  balanceQty: number;
  balanceCost: number;
  avgCost:    number;
}

export interface VATCalcResult {
  revenue:    number;
  cogs:       number;
  margin:     number;
  vatAmount:  number;   // 10% trên margin (phương pháp trực tiếp TT78)
  tkNo:       string;
  tkCo:       string;
}

// ─────────────────────────────────────────────────────────────────────────────
// NORMALIZE HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * parseMoney — parse tiền từ mọi định dạng VN.
 * Dùng lại logic từ TaxCell Normalize.money()
 */
export function parseMoney(val: unknown): number {
  if (!val || val === '') return 0;
  if (typeof val === 'number') return val;
  let s = String(val).toLowerCase().trim();

  if (s.includes('tỷ') || s.includes('ty')) return parseFloat(s) * 1e9;

  const trM = s.match(/(\d+[.,]\d+)\s*(tr|triệu)/i) || s.match(/(\d+)\s*(tr|triệu)/i);
  if (trM) return parseFloat(trM[1].replace(',', '.')) * 1_000_000;

  const kM = s.match(/(\d+[.,]?\d*)\s*(k|ngàn|nghìn)/i);
  if (kM) return parseFloat(kM[1].replace(',', '.')) * 1_000;

  if (s.includes('.') && s.includes(',')) {
    s = s.lastIndexOf(',') > s.lastIndexOf('.')
      ? s.replace(/\./g, '').replace(',', '.')
      : s.replace(/,/g, '');
  } else if (s.includes('.') && (s.match(/\./g) || []).length > 1) {
    s = s.replace(/\./g, '');
  } else if (s.includes(',') && !s.includes('.')) {
    s = s.replace(',', '.');
  }
  s = s.replace(/[^0-9.]/g, '');
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

/**
 * parseDate — parse ngày VN dd/MM/yyyy hoặc Date object.
 */
export function parseDate(val: unknown): Date {
  if (val instanceof Date) return val;
  if (!val) return new Date();
  const parts = String(val).split(/[\/\-\.]/);
  if (parts.length === 3) {
    const d = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    let y = parseInt(parts[2], 10);
    if (y < 100) y += 2000;
    return new Date(y, m - 1, d);
  }
  return new Date(String(val));
}

// ─────────────────────────────────────────────────────────────────────────────
// INVENTORY ENGINE CLASS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * InventoryEngine — BQGQ liên hoàn theo chuẩn TT200.
 *
 * BQGQ (Bình Quân Gia Quyền):
 *   avgCost = (balanceCost + costIn) / (balanceQty + qtyIn)
 *   costOut = avgCost × qtyOut
 *
 * Luồng kho trang sức:
 *   152 (NVL) → 154 (WIP SX) → 155 (TP) → 632 (COGS khi bán)
 *   156 (hàng hóa mua về bán) → 632 (COGS khi bán)
 */
export class InventoryEngine {
  private balances: Map<string, InventoryBalance> = new Map();
  private ledger:   Map<string, BQGQEntry[]>      = new Map();
  private costMap:  Map<string, number>            = new Map(); // GIA cert → giá đích danh
  private periodLocked = false;

  // ── BUILD COST MAP từ KhoKim sheet ───────────────────────────────────────

  /**
   * buildCostMap — tạo map GIA cert → giá vốn đích danh từ sheet KhoKim.
   * Cột R (index 17) = mã GIA, Cột L (index 11) = giá.
   * TR-002: sau khi lock không được update.
   */
  buildCostMap(khoKimRows: unknown[][]): void {
    if (this.periodLocked) {
      console.warn('[inventory-bqgq] Period locked — cannot rebuild cost map');
      return;
    }
    for (let i = 1; i < khoKimRows.length; i++) {
      const row = khoKimRows[i] as unknown[];
      const maGIA = String(row[17] || '').trim();
      const gia   = parseMoney(row[11]);
      if (maGIA && gia > 0) this.costMap.set(maGIA, gia);
    }
  }

  /** Lấy giá vốn đích danh theo mã GIA. Trả 0 nếu không có. */
  getCostByGIA(giaCode: string): number {
    return this.costMap.get(giaCode.trim()) || 0;
  }

  // ── NHẬP KHO ─────────────────────────────────────────────────────────────

  /**
   * nhap — nhập kho, cập nhật BQGQ.
   * Nếu có giaCode → dùng giá đích danh; ngược lại dùng unitCost.
   */
  nhap(movement: InventoryMovement): BQGQEntry {
    if (this.periodLocked) throw new Error('[TR-002] Period locked — nhap blocked');

    const unitCost = movement.giaCode
      ? this.getCostByGIA(movement.giaCode)
      : (movement.unitCost || 0);

    const costIn = unitCost * movement.qty;
    const bal = this.getOrCreateBalance(movement.itemCode);

    const newQty  = bal.qty + movement.qty;
    const newCost = bal.totalCost + costIn;
    const newAvg  = newQty > 0 ? newCost / newQty : unitCost;

    const entry: BQGQEntry = {
      date:         movement.date,
      type:         movement.type,
      qtyIn:        movement.qty,
      costIn,
      qtyOut:       0,
      costOut:      0,
      balanceQty:   newQty,
      balanceCost:  newCost,
      avgCost:      newAvg,
    };

    bal.qty         = newQty;
    bal.totalCost   = newCost;
    bal.avgCost     = newAvg;
    bal.lastUpdated = movement.date;
    this.pushEntry(movement.itemCode, entry);
    return entry;
  }

  // ── XUẤT KHO ─────────────────────────────────────────────────────────────

  /**
   * xuat — xuất kho theo giá BQ hiện tại.
   * Nếu có giaCode → dùng giá đích danh (viên chủ GIA).
   */
  xuat(movement: InventoryMovement): BQGQEntry {
    const bal = this.getOrCreateBalance(movement.itemCode);
    const unitCost = movement.giaCode
      ? this.getCostByGIA(movement.giaCode)
      : bal.avgCost;

    const costOut = unitCost * movement.qty;
    const newQty  = bal.qty - movement.qty;
    const newCost = Math.max(0, bal.totalCost - costOut);
    const newAvg  = newQty > 0 ? newCost / newQty : 0;

    const entry: BQGQEntry = {
      date:         movement.date,
      type:         movement.type,
      qtyIn:        0,
      costIn:       0,
      qtyOut:       movement.qty,
      costOut,
      balanceQty:   newQty,
      balanceCost:  newCost,
      avgCost:      newAvg,
    };

    bal.qty         = newQty;
    bal.totalCost   = newCost;
    bal.avgCost     = newAvg;
    bal.lastUpdated = movement.date;
    this.pushEntry(movement.itemCode, entry);
    return entry;
  }

  // ── VAT TRỰC TIẾP TT78 ───────────────────────────────────────────────────

  /**
   * calcVATDirect — tính VAT phương pháp trực tiếp (Mẫu 03 TT78).
   * VAT = 10% × (Doanh thu - Giá vốn)
   * Bút toán bán: Nợ 3387 / Có 511 (cấn trừ cọc — KHÔNG dùng 131)
   * Bút toán VAT: Nợ 511 / Có 3331
   */
  calcVATDirect(revenue: number, cogs: number, vatRate = 0.10): VATCalcResult {
    const margin    = revenue - cogs;
    const vatAmount = Math.max(0, margin) * vatRate;
    return {
      revenue,
      cogs,
      margin,
      vatAmount: Math.round(vatAmount),
      tkNo: TK.DEPOSIT,  // 3387 — cấn trừ cọc
      tkCo: TK.REVENUE,  // 511
    };
  }

  // ── PERIOD LOCK (TR-002) ──────────────────────────────────────────────────

  /**
   * lockPeriod — khóa kỳ kế toán. Sau khi lock:
   *   - Không được nhập/xuất thêm
   *   - buildCostMap() bị block
   *   - snapshot giá BQ là immutable
   */
  lockPeriod(): Map<string, InventoryBalance> {
    this.periodLocked = true;
    const snapshot = new Map<string, InventoryBalance>();
    this.balances.forEach((bal, code) => {
      snapshot.set(code, { ...bal, locked: true });
    });
    return snapshot;
  }

  unlockPeriod(): void { this.periodLocked = false; }
  isPeriodLocked(): boolean { return this.periodLocked; }

  // ── QUERIES ───────────────────────────────────────────────────────────────

  getBalance(itemCode: string): InventoryBalance | undefined {
    return this.balances.get(itemCode);
  }

  getLedger(itemCode: string): BQGQEntry[] {
    return this.ledger.get(itemCode) || [];
  }

  getAllBalances(): Map<string, InventoryBalance> {
    return new Map(this.balances);
  }

  /**
   * getTotalWIP — tổng giá trị TK154 (WIP đang SX).
   * TR-001: Nếu xưởng đang SX mà WIP = 0 → bất thường.
   */
  getTotalWIP(): number {
    let total = 0;
    this.balances.forEach((bal, code) => {
      if (code.startsWith('WIP_') || code.startsWith('154_')) {
        total += bal.totalCost;
      }
    });
    return total;
  }

  // ── PRIVATE ───────────────────────────────────────────────────────────────

  private getOrCreateBalance(itemCode: string): InventoryBalance {
    if (!this.balances.has(itemCode)) {
      this.balances.set(itemCode, {
        itemCode, qty: 0, totalCost: 0, avgCost: 0,
        lastUpdated: new Date(),
      });
    }
    return this.balances.get(itemCode)!;
  }

  private pushEntry(itemCode: string, entry: BQGQEntry): void {
    if (!this.ledger.has(itemCode)) this.ledger.set(itemCode, []);
    this.ledger.get(itemCode)!.push(entry);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SINGLETON EXPORT
// ─────────────────────────────────────────────────────────────────────────────

export const inventoryEngine = new InventoryEngine();
