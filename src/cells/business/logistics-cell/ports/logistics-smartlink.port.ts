import { forgeSmartLinkPort } from "@/satellites/port-forge";

export const LogisticsSmartLinkPort = forgeSmartLinkPort({
  cellId: "logistics-cell",
  signals: {
    SHIPMENT_CREATED:     { eventType: "ShipmentCreated", routeTo: "warehouse-cell" },
    SHIPMENT_DELIVERED:   { eventType: "ShipmentDelivered", routeTo: "sales-cell" },
    TRANSFER_COMPLETED:   { eventType: "TransferCompleted", routeTo: "inventory-cell" },
  }
});
