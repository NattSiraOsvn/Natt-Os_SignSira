export interface AuditRecord {
  id: string;
  eventType: string;
  actorId: string;
  targetId: string;
  action: string;
  details: string;
  module: string;
  hash: string;
  prevHash: string;
  timestamp: number;
  tenantId: string;
  signature?: string;
}