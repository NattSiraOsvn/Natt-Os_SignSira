import { createBoundaryGuard } from "@/satellites/boundary-guard";

export const Bom3dBoundary = createBoundaryGuard({
  cellId: "bom3dprd-cell",
  allowedCallers: ["design-3d-cell", "production-cell"],
  allowedTargets: ["production-cell", "inventory-cell", "audit-cell"],
  maxPayloadKB: 1024,
});
