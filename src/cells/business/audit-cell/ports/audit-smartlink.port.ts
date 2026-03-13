import { forgeSmartLinkPort } from "@/satellites/port-forge";

export const AuditSmartLinkPort = forgeSmartLinkPort({
  cellId: "audit-cell",
  signals: {
    FRAUD_ALERT: { eventType: "FraudAlertRaised", routeTo: "quantum-defense-cell" },
    RECONCILIATION_REPORT: { eventType: "ReconciliationReportGenerated", routeTo: "period-close-cell" },
    AUDIT_LOG: { eventType: "AuditLogged", routeTo: "audit-cell" }
  }
});
