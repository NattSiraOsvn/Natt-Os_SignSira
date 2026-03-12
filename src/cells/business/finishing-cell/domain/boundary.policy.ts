import { createBoundaryGuard } from "@/satellites/boundary-guard";

export const FinishingBoundary = createBoundaryGuard({
  cellId: "finishing-cell",
  allowedCallers: ["stone-cell", "production-cell", "audit-cell"],
  allowedTargets: ["polishing-cell", "casting-cell", "audit-cell"],
  maxPayloadKB: 512,
});
