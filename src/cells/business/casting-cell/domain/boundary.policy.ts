import { createBoundaryGuard } from "@/satellites/boundary-guard";

export const CastingBoundary = createBoundaryGuard({
  cellId: "casting-cell",
  allowedCallers: ["production-cell", "design-3d-cell", "audit-cell"],
  allowedTargets: ["stone-cell", "audit-cell", "inventory-cell"],
  maxPayloadKB: 512,
});
