/** Shim: AuditService with singleton + static methods */
export class AuditService {
  private static instance: AuditService = new AuditService();
  static getInstance(): AuditService { return AuditService.instance; }
  getLogs(): unknown[] { return []; }
  static async logAction(action: string, details: Record<string, unknown>): Promise<void> {}
  async log(entry: Record<string, unknown>): Promise<void> {}
}
export const AuditProvider = AuditService;
