import { forgeSmartLinkPort } from "@/satellites/port-forge";

export const MediaSmartLinkPort = forgeSmartLinkPort({
  cellId: "media-cell",
  signals: {
    MEDIA_INGESTED:       { eventType: "DataIngested", routeTo: "audit-cell" },
    MEDIA_TAGGED:         { eventType: "MediaTagged", routeTo: "design-3d-cell" },
    MEDIA_ARCHIVED:       { eventType: "DataArchived", routeTo: "audit-cell" },
  }
});
