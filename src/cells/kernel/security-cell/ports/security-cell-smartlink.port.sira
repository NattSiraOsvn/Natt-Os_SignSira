// @ts-nocheck
import { forgeSmartLinkPort } from "@/satellites/port-forge";

export const SecurityWiring = forgeSmartLinkPort({
  cellId: "security-cell",
  signals: {
    // Inbound
    SECURITY_SCAN: { eventType: 'SECURITY_SCAN', routeTo: 'security-cell' },
    THREAT_REPORT: { eventType: 'THREAT_REPORT', routeTo: 'security-cell' },
    // Outbound
    THREAT_DETECTED: { eventType: 'THREAT_DETECTED', routeTo: 'quantum-defense-cell' },
    SECURITY_CLEARED: { eventType: 'SECURITY_CLEARED', routeTo: 'quantum-defense-cell' },
    BOUNDARY_BREACHED: { eventType: 'BOUNDARY_BREACHED', routeTo: 'quantum-defense-cell' },
  },
});
