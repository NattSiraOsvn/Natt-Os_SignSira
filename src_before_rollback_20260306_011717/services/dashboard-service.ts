
import { HUDMetric, Department, ActionLog } from '@/types';
import { getCell } from '@/cells/shared-kernel/smartlink.registry';

/**
 * 📊 DASHBOARD SERVICE - REGISTRY-BASED
 * Thực thi bóc tách dữ liệu qua SmartLink Registry v5.0.
 * Tuân thủ tuyệt đối Boundary Law (Book III Điều 7).
 */
class DashboardService {
  private static instance: DashboardService;

  static getInstance() {
    if (!DashboardService.instance) DashboardService.instance = new DashboardService();
    return DashboardService.instance;
  }

  async getHUDMetrics(): Promise<HUDMetric[]> {
    // 🛡️ HỢP HIẾN: Pull logic thực thi từ Registry thay vì import tĩnh
    const WarehouseProvider = await getCell('WAREHOUSE');
    const SalesProvider = await getCell('SALES');

    // Bóc tách dữ liệu thống kê từ các Shard Isolate
    const inventory = WarehouseProvider.getAllInventory();
    const totalItems = inventory.length;
    
    const totalRevenue = await SalesProvider.getRevenueStats();

    return [
      {
        id: 'M1',
        label: 'DOANH THU CHỐT SHARD',
        name: 'DOANH THU CHỐT SHARD',
        value: totalRevenue || 449120,
        unit: 'VND',
        trend: 'UP',
        department: Department.SALES,
        icon: '💰'
      },
      {
        id: 'M2',
        label: 'TỒN KHO VÀNG',
        name: 'TỒN KHO VÀNG',
        value: totalItems,
        unit: 'SP',
        trend: 'STABLE',
        department: Department.PRODUCTION,
        icon: '📦'
      }
    ];
  }

  async getActionLogs(): Promise<ActionLog[]> {
    return [];
  }
}

export const DashboardProvider = DashboardService.getInstance();
