export interface CellHealth {
  cellId: string;
  confidenceScore: number;
  status: "HEALTHY" | "DEGRADED" | "CRITICAL" | "ELIMINATED";
  lastChecked: number;
  issues: string[];
  wave: 1 | 2 | 3;
}
