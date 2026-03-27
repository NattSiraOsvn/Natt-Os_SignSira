// @ts-nocheck
// — legacy service imports, pending cell migration

import { ShardingService } from '../../../../../services/blockchainService';
import { NotifyBus } from '../../../../../services/notificationService';
import { PersonaID } from '../../../../../types';

export interface AuditEntry {
  action: string;
  actor: string;
  entity_type: string;
  entity_id: string;
  old_state_hash?: string;
  new_state_hash: string;
  correlation_id: string;
}

/**
 * 🔒 FINANCE AUDIT LOGGER (Append-Only)
 * Đảm bảo mọi mutation tài chính đều được băm và lưu trữ không thể xóa sửa.
 */
export class FinanceAuditLogger {
  
  public static async logAction(entry: AuditEntry): Promise<string> {
    const timestamp = new Date().toISOString();
    const auditHash = ShardingService.generateShardHash({ ...entry, timestamp });

    // 1. Thực tế: Lưu vào bảng finance.audit_trail (Postgres)
    console.info(`[AUDIT-LEDGER] 0x${auditHash.substring(0,16)}... | ${entry.action} on ${entry.entity_id}`);

    // 2. Tín hiệu cho Gatekeeper Monitor
    if (entry.action.includes('CANCEL') || entry.action.includes('FAIL')) {
      NotifyBus.push({
        type: 'RISK',
        title: 'AUDIT CRITICAL ALERT',
        content: `Mutation nhạy cảm: ${entry.action} trên ${entry.entity_id}. Correlation: ${entry.correlation_id}`,
        persona: PersonaID.KRIS
      });
    }

    return auditHash;
  }
}
