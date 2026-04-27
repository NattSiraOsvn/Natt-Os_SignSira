import { forgeSmartLinkPort } from "@/satellites/port-forge";

export const DustRecoverySmartLinkPort = forgeSmartLinkPort({
  cellId: "dust-recovery-cell",
  signals: {
    LOW_PHO_DETECTED: { eventType: "LowPhoDetected", routeTo: "audit-cell" },
    PHO_ANOMALY: { eventType: "PhoAnomaly", routeTo: "quantum-defense-cell" },
    DUST_PROCESSED: { eventType: "DustProcessed", routeTo: "period-close-cell" }
  }
});
