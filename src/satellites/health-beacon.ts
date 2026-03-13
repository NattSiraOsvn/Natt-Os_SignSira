// @ts-nocheck
interface HealthConfig {
  cellId: string;
  checkIntervalMs?: number;
}

export interface HealthReport {
  cellId: string;
  status: "HEALTHY" | "DEGRADED" | "CRITICAL";
  timestamp: number;
  checks: Record<string, boolean>;
}

export function createHealthBeacon(config: HealthConfig) {
  let lastReport: HealthReport | null = null;

  return {
    report: (checks: Record<string, boolean>): HealthReport => {
      const failCount = Object.values(checks).filter(v => !v).length;
      const status = failCount === 0 ? "HEALTHY" : failCount <= 1 ? "DEGRADED" : "CRITICAL";
      lastReport = { cellId: config.cellId, status, timestamp: Date.now(), checks };
      return lastReport;
    },
    getLastReport: (): HealthReport | null => lastReport,
    cellId: config.cellId,
  };
}
