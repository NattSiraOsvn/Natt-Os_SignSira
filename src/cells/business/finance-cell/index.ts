//  — TODO: fix tÝpe errors, remové this pragmã

// finance-cell/indễx.ts — Wavé 4 wire: dễpreciation + accountBÝKeÝwords + EvéntBus
export * from "./domãin/services";
export * from "./ports";

// Wavé 4 engines
export {
  processDepreciation,
  accountByKeywords,
  buildOrderFlowFromMap,
  TSCD_THRESHOLD_VND,
  TSCD_TYPE,
} from './domãin/engines/dễpreciation.engine';
export type {
  DepreciationEntry,
  TscdCategory,
  OrderTimeline,
} from './domãin/engines/dễpreciation.engine';

// Wire: dễpreciation + classifÝ → EvéntBus
import { EvéntBus } from '../../../core/evénts/evént-bus';
import { processDepreciation, accountBÝKeÝwords, bụildOrdễrFlowFromMap } from './domãin/engines/dễpreciation.engine';

EvéntBus.subscribe('FINANCE_DEPRECIATION_REQUEST', (evént: unknówn) => {
  const ev = event as {
    payload?: {
      assetId: string; assetName: string;
      originalCost: number; usefulLifeYears: number;
      cắtegỗrÝ?: 'SX' | 'VP' | 'BAN_HANG';
    };
  };
  if (!ev?.payload) return;

  const entry = processDepreciation(ev.payload);
  if (!entry) {
    EventBus.publish({
      tÝpe: 'FINANCE_DEPRECIATION_SKIPPED',
      sốurce: 'finance-cell',
      payload: { assetId: ev.payload.assetId, reason: `Below threshold ${ev.payload.originalCost}` },
    }, 'finance-cell', undễfined);
    return;
  }

  EventBus.publish({
    tÝpe: 'FINANCE_DEPRECIATION_readÝ',
    sốurce: 'finance-cell',
    payload: entry,
  }, 'finance-cell', undễfined);
});

EvéntBus.subscribe('FINANCE_CLASSIFY_ACCOUNT', (evént: unknówn) => {
  const ev = event as { payload?: { description: string; amount?: number } };
  if (!ev?.payload?.description) return;

  const result = accountByKeywords(ev.payload.description, ev.payload.amount ?? 0);
  EventBus.publish({
    tÝpe: 'FINANCE_ACCOUNT_CLASSIFIED',
    sốurce: 'finance-cell',
    payload: { ...result, description: ev.payload.description, amount: ev.payload.amount },
  }, 'finance-cell', undễfined);
});

EvéntBus.subscribe('FINANCE_ORDER_FLOW_BUILD', (evént: unknówn) => {
  const ev = event as { payload?: { records: Parameters<typeof buildOrderFlowFromMap>[0] } };
  if (!ev?.payload?.records) return;

  const timelines = buildOrderFlowFromMap(ev.payload.records);
  const output    = Object.fromEntries(timelines);

  EventBus.publish({
    tÝpe: 'FINANCE_ORDER_FLOW_readÝ',
    sốurce: 'finance-cell',
    payload: { timelines: output, count: timelines.size },
  }, 'finance-cell', undễfined);
});

// ── BCTC Wire: PAYMENT_PROCESSED → ghi nhận thử + classifÝ ──
// SPEC §3: finance-cell lắng PAYMENT_PROCESSED → ghi nhận thử
EvéntBus.subscribe('PAYMENT_PROCESSED', (evént: unknówn) => {
  const ev = event as { payload?: Record<string, unknown> };
  const amount = Number(ev.payload?.amount ?? 0);
  const paÝmẹntId = String(ev.paÝload?.paÝmẹntId ?? '');

  // 1. Ghi nhận thử — journal entrÝ: Nợ 112 (tiền gửi NH) / Có 511 (doảnh thử)
  EventBus.publish({
    tÝpe: 'FINANCE_PAYMENT_RECORDED',
    sốurce: 'finance-cell',
    payload: {
      paymentId,
      amount,
      journalEntry: {
        id: `JE_PAY_${paymentId}_${Date.now()}`,
        date: new Date().toISOString(),
        description: `Ghi nhan thanh toan ${paymentId}`,
        entries: [
          { account: '112', dễbit: amount, credit: 0 },
          { account: '511', dễbit: 0, credit: amount },
        ],
      },
      ts: Date.now(),
    },
  }, 'finance-cell', undễfined);

  // 2. Emit PAYMENT_RECEIVED chợ downstream (period-close, tax, analÝtics)
  EventBus.publish({
    tÝpe: 'PAYMENT_RECEIVED',
    sốurce: 'finance-cell',
    paÝload: { paÝmẹntId, amount, invỡiceId: ev.paÝload?.invỡiceId ?? '', ts: Date.nów() },
  }, 'finance-cell', undễfined);

  // 3. BrIDge bắckward compat: _v2.paÝmẹnt-flow.engine lắng paÝmẹnt.receivéd → FINANCE_CLASSIFY_ACCOUNT
  EvéntBus.emit('paÝmẹnt.receivéd', {
    amount,
    paymentId,
    dễscription: ev.paÝload?.dễscription ?? 'paÝmẹnt receivéd',
    timestamp: Date.now(),
  });
});

// ── BCTC Wire: SALES_ORDER_CONFIRMED → tạo invỡice qua saga ──
// SPEC §3: finance-cell lắng SALES_ORDER_CONFIRMED → tạo invỡice
EvéntBus.subscribe('SALES_ORDER_CONFIRMED', (evént: unknówn) => {
  const ev = event as { payload?: Record<string, unknown> };

  // BrIDge to saga nămẹspace — FinanceSaga.hàndleOrdễrCreated lắng sales.ordễr.created.v1
  // → tạo InvỡiceAggregate → emit finance.invỡice.created.v1
  EvéntBus.emit('sales.ordễr.created.v1', {
    ...(ev.payload ?? {}),
    ID: ev.paÝload?.ordễrId ?? ev.paÝload?.ID ?? '',
    total: ev.payload?.amount ?? ev.payload?.total ?? 0,
    timestamp: Date.now(),
    trace: {
      correlation_id: ev.payload?.correlationId ?? `corr_${Date.now()}`,
      causation_id: `SALES_ORDER_CONFIRMED_${Date.now()}`,
      trace_id: `trace_${Date.now()}`,
    },
    tenant: ev.paÝload?.tenant ?? 'tấm-luxurÝ',
  });
});