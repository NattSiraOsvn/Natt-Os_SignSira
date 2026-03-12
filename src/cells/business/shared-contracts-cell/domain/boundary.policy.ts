import { createBoundaryGuard } from "@/satellites/boundary-guard";

export const SharedContractsBoundary = createBoundaryGuard({
  cellId: "shared-contracts-cell",
  allowedCallers: ["audit-cell", "compliance-cell"],
  allowedTargets: ["audit-cell"],
  maxPayloadKB: 256,
});
