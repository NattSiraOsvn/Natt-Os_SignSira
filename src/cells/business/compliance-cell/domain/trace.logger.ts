import { createTraceLogger } from "@/satellites/trace-logger";
export const ComplianceTrace = createTraceLogger({ cellId: "compliance-cell", domain: "COMPLIANCE" });
