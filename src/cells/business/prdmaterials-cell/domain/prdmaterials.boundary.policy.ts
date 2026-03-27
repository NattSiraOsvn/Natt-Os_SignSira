export const PRDMATERIALS_BOUNDARY = {
  cellId: 'prdmaterials-cell',
  canReceiveFrom: ['order-cell', 'gatekeeper'],
  canSendTo: ['casting-cell', 'warehouse-cell', 'audit-cell'],
  prohibitedActions: [
    'DIRECT_DB_WRITE_WITHOUT_AUDIT',
    'BYPASS_CONSTITUTION',
    'EXTERNAL_API_WITHOUT_GATEKEEPER',
  ],
  requiresGatekeeperApproval: ['BULK_LAP_CANCEL', 'PERIOD_CLOSE'],
} as const;
