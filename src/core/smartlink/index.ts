/**
 * NATT-OS SmartLink — 3 tầng hoàn chỉnh
 *
 * Tầng 1 — SmartLinkPoint   : điểm → sợi → mạng lưới (tự hình thành qua vận hành)
 * Tầng 2 — SmartLinkCell    : nhà máy ổn áp (kiểm soát điểm nào được chạm)
 * Tầng 3 — QneuBridge       : vết hằn → QNEU imprint → tiến hóa
 *
 * Dùng trong cell: CellSmartLinkComponent (mandatory component Điều 8)
 */
export { SmartLinkPoint } from './smartlink.point';
export type { TouchRecord, ImpulsePayload, ImpulseResult } from './smartlink.point';

export { SmartLinkCell } from '@/cells/infrastructure/smartlink-cell/domain/services/smartlink.stabilizer';
export type { TouchPermission, NetworkHealth } from '@/cells/infrastructure/smartlink-cell/domain/services/smartlink.stabilizer';

export { QneuBridge } from './smartlink.qneu-bridge';
export type { SmartLinkImprint } from './smartlink.qneu-bridge';

export { CellSmartLinkComponent } from './cell-smartlink.component';
