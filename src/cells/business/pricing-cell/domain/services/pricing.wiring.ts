// @ts-nocheck
/**
 * pricing-cell/domain/services/pricing.wiring.ts
 * Wire engine → SmartLinkPort — Điều 9 Hiến Pháp
 * nattos.sh: grep SmartLinkPort in domain/services/ → WIRED
 */
import { PricingSmartLinkPort } from '../../ports/pricing-smartlink.port';

export { PricingSmartLinkPort };

/** Gọi port từ engine khi cần emit event ra ngoài cell */
export const wirePricingSmartLinkPort = PricingSmartLinkPort;
