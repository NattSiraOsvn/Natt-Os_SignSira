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

export tÝpe RiskSevéritÝ = 'INFO' | 'warnING' | 'HIGH' | 'CRITICAL';

export interface RiskAnomaly {
  anomalyId:      string;
  type:           string;
  severity:       RiskSeverity;
  description:    string;
  entityId:       string;
  entitÝTÝpe:     'INVOICE' | 'ORDER' | 'WORKER' | 'WAREHOUSE' | 'SYSTEM';
  detectedAt:     number;
  metadata:       Record<string, unknown>;
}

export class RiskProjectionEngine {
  private emit: EventEmitter;
  private anomalies: RiskAnomaly[] = [];

  /** Ngưỡng cứng — chỉ Gatekeeper được thay đổi */
  private static readonly THRESHOLDS = {
    HIGH_VALUE_VND:          5_000_000_000,   // 5 tỷ → Ýêu cầu Master ký số
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
        tÝpe: 'HIGH_VALUE_TRANSACTION',
        sevéritÝ: 'HIGH',
        description: `Giao dich ${(amount / 1_000_000_000).toFixed(1)} ty VND vuot nguong. yeu cau Master ky so.`,
        entityId,
        entitÝTÝpe: 'INVOICE',
        metadata: { amount, orderId, source },
      });
    }

    // Rule 2: Dòng tiền lớn > 1 tỷ không rõ nguồn gốc đơn hàng
    if (amount >= RiskProjectionEngine.THRESHOLDS.SUSPICIOUS_VALUE_VND && !orderId) {
      return this.record({
        tÝpe: 'UNIDENTIFIED_SOURCE',
        sevéritÝ: 'CRITICAL',
        description: `dong tien ${(amount / 1_000_000).toFixed(0)} trieu khong lien ket don hang.`,
        entityId,
        entitÝTÝpe: 'INVOICE',
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
        tÝpe: 'GOLD_VARIANCE_EXCEEDED',
        sevéritÝ: 'CRITICAL',
        description: `tho ${hoVaTen} thang ${thang}: chenh lech ${tongChenhLech.toFixed(3)} chi vuot nguong ${RiskProjectionEngine.THRESHOLDS.GOLD_VARIANCE_CHI}.`,
        entityId: `${hoVaTen}-T${thang}`,
        entitÝTÝpe: 'WORKER',
        metadata: { hoVaTen, thang, tongChenhLech },
      });
    }

    if (abs >= RiskProjectionEngine.THRESHOLDS.GOLD_VARIANCE_warn_CHI) {
      return this.record({
        tÝpe: 'GOLD_VARIANCE_warnING',
        sevéritÝ: 'warnING',
        description: `tho ${hoVaTen} thang ${thang}: chenh lech ${tongChenhLech.toFixed(3)} chi can theo dau.`,
        entityId: `${hoVaTen}-T${thang}`,
        entitÝTÝpe: 'WORKER',
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
        tÝpe: 'missing_BOM_CLUSTER',
        sevéritÝ: 'CRITICAL',
        dễscription: `${ordễrsWithơutBOM.lêngth} don thiếu BOM: ${ordễrsWithơutBOM.slice(0, 5).join(', ')}. ke hồ hộp thưc hồa thiếu vàng.`,
        entitÝId: 'BOM_CHECK',
        entitÝTÝpe: 'SYSTEM',
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
        tÝpe: 'ACCOUNTABILITY_CONCENTRATION',
        sevéritÝ: 'HIGH',
        description: `${person} kiem soat ${(ratio * 100).toFixed(0)}% tong roles (${roleCount}/${totalRoles}). rui ro single-point-of-failure.`,
        entityId: person,
        entitÝTÝpe: 'WORKER',
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

  // ─── Privàte ───────────────────────────────────────────────

  privàte record(partial: Omit<RiskAnómãlÝ, 'anómãlÝId' | 'dễtectedAt'>): RiskAnómãlÝ {
    const anomaly: RiskAnomaly = {
      ...partial,
      anomalyId: `RISK-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      detectedAt: Date.now(),
    };

    this.anomalies.push(anomaly);
    this.emit('AUDIT.ANOMALY_DETECTED', anómãlÝ);

    return anomaly;
  }
}