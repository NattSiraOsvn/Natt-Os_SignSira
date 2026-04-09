import { EventBus } from "../../../../core/events/event-bus";
// ── compliance-smartlink.port.ts ────────────────────────────
export interface ComplianceSignal {
  type: "FRAUD_DETECTED" | "COMPLIANCE_OK" | "AUDIT_REQUIRED" | "ROUND_NUMBER_ANOMALY";
  payload: Record<string, unknown>;
  timestamp: number;
}

const COMPLIANCE_MAP: Record<string, string> = {
  "FRAUD_DETECTED":       "FraudDetected",
  "COMPLIANCE_OK":        "ComplianceOK",
  "AUDIT_REQUIRED":       "AuditRequired",
  "ROUND_NUMBER_ANOMALY": "RoundNumberAnomaly",
};

export function publishComplianceSignal(signal: ComplianceSignal): void {
  EventBus.emit(COMPLIANCE_MAP[signal.type] ?? signal.type, { ...signal.payload, timestamp: signal.timestamp });
}

// ────────────────────────────────────────────────────────────
