/**
 * SmartLink Registry — alias sang SmartLinkCell
 * Cho phép các cell tìm điểm SmartLink của cell khác
 */
import { SmartLinkCell } from '@/cells/infrastructure/smartlink-cell/interface/SmartLinkCell';

  // export const getCell = (cellId: string) => SmartLinkCell.getStats?.(cellId) ?? null;
export const getNetworkHealth = () => SmartLinkCell.getNetworkHealth();
  // export const getAllStats = () => SmartLinkCell.getStats?.();
export { SmartLinkCell as SmartLinkRegistry };
