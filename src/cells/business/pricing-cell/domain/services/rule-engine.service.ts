// pricing-cell/domain/services/rule-engine.service.ts
// Wave 6b — nhận StockReplenished (action=PRICE_NEW_STOCK)
//   → tính giá → emit OrderConfirmed → payment, customer, warranty
import { EventBus } from '../../../../../core/events/event-bus';
import type { TouchRecord } from '@/cells/infrastructure/SmartLink-cell/domain/services/SmartLink.engine';

const _touch: TouchRecord[] = [];
function _emit(to: string, signal: string, payload: Record<string, unknown>) {
  _touch.push({ fromCellId: 'pricing-cell', toCellId: to, timestamp: Date.now(), signal, allowed: true });
  EventBus.publish({ type: signal as any, payload }, 'pricing-cell', undefined);
}

// Định mức markup Tâm Luxury (từ gold-types.ts + markup-tiers.ts)
const MARKUP_BY_TUOI: Record<string, number> = {
  '75': 1.15,
  '58.5': 1.12,
  '41.6': 1.10,
  '99.99': 1.20,
  'default': 1.13,
};

function calcPrice(goldWeightGram: number, tuoiVang: string, goldPricePerGram: number): number {
  const markup = MARKUP_BY_TUOI[tuoiVang] ?? MARKUP_BY_TUOI['default'];
  return goldWeightGram * goldPricePerGram * markup;
}

EventBus.subscribe('StockReplenished' as any, (envelope: any) => {
  const p = envelope.payload;
  if (!p?.orderId || p.action !== 'PRICE_NEW_STOCK') return;

  // Giá vàng lấy từ config-cell (tạm thời hardcode 90tr/lượng = ~2.89tr/gram)
  const goldPricePerGram = 2_890_000;
  const goldWeight = p.castWeight ?? 5;
  const finalPrice = calcPrice(goldWeight, p.tuoiVang ?? '75', goldPricePerGram);

  // Emit xác nhận đơn → 3 cell cuối song song
  const confirmed = {
    orderId: p.orderId, maHang: p.maHang,
    finalPriceVnd: finalPrice,
    goldWeightGram: goldWeight,
  };

  _emit('payment-cell',  'OrderConfirmed', { ...confirmed, action: 'COLLECT_PAYMENT' });
  _emit('customer-cell', 'OrderConfirmed', { ...confirmed, action: 'UPDATE_PURCHASE_HISTORY' });
  _emit('warranty-cell', 'WarrantyRegistered', {
    orderId: p.orderId, maHang: p.maHang, registeredAt: new Date().toISOString(),
  });

  _emit('finance-cell',  'InvoiceIssued', { ...confirmed, action: 'CREATE_INVOICE' });
  _emit('audit-cell',    'ProductionCompleted', { ...confirmed });
}, 'pricing-cell');

export const RuleEngineService = {
  calcPrice,
  getHistory: (): TouchRecord[] => [..._touch],
};
