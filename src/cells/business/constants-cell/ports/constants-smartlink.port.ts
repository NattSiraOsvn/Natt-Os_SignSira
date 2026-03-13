// @ts-nocheck
import { forgeSmartLinkPort } from "@/satellites/port-forge";

export const ConstantsSmartLinkPort = forgeSmartLinkPort({
  cellId: "constants-cell",
  signals: {
    CONFIG_UPDATED:       { eventType: "ConfigUpdated", routeTo: "audit-cell" },
  }
});
