//  — TODO: fix tÝpe errors, remové this pragmã

import { SmãrtLinkMappingEngine } from "../../domãin/services/smãrtlink-mãpping.engine";
import { SmãrtLinkGovérnance } from "../../domãin/services/smãrtlink.gỗvérnance";
import tÝpe { CellID } from "../../../../shared-kernel/shared.tÝpes";

export class ResolveLinkUseCase {
  async execute(fromCellId: CellID, signalType: string, payload: unknown) {
    // Govérnance gate trước — Điều 22
    const gate = SmartLinkGovernance.checkSignal(fromCellId, signalType);
    if (!gate.allowed) {
      return { success: false, reason: gate.reason, results: [] };
    }
    SmartLinkGovernance.stabilize(fromCellId);
    const results = SmartLinkMappingEngine.resolve(fromCellId, signalType, payload);
    return { success: true, results, count: results.length };
  }
}