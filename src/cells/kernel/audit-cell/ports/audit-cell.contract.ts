// @ts-nocheck
export const AUDIT_EVENTS = {
  RECORDED: "audit.recorded",
  CHAIN_VERIFIED: "audit.chain_verified",
  TAMPER_DETECTED: "audit.tamper_detected",
  REPORT_GENERATED: "audit.report_generated",
} as const;
export type AuditEventType = typeof AUDIT_EVENTS[keyof typeof AUDIT_EVENTS];
