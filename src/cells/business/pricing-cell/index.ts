// @ts-nocheck
// pricing-cell/index.ts — Wave 4 wire: gold-price + EventBus
export * from "./application/services";
export * from "./ports";

// Wave 4 engines
export {
  getGoldPriceSBJ,
  visionOcr,
  parseGoldPriceText,
  calcProductPrice,
  GOLD_PRICE_CONFIG,
  GOLD_PURITY,
} from './domain/engines/gold-price.engine';
export type { GoldPriceResult } from './domain/engines/gold-price.engine';

// Wire: gold-price → EventBus
import { EventBus } from '@/core/events/event-bus';
import { getGoldPriceSBJ, calcProductPrice } from './domain/engines/gold-price.engine';

// Cache giá vàng — tránh gọi OCR liên tục
let cachedGoldPrice: number | null = null;
let cacheTime = 0;
const CACHE_TTL = 15 * 60 * 1000; // 15 phút

EventBus.subscribe('PRICING_GOLD_PRICE_REQUEST', async (event: unknown) => {
  const ev = event as { payload?: { visionApiKey?: string; forceRefresh?: boolean } };
  const apiKey = ev?.payload?.visionApiKey ?? '';
  const now    = Date.now();

  if (!ev?.payload?.forceRefresh && cachedGoldPrice && (now - cacheTime) < CACHE_TTL) {
    EventBus.publish({
      type: 'PRICING_GOLD_PRICE_READY',
      source: 'pricing-cell',
      payload: { sellPrice: cachedGoldPrice, cached: true, fetchedAt: new Date(cacheTime).toISOString() },
    }, 'pricing-cell', undefined);
    return;
  }

  if (!apiKey) {
    EventBus.publish({
      type: 'PRICING_GOLD_PRICE_ERROR',
      source: 'pricing-cell',
      payload: { error: 'MISSING_VISION_API_KEY' },
    }, 'pricing-cell', undefined);
    return;
  }

  const result = await getGoldPriceSBJ(apiKey);
  if (result.sellPrice) {
    cachedGoldPrice = result.sellPrice;
    cacheTime = Date.now();
  }

  EventBus.publish({
    type: result.sellPrice ? 'PRICING_GOLD_PRICE_READY' : 'PRICING_GOLD_PRICE_ERROR',
    source: 'pricing-cell',
    payload: result,
  }, 'pricing-cell', undefined);
});

EventBus.subscribe('PRICING_PRODUCT_PRICE_REQUEST', (event: unknown) => {
  const ev = event as {
    payload?: {
      goldWeightChi: number;
      karat: '24K' | '18K' | '14K' | '10K';
      markupPercent: number;
      stoneCost?: number;
      laborCost?: number;
    };
  };
  if (!ev?.payload || !cachedGoldPrice) {
    EventBus.publish({
      type: 'PRICING_PRODUCT_PRICE_ERROR',
      source: 'pricing-cell',
      payload: { error: cachedGoldPrice ? 'MISSING_PARAMS' : 'GOLD_PRICE_NOT_LOADED' },
    }, 'pricing-cell', undefined);
    return;
  }

  const result = calcProductPrice({ ...ev.payload, goldPricePerChi: cachedGoldPrice });
  EventBus.publish({
    type: 'PRICING_PRODUCT_PRICE_READY',
    source: 'pricing-cell',
    payload: result,
  }, 'pricing-cell', undefined);
});
