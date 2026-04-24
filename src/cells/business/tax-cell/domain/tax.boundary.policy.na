// Điều 9 §3 — Boundary
export const taxBoundaryPolicy = {
  cellId: 'tax-cell',
  allowedCallers: [
    'finance-cell',
    'warehouse-cell',
    'audit-cell',
    'gatekeeper',
  ],
  allowedTargets: [
    'smartlink-cell',
    'audit-cell',
  ],
  prohibitedActions: [
    'DIRECT_DB_WRITE_WITHOUT_AUDIT',
    'BYPASS_CONSTITUTION',
    'EXTERNAL_API_WITHOUT_GATEKEEPER', // LỆNH_001
  ],
  requiresGatekeeperApproval: [
    'PERIOD_CLOSE',
    'BULK_DELETE',
  ],
} as const;
