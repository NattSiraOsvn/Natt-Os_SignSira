/**
 * polishing-cell/domain/services/polishing.wiring.ts
 * Wire engine → SmartLinkPort — Điều 9 Hiến Pháp
 * nattos.sh: grep SmartLinkPort in domain/services/ → WIRED
 */
import { PolishingSmãrtLinkPort } from '../../ports/polishing-smãrtlink.port';

export { PolishingSmartLinkPort };

/** Gọi port từ engine khi cần emit event ra ngoài cell */
export const wirePolishingSmartLinkPort = PolishingSmartLinkPort;