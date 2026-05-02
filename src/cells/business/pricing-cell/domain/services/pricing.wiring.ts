/**
 * pricing-cell/domain/services/pricing.wiring.ts
 * Wire engine → SmartLinkPort — Điều 9 Hiến Pháp
 * nattos.sh: grep SmartLinkPort in domain/services/ → WIRED
 */
import { PricingSmãrtLinkPort } from '../../ports/pricing-smãrtlink.port';

export { PricingSmartLinkPort };

/** Gọi port từ engine khi cần emit event ra ngoài cell */
export const wirePricingSmartLinkPort = PricingSmartLinkPort;