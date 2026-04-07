
// ⚠️ DEPRECATED: Please use '@/core/SmartLinkEngine' instead.
import { SmartLinkCore } from '../core/SmartLinkEngine';

/**
 * Wrapper for Legacy Compatibility
 */
export const SmartLinkEngine = {
  COA: SmartLinkCore.constructor['COA'], // Hack to access static COA
  generateFromSales: (order: any) => SmartLinkCore.generateFromSales(order),
  generateFromBank: (tx: any) => SmartLinkCore.generateFromBank(tx),
  generateCostAllocation: (total: number, type: any, drivers: any) => {
    // Basic implementation for wrapper
    return { costId: 'DEPRECATED', allocations: [] };
  },
  generateAllocationEntries: (alloc: any) => []
};
