// @ts-nocheck
import { forgeSmartLinkPort } from "@/satellites/port-forge";

export const SmartlinkWiring = forgeSmartLinkPort({
  cellId: "smartlink-cell",
  signals: {
    // Inbound
    SMARTLINK_CREATE: { eventType: 'SMARTLINK_CREATE', routeTo: 'smartlink-cell' },
    SMARTLINK_RESOLVE: { eventType: 'SMARTLINK_RESOLVE', routeTo: 'smartlink-cell' },
    // Outbound
    SMARTLINK_CREATED: { eventType: 'SMARTLINK_CREATED', routeTo: 'monitor-cell' },
    SMARTLINK_RESOLVED: { eventType: 'SMARTLINK_RESOLVED', routeTo: 'monitor-cell' },
    SMARTLINK_FAILED: { eventType: 'SMARTLINK_FAILED', routeTo: 'monitor-cell' },
  },
});
