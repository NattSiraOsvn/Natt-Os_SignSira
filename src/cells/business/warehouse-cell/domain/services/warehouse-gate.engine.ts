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
 * Source: workflowsx.md + workflowsx1.md (Thiên) + Module_SX.xlsx real data
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
} from '../types/warehouse.types';

// ─── Gate Definition ─────────────────────────────────────────

export interface GateRequirement {
  gate:           number;
  name:           string;
  requiredFields: string[];
  description:    string;
}

export const GATE_DEFINITIONS: GateRequirement[] = [
  {
    gate: 1, name: 'NHAN_DON',
    requiredFields: ['maDon', 'ngayNhanDon', 'loaiDon', 'trongLuongCamKet', 'tuoiVang', 'salePhuTrach'],
    description: 'Nhận đơn từ khách — điểm khởi phát vòng đời',
  },
  {
    gate: 2, name: 'THIET_KE_3D_BOM',
    requiredFields: ['fileSTL', 'bomVersion', 'dinhMucVang', 'dinhMucDa', 'haoHutDuKien', 'nguoiDuyetThietKe'],
    description: 'Thiết kế 3D + BOM — bộ não sản phẩm',
  },
  {
    gate: 3, name: 'LENH_SAN_XUAT',
    requiredFields: ['soLenhSX', 'nguoiTaoLenh', 'vangXuatXuong', 'ngayCapVang', 'accountability'],
    description: 'Lệnh SX — xuất NVL từ kho cho xưởng',
  },
  {
    gate: 4, name: 'QUA_TRINH_SAN_XUAT',
    requiredFields: ['weightCheckpoints', 'congDoanHienTai'],
    description: 'Sản xuất 4 cấp — trung tâm thất thoát bụi vàng',
  },
  {
    gate: 5, name: 'KCS_KIEM_DINH',
    requiredFields: ['kcsResult'],
    description: 'KCS — TL cuối, dung sai, xác nhận đá',
  },
  {
    gate: 6, name: 'TONG_HOP_VANG_KHO',
    requiredFields: ['vangXuat', 'vangThuHoi', 'vangTraLai', 'vangTon', 'buiThuGom', 'chenhLech'],
    description: 'Tổng hợp vàng — điểm cân đối KHO',
  },
  {
    gate: 7, name: 'GIAO_HANG',
    requiredFields: ['maVanDon', 'ngayGiao', 'trongLuongGiao', 'nguoiGiao', 'nguoiNhan'],
    description: 'Giao hàng — vận đơn + TL + ảnh bàn giao',
  },
  {
    gate: 8, name: 'CHOT_DON',
    requiredFields: ['tongTLThucTe', 'tongTLDinhMuc', 'haoHutHopLy', 'haoHutBatThuong', 'nguoiDuyetCuoi'],
    description: 'Chốt đơn — so sánh thực tế vs định mức',
  },
  {
    gate: 9, name: 'SOAT_KHO_KIEM_TOAN',
    requiredFields: ['soatKhoRecord'],
    description: 'Soát kho — vàng xuất - TP - tồn - bụi = 0?',
  },
];

// ─── Order Lifecycle — tracks which gates have been passed ───

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
      return { passed: false, missing: ['ORDER_NOT_FOUND'], order: null };
    }

    // Gates must be sequential — cannot skip
    if (gateNumber > order.currentGate + 1) {
      this.emit(WAREHOUSE_EVENTS.GATE_BLOCKED, {
        maDon,
        gate: gateNumber,
        reason: `Phải qua Gate ${order.currentGate + 1} trước`,
      });
      return { passed: false, missing: [`GATE_${order.currentGate + 1}_NOT_PASSED`], order };
    }

    // Validate required fields
    const gateDef = GATE_DEFINITIONS.find(g => g.gate === gateNumber);
    if (!gateDef) {
      return { passed: false, missing: ['INVALID_GATE'], order };
    }

    const missing = gateDef.requiredFields.filter(field => {
      const value = data[field];
      return value === undefined || value === null || value === '';
    });

    if (missing.length > 0) {
      this.emit(WAREHOUSE_EVENTS.GATE_BLOCKED, {
        maDon,
        gate: gateNumber,
        gateName: gateDef.name,
        missing,
        reason: `Thiếu dữ liệu: ${missing.join(', ')}`,
      });
      return { passed: false, missing, order };
    }

    // Pass the gate
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

    this.emit(WAREHOUSE_EVENTS.GATE_PASSED, {
      maDon,
      gate: gateNumber,
      gateName: gateDef.name,
      trangThai: order.trangThai,
      timestamp: record.passedAt,
    });

    return { passed: true, missing: [], order };
  }

  /**
   * Get full lifecycle view of an order — the "1 click = full vòng đời".
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
        const haoHutBatThuong = gate8.data['haoHutBatThuong'] as number;
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
    level: 'XANH' | 'VANG' | 'DO';
  } {
    const vangXuat    = (data['vangXuat'] as number) || 0;
    const vangThuHoi  = (data['vangThuHoi'] as number) || 0;
    const vangTraLai  = (data['vangTraLai'] as number) || 0;
    const vangTon     = (data['vangTon'] as number) || 0;
    const buiThuGom   = (data['buiThuGom'] as number) || 0;

    const chenhLech = vangXuat - vangThuHoi - vangTraLai - vangTon - buiThuGom;
    const abs = Math.abs(chenhLech);

    let level: 'XANH' | 'VANG' | 'DO';
    if (abs < 0.02) level = 'XANH';
    else if (abs < 0.10) level = 'VANG';
    else level = 'DO';

    return { balanced: level === 'XANH', chenhLech, level };
  }

  // ─── Private helpers ─────────────────────────────────────────

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
