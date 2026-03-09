import type { TouchRecord } from "@/cells/infrastructure/smartlink-cell/domain/services/smartlink.engine";

export interface AnalyticsSignal {
  type: "REPORT_READY" | "ANOMALY_DETECTED" | "INSIGHT_PUBLISHED" | "FORECAST_UPDATED";
  payload: Record<string, unknown>;
  timestamp: number;
}

const _touchHistory: TouchRecord[] = [];

export const AnalyticsSmartLinkPort = {
  emit: (signal: AnalyticsSignal): void => {
    const touch: TouchRecord = {
      fromCellId: "analytics-cell",
      toCellId: _routeSignal(signal.type),
      timestamp: signal.timestamp,
      signal: signal.type,
      allowed: true,
    };
    _touchHistory.push(touch);
    console.log(`[ANALYTICS SmartLink] ${signal.type} → ${touch.toCellId}`);
  },

  getHistory: (): TouchRecord[] => [..._touchHistory],

  notifyReportReady: (reportId: string, type: string): void =>
    AnalyticsSmartLinkPort.emit({ type: "REPORT_READY", payload: { reportId: reportId, type: type }, timestamp: Date.now() }),
  notifyAnomalyDetected: (entityId: string, score: number): void =>
    AnalyticsSmartLinkPort.emit({ type: "ANOMALY_DETECTED", payload: { entityId: entityId, score: score }, timestamp: Date.now() }),
  notifyInsightPublished: (insightId: string): void =>
    AnalyticsSmartLinkPort.emit({ type: "INSIGHT_PUBLISHED", payload: { insightId: insightId }, timestamp: Date.now() }),
  notifyForecastUpdated: (period: string): void =>
    AnalyticsSmartLinkPort.emit({ type: "FORECAST_UPDATED", payload: { period: period }, timestamp: Date.now() }),
};

function _routeSignal(type: AnalyticsSignal["type"]): string {
  const routes: Record<string, string> = {
    "REPORT_READY": "audit-cell",
    "ANOMALY_DETECTED": "compliance-cell",
    "INSIGHT_PUBLISHED": "sales-cell",
    "FORECAST_UPDATED": "production-cell",
  };
  return routes[type] ?? "audit-cell";
}
