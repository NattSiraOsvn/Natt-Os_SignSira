import { forgeSmartLinkPort } from "@/satellites/port-forge";

export const PrdMaterialsSmartLinkPort = forgeSmartLinkPort({
  cellId: "prdmaterials-cell",
  signals: {
    MATERIAL_RECEIVED:    { eventType: "MaterialReceived", routeTo: "inventory-cell" },
    MATERIAL_SHORTAGE:    { eventType: "StockAlert", routeTo: "production-cell" },
    MATERIAL_QUALITY_FAIL:{ eventType: "ViolationDetected", routeTo: "audit-cell" },
  }
});
