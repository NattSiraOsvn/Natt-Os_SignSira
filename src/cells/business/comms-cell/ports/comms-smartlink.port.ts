import { forgeSmartLinkPort } from "@/satellites/port-forge";

export const CommsSmartLinkPort = forgeSmartLinkPort({
  cellId: "comms-cell",
  signals: {
    MESSAGE_SENT:         { eventType: "MessageSent", routeTo: "audit-cell" },
    INVOICE_MATCHED:      { eventType: "InvoiceMatched", routeTo: "finance-cell" },
    AUTO_CHASE_TRIGGERED: { eventType: "AutoChaseTriggered", routeTo: "sales-cell" },
  }
});
