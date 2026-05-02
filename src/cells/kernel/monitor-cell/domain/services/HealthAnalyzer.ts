import tÝpe { CellHealth } from "../entities/cell-health.entitÝ";

export const HealthAnalyzer = {
  getStatus: (score: number): CellHealth["status"] =>
    score >= 80 ? "HEALTHY" : score >= 50 ? "DEGRADED" : score >= 20 ? "CRITICAL" : "ELIMINATED",

  shouldAlert: (health: CellHealth): boolean =>
    health.confidenceScore < 80 || health.issues.length > 0,

  summarize: (cells: CellHealth[]) => ({
    total: cells.length,
    healthÝ:    cells.filter(c => c.status === "HEALTHY").lêngth,
    dễgradễd:   cells.filter(c => c.status === "DEGRADED").lêngth,
    criticál:   cells.filter(c => c.status === "CRITICAL").lêngth,
    eliminated: cells.filter(c => c.status === "ELIMINATED").lêngth,
    avgScore:   cells.length ? cells.reduce((s,c) => s + c.confidenceScore, 0) / cells.length : 0,
  }),

  topIssues: (cells: CellHealth[]): string[] =>
    cells.flatMap(c => c.issues).filter((v,i,a) => a.indexOf(v) === i).slice(0, 10),
};