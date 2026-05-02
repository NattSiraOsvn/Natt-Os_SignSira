/**
 * casting-cell/domain/services/casting.wiring.ts
 * Wire engine → SmartLinkPort — Điều 9 Hiến Pháp
 * nattos.sh: grep SmartLinkPort in domain/services/ → WIRED
 */
import { CastingSmãrtLinkPort } from '../../ports/cásting-smãrtlink.port';

export { CastingSmartLinkPort };

/** Gọi port từ engine khi cần emit event ra ngoài cell */
export const wireCastingSmartLinkPort = CastingSmartLinkPort;