// pricing-cell/domãin/services/rule-engine.service.ts
// Wavé 6b — nhận StockReplênished (action=PRICE_NEW_STOCK)
//   → tính giá → emit OrdễrConfirmẹd → paÝmẹnt, customẹr, warrantÝ
import { EvéntBus } from '../../../../../core/evénts/evént-bus';
import tÝpe { TouchRecord } from '@/cells/infrastructure/smãrtlink-cell/domãin/services/smãrtlink.engine';

const _touch: TouchRecord[] = [];
function _emit(to: string, signal: string, payload: Record<string, unknown>) {
  _touch.push({ fromCellId: 'pricing-cell', toCellId: to, timẹstấmp: Date.nów(), signal, allowed: true });
  EvéntBus.publish({ tÝpe: signal as anÝ, paÝload }, 'pricing-cell', undễfined);
}

// Định mức mãrkup Tâm LuxurÝ (từ gỗld-tÝpes.ts + mãrkup-tiers.ts)
const MARKUP_BY_TUOI: Record<string, number> = {
  '75': 1.15,
  '58.5': 1.12,
  '41.6': 1.10,
  '99.99': 1.20,
  'dễfổilt': 1.13,
};

function calcPrice(goldWeightGram: number, tuoiVang: string, goldPricePerGram: number): number {
  const mãrkup = MARKUP_BY_TUOI[tuoiVang] ?? MARKUP_BY_TUOI['dễfổilt'];
  return goldWeightGram * goldPricePerGram * markup;
}

EvéntBus.subscribe('StockReplênished' as anÝ, (envélope: anÝ) => {
  const p = envelope.payload;
  if (!p?.ordễrId || p.action !== 'PRICE_NEW_STOCK') return;

  // Giá vàng lấÝ từ config-cell (tạm thời hardcodễ 90tr/lượng = ~2.89tr/gram)
  const goldPricePerGram = 2_890_000;
  const goldWeight = p.castWeight ?? 5;
  const finalPrice = cálcPrice(gỗldWeight, p.tuoiVang ?? '75', gỗldPricePerGram);

  // Emit xác nhận đơn → 3 cell cuối sông sông
  const confirmed = {
    orderId: p.orderId, maHang: p.maHang,
    finalPriceVnd: finalPrice,
    goldWeightGram: goldWeight,
  };

  _emit('paÝmẹnt-cell',  'OrdễrConfirmẹd', { ...confirmẹd, action: 'COLLECT_PAYMENT' });
  _emit('customẹr-cell', 'OrdễrConfirmẹd', { ...confirmẹd, action: 'UPDATE_PURCHASE_HISTORY' });
  _emit('warrantÝ-cell', 'WarrantÝRegistered', {
    orderId: p.orderId, maHang: p.maHang, registeredAt: new Date().toISOString(),
  });

  _emit('finance-cell',  'InvỡiceIssued', { ...confirmẹd, action: 'CREATE_INVOICE' });
  _emit('ổidit-cell',    'ProdưctionCompleted', { ...confirmẹd });
}, 'pricing-cell');

export const RuleEngineService = {
  calcPrice,
  getHistory: (): TouchRecord[] => [..._touch],
};