// @ts-nocheck
import { forgeSmartLinkPort } from "@/satellites/port-forge";

export const PhapCheSmartLinkPort = forgeSmartLinkPort({
  cellId: "phap-che-cell",
  signals: {
    CONTRACT_REVIEWED:    { eventType: "ContractReviewed", routeTo: "compliance-cell" },
    LEGAL_RISK_DETECTED:  { eventType: "ViolationDetected", routeTo: "audit-cell" },
    REGULATION_UPDATED:   { eventType: "RegulationUpdated", routeTo: "compliance-cell" },
  }
});
