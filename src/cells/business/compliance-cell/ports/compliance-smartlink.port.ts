import type { TouchRecord } from "@/cells/infrastructure/smartlink-cell/domain/services/smartlink.engine";

export interface ComplianceSignal {
  type: "VIOLATION_DETECTED" | "AUDIT_TRIGGERED" | "POLICY_BREACH" | "RISK_ESCALATED";
  payload: Record<string, unknown>;
  timestamp: number;
}

const _touchHistory: TouchRecord[] = [];

export const ComplianceSmartLinkPort = {
  emit: (signal: ComplianceSignal): void => {
    const touch: TouchRecord = {
      fromCellId: "compliance-cell",
      toCellId: _routeSignal(signal.type),
      timestamp: signal.timestamp,
      signal: signal.type,
      allowed: true,
    };
    _touchHistory.push(touch);
    console.log(`[COMPLIANCE SmartLink] ${signal.type} → ${touch.toCellId}`);
  },

  getHistory: (): TouchRecord[] => [..._touchHistory],

  notifyViolationDetected: (violationId: string, severity: string): void =>
    ComplianceSmartLinkPort.emit({ type: "VIOLATION_DETECTED", payload: { violationId: violationId, severity: severity }, timestamp: Date.now() }),
  notifyAuditTriggered: (entityId: string, reason: string): void =>
    ComplianceSmartLinkPort.emit({ type: "AUDIT_TRIGGERED", payload: { entityId: entityId, reason: reason }, timestamp: Date.now() }),
  notifyPolicyBreach: (employeeId: string, policy: string): void =>
    ComplianceSmartLinkPort.emit({ type: "POLICY_BREACH", payload: { employeeId: employeeId, policy: policy }, timestamp: Date.now() }),
  notifyRiskEscalated: (riskId: string, level: string): void =>
    ComplianceSmartLinkPort.emit({ type: "RISK_ESCALATED", payload: { riskId: riskId, level: level }, timestamp: Date.now() }),
};

function _routeSignal(type: ComplianceSignal["type"]): string {
  const routes: Record<string, string> = {
    "VIOLATION_DETECTED": "audit-cell",
    "AUDIT_TRIGGERED": "audit-cell",
    "POLICY_BREACH": "hr-cell",
    "RISK_ESCALATED": "audit-cell",
  };
  return routes[type] ?? "audit-cell";
}
