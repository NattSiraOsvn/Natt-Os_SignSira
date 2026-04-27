// @ts-nocheck
import { forgeSmartLinkPort } from "@/satellites/port-forge";

export const AiConnectorWiring = forgeSmartLinkPort({
  cellId: "ai-connector-cell",
  signals: {
    // Inbound
    AI_QUERY: { eventType: 'AI_QUERY', routeTo: 'ai-connector-cell' },
    AI_MEMORY_REQUEST: { eventType: 'AI_MEMORY_REQUEST', routeTo: 'ai-connector-cell' },
    // Outbound
    AI_RESPONSE: { eventType: 'AI_RESPONSE', routeTo: 'audit-cell' },
    AI_MEMORY_LOADED: { eventType: 'AI_MEMORY_LOADED', routeTo: 'audit-cell' },
  },
});
