// @ts-nocheck — TODO: fix type errors, remove this pragma

import { SmartLinkMappingEngine } from "../../domain/services/smartlink-mapping.engine";
import { SmartLinkGovernance } from "../../domain/services/smartlink.governance";
import type { CellID } from "../../../../shared-kernel/shared.types";

export class ResolveLinkUseCase {
  async execute(fromCellId: CellID, signalType: string, payload: unknown) {
    // Governance gate trước — Điều 22
    const gate = SmartLinkGovernance.checkSignal(fromCellId, signalType);
    if (!gate.allowed) {
      return { success: false, reason: gate.reason, results: [] };
    }
    SmartLinkGovernance.stabilize(fromCellId);
    const results = SmartLinkMappingEngine.resolve(fromCellId, signalType, payload);
    return { success: true, results, count: results.length };
  }
}
