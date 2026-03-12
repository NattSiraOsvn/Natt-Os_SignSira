import { createTraceLogger } from "@/satellites/trace-logger";
export const SharedContractsTrace = createTraceLogger({ cellId: "shared-contracts-cell", domain: "CONTRACTS" });
