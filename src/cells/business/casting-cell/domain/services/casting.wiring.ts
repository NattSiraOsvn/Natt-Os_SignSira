/**
 * casting-cell/domain/services/casting.wiring.ts
 * Wire engine → SmartLinkPort — Điều 9 Hiến Pháp
 * nattos.sh: grep SmartLinkPort in domain/services/ → WIRED
 */
import { CastingSmartLinkPort } from '../../ports/casting-SmartLink.port';

export { CastingSmartLinkPort };

/** Gọi port từ engine khi cần emit event ra ngoài cell */
export const wireCastingSmartLinkPort = CastingSmartLinkPort;
