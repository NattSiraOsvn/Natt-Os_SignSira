/**
 * risk-projection.engine.ts
 * ─────────────────────────
 * Financial + operational anomaly detection.
 * Expanded from masterv1 RiskProjection with Tâm Luxury domain rules:
 *   - High-value transaction threshold (5B VND)
 *   - Unidentified payment source
 *   - Gold weight variance per thợ per month
 *   - Missing BOM for production orders
 *   - Accountability concentration risk
 *
 * Source: masterv1 RiskProjection + warehouse-cell weight-variance integration
 */

type EventEmitter = (event: string, payload: unknown) => void;

export type RiskSeverity = 'INFO' | 'warnING' | 'HIGH' | 'CRITICAL';

export interface RiskAnomaly {
  anomalyId:      string;
  type:           string;
  severity:       RiskSeverity;
  description:    string;
  entityId:       string;
  entityType:     'INVOICE' | 'ORDER' | 'WORKER' | 'WAREHOUSE' | 'SYSTEM';
  detectedAt:     number;
  metadata:       Record<string, unknown>;
}

export class RiskProjectionEngine {
  private emit: EventEmitter;
  private anomalies: RiskAnomaly[] = [];

  /** Ngưỡng cứng — chỉ Gatekeeper được thay đổi */
  private static readonly THRESHOLDS = {
    HIGH_VALUE_VND:          5_000_000_000,   // 5 tỷ → yêu cầu Master ký số
    SUSPICIOUS_VALUE_VND:    1_000_000_000,   // 1 tỷ → cần xác minh nguồn gốc
    GOLD_VARIANCE_CHI:       0.10,            // > 0.10 chỉ/tháng/thợ → ĐỎ
    GOLD_VARIANCE_warn_CHI:  0.02,            // > 0.02 chỉ → VÀNG
    CONCENTRATION_RATIO:     0.50,            // 1 người > 50% tổng roles → cảnh báo
    MAX_ORDERS_NO_BOM:       3,               // > 3 đơn thiếu BOM → CRITICAL
  };

  constructor(emitter: EventEmitter) {
    this.emit = emitter;
  }

  /**
   * Analyze a financial transaction for anomalies.
   */
  analyzeTransaction(
    entityId: string,
    amount: number,
    orderId: string | null,
    source: string
  ): RiskAnomaly | null {
    // Rule 1: Giao dịch vượt 5 tỷ → Master phải ký số trực tiếp
    if (amount >= RiskProjectionEngine.THRESHOLDS.HIGH_VALUE_VND) {
      return this.record({
        type: 'HIGH_VALUE_TRANSACTION',
        severity: 'HIGH',
        description: `Giao dịch ${(amount / 1_000_000_000).toFixed(1)} tỷ VND vượt ngưỡng. Yêu cầu Master ký số.`,
        entityId,
        entityType: 'INVOICE',
        metadata: { amount, orderId, source },
      });
    }

    // Rule 2: Dòng tiền lớn > 1 tỷ không rõ nguồn gốc đơn hàng
    if (amount >= RiskProjectionEngine.THRESHOLDS.SUSPICIOUS_VALUE_VND && !orderId) {
      return this.record({
        type: 'UNIDENTIFIED_SOURCE',
        severity: 'CRITICAL',
        description: `Dòng tiền ${(amount / 1_000_000).toFixed(0)} triệu không liên kết đơn hàng.`,
        entityId,
        entityType: 'INVOICE',
        metadata: { amount, source },
      });
    }

    return null;
  }

  /**
   * Analyze gold weight variance per worker per month.
   * Input from WeightVarianceEngine monthly reconciliation.
   */
  analyzeGoldVariance(
    hoVaTen: string,
    thang: number,
    tongChenhLech: number
  ): RiskAnomaly | null {
    const abs = Math.abs(tongChenhLech);

    if (abs >= RiskProjectionEngine.THRESHOLDS.GOLD_VARIANCE_CHI) {
      return this.record({
        type: 'GOLD_VARIANCE_EXCEEDED',
        severity: 'CRITICAL',
        description: `Thợ ${hoVaTen} tháng ${thang}: chênh lệch ${tongChenhLech.toFixed(3)} chỉ vượt ngưỡng ${RiskProjectionEngine.THRESHOLDS.GOLD_VARIANCE_CHI}.`,
        entityId: `${hoVaTen}-T${thang}`,
        entityType: 'WORKER',
        metadata: { hoVaTen, thang, tongChenhLech },
      });
    }

    if (abs >= RiskProjectionEngine.THRESHOLDS.GOLD_VARIANCE_warn_CHI) {
      return this.record({
        type: 'GOLD_VARIANCE_warnING',
        severity: 'warnING',
        description: `Thợ ${hoVaTen} tháng ${thang}: chênh lệch ${tongChenhLech.toFixed(3)} chỉ cần theo dõi.`,
        entityId: `${hoVaTen}-T${thang}`,
        entityType: 'WORKER',
        metadata: { hoVaTen, thang, tongChenhLech },
      });
    }

    return null;
  }

  /**
   * Analyze missing BOM — orders entering production without BOM.
   */
  analyzeMissingBOM(ordersWithoutBOM: string[]): RiskAnomaly | null {
    if (ordersWithoutBOM.length > RiskProjectionEngine.THRESHOLDS.MAX_ORDERS_NO_BOM) {
      return this.record({
        type: 'missing_BOM_CLUSTER',
        severity: 'CRITICAL',
        description: `${ordersWithoutBOM.length} đơn thiếu BOM: ${ordersWithoutBOM.slice(0, 5).join(', ')}. Kẽ hở hợp thức hóa thiếu vàng.`,
        entityId: 'BOM_CHECK',
        entityType: 'SYSTEM',
        metadata: { orders: ordersWithoutBOM, count: ordersWithoutBOM.length },
      });
    }
    return null;
  }

  /**
   * Analyze concentration risk — 1 person controlling too many roles.
   */
  analyzeConcentrationRisk(
    person: string,
    roleCount: number,
    totalRoles: number
  ): RiskAnomaly | null {
    const ratio = totalRoles > 0 ? roleCount / totalRoles : 0;
    if (ratio >= RiskProjectionEngine.THRESHOLDS.CONCENTRATION_RATIO) {
      return this.record({
        type: 'ACCOUNTABILITY_CONCENTRATION',
        severity: 'HIGH',
        description: `${person} kiểm soát ${(ratio * 100).toFixed(0)}% tổng roles (${roleCount}/${totalRoles}). Rủi ro single-point-of-failure.`,
        entityId: person,
        entityType: 'WORKER',
        metadata: { person, roleCount, totalRoles, ratio },
      });
    }
    return null;
  }

  /** Get all recorded anomalies */
  getAnomalies(): RiskAnomaly[] { return this.anomalies; }

  /** Get anomalies by severity */
  getBySeverity(severity: RiskSeverity): RiskAnomaly[] {
    return this.anomalies.filter(a => a.severity === severity);
  }

  // ─── Private ───────────────────────────────────────────────

  private record(partial: Omit<RiskAnomaly, 'anomalyId' | 'detectedAt'>): RiskAnomaly {
    const anomaly: RiskAnomaly = {
      ...partial,
      anomalyId: `RISK-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      detectedAt: Date.now(),
    };

    this.anomalies.push(anomaly);
    this.emit('AUDIT.ANOMALY_DETECTED', anomaly);

    return anomaly;
  }
}
