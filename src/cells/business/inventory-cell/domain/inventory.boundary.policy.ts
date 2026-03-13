// @ts-nocheck
export const INVENTORY_BOUNDARY = {
  cellId: 'inventory-cell',
  canReceiveFrom: [
    'warehouse-cell', 'production-cell', 'casting-cell',
    'finishing-cell', 'polishing-cell', 'finance-cell', 'gatekeeper',
  ],
  canSendTo: ['finance-cell', 'audit-cell', 'warehouse-cell'],
  prohibitedActions: [
    'DELETE_STOCK_ENTRY',
    'BYPASS_CONSTITUTION',
    'BACKDATED_ADJUST_GT30DAYS',
  ],
  requiresGatekeeperApproval: ['MONTH_END_CLOSE', 'BULK_ADJUST'],
} as const;
