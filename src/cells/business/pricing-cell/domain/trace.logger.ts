import { createTraceLogger } from "@/satellites/trace-logger";
export const PricingTrace = createTraceLogger({ cellId: "pricing-cell", domain: "PRICING" });
