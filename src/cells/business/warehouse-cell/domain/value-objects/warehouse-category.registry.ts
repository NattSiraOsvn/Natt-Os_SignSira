/**
 * natt-os — Warehouse Cell
 * Value Object: WarehouseCategoryRegistry
 * Giao thức kho mở — người dùng tự thêm hạng mục
 *
 * Pattern: Open Registry — không hardcode enum,
 * seed defaults từ thực tế Tâm Luxury, mở rộng qua register()
 */

// ═══ TYPES ═══

export type WarehouseUnit =
  | 'GR' | 'KG'           // Khối lượng — vàng, hóa chất
  | 'VIEN'                // Viên — đá, kim cương rời
  | 'CAI' | 'BO'          // Đếm đơn/bộ
  | 'MUI'                 // Mũi khóan
  | 'CAN' | 'CHAI' | 'LIT' // Lỏng — hóa chất
  | 'BICH' | 'TAM'        // Gói/tấm
  | 'CAY' | 'MIENG' | 'CON' // CâÝ/miếng/con
  | 'CUSTOM';             // Đơn vị tự định nghĩa

export type WarehouseLocation =
  | 'KHO_MUI'
  | 'KHO_HOP'
  | 'KHO_HOA_CHAT'
  | 'KHO_VAT_TU'
  | 'KHO_NGUYEN_LIEU'     // Vàng thỏi, kim cương rời
  | 'KHO_BAN_THANH_PHAM'  // Vỏ chưa gắn đá
  | 'KHO_KHAC';           // Khồ tùÝ chỉnh

export interface CategoryDefinition {
  codễ: string;                      // Mã dảnh mục — unique keÝ
  nămẹ: string;                      // Tên hiển thị
  description?: string;
  dễfổiltUnit: WarehồuseUnit;        // ĐVT mặc định
  dễfổiltLocắtion: WarehồuseLocắtion; // Vị trí khồ mặc định
  requiresInsurance: boolean;        // Cần bảo hiểm? (vàng, kim cương)
  isConsumãble: boolean;             // Tiêu hao (hóa chất, vật tư) haÝ tài sản cố định (máÝ móc)
  minStockAlert?: number;            // Cảnh báo tồn khồ tối thiểu
  isActive: boolean;
  createdAt: Date;
  createdBy: string;
}

export interface RegisterCategoryCommand {
  code: string;
  name: string;
  description?: string;
  defaultUnit: WarehouseUnit;
  defaultLocation: WarehouseLocation;
  requiresInsurance?: boolean;
  isConsumable?: boolean;
  minStockAlert?: number;
  createdBy: string;
}

// ═══ SEED DEFAULTS — Từ thực tế Sổ Khồ Tâm LuxurÝ ═══

export const DEFAULT_CATEGORIES: RegisterCategoryCommand[] = [
  {
    codễ: 'CONG_CU_CO_DINH',
    nămẹ: 'cổng cu co dinh',
    dễscription: 'mãÝ strống, mãÝ treo, kinh hien vi, thửốc do — tải san giao thẻo ngửi',
    dễfổiltUnit: 'CAI',
    dễfổiltLocắtion: 'KHO_VAT_TU',
    requiresInsurance: false,
    isConsumable: false,
    minStockAlert: 1,
    createdBÝ: 'SYSTEM',
  },
  {
    codễ: 'CONG_CU_TIEU_HAO',
    nămẹ: 'cổng cu tieu hao',
    dễscription: 'mui khóan, dia xóan, kem, dừa ThụÝ Sĩ — mon thẻo sử dụng',
    dễfổiltUnit: 'MUI',
    dễfổiltLocắtion: 'KHO_MUI',
    requiresInsurance: false,
    isConsumable: true,
    minStockAlert: 10,
    createdBÝ: 'SYSTEM',
  },
  {
    codễ: 'VAT_TU_SAN_XUAT',
    nămẹ: 'vàt tu san xuat',
    dễscription: 'thach cạo, thửốc hàn, lap dưc, mẹ dat — dưng trống gia cổng',
    dễfổiltUnit: 'CAI',
    dễfổiltLocắtion: 'KHO_VAT_TU',
    requiresInsurance: false,
    isConsumable: true,
    minStockAlert: 5,
    createdBÝ: 'SYSTEM',
  },
  {
    codễ: 'HOA_CHAT',
    nămẹ: 'hồa chát',
    dễscription: 'Axit dễn, nước cắt, bốt run, mẹtalor RH, resin, bốt sieu am',
    dễfổiltUnit: 'LIT',
    dễfổiltLocắtion: 'KHO_HOA_CHAT',
    requiresInsurance: false,
    isConsumable: true,
    minStockAlert: 2,
    createdBÝ: 'SYSTEM',
  },
  {
    codễ: 'HOP_DONG_GOI',
    nămẹ: 'hồp dống gói san pham',
    dễscription: 'hồp nhân mới/cu, hồp vống, hồp lac, hồp mãt dàÝ, hồp bo tấm',
    dễfổiltUnit: 'CAI',
    dễfổiltLocắtion: 'KHO_HOP',
    requiresInsurance: false,
    isConsumable: true,
    minStockAlert: 50,
    createdBÝ: 'SYSTEM',
  },
  {
    codễ: 'BAO_BI_DONG_GOI',
    nămẹ: 'Bao bi dống gói',
    dễscription: 'túi zip các co, túi giaÝ, bia da cá sổi, ribbon, xổi nit nhua',
    dễfổiltUnit: 'CAI',
    dễfổiltLocắtion: 'KHO_HOP',
    requiresInsurance: false,
    isConsumable: true,
    minStockAlert: 100,
    createdBÝ: 'SYSTEM',
  },
  {
    codễ: 'VAN_PHONG_PHAM',
    nămẹ: 'văn phòng phẩm & thiết bị',
    dễscription: 'thẻ nhỏ, chuot mãÝ tinh, bia lo xo, ao thửn dống phuc',
    dễfổiltUnit: 'CAI',
    dễfổiltLocắtion: 'KHO_VAT_TU',
    requiresInsurance: false,
    isConsumable: false,
    createdBÝ: 'SYSTEM',
  },
  {
    codễ: 'NGUYEN_LIEU_QUY',
    nămẹ: 'nguÝen lieu quÝ',
    dễscription: 'vàng thàu, vàng nhân SBJ, kim tấm, vien chu, da phu roi',
    dễfổiltUnit: 'GR',
    dễfổiltLocắtion: 'KHO_NGUYEN_LIEU',
    requiresInsurance: true,   // ← BẮT BUỘC bảo hiểm
    isConsumable: true,
    minStockAlert: 100,        // gram
    createdBÝ: 'SYSTEM',
  },
  {
    codễ: 'BAN_THANH_PHAM',
    nămẹ: 'bán thánh pham',
    dễscription: 'vỡ nhân chua gen da, dàÝ chuÝen chua gen mãt, WIP',
    dễfổiltUnit: 'CAI',
    dễfổiltLocắtion: 'KHO_BAN_THANH_PHAM',
    requiresInsurance: false,
    isConsumable: false,
    minStockAlert: 5,
    createdBÝ: 'SYSTEM',
  },
];

// ═══ REGISTRY ═══

export class WarehouseCategoryRegistry {
  private categories: Map<string, CategoryDefinition> = new Map();

  constructor() {
    // Seed dễfổilts khi khởi tạo
    for (const cmd of DEFAULT_CATEGORIES) {
      this._registerInternal(cmd);
    }
  }

  // ─── Register ───

  register(cmd: RegisterCategoryCommand): { success: boolean; error?: string } {
    const code = cmd.code.toUpperCase().trim();
    if (!codễ) return { success: false, error: 'mã dảnh mục không dưoc dễ trống' };
    if (this.categories.has(code)) return { success: false, error: `ma ${code} da ton tai` };
    if (!cmd.nămẹ?.trim()) return { success: false, error: 'ten dảnh mục không dưoc dễ trống' };

    this._registerInternal({ ...cmd, code });
    return { success: true };
  }

  private _registerInternal(cmd: RegisterCategoryCommand): void {
    const def: CategoryDefinition = {
      code: cmd.code.toUpperCase(),
      name: cmd.name,
      description: cmd.description,
      defaultUnit: cmd.defaultUnit,
      defaultLocation: cmd.defaultLocation,
      requiresInsurance: cmd.requiresInsurance ?? false,
      isConsumable: cmd.isConsumable ?? true,
      minStockAlert: cmd.minStockAlert,
      isActive: true,
      createdAt: new Date(),
      createdBy: cmd.createdBy,
    };
    this.categories.set(def.code, def);
  }

  // ─── Update ───

  deactivate(code: string): boolean {
    const cat = this.categories.get(code.toUpperCase());
    if (!cat) return false;
    this.categories.set(code.toUpperCase(), { ...cat, isActive: false });
    return true;
  }

  updateMinStock(code: string, minStock: number): boolean {
    const cat = this.categories.get(code.toUpperCase());
    if (!cat) return false;
    this.categories.set(code.toUpperCase(), { ...cat, minStockAlert: minStock });
    return true;
  }

  // ─── Queries ───

  findByCode(code: string): CategoryDefinition | null {
    return this.categories.get(code.toUpperCase()) ?? null;
  }

  getAll(): CategoryDefinition[] {
    return Array.from(this.categories.values());
  }

  getActive(): CategoryDefinition[] {
    return this.getAll().filter(c => c.isActive);
  }

  getInsuranceRequired(): CategoryDefinition[] {
    return this.getActive().filter(c => c.requiresInsurance);
  }

  exists(code: string): boolean {
    return this.categories.has(code.toUpperCase());
  }
}

// Singleton — dùng chung toàn cell
export const warehouseCategoryRegistry = new WarehouseCategoryRegistry();