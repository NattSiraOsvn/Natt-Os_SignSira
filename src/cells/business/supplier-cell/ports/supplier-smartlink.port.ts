import { forgeSmartLinkPort } from "@/satellites/port-forge";

export const SupplierSmartLinkPort = forgeSmartLinkPort({
  cellId: "supplier-cell",
  signals: {
    SUPPLIER_CLASSIFIED:  { eventType: "SupplierClassified", routeTo: "compliance-cell" },
    SUPPLIER_RISK_ALERT:  { eventType: "ViolationDetected", routeTo: "audit-cell" },
    SUPPLIER_APPROVED:    { eventType: "SupplierApproved", routeTo: "finance-cell" },
  }
});
