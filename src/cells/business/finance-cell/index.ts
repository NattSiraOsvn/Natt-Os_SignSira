// @ts-nocheck
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
import { EventBus } from '@/core/events/event-bus';
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
