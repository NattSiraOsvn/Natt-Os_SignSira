import { createBoundaryGuard } from "@/satellites/boundary-guard";

export const PolishingBoundary = createBoundaryGuard({
  cellId: "polishing-cell",
  allowedCallers: ["finishing-cell", "production-cell", "audit-cell"],
  allowedTargets: ["production-cell", "inventory-cell", "audit-cell"],
  maxPayloadKB: 512,
});
