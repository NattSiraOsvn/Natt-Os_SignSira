// @ts-nocheck
export const DESIGN3D_BOUNDARY = { cellId: "design-3d-cell", canReceiveFrom: ["order-cell", "gatekeeper"], canSendTo: ["casting-cell", "prdmaterials-cell", "audit-cell"], prohibitedActions: ["BYPASS_CONSTITUTION", "EXTERNAL_API_WITHOUT_GATEKEEPER"], requiresGatekeeperApproval: ["BULK_SKU_DELETE"] } as const;
