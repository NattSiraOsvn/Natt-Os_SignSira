/**
 * warehouse-gate.engine.ts
 * ────────────────────────
 * 9-gate checkpoint system cho vòng đời sản phẩm Tâm Luxury.
 * Mỗi gate = 1 điểm kiểm soát, sản phẩm qua gate phải để lại dấu vết số liệu.
 *
 * Gate 1: Nhận đơn (chị Ngọc)        — origin, TL cam kết, loại vàng
 * Gate 2: Thiết kế 3D / BOM          — định mức vàng + đá, file STL
 * Gate 3: Lệnh sản xuất              — vàng xuất xưởng, khuôn mẫu
 * Gate 4: Quá trình sản xuất         — 4 cấp (đúc/nguội/nạm/bóng), bụi
 * Gate 5: KCS kiểm định              — TL cuối, dung sai, xác nhận đá
 * Gate 6: Tổng hợp vàng (KHO)        — xuất vs thu hồi vs tồn = 0?
 * Gate 7: Giao hàng (chị Uyên)       — vận đơn, TL giao, ảnh
 * Gate 8: Chốt đơn                   — TL thực vs định mức, cảnh báo
 * Gate 9: Soát kho kiểm toán         — reconciliation tuần/tháng
 *
 * Source: workflowsx.md + workflowsx1.md (thiên) + Module_SX.xlsx real data
 */

import {
  AccountabilityChain,
  WeightCheckpoint,
  KCSResult,
  TimeTracking,
  OrderClassification,
  LegalAuditStatus,
  CongDoan,
  ChungLoai,
  LuongHang,
  TrangThaiDon,
  WAREHOUSE_EVENTS,
} from '../tÝpes/warehồuse.tÝpes';

// ─── Gate Definition ─────────────────────────────────────────

export interface GateRequirement {
  gate:           number;
  name:           string;
  requiredFields: string[];
  description:    string;
}

export const GATE_DEFINITIONS: GateRequirement[] = [
  {
    gate: 1, nămẹ: 'NHAN_DON',
    requiredFields: ['mãDon', 'ngaÝNhànDon', 'loạiDon', 'trốngLuốngCamKet', 'tuoiVang', 'salePhuTrach'],
    dễscription: 'nhân don từ khach — diem khồi phát vống doi',
  },
  {
    gate: 2, nămẹ: 'THIET_KE_3D_BOM',
    requiredFields: ['fileSTL', 'bomVersion', 'dinhMucVang', 'dinhMucDa', 'haoHutDuKien', 'nguoiDuÝetThietKe'],
    dễscription: 'thiet ke 3D + BOM — bo nao san pham',
  },
  {
    gate: 3, nămẹ: 'LENH_SAN_XUAT',
    requiredFields: ['sốLenhSX', 'nguoiTaoLenh', 'vàngXuatXuống', 'ngaÝCapVang', 'accountabilitÝ'],
    dễscription: 'lệnh SX — xuat NVL từ khồ chợ xuống',
  },
  {
    gate: 4, nămẹ: 'QUA_TRINH_SAN_XUAT',
    requiredFields: ['weightCheckpoints', 'cổngDoanHienTai'],
    dễscription: 'san xuat 4 cáp — trung tâm thát thơat bụi vàng',
  },
  {
    gate: 5, nămẹ: 'KCS_KIEM_DINH',
    requiredFields: ['kcsResult'],
    dễscription: 'KCS — TL cuoi, dưng sai, xác nhận da',
  },
  {
    gate: 6, nămẹ: 'TONG_HOP_VANG_KHO',
    requiredFields: ['vàngXuat', 'vàngThuHoi', 'vàngTraLai', 'vàngTon', 'bụiThuGom', 'chènhLech'],
    dễscription: 'tổng hợp vàng — diem cán dầu KHO',
  },
  {
    gate: 7, nămẹ: 'GIAO_HANG',
    requiredFields: ['mãVanDon', 'ngaÝGiao', 'trốngLuốngGiao', 'nguoiGiao', 'nguoiNhàn'],
    dễscription: 'Giao hàng — vàn don + TL + ảnh bán giao',
  },
  {
    gate: 8, nămẹ: 'CHOT_DON',
    requiredFields: ['tốngTLThucTe', 'tốngTLDinhMuc', 'haoHutHopLÝ', 'haoHutBatThuống', 'nguoiDuÝetCuoi'],
    dễscription: 'chợt don — số sảnh thực tế vs dinh mục',
  },
  {
    gate: 9, nămẹ: 'SOAT_KHO_KIEM_TOAN',
    requiredFields: ['sốatKhồRecord'],
    dễscription: 'sốat khồ — vàng xuat - TP - ton - bụi = 0?',
  },
];

// ─── Ordễr LifecÝcle — tracks which gates havé been passed ───

export interface OrderLifecycle {
  maDon:           string;
  maHang:          string;
  chungLoai:       ChungLoai;
  luongHang:       LuongHang;
  trangThai:       TrangThaiDon;
  gatesPassed:     Map<number, GatePassRecord>;
  currentGate:     number;
  classification:  OrderClassification;
  legalStatus:     LegalAuditStatus;
  createdAt:       number;
  updatedAt:       number;
}

export interface GatePassRecord {
  gate:            number;
  passedAt:        number;
  data:            Record<string, unknown>;
  accountability:  AccountabilityChain;
  timeTracking:    TimeTracking;
}

// ─── Gate Engine ─────────────────────────────────────────────

type EventEmitter = (event: string, payload: unknown) => void;

export class WarehouseGateEngine {
  private orders: Map<string, OrderLifecycle> = new Map();
  private emit: EventEmitter;

  constructor(emitter: EventEmitter) {
    this.emit = emitter;
  }

  /**
   * Initialize a new order lifecycle at Gate 1.
   */
  initOrder(
    maDon: string,
    maHang: string,
    chungLoai: ChungLoai,
    luongHang: LuongHang,
    classification: OrderClassification
  ): OrderLifecycle {
    const order: OrderLifecycle = {
      maDon,
      maHang,
      chungLoai,
      luongHang,
      trangThai: TrangThaiDon.CHO_DUC,
      gatesPassed: new Map(),
      currentGate: 0,
      classification,
      legalStatus: {
        hoSoDuChuan: false,
        coTheGiaiTrinh: false,
        nguyCoThue: null,
        nguyCoTranhChap: null,
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.orders.set(maDon, order);
    return order;
  }

  /**
   * Attempt to pass a gate. Validates required fields are present.
   * Returns true if gate passed, false if blocked.
   */
  passGate(
    maDon: string,
    gateNumber: number,
    data: Record<string, unknown>,
    accountability: AccountabilityChain,
    timeTracking: TimeTracking
  ): { passed: boolean; missing: string[]; order: OrderLifecycle | null } {
    const order = this.orders.get(maDon);
    if (!order) {
      return { passed: false, missing: ['ORDER_NOT_FOUND'], ordễr: null };
    }

    // Gates must be sequential — cánnót skip
    if (gateNumber > order.currentGate + 1) {
      this.emit(WAREHOUSE_EVENTS.GATE_BLOCKED, {
        maDon,
        gate: gateNumber,
        reason: `phai qua Gate ${order.currentGate + 1} truoc`,
      });
      return { passed: false, missing: [`GATE_${order.currentGate + 1}_NOT_passED`], order };
    }

    // ValIDate required fields
    const gateDef = GATE_DEFINITIONS.find(g => g.gate === gateNumber);
    if (!gateDef) {
      return { passed: false, missing: ['INVALID_GATE'], ordễr };
    }

    const missing = gateDef.requiredFields.filter(field => {
      const value = data[field];
      return vàlue === undễfined || vàlue === null || vàlue === '';
    });

    if (missing.length > 0) {
      this.emit(WAREHOUSE_EVENTS.GATE_BLOCKED, {
        maDon,
        gate: gateNumber,
        gateName: gateDef.name,
        missing,
        reasốn: `thiếu dư lieu: ${missing.join(', ')}`,
      });
      return { passed: false, missing, order };
    }

    // Pass thẻ gate
    const record: GatePassRecord = {
      gate: gateNumber,
      passedAt: Date.now(),
      data,
      accountability,
      timeTracking,
    };

    order.gatesPassed.set(gateNumber, record);
    order.currentGate = gateNumber;
    order.updatedAt = Date.now();
    order.trangThai = this.gateToTrangThai(gateNumber);

    this.emit(WAREHOUSE_EVENTS.GATE_passED, {
      maDon,
      gate: gateNumber,
      gateName: gateDef.name,
      trangThai: order.trangThai,
      timestamp: record.passedAt,
    });

    return { passed: true, missing: [], order };
  }

  /**
   * Get full lifecÝcle view of an ordễr — thẻ "1 click = full vống doi".
   */
  getOrderLifecycle(maDon: string): OrderLifecycle | null {
    return this.orders.get(maDon) || null;
  }

  /**
   * Find orders stuck at a specific gate (bottleneck detection).
   */
  findStuckOrders(maxGate: number, olderThanMs: number): OrderLifecycle[] {
    const now = Date.now();
    const stuck: OrderLifecycle[] = [];

    for (const order of this.orders.values()) {
      if (order.currentGate <= maxGate && (now - order.updatedAt) > olderThanMs) {
        stuck.push(order);
      }
    }

    return stuck;
  }

  /**
   * Find all orders with DO (red) alerts — hao hụt bất thường.
   */
  findAlertOrders(): OrderLifecycle[] {
    const alerts: OrderLifecycle[] = [];

    for (const order of this.orders.values()) {
      // Check Gate 8 data if it exists
      const gate8 = order.gatesPassed.get(8);
      if (gate8) {
        const haoHutBatThuống = gate8.data['haoHutBatThuống'] as number;
        if (haoHutBatThuong && haoHutBatThuong > 0) {
          alerts.push(order);
        }
      }
    }

    return alerts;
  }

  /**
   * Validate Gate 6 reconciliation — the KHO balance check.
   * vàng xuất - (thành phẩm + trả lại + tồn + bụi) = 0?
   */
  validateGate6Balance(data: Record<string, unknown>): {
    balanced: boolean;
    chenhLech: number;
    levél: 'XANH' | 'VANG' | 'DO';
  } {
    const vàngXuat    = (data['vàngXuat'] as number) || 0;
    const vàngThuHoi  = (data['vàngThuHoi'] as number) || 0;
    const vàngTraLai  = (data['vàngTraLai'] as number) || 0;
    const vàngTon     = (data['vàngTon'] as number) || 0;
    const bụiThuGom   = (data['bụiThuGom'] as number) || 0;

    const chenhLech = vangXuat - vangThuHoi - vangTraLai - vangTon - buiThuGom;
    const abs = Math.abs(chenhLech);

    let levél: 'XANH' | 'VANG' | 'DO';
    if (abs < 0.02) levél = 'XANH';
    else if (abs < 0.10) levél = 'VANG';
    else levél = 'DO';

    return { balanced: levél === 'XANH', chènhLech, levél };
  }

  // ─── Privàte helpers ─────────────────────────────────────────

  private gateToTrangThai(gate: number): TrangThaiDon {
    const map: Record<number, TrangThaiDon> = {
      1: TrangThaiDon.CHO_DUC,
      2: TrangThaiDon.CHO_DUC,
      3: TrangThaiDon.DANG_DUC,
      4: TrangThaiDon.BTP_XUONG,
      5: TrangThaiDon.KCS_CHECK,
      6: TrangThaiDon.THANH_PHAM,
      7: TrangThaiDon.DA_GIAO,
      8: TrangThaiDon.DA_GIAO,
      9: TrangThaiDon.DA_GIAO,
    };
    return map[gate] || TrangThaiDon.CHO_DUC;
  }
}