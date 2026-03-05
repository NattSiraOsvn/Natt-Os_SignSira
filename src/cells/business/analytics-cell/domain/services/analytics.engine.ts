// ============================================================================
// src/cells/business/analytics-cell/domain/services/analytics.engine.ts
// Merged: analytics-service.ts + analytics-api.ts
// Fixed:
//   eventBridge.ts   → @/services/event-bridge (casing + .ts extension)
//   admin/AuditService.ts → @/cells/kernel/audit-cell/domain/services/audit.engine
//   types.ts ext     → @/types
// Migrated by Băng — 2026-03-06
// ============================================================================

import { EventEnvelope, GovernanceKPI, TeamPerformance } from '@/types';
import { EventBridge } from '@/services/event-bridge';
import { AuditProvider } from '@/cells/kernel/audit-cell/domain/services/audit.engine';

// ─── ANALYTICS ENGINE (Read-model projections) ───────────────────────────────

export class AnalyticsEngine {
  private static instance: AnalyticsEngine;
  private readonly RM_DAILY_METRICS   = 'NATT_OS_RM_DAILY_METRICS';
  private readonly RM_ORDER_ANALYTICS = 'NATT_OS_RM_ORDER_ANALYTICS';
  private readonly RM_GOVERNANCE_KPIS = 'NATT_OS_RM_GOVERNANCE_KPIS';

  public static getInstance(): AnalyticsEngine {
    if (!AnalyticsEngine.instance) AnalyticsEngine.instance = new AnalyticsEngine();
    return AnalyticsEngine.instance;
  }

  public init(): void {
    EventBridge.subscribe('sales.order.created.v1',     (e) => this.projectOrderCreated(e as EventEnvelope));
    EventBridge.subscribe('finance.payment.completed.v1',(e) => this.projectPaymentSuccess(e as EventEnvelope));
    EventBridge.subscribe('finance.payment.failed.v1',  (e) => this.projectPaymentFailure(e as EventEnvelope));
    EventBridge.subscribe('warehouse.inventory.reserved.v1', (e) => this.projectInventoryAction(e as EventEnvelope));
    this.ensureDailyMetrics();
  }

  private ensureDailyMetrics(): void {
    const date = new Date().toISOString().split('T')[0];
    const store = this.getStore(this.RM_DAILY_METRICS);
    if (!store[date]) {
      store[date] = {
        metric_date: date,
        total_orders: 0,
        total_revenue_vnd: 0,
        orders_confirmed: 0,
        payments_received: 0,
        payments_failed: 0,
        production_efficiency: 0,
        work_orders_created: 0,
        work_orders_completed: 0,
        updated_at: new Date().toISOString()
      };
      this.setStore(this.RM_DAILY_METRICS, store);
    }
  }

  private async projectOrderCreated(event: EventEnvelope): Promise<void> {
    const date = event.occurred_at.split('T')[0];
    const { payload } = event;

    const orders = this.getStore(this.RM_ORDER_ANALYTICS);
    orders[payload.id] = { ...payload, status: 'PENDING', updated_at: new Date().toISOString() };
    this.setStore(this.RM_ORDER_ANALYTICS, orders);

    const metrics = this.getStore(this.RM_DAILY_METRICS);
    if (metrics[date]) {
      metrics[date].total_orders += 1;
      metrics[date].total_revenue_vnd += (payload.total || 0);
      metrics[date].updated_at = new Date().toISOString();
      this.setStore(this.RM_DAILY_METRICS, metrics);
    }

    await AuditProvider.logAction({
      action: 'ORDER_PROJECTED',
      actor: 'ANALYTICS_ENGINE',
      module: 'analytics-cell',
      details: `Order ${payload.id} projected to read models`
    });
  }

  private async projectPaymentSuccess(event: EventEnvelope): Promise<void> {
    const date = event.occurred_at.split('T')[0];
    const metrics = this.getStore(this.RM_DAILY_METRICS);
    if (metrics[date]) {
      metrics[date].payments_received += 1;
      metrics[date].updated_at = new Date().toISOString();
      this.setStore(this.RM_DAILY_METRICS, metrics);
    }
  }

  private async projectPaymentFailure(event: EventEnvelope): Promise<void> {
    const date = event.occurred_at.split('T')[0];
    const metrics = this.getStore(this.RM_DAILY_METRICS);
    if (metrics[date]) {
      metrics[date].payments_failed += 1;
      metrics[date].updated_at = new Date().toISOString();
      this.setStore(this.RM_DAILY_METRICS, metrics);
    }
  }

  private async projectInventoryAction(_event: EventEnvelope): Promise<void> {
    // Extend khi inventory events có payload cụ thể
  }

  // ─── Analytics API (merged) ─────────────────────────────────────────────

  public async getGovernanceKPIs(): Promise<GovernanceKPI[]> {
    const date = new Date().toISOString().split('T')[0];
    const metrics = this.getStore(this.RM_DAILY_METRICS)[date] || {};

    return [
      {
        kpi_id: 'KPI-001',
        kpi_name: 'Tổng doanh thu (NET)',
        category: 'FINANCIAL',
        period_date: Date.now(),
        target_value: 1_000_000_000,
        actual_value: metrics.total_revenue_vnd || 449_120_000,
        previous_value: 410_000_000,
        change_percent: 9.5,
        status: 'OK',
        owner_team: 'Bối Bối (Team 1)',
        tHReshold_warning: 800_000_000,
        tHReshold_critical: 500_000_000
      },
      {
        kpi_id: 'KPI-002',
        kpi_name: 'Hiệu suất chế tác',
        category: 'OPERATIONAL',
        period_date: Date.now(),
        target_value: 100,
        actual_value: metrics.production_efficiency || 96,
        previous_value: 94,
        change_percent: 2.1,
        status: 'OK',
        owner_team: 'Bối Bối (Team 1)',
        tHReshold_warning: 90,
        tHReshold_critical: 80
      },
      {
        kpi_id: 'KPI-003',
        kpi_name: 'Tỷ lệ thanh toán thành công',
        category: 'FINANCIAL',
        period_date: Date.now(),
        target_value: 99,
        actual_value: metrics.total_orders > 0
          ? (metrics.payments_received / metrics.total_orders) * 100
          : 98,
        previous_value: 97.5,
        change_percent: 0.5,
        status: 'OK',
        owner_team: 'ChatGPT (Team 2)',
        tHReshold_warning: 95,
        tHReshold_critical: 90
      }
    ];
  }

  public async getTeamPerformance(): Promise<TeamPerformance[]> {
    return [
      { team_name: 'Team 1: Bối Bối (Core Business)',   total_tasks: 124, tasks_completed: 110, tasks_in_progress: 10, tasks_blocked: 4, load_percentage: 85, completion_rate: 88.7 },
      { team_name: 'Team 2: ChatGPT (Finance & HR)',     total_tasks: 85,  tasks_completed: 80,  tasks_in_progress: 5,  tasks_blocked: 0, load_percentage: 60, completion_rate: 94.1 },
      { team_name: 'Team 3: KIM (System & Support)',    total_tasks: 42,  tasks_completed: 40,  tasks_in_progress: 2,  tasks_blocked: 0, load_percentage: 30, completion_rate: 95.2 },
      { team_name: 'Team 4: BĂNG (Analytics & Exec)',   total_tasks: 15,  tasks_completed: 15,  tasks_in_progress: 0,  tasks_blocked: 0, load_percentage: 10, completion_rate: 100  }
    ];
  }

  public async getDaySummary(): Promise<unknown> {
    const date = new Date().toISOString().split('T')[0];
    return this.getStore(this.RM_DAILY_METRICS)[date] || null;
  }

  // ─── Storage helpers ──────────────────────────────────────────────────────

  private getStore(key: string): Record<string, unknown> {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  }

  private setStore(key: string, data: unknown): void {
    try { localStorage.setItem(key, JSON.stringify(data)); } catch { /* graceful */ }
  }
}

export const AnalyticsProvider = AnalyticsEngine.getInstance();
// Compat alias
export const AnalyticsAPI = AnalyticsProvider;
