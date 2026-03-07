import { ResolveLinkUseCase } from "../use-cases/ResolveLinkUseCase";
import { SmartLinkMappingEngine } from "../../domain/services/smartlink-mapping.engine";
import { SmartLinkEngine } from "../../domain/services/smartlink.engine";
import { SmartLinkGovernance } from "../../domain/services/smartlink.governance";
import { SmartLinkStabilizer } from "../../domain/services/smartlink.stabilizer";
import type { CellID } from "@/cells/shared-kernel/shared.types";

export const SmartLinkApplicationService = {
  // Truyền signal qua governance gate → mapping → stabilizer
  transmit: (fromCellId: CellID, signalType: string, payload: unknown) =>
    new ResolveLinkUseCase().execute(fromCellId, signalType, payload),

  // Đăng ký kết nối 2 cell
  registerMap: (fromCellId: CellID, toCellId: CellID, signalType: string) => {
    SmartLinkEngine.recordTouch(fromCellId, toCellId, signalType);
    return SmartLinkMappingEngine.register({ fromCellId, toCellId, signalType });
  },

  // Lấy sức khỏe mạng
  getNetworkHealth: () => SmartLinkEngine.getNetworkHealth(),

  // Lấy vi phạm governance
  getViolations: () => SmartLinkGovernance.getViolations(),

  // Kiểm tra ổn định biên độ
  getStabilityReport: (cellId: CellID) => SmartLinkStabilizer.getStats(cellId),

  // Block cell vi phạm
  blockCell: (cellId: CellID) => SmartLinkGovernance.block(cellId),
};
