// SmartLink barrel — Điều 22 sợi dẫn truyền thần kinh
export * from "@/cells/infrastructure/smartlink-cell/domain/services/smartlink.engine";
export * from "@/cells/infrastructure/smartlink-cell/domain/services/smartlink.governance";

// Convenience singleton registry
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
    // Wave 1 không bị chặn bởi Wave 3 — tôn ti thứ bậc
    if (from.wave > to.wave + 1) return false;
    if (!from.connections.includes(toCellId)) from.connections.push(toCellId);
    return true;
  },

  getRegistered: (): SmartLinkRegistration[] => [..._registry.values()],
  isRegistered: (cellId: string): boolean => _registry.has(cellId),
  getConnections: (cellId: string): string[] => _registry.get(cellId)?.connections ?? [],

  // Auto-register all known cells on import
  bootstrap: (): void => {
    const kernelCells    = ["audit-cell","config-cell","monitor-cell","rbac-cell","security-cell"];
    const infraCells     = ["smartlink-cell","sync-cell","warehouse-cell","shared-contracts-cell"];
    const businessCells  = ["finance-cell","hr-cell","sales-cell","order-cell","inventory-cell",
                             "payment-cell","customer-cell","production-cell","pricing-cell",
                             "warranty-cell","buyback-cell","promotion-cell","showroom-cell",
                             "customs-cell","analytics-cell"];
    kernelCells.forEach(id   => SmartLinkRegistry.register(id, 1));
    infraCells.forEach(id    => SmartLinkRegistry.register(id, 2));
    businessCells.forEach(id => SmartLinkRegistry.register(id, 3));
  },
};

SmartLinkRegistry.bootstrap();
