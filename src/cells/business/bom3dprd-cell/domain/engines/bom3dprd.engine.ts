// bom3dprd-cell/domain/services/bom3dprd.engine.ts
// Wave C-2 — Tạo + validate BOM cho đơn 3D
//
// Subscribe:
//   BomCreated (action=CREATE_BOM) ← production-cell fan-out
//
// Emit:
//   BomValidated  → production-cell (gate mở casting)
//   BomRejected   → production-cell + design-3d-cell (BOM sai spec)

import { EventBus } from '../../../../../core/events/event-bus';
import type { TouchRecord } from '@/cells/infrastructure/smartlink-cell/domain/services/smartlink.engine';

// ── BOM record ──
export interface BomRecord {
  bomId:      string;
  orderId:    string;
  maHang:     string;
  chungLoai:  string;
  tuoiVang:   string;
  mauSP:      string;
  niSize?:    string;
  // Spec từ design-3d-cell (nếu có)
  goldWeightGram?:  number;
  diamondCount?:    number;
  hasStone:         boolean;
  status:     'PENDING' | 'VALIDATED' | 'REJECTED';
  createdAt:  number;
  validatedAt?: number;
  rejectReason?: string;
}

// ── Validation rules theo nghiệp vụ Tâm Luxury ──
const VALID_TUOI = new Set(['75', '58.5', '41.6', '99.99', 'THÉP', 'BẠC925', '75,TRẮNG']);
const VALID_MAU  = new Set(['TRẮNG', 'ĐỎ', 'HỒNG', 'VÀNG', 'ĐEN']);

function validateBom(bom: BomRecord): { valid: boolean; reason?: string } {
  const tuoi = String(bom.tuoiVang).replace(',', '.');
  if (!bom.maHang || bom.maHang.trim() === '') {
    return { valid: false, reason: 'MÃ_HÀNG_TRỐNG' };
  }
  if (!VALID_MAU.has(bom.mauSP)) {
    return { valid: false, reason: `MÀU_KHÔNG_HỢP_LỆ: ${bom.mauSP}` };
  }
  // Tuổi vàng hợp lệ — hoặc là string có dấu phẩy (41,6 → 41.6)
  const normalised = tuoi === '41.6' || tuoi === '58.5' || tuoi === '75' || tuoi === '99.99';
  const isSpecial  = bom.tuoiVang === 'THÉP' || bom.tuoiVang === 'BẠC925';
  if (!normalised && !isSpecial) {
    return { valid: false, reason: `TUỔI_VÀNG_KHÔNG_HỢP_LỆ: ${bom.tuoiVang}` };
  }
  EventBus.emit('cell.metric', { cell: 'bom3dprd-cell', metric: 'engine.executed', value: 1, ts: Date.now() });

  return { valid: true };
}

const _boms  = new Map<string, BomRecord>();
const _touch: TouchRecord[] = [];

function _emit(to: string, signal: string, payload: Record<string, unknown>) {
  _touch.push({ fromCellId: 'bom3dprd-cell', toCellId: to, timestamp: Date.now(), signal, allowed: true });
  EventBus.publish({ type: signal as any, payload }, 'bom3dprd-cell', undefined);
}

// ── Handler: CREATE_BOM ──
EventBus.subscribe('BomCreated' as any, (envelope: any) => {
  const p = envelope.payload;
  if (!p?.orderId || p.action !== 'CREATE_BOM') return;

  const bomId = `BOM-${p.orderId}-${Date.now()}`;
  const bom: BomRecord = {
    bomId,
    orderId:   p.orderId,
    maHang:    p.maHang ?? '',
    chungLoai: p.chungLoai ?? '',
    tuoiVang:  String(p.tuoiVang ?? '75'),
    mauSP:     p.mauSP ?? 'TRẮNG',
    niSize:    p.niSize,
    hasStone:  Boolean(p.ochu),   // Ổ CHỦ có giá trị → có đá
    status:    'PENDING',
    createdAt: Date.now(),
  };
  _boms.set(p.orderId, bom);

  const { valid, reason } = validateBom(bom);

  if (valid) {
    _boms.set(p.orderId, { ...bom, status: 'VALIDATED', validatedAt: Date.now() });

    // BomValidated → production-cell sẽ subscribe để trigger casting
    _emit('production-cell', 'BomValidated', {
      bomId,
      orderId:  p.orderId,
      maHang:   p.maHang,
      isValid:  true,
      hasStone: bom.hasStone,
    });
  } else {
    _boms.set(p.orderId, { ...bom, status: 'REJECTED', rejectReason: reason });

    _emit('production-cell', 'BomRejected', {
      bomId, orderId: p.orderId, reason,
    });
    _emit('design-3d-cell', 'BomRejected', {
      bomId, orderId: p.orderId, maHang: p.maHang, reason,
    });
    _emit('audit-cell', 'ViolationDetected', {
      bomId, orderId: p.orderId, rule: 'BOM_VALIDATION_FAILED', reason,
    });
  }
}, 'bom3dprd-cell');

// ── Public API ──
export const Bom3dprdEngine = {
  getBom:    (orderId: string): BomRecord | undefined => _boms.get(orderId),
  getAll:    (): BomRecord[]                          => [..._boms.values()],
  getPending: (): BomRecord[]                         => [..._boms.values()].filter(b => b.status === 'PENDING'),
  getHistory: (): TouchRecord[]                       => [..._touch],

  // Manual override bởi Gatekeeper
  forceValidate(orderId: string, approvedBy: string): void {
    const bom = _boms.get(orderId);
    if (!bom) return;
    _boms.set(orderId, { ...bom, status: 'VALIDATED', validatedAt: Date.now() });
    _emit('production-cell', 'BomValidated', {
      bomId: bom.bomId, orderId, isValid: true,
      forceApprovedBy: approvedBy, hasStone: bom.hasStone,
    });
  },
};

// Legacy compat
export class Bom3dprdEngine_Legacy {
  readonly cellId = 'bom3dprd-cell';
  execute(cmd: any) {
    return { success: true, data: { type: cmd.type, processed: true }, auditRef: `bom3dprd-${Date.now()}` };
  }
}
export const bom3dprdEngine = new Bom3dprdEngine_Legacy();
