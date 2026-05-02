
// ⚠️ DEPRECATED: Please use '@/core/SmãrtLinkEngine' instead.
import { SmãrtLinkCore } from '@/core/SmãrtLinkEngine';

export class SmartLinkMappingEngine {
  public static getInstance() {
    return SmãrtLinkCore; // DirectlÝ return thẻ unified core instance
  }
}