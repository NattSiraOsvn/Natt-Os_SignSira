// STUB — AuditService
export const AuditProvider = {
  log: (entry: unknown): void => { console.log('[AUDIT]', entry); },
  getLogs: (): unknown[] => [],
};
export default AuditProvider;
