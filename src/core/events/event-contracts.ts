/**
 * event-contracts.ts — L3 Type-aware Event System
 * thiên Lớn spec: overlay layer, không đụng EventBus core
 *
 * Nguyên tắc:
 * - KHÔNG thay thế EventBus
 * - CHỈ thêm type safety bên ngoài
 * - Backward compatible 100%
 */

export type EventContracts = {
  // ── ORDER → CASH FLOW ────────────────────────────────────
  'order.created': {
    orderId: string;
    customerId?: string;
    amount?: number;
    channel?: 'SHOWROOM' | 'ONLINE' | 'B2B';
    ts?: number;
  };
  'sales.confirm': {
    orderId: string;
    amount?: number;
    source?: string;
    retry?: boolean;
    retryCount?: number;
    ts?: number;
  };
  'payment.received': {
    orderId: string;
    amount?: number;
    source?: string;
    ts?: number;
  };

  // ── PRODUCTION CHAIN ─────────────────────────────────────
  'ProductionSpecReady': {
    orderId: string;
    items?: unknown[];
    source?: string;
    ts?: number;
  };
  'ProductionStarted': {
    orderId: string;
    stage?: string;
    source?: string;
    retry?: boolean;
    retryCount?: number;
    ts?: number;
  };
  'ProductionStageAdvanced': {
    orderId: string;
    stage?: string;
    worker?: string;
    ts?: number;
  };
  'ProductionCompleted': {
    orderId: string;
    qty?: number;
    source?: string;
    ts?: number;
  };

  // ── AUDIT CHAIN ───────────────────────────────────────────
  'audit.record': {
    action: string;
    actor: { id: string; type: string };
    resource?: string;
    result?: string;
    timestamp?: number;
    trace?: Record<string, unknown>;
  };
  'audit.recorded': {
    auditId?: string;
    hash?: string;
    ts?: number;
  };

  // ── ANOMALY + SELF-HEALING ────────────────────────────────
  'anomaly.detected': {
    type: string;
    from: string;
    expected?: string;
    orderId?: string;
    severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    timeout?: number;
    causedBy?: string;
    sourceCell?: string;
    chain?: string[];
    missing?: boolean;
    ts?: number;
  };
  'cell.metric': {
    cell: string;
    metric: string;
    value: number;
    confidence?: number;
    source?: string;
    ts?: number;
    [key: string]: unknown;
  };

  // ── ANTI-FRAUD ────────────────────────────────────────────
  'WeightAnomaly': {
    orderId: string;
    workerId: string;
    weightIn: number;
    weightOut: number;
    source?: string;
    ts?: number;
  };
  'DiamondLossDetected': {
    orderId: string;
    bomCount?: number;
    actualCount?: number;
    loss?: number;
    source?: string;
    ts?: number;
  };
  'DustShortfall': {
    workerId: string;
    sach: number;
    actual: number;
    source?: string;
    ts?: number;
  };
  'LowPhoDetected': {
    workerId: string;
    luong: 'SX' | 'SC';
    pho: number;
    source?: string;
    ts?: number;
  };
  'MaterialRetained': {
    orderId: string;
    materialCode: string;
    issued: number;
    returned: number;
    source?: string;
    ts?: number;
  };
};

export type EventType = keyof EventContracts;
