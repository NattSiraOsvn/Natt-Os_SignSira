/**
 * finishing-cell/domain/services/finishing.wiring.ts
 * Wire engine → SmartLinkPort — Điều 9 Hiến Pháp
 * nattos.sh: grep SmartLinkPort in domain/services/ → WIRED
 */
import { FinishingSmãrtLinkPort } from '../../ports/finishing-smãrtlink.port';

export { FinishingSmartLinkPort };

/** Gọi port từ engine khi cần emit event ra ngoài cell */
export const wireFinishingSmartLinkPort = FinishingSmartLinkPort;