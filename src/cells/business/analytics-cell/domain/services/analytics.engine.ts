// @ts-nocheck — TODO: fix type errors, remove this pragma

import { AnalyticsSmartLinkPort } from "../../ports/analytics-smartlink.port";
import type { BusinessMetrics } from "@/types";

export interface AnalyticsReport {
  period: string;
  revenue: number;
  cost: number;
  profit: number;
  margin: number;
  topProducts: Array<{ id: string; name: string; sales: number }>;
  generatedAt: number;
}

export const AnalyticsEngine = {
  buildReport: (metrics: Partial<BusinessMetrics>, period: string): AnalyticsReport => {
    const revenue = metrics.totalRevenue ?? 0;
    const cost = metrics.totalCost ?? 0;
    const profit = revenue - cost;
    return {
      period, revenue, cost, profit,
      margin: revenue > 0 ? profit / revenue : 0,
      topProducts: [],
      generatedAt: Date.now(),
    };
  },
  calculateRFM: (orders: any[]): Array<{ customerId: string; recency: number; frequency: number; monetary: number }> => {
    const map = new Map<string, { last: number; count: number; total: number }>();
    orders.forEach(o => {
      const e = map.get(o.customerId) ?? { last: 0, count: 0, total: 0 };
      e.last = Math.max(e.last, o.date ?? 0);
      e.count++;
      e.total += o.amount ?? 0;
      map.set(o.customerId, e);
    });
    const now = Date.now();
    return [...map.entries()].map(([customerId, v]) => ({
      customerId,
      recency: Math.floor((now - v.last) / 86400000),
      frequency: v.count,
      monetary: v.total,
    }));
  },
  forecastRevenue: (history: number[], periods = 3): number[] => {
    if (history.length < 2) return Array(periods).fill(0);
    const avg = history.reduce((s, v) => s + v, 0) / history.length;
    const trend = (history[history.length - 1] - history[0]) / history.length;
    return Array.from({ length: periods }, (_, i) => avg + trend * (i + 1));
  },
  getKPIs: (metrics: Partial<BusinessMetrics>) => ({
    revenueGrowth: 0,
    grossMargin: 0,
    inventoryTurnover: 0,
    customerAcquisitionCost: 0,
    averageOrderValue: (metrics.totalRevenue ?? 0) / Math.max(1, metrics.orderCount ?? 1),
  }),
};
