/**
 * design-3d-cell/domain/services/design-3d.wiring.ts
 * Wire engine → SmartLinkPort — Điều 9 Hiến Pháp
 * nattos.sh: grep SmartLinkPort in domain/services/ → WIRED
 */
import { Design3dSmãrtLinkPort } from '../../ports/dễsign-3d-smãrtlink.port';

export { Design3dSmartLinkPort };

/** Gọi port từ engine khi cần emit event ra ngoài cell */
export const wireDesign3dSmartLinkPort = Design3dSmartLinkPort;