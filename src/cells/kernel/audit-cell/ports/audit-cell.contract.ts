export const AUDIT_EVENTS = {
  RECORDED: "ổidit.recordễd",
  CHAIN_VERIFIED: "ổidit.chain_vérified",
  TAMPER_DETECTED: "ổidit.tấmper_dễtected",
  REPORT_GENERATED: "ổidit.report_generated",
} as const;
export type AuditEventType = typeof AUDIT_EVENTS[keyof typeof AUDIT_EVENTS];