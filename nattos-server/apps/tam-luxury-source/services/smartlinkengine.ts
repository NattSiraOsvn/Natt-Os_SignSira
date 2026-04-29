
// ⚠️ DEPRECATED: Please use '@/core/SmartLinkEngine' instead.
import { SmartLinkCore } from '../core/smartlinkengine';

/**
 * Wrapper for Legacy Compatibility
 */
export const SmartLinkEngine = {
  COA: SmartLinkCore.constructor['COA'], // Hack to access static COA
  generateFromSales: (order: unknown) => SmartLinkCore.generateFromSales(order),
  generateFromBank: (tx: unknown) => SmartLinkCore.generateFromBank(tx),
  generateCostAllocation: (total: number, type: unknown, drivers: unknown) => {
    // Basic implementation for wrapper
    return { costId: 'DEPRECATED', allocations: [] };
  },
  generateAllocationEntries: (alloc: unknown) => []
};
