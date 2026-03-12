import { forgeSmartLinkPort } from "@/satellites/port-forge";

export const PrdWarrantySmartLinkPort = forgeSmartLinkPort({
  cellId: "prdwarranty-cell",
  signals: {
    WARRANTY_ISSUED:      { eventType: "WarrantyIssued", routeTo: "warranty-cell" },
    WARRANTY_CLAIM:       { eventType: "WarrantyClaimed", routeTo: "finance-cell" },
    NASI_CERT_GENERATED:  { eventType: "NaSiLinked", routeTo: "audit-cell" },
  }
});
