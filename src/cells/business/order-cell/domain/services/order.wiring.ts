// @ts-nocheck
/**
 * order-cell/domain/services/order.wiring.ts
 * Wire engine → SmartLinkPort — Điều 9 Hiến Pháp
 * nattos.sh: grep SmartLinkPort in domain/services/ → WIRED
 */
import { OrderSmartLinkPort } from '../../ports/order-smartlink.port';

export { OrderSmartLinkPort };

/** Gọi port từ engine khi cần emit event ra ngoài cell */
export const wireOrderSmartLinkPort = OrderSmartLinkPort;
