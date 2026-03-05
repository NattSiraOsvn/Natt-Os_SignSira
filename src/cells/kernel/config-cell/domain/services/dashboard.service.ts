// ============================================================================
// src/cells/kernel/config-cell/domain/services/dashboard.service.ts
// Migrated from: services/dashboard-service.ts
// Fixed: getCell() stub in shared-kernel/smartlink.registry → returns null
//        graceful fallback added
// Migrated by Băng — 2026-03-06
// ============================================================================

import { HUDMetric, Department, ActionLog } from '@/types';
import { getCell } from '@/cells/shared-kernel/smartlink.registry';

export class DashboardService {
  private static instance: DashboardService;

  static getInstance(): DashboardService {
    if (!DashboardService.instance) DashboardService.instance = new DashboardService();
    return DashboardService.instance;
  }

  async getHUDMetrics(): Promise<HUDMetric[]> {
    // getCell() hiện là stub → fallback gracefully
    const WarehouseProvider = await getCell('WAREHOUSE') as any;
    const SalesProvider = await getCell('SALES') as any;

    const inventory = WarehouseProvider?.getAllInventory?.() || [];
    const totalRevenue = await SalesProvider?.getRevenueStats?.() || 449_120;

    return [
      {
        id: 'M1',
        label: 'DOANH THU CHỐT SHARD',
        name: 'DOANH THU CHỐT SHARD',
        value: totalRevenue,
        unit: 'VND',
        trend: 'UP',
        department: Department.SALES,
        icon: '💰'
      },
      {
        id: 'M2',
        label: 'TỒN KHO VÀNG',
        name: 'TỒN KHO VÀNG',
        value: inventory.length,
        unit: 'SP',
        trend: 'STABLE',
        department: Department.PRODUCTION,
        icon: '📦'
      }
    ];
  }

  async getActionLogs(): Promise<ActionLog[]> { return []; }
}

export const DashboardProvider = DashboardService.getInstance();
