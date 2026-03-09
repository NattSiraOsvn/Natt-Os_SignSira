import type { TouchRecord } from "@/cells/infrastructure/smartlink-cell/domain/services/smartlink.engine";

export interface PromotionSignal {
  type: "PROMO_ACTIVATED" | "PROMO_EXPIRED" | "VOUCHER_REDEEMED" | "CAMPAIGN_LAUNCHED";
  payload: Record<string, unknown>;
  timestamp: number;
}

const _touchHistory: TouchRecord[] = [];

export const PromotionSmartLinkPort = {
  emit: (signal: PromotionSignal): void => {
    const touch: TouchRecord = {
      fromCellId: "promotion-cell",
      toCellId: _routeSignal(signal.type),
      timestamp: signal.timestamp,
      signal: signal.type,
      allowed: true,
    };
    _touchHistory.push(touch);
    console.log(`[PROMOTION SmartLink] ${signal.type} → ${touch.toCellId}`);
  },

  getHistory: (): TouchRecord[] => [..._touchHistory],

  notifyPromoActivated: (promoId: string, discount: number): void =>
    PromotionSmartLinkPort.emit({ type: "PROMO_ACTIVATED", payload: { promoId: promoId, discount: discount }, timestamp: Date.now() }),
  notifyPromoExpired: (promoId: string): void =>
    PromotionSmartLinkPort.emit({ type: "PROMO_EXPIRED", payload: { promoId: promoId }, timestamp: Date.now() }),
  notifyVoucherRedeemed: (voucherId: string, amount: number): void =>
    PromotionSmartLinkPort.emit({ type: "VOUCHER_REDEEMED", payload: { voucherId: voucherId, amount: amount }, timestamp: Date.now() }),
  notifyCampaignLaunched: (campaignId: string): void =>
    PromotionSmartLinkPort.emit({ type: "CAMPAIGN_LAUNCHED", payload: { campaignId: campaignId }, timestamp: Date.now() }),
};

function _routeSignal(type: PromotionSignal["type"]): string {
  const routes: Record<string, string> = {
    "PROMO_ACTIVATED": "sales-cell",
    "PROMO_EXPIRED": "analytics-cell",
    "VOUCHER_REDEEMED": "finance-cell",
    "CAMPAIGN_LAUNCHED": "customer-cell",
  };
  return routes[type] ?? "audit-cell";
}
