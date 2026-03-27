// @ts-nocheck
// ── enterprise-linker.engine.ts ─────────────────────────────
// Analytics: liên kết dữ liệu đa nguồn → KPI tổng hợp
// Path: src/cells/business/analytics-cell/domain/services/

export interface LinkRecord {
  source:    string;
  entityId:  string;
  metric:    string;
  value:     number;
  timestamp: number;
}

export interface KPISummary {
  entityId:  string;
  metrics:   Record<string, number>;
  sources:   string[];
  conflicts: string[];   // metric nào có data xung đột giữa các nguồn
}

export class EnterpriseLinkerEngine {
  link(records: LinkRecord[]): KPISummary[] {
    const byEntity = new Map<string, LinkRecord[]>();
    for (const r of records) {
      if (!byEntity.has(r.entityId)) byEntity.set(r.entityId, []);
      byEntity.get(r.entityId)!.push(r);
    }

    const summaries: KPISummary[] = [];
    for (const [entityId, recs] of byEntity) {
      const metrics: Record<string, number[]> = {};
      const sources = new Set<string>();

      for (const r of recs) {
        sources.add(r.source);
        if (!metrics[r.metric]) metrics[r.metric] = [];
        metrics[r.metric].push(r.value);
      }

      const avgMetrics: Record<string, number> = {};
      const conflicts: string[] = [];

      for (const [metric, values] of Object.entries(metrics)) {
        const avg = values.reduce((s, v) => s + v, 0) / values.length;
        avgMetrics[metric] = avg;
        // Conflict: variance > 10% of mean
        const variance = values.reduce((s, v) => s + (v - avg) ** 2, 0) / values.length;
        if (avg > 0 && Math.sqrt(variance) / avg > 0.1) conflicts.push(metric);
}
}

  }
}
