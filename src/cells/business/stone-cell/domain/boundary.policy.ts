import { createBoundaryGuard } from "@/satellites/boundary-guard";

export const StoneBoundary = createBoundaryGuard({
  cellId: "stone-cell",
  allowedCallers: ["casting-cell", "production-cell", "design-3d-cell", "audit-cell"],
  allowedTargets: ["finishing-cell", "inventory-cell", "audit-cell"],
  maxPayloadKB: 512,
});
