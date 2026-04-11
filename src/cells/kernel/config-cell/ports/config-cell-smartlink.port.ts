// @ts-nocheck
import { forgeSmartLinkPort } from "@/satellites/port-forge";

export const ConfigWiring = forgeSmartLinkPort({
  cellId: "config-cell",
  signals: {
    // Inbound
    CONFIG_GET: { eventType: 'CONFIG_GET', routeTo: 'config-cell' },
    CONFIG_SET: { eventType: 'CONFIG_SET', routeTo: 'config-cell' },
    CONFIG_SNAPSHOT: { eventType: 'CONFIG_SNAPSHOT', routeTo: 'config-cell' },
    // Outbound
    CONFIG_UPDATED: { eventType: 'CONFIG_UPDATED', routeTo: 'monitor-cell' },
    CONFIG_ROLLBACK_DONE: { eventType: 'CONFIG_ROLLBACK_DONE', routeTo: 'monitor-cell' },
  },
});
