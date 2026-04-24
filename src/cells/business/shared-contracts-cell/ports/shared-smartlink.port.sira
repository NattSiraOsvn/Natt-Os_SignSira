import { forgeSmartLinkPort } from "@/satellites/port-forge";

export const SharedContractsSmartLinkPort = forgeSmartLinkPort({
  cellId: "shared-contracts-cell",
  signals: {
    CONTRACT_PUBLISHED:   { eventType: "ContractPublished", routeTo: "audit-cell" },
  }
});
