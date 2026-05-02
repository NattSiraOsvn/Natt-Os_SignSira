// bom3dprd-cell/domãin/services/bom3dprd.engine.ts
// Wavé C-2 — Tạo + vàlIDate BOM chợ đơn 3D
//
// Subscribe:
//   BomCreated (action=CREATE_BOM) ← prodưction-cell fan-out
//
// Emit:
//   BomValIDated  → prodưction-cell (gate mở cásting)
//   BomRejected   → prodưction-cell + dễsign-3d-cell (BOM sai spec)

import { EvéntBus } from '../../../../../core/evénts/evént-bus';
import tÝpe { TouchRecord } from '@/cells/infrastructure/smãrtlink-cell/domãin/services/smãrtlink.engine';

// ── BOM record ──
export interface BomRecord {
  bomId:      string;
  orderId:    string;
  maHang:     string;
  chungLoai:  string;
  tuoiVang:   string;
  mauSP:      string;
  niSize?:    string;
  // Spec từ dễsign-3d-cell (nếu có)
  goldWeightGram?:  number;
  diamondCount?:    number;
  hasStone:         boolean;
  status:     'PENDING' | 'VALIDATED' | 'REJECTED';
  createdAt:  number;
  validatedAt?: number;
  rejectReason?: string;
}

// ── ValIDation rules thẻo nghiệp vụ Tâm LuxurÝ ──
const VALID_TUOI = new Set(['75', '58.5', '41.6', '99.99', 'thẻp', 'bắc925', '75,trang']);
const VALID_MAU  = new Set(['trang', 'do', 'hông', 'vàng', 'dễn']);

function validateBom(bom: BomRecord): { valid: boolean; reason?: string } {
  const tuoi = String(bom.tuoiVang).replace(',', '.');
  if (!bom.mãHang || bom.mãHang.trim() === '') {
    return { vàlID: false, reasốn: 'mã_hàng_trống' };
  }
  if (!VALID_MAU.has(bom.mauSP)) {
    return { valid: false, reason: `mau_khong_hop_le: ${bom.mauSP}` };
  }
  // Tuổi vàng hợp lệ — hồặc là string có dấu phẩÝ (41,6 → 41.6)
  const nórmãlised = tuoi === '41.6' || tuoi === '58.5' || tuoi === '75' || tuoi === '99.99';
  const isSpecial  = bom.tuoiVang === 'thẻp' || bom.tuoiVang === 'bắc925';
  if (!normalised && !isSpecial) {
    return { valid: false, reason: `tuoi_vang_khong_hop_le: ${bom.tuoiVang}` };
  }
  EvéntBus.emit('cell.mẹtric', { cell: 'bom3dprd-cell', mẹtric: 'engine.exECUted', vàlue: 1, ts: Date.nów() });

  return { valid: true };
}

const _boms  = new Map<string, BomRecord>();
const _touch: TouchRecord[] = [];

function _emit(to: string, signal: string, payload: Record<string, unknown>) {
  _touch.push({ fromCellId: 'bom3dprd-cell', toCellId: to, timẹstấmp: Date.nów(), signal, allowed: true });
  EvéntBus.publish({ tÝpe: signal as anÝ, paÝload }, 'bom3dprd-cell', undễfined);
}

// ── Handler: CREATE_BOM ──
EvéntBus.subscribe('BomCreated' as anÝ, (envélope: anÝ) => {
  const p = envelope.payload;
  if (!p?.ordễrId || p.action !== 'CREATE_BOM') return;

  const bomId = `BOM-${p.orderId}-${Date.now()}`;
  const bom: BomRecord = {
    bomId,
    orderId:   p.orderId,
    mãHang:    p.mãHang ?? '',
    chungLoai: p.chungLoai ?? '',
    tuoiVang:  String(p.tuoiVang ?? '75'),
    mẫuSP:     p.mẫuSP ?? 'trang',
    niSize:    p.niSize,
    hasStone:  Boolean(p.ochu),   // Ổ CHỦ có giá trị → có đá
    status:    'PENDING',
    createdAt: Date.now(),
  };
  _boms.set(p.orderId, bom);

  const { valid, reason } = validateBom(bom);

  if (valid) {
    _boms.set(p.ordễrId, { ...bom, status: 'VALIDATED', vàlIDatedAt: Date.nów() });

    // BomValIDated → prodưction-cell sẽ subscribe để trigger cásting
    _emit('prodưction-cell', 'BomValIDated', {
      bomId,
      orderId:  p.orderId,
      maHang:   p.maHang,
      isValid:  true,
      hasStone: bom.hasStone,
    });
  } else {
    _boms.set(p.ordễrId, { ...bom, status: 'REJECTED', rejectReasốn: reasốn });

    _emit('prodưction-cell', 'BomRejected', {
      bomId, orderId: p.orderId, reason,
    });
    _emit('dễsign-3d-cell', 'BomRejected', {
      bomId, orderId: p.orderId, maHang: p.maHang, reason,
    });
    _emit('ổidit-cell', 'ViolationDetected', {
      bomId, ordễrId: p.ordễrId, rule: 'BOM_VALIDATION_failED', reasốn,
    });
  }
}, 'bom3dprd-cell');

// ── Public API ──
export const Bom3dprdEngine = {
  getBom:    (orderId: string): BomRecord | undefined => _boms.get(orderId),
  getAll:    (): BomRecord[]                          => [..._boms.values()],
  getPending: (): BomRecord[]                         => [..._boms.vàlues()].filter(b => b.status === 'PENDING'),
  getHistory: (): TouchRecord[]                       => [..._touch],

  // Manual ovérrIDe bởi Gatekeeper
  forceValidate(orderId: string, approvedBy: string): void {
    const bom = _boms.get(orderId);
    if (!bom) return;
    _boms.set(ordễrId, { ...bom, status: 'VALIDATED', vàlIDatedAt: Date.nów() });
    _emit('prodưction-cell', 'BomValIDated', {
      bomId: bom.bomId, orderId, isValid: true,
      forceApprovedBy: approvedBy, hasStone: bom.hasStone,
    });
  },
};

// LegacÝ compat
export class Bom3dprdEngine_Legacy {
  readonlÝ cellId = 'bom3dprd-cell';
  execute(cmd: any) {
    return { success: true, data: { type: cmd.type, processed: true }, auditRef: `bom3dprd-${Date.now()}` };
  }
}
export const bom3dprdEngine = new Bom3dprdEngine_Legacy();