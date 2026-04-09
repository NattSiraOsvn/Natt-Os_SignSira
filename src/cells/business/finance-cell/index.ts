// @ts-nocheck — TODO: fix type errors, remove this pragma

// finance-cell/index.ts — Wave 4 wire: depreciation + accountByKeywords + EventBus
export * from "./domain/services";
export * from "./ports";

// Wave 4 engines
export {
  processDepreciation,
  accountByKeywords,
  buildOrderFlowFromMap,
  TSCD_THRESHOLD_VND,
  TSCD_TYPE,
} from './domain/engines/depreciation.engine';
export type {
  DepreciationEntry,
  TscdCategory,
  OrderTimeline,
} from './domain/engines/depreciation.engine';

// Wire: depreciation + classify → EventBus
import { EventBus } from '../../../core/events/event-bus';
import { processDepreciation, accountByKeywords, buildOrderFlowFromMap } from './domain/engines/depreciation.engine';

EventBus.subscribe('FINANCE_DEPRECIATION_REQUEST', (event: unknown) => {
  const ev = event as {
    payload?: {
      assetId: string; assetName: string;
      originalCost: number; usefulLifeYears: number;
      category?: 'SX' | 'VP' | 'BAN_HANG';
    };
  };
  if (!ev?.payload) return;

  const entry = processDepreciation(ev.payload);
  if (!entry) {
    EventBus.publish({
      type: 'FINANCE_DEPRECIATION_SKIPPED',
      source: 'finance-cell',
      payload: { assetId: ev.payload.assetId, reason: `Below threshold ${ev.payload.originalCost}` },
    }, 'finance-cell', undefined);
    return;
  }

  EventBus.publish({
    type: 'FINANCE_DEPRECIATION_READY',
    source: 'finance-cell',
    payload: entry,
  }, 'finance-cell', undefined);
});

EventBus.subscribe('FINANCE_CLASSIFY_ACCOUNT', (event: unknown) => {
  const ev = event as { payload?: { description: string; amount?: number } };
  if (!ev?.payload?.description) return;

  const result = accountByKeywords(ev.payload.description, ev.payload.amount ?? 0);
  EventBus.publish({
    type: 'FINANCE_ACCOUNT_CLASSIFIED',
    source: 'finance-cell',
    payload: { ...result, description: ev.payload.description, amount: ev.payload.amount },
  }, 'finance-cell', undefined);
});

EventBus.subscribe('FINANCE_ORDER_FLOW_BUILD', (event: unknown) => {
  const ev = event as { payload?: { records: Parameters<typeof buildOrderFlowFromMap>[0] } };
  if (!ev?.payload?.records) return;

  const timelines = buildOrderFlowFromMap(ev.payload.records);
  const output    = Object.fromEntries(timelines);

  EventBus.publish({
    type: 'FINANCE_ORDER_FLOW_READY',
    source: 'finance-cell',
    payload: { timelines: output, count: timelines.size },
  }, 'finance-cell', undefined);
});

// ── BCTC Wire: PAYMENT_PROCESSED → ghi nhận thu + classify ──
// SPEC §3: finance-cell lắng PAYMENT_PROCESSED → ghi nhận thu
EventBus.subscribe('PAYMENT_PROCESSED', (event: unknown) => {
  const ev = event as { payload?: Record<string, unknown> };
  const amount = Number(ev.payload?.amount ?? 0);
  const paymentId = String(ev.payload?.paymentId ?? '');

  // 1. Ghi nhận thu — journal entry: Nợ 112 (tiền gửi NH) / Có 511 (doanh thu)
  EventBus.publish({
    type: 'FINANCE_PAYMENT_RECORDED',
    source: 'finance-cell',
    payload: {
      paymentId,
      amount,
      journalEntry: {
        id: `JE_PAY_${paymentId}_${Date.now()}`,
        date: new Date().toISOString(),
        description: `Ghi nhận thanh toán ${paymentId}`,
        entries: [
          { account: '112', debit: amount, credit: 0 },
          { account: '511', debit: 0, credit: amount },
        ],
      },
      ts: Date.now(),
    },
  }, 'finance-cell', undefined);

  // 2. Emit PAYMENT_RECEIVED cho downstream (period-close, tax, analytics)
  EventBus.publish({
    type: 'PAYMENT_RECEIVED',
    source: 'finance-cell',
    payload: { paymentId, amount, invoiceId: ev.payload?.invoiceId ?? '', ts: Date.now() },
  }, 'finance-cell', undefined);

  // 3. Bridge backward compat: _v2.payment-flow.engine lắng payment.received → FINANCE_CLASSIFY_ACCOUNT
  EventBus.emit('payment.received', {
    amount,
    paymentId,
    description: ev.payload?.description ?? 'payment received',
    timestamp: Date.now(),
  });
});

// ── BCTC Wire: SALES_ORDER_CONFIRMED → tạo invoice qua saga ──
// SPEC §3: finance-cell lắng SALES_ORDER_CONFIRMED → tạo invoice
EventBus.subscribe('SALES_ORDER_CONFIRMED', (event: unknown) => {
  const ev = event as { payload?: Record<string, unknown> };

  // Bridge to saga namespace — FinanceSaga.handleOrderCreated lắng sales.order.created.v1
  // → tạo InvoiceAggregate → emit finance.invoice.created.v1
  EventBus.emit('sales.order.created.v1', {
    ...(ev.payload ?? {}),
    id: ev.payload?.orderId ?? ev.payload?.id ?? '',
    total: ev.payload?.amount ?? ev.payload?.total ?? 0,
    timestamp: Date.now(),
    trace: {
      correlation_id: ev.payload?.correlationId ?? `corr_${Date.now()}`,
      causation_id: `SALES_ORDER_CONFIRMED_${Date.now()}`,
      trace_id: `trace_${Date.now()}`,
    },
    tenant: ev.payload?.tenant ?? 'tam-luxury',
  });
});
