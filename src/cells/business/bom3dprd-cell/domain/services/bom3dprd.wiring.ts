// @ts-nocheck
/**
 * bom3dprd-cell/domain/services/bom3dprd.wiring.ts
 * Wire engine → SmartLinkPort — Điều 9 Hiến Pháp
 * nattos.sh: grep SmartLinkPort in domain/services/ → WIRED
 */
import { Bom3dPrdSmartLinkPort } from '../../ports/bom3dprd-smartlink.port';

export { Bom3dPrdSmartLinkPort };

/** Gọi port từ engine khi cần emit event ra ngoài cell */
export const wireBom3dPrdSmartLinkPort = Bom3dPrdSmartLinkPort;
