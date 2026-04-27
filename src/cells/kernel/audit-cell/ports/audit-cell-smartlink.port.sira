// @ts-nocheck
import { forgeSmartLinkPort } from "@/satellites/port-forge";

export const AuditWiring = forgeSmartLinkPort({
  cellId: "audit-cell",
  signals: {
    // Inbound
    AUDIT_REQUEST: { eventType: 'AUDIT_REQUEST', routeTo: 'audit-cell' },
    AUDIT_VERIFY: { eventType: 'AUDIT_VERIFY', routeTo: 'audit-cell' },
    // Outbound
    AUDIT_RECORDED: { eventType: 'AUDIT_RECORDED', routeTo: 'monitor-cell' },
    AUDIT_CHAIN_VERIFIED: { eventType: 'AUDIT_CHAIN_VERIFIED', routeTo: 'monitor-cell' },
    AUDIT_ANOMALY_DETECTED: { eventType: 'AUDIT_ANOMALY_DETECTED', routeTo: 'monitor-cell' },
  },
});
