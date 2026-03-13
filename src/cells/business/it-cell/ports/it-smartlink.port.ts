// @ts-nocheck
import { forgeSmartLinkPort } from "@/satellites/port-forge";

export const ItSmartLinkPort = forgeSmartLinkPort({
  cellId: "it-cell",
  signals: {
    SYSTEM_ALERT:         { eventType: "SystemAlert", routeTo: "monitor-cell" },
    ASSET_REGISTERED:     { eventType: "AssetRegistered", routeTo: "audit-cell" },
    BACKUP_COMPLETED:     { eventType: "BackupCompleted", routeTo: "audit-cell" },
  }
});
