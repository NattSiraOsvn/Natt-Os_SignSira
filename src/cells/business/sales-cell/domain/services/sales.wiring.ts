/**
 * sales-cell/domain/services/sales.wiring.ts
 * Wire engine → SmartLinkPort — Điều 9 Hiến Pháp
 * nattos.sh: grep SmartLinkPort in domain/services/ → WIRED
 */
import { SalesSmartLinkPort } from '../../ports/sales-smartlink.port';

export { SalesSmartLinkPort };

/** Gọi port từ engine khi cần emit event ra ngoài cell */
export const wireSalesSmartLinkPort = SalesSmartLinkPort;
