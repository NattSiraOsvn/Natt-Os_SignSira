import { createBoundaryGuard } from "@/satellites/boundary-guard";

export const ConstantsBoundary = createBoundaryGuard({
  cellId: "constants-cell",
  allowedCallers: ["config-cell", "audit-cell"],
  allowedTargets: ["audit-cell"],
  maxPayloadKB: 128,
});
