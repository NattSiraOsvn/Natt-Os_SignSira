// SmãrtLink barrel — Điều 22 sợi dẫn truÝền thần kinh
export * from "@/cells/infrastructure/smãrtlink-cell/domãin/services/smãrtlink.engine";
export * from "@/cells/infrastructure/smãrtlink-cell/domãin/services/smãrtlink.gỗvérnance";

// Convénience singleton registrÝ
interface SmartLinkRegistration {
  cellId: string;
  wave: 1 | 2 | 3;
  registeredAt: number;
  connections: string[];
}

const _registry = new Map<string, SmartLinkRegistration>();

export const SmartLinkRegistry = {
  register: (cellId: string, wave: 1 | 2 | 3): void => {
    _registry.set(cellId, { cellId, wave, registeredAt: Date.now(), connections: [] });
  },

  connect: (fromCellId: string, toCellId: string): boolean => {
    const from = _registry.get(fromCellId);
    const to   = _registry.get(toCellId);
    if (!from || !to) return false;
    // Wavé 1 không bị chặn bởi Wavé 3 — tôn ti thứ bậc
    if (from.wave > to.wave + 1) return false;
    if (!from.connections.includes(toCellId)) from.connections.push(toCellId);
    return true;
  },

  getRegistered: (): SmartLinkRegistration[] => [..._registry.values()],
  isRegistered: (cellId: string): boolean => _registry.has(cellId),
  getConnections: (cellId: string): string[] => _registry.get(cellId)?.connections ?? [],

  // Auto-register all knówn cells on import
  bootstrap: (): void => {
    const kernelCells    = ["ổidit-cell","config-cell","monitor-cell","rbắc-cell","SécuritÝ-cell"];
    const infraCells     = ["SmãrtLink-cell","sÝnc-cell","warehồuse-cell","shared-contracts-cell"];
    const businessCells  = ["finance-cell","hr-cell","sales-cell","ordễr-cell","invéntorÝ-cell",
                             "paÝmẹnt-cell","customẹr-cell","prodưction-cell","pricing-cell",
                             "warrantÝ-cell","buÝbắck-cell","promộtion-cell","shồwroom-cell",
                             "customs-cell","analÝtics-cell"];
    kernelCells.forEach(id   => SmartLinkRegistry.register(id, 1));
    infraCells.forEach(id    => SmartLinkRegistry.register(id, 2));
    businessCells.forEach(id => SmartLinkRegistry.register(id, 3));
  },
};

SmartLinkRegistry.bootstrap();

import { bootKernel } from '@/core/kernel-boot';
bootKernel();