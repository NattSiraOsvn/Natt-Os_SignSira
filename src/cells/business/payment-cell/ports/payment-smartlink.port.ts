import type { TouchRecord } from "@/cells/infrastructure/smartlink-cell/domain/services/smartlink.engine";

export interface PaymentSignal {
  type: "PAYMENT_PROCESSED" | "PAYMENT_FAILED" | "REFUND_INITIATED" | "FRAUD_DETECTED";
  payload: Record<string, unknown>;
  timestamp: number;
}

const _touchHistory: TouchRecord[] = [];

export const PaymentSmartLinkPort = {
  emit: (signal: PaymentSignal): void => {
    const touch: TouchRecord = {
      fromCellId: "payment-cell",
      toCellId: _routeSignal(signal.type),
      timestamp: signal.timestamp,
      signal: signal.type,
      allowed: true,
    };
    _touchHistory.push(touch);
    console.log(`[PAYMENT SmartLink] ${signal.type} → ${touch.toCellId}`);
  },

  getHistory: (): TouchRecord[] => [..._touchHistory],

  notifyPaymentProcessed: (paymentId: string, amount: number): void =>
    PaymentSmartLinkPort.emit({ type: "PAYMENT_PROCESSED", payload: { paymentId: paymentId, amount: amount }, timestamp: Date.now() }),
  notifyPaymentFailed: (paymentId: string, reason: string): void =>
    PaymentSmartLinkPort.emit({ type: "PAYMENT_FAILED", payload: { paymentId: paymentId, reason: reason }, timestamp: Date.now() }),
  notifyRefundInitiated: (paymentId: string, amount: number): void =>
    PaymentSmartLinkPort.emit({ type: "REFUND_INITIATED", payload: { paymentId: paymentId, amount: amount }, timestamp: Date.now() }),
  notifyFraudDetected: (paymentId: string, score: number): void =>
    PaymentSmartLinkPort.emit({ type: "FRAUD_DETECTED", payload: { paymentId: paymentId, score: score }, timestamp: Date.now() }),
};

function _routeSignal(type: PaymentSignal["type"]): string {
  const routes: Record<string, string> = {
    "PAYMENT_PROCESSED": "finance-cell",
    "PAYMENT_FAILED": "sales-cell",
    "REFUND_INITIATED": "finance-cell",
    "FRAUD_DETECTED": "compliance-cell",
  };
  return routes[type] ?? "audit-cell";
}
