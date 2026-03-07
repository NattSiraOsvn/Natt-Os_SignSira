import type { CellHealth } from "../entities/cell-health.entity";

export const HealthAnalyzer = {
  getStatus: (score: number): CellHealth["status"] =>
    score >= 80 ? "HEALTHY" : score >= 50 ? "DEGRADED" : score >= 20 ? "CRITICAL" : "ELIMINATED",

  shouldAlert: (health: CellHealth): boolean =>
    health.confidenceScore < 80 || health.issues.length > 0,

  summarize: (cells: CellHealth[]) => ({
    total: cells.length,
    healthy:    cells.filter(c => c.status === "HEALTHY").length,
    degraded:   cells.filter(c => c.status === "DEGRADED").length,
    critical:   cells.filter(c => c.status === "CRITICAL").length,
    eliminated: cells.filter(c => c.status === "ELIMINATED").length,
    avgScore:   cells.length ? cells.reduce((s,c) => s + c.confidenceScore, 0) / cells.length : 0,
  }),

  topIssues: (cells: CellHealth[]): string[] =>
    cells.flatMap(c => c.issues).filter((v,i,a) => a.indexOf(v) === i).slice(0, 10),
};
