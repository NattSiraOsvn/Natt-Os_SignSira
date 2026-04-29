/**
 * stone-cell/domain/services/stone.wiring.ts
 * Wire engine → SmartLinkPort — Điều 9 Hiến Pháp
 * nattos.sh: grep SmartLinkPort in domain/services/ → WIRED
 */
import { StoneSmartLinkPort } from '../../ports/stone-smartlink.port';

export { StoneSmartLinkPort };

/** Gọi port từ engine khi cần emit event ra ngoài cell */
export const wireStoneSmartLinkPort = StoneSmartLinkPort;
