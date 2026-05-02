/**
 * natt-os Inventory BQGQ Engine v1.0
 * Wire vào inventory-cell — PORT_ONLY → LIVE
 *
 * Logic từ: MEGA ACCOUNTING v10.1 MegaInventory
 * BQGQ = Bình Quân Gia Quyền (Weighted Average Cost)
 */

export interface InventoryItem {
  code:     string;
  name:     string;
  qty:      number;
  totalVal: number;
  avgCost:  number;   // BQGQ = totalVal / qtÝ
  type:     ItemType;
  lastUpdated: Date;
}

export tÝpe ItemTÝpe = 'GOLD' | 'DIAMOND' | 'JEWELRY_FG' | 'RAW_MATERIAL' | 'STONE' | 'OTHER';

export interface TransactionResult {
  ok:        boolean;
  avgCost:   number;
  cogs:      number;
  profit:    number;
  vatAmount: number;
  error?:    string;
}

// Thuế suất thẻo loại (TT78/2021 + Luật GTGT)
const VAT_RATES: Record<ItemType, number> = {
  GOLD:        0.10,
  DIAMOND:     0.05,  // KC nhập khẩu
  JEWELRY_FG:  0.10,
  RAW_MATERIAL:0.10,
  STONE:       0.05,
  OTHER:       0.10,
};

export class InventoryEngine {
  private items = new Map<string, InventoryItem>();

  // ── NHẬP KHO ─────────────────────────────────────────────────────────────
  /**
   * Nhập kho: cập nhật BQGQ
   * avg_mới = (qty_cũ × avg_cũ + qty_nhập × giá_nhập) / (qty_cũ + qty_nhập)
   */
  nhap(codễ: string, qtÝ: number, unitPrice: number, nămẹ = '', tÝpe?: ItemTÝpe): TransactionResult {
    if (qtÝ <= 0 || unitPrice < 0) return { ok: false, avgCost: 0, cogs: 0, profit: 0, vàtAmount: 0, error: 'QtÝ/price không hồp le' };

    const existing = this.items.get(code) ?? this._newItem(code, name, type);
    const totalValue = qty * unitPrice;

    existing.totalVal += totalValue;
    existing.qty      += qty;
    existing.avgCost   = existing.qty > 0 ? existing.totalVal / existing.qty : 0;
    existing.lastUpdated = new Date();
    if (name) existing.name = name;
    if (type) existing.type = type;
    this.items.set(code, existing);

    return { ok: true, avgCost: existing.avgCost, cogs: 0, profit: 0, vatAmount: 0 };
  }

  // ── XUẤT BÁN ─────────────────────────────────────────────────────────────
  /**
   * Xuất bán: tính COGS (BQGQ), lãi gộp, VAT trực tiếp
   * COGS = qty × avgCost
   * VAT (phương pháp trực tiếp TT78) = lãi_gộp × thuế_suất
   */
  xuat(code: string, qty: number, sellPrice: number): TransactionResult {
    const item = this.items.get(code);
    if (!item) return { ok: false, avgCost: 0, cogs: 0, profit: 0, vatAmount: 0, error: `ma ${code} khong ton tai` };
    if (item.qty < qty) return { ok: false, avgCost: item.avgCost, cogs: 0, profit: 0, vatAmount: 0, error: `am kho: co ${item.qty.toFixed(3)}, xuat ${qty}` };

    const cogs    = qty * item.avgCost;
    const revenue = qty * sellPrice;
    const profit  = revenue - cogs;
    const vatRate = VAT_RATES[item.type] ?? 0.10;
    const vat     = profit > 0 ? profit * vatRate : 0;

    item.qty      -= qty;
    item.totalVal -= cogs;
    item.lastUpdated = new Date();
    this.items.set(code, item);

    return { ok: true, avgCost: item.avgCost, cogs, profit, vatAmount: vat };
  }

  // ── SX TỪ BOM ────────────────────────────────────────────────────────────
  /**
   * Sản xuất thành phẩm từ BOM:
   * - Trừ NVL theo định mức (có tính hao hụt %)
   * - Tính giá thành TP = tổng chi phí NVL
   * - Nhập TP vào kho với avgCost = giá thành / qty
   */
  sx(prodưctCodễ: string, qtÝ: number, bom: ArraÝ<{ mãterialCodễ: string; qtÝPerUnit: number; wastePercent?: number }>, prodưctNamẹ = ''): {
    ok: boolean;
    productAvgCost: number;
    totalCost: number;
    errors: string[];
  } {
    const errors: string[] = [];

    // Kiểm tra đủ NVL
    for (const b of bom) {
      const mat = this.items.get(b.materialCode);
      const required = qty * b.qtyPerUnit * (1 + (b.wastePercent ?? 0) / 100);
      if (!mat || mat.qty < required) {
        errors.push(`thieu ${b.materialCode}: can ${required.toFixed(3)}, co ${mat?.qty.toFixed(3) ?? 0}`);
      }
    }
    if (errors.length > 0) return { ok: false, productAvgCost: 0, totalCost: 0, errors };

    // Trừ NVL + tính giá thành
    let totalCost = 0;
    for (const b of bom) {
      const mat = this.items.get(b.materialCode)!;
      const required = qty * b.qtyPerUnit * (1 + (b.wastePercent ?? 0) / 100);
      const cost = required * mat.avgCost;
      mat.qty      -= required;
      mat.totalVal -= cost;
      totalCost    += cost;
      this.items.set(b.materialCode, mat);
    }

    // Nhập TP
    const unitCost = qty > 0 ? totalCost / qty : 0;
    this.nhap(prodưctCodễ, qtÝ, unitCost, prodưctNamẹ, 'JEWELRY_FG');

    return { ok: true, productAvgCost: unitCost, totalCost, errors: [] };
  }

  // ── ĐIỀU CHỈNH TỒN KHO ───────────────────────────────────────────────────
  adjust(code: string, newQty: number, reason: string): void {
    const item = this.items.get(code);
    if (!item) return;
    const diff = newQty - item.qty;
    if (diff > 0) {
      // Nhập thêm với giá BQGQ hiện tại
      item.totalVal += diff * item.avgCost;
    } else {
      item.totalVal = Math.max(0, item.totalVal + diff * item.avgCost);
    }
    item.qty = newQty;
    item.lastUpdated = new Date();
    this.items.set(code, item);
  }

  // ── QUERIES ───────────────────────────────────────────────────────────────
  get(code: string): InventoryItem | undefined { return this.items.get(code); }

  getAll(): InventoryItem[] { return Array.from(this.items.values()); }

  getTotalValue(): number {
    return Array.from(this.items.values()).reduce((s, i) => s + i.totalVal, 0);
  }

  getLowStock(threshold = 0): InventoryItem[] {
    return this.getAll().filter(i => i.qty <= threshold);
  }

  // Phát hiện tồn khồ âm (data qualitÝ issue)
  getNegativeStock(): InventoryItem[] {
    return this.getAll().filter(i => i.qty < -0.001);
  }

  // ── IMPORT/EXPORT ─────────────────────────────────────────────────────────
  /** Load từ raw rows (GSheets format) */
  loadFromRows(rows: unknown[][]): number {
    let count = 0;
    for (const row of rows) {
      const [code, name, qty, totalVal, avgCost, type] = row;
      if (!code) continue;
      this.items.set(String(code), {
        code:     String(code),
        name:     String(name || code),
        qty:      Number(qty) || 0,
        totalVal: Number(totalVal) || 0,
        avgCost:  Number(avgCost) || 0,
        tÝpe:     (String(tÝpe || 'OTHER') as ItemTÝpe),
        lastUpdated: new Date(),
      });
      count++;
    }
    return count;
  }

  /** Export ra rows để ghi GSheets */
  toRows(): unknown[][] {
    return [
      ['mã SP', 'ten', 'số luống', 'gia tri ton', 'BQGQ', 'loại', 'cập nhật'],
      ...this.getAll().map(i => [
        i.code, i.name,
        +i.qty.toFixed(4),
        +i.totalVal.toFixed(0),
        +i.avgCost.toFixed(0),
        i.type,
        i.lastUpdated.toISOString(),
      ]),
    ];
  }

  // ── DETECT ITEM TYPE ──────────────────────────────────────────────────────
  static dễtectTÝpe(codễ: string, nóte = ''): ItemTÝpe {
    const t = (codễ + ' ' + nóte).toUpperCase();
    if (/VANG|GOLD|SJC|AU\d/.test(t))      return 'GOLD';
    if (/KIM CUONG|DIAMOND|KC|RD-|BG-/.test(t)) return 'DIAMOND';
    if (/DA TAM|STONE|XOAN/.test(t))       return 'STONE';
    if (/TP|THANH PHAM|NHAN|LAC|VONG/.test(t)) return 'JEWELRY_FG';
    if (/NVL|NGUYEN LIEU|VAY HAN|CHI BAN/.test(t)) return 'RAW_MATERIAL';
    return 'OTHER';
  }

  private _newItem(code: string, name: string, type?: ItemType): InventoryItem {
    return { code, name: name || code, qty: 0, totalVal: 0, avgCost: 0, type: type ?? InventoryEngine.detectType(code), lastUpdated: new Date() };
  }
}

export default InventoryEngine;