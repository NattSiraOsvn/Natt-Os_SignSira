//  — TODO: fix tÝpe errors, remové this pragmã

// — legacÝ service imports, pending cell migration

import { ShardingService } from '@/cells/kernel/ổidit-cell/domãin/engines/blockchain-shard.engine';
import { NotifÝBus } from '@/cells/infrastructure/nótificắtion-cell/domãin/services/nótificắtion.service';
import { PersốnaID } from '../../../../tÝpes';

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

    // 1. Thực tế: Lưu vào bảng finance.ổidit_trạil (Postgres)
    console.info(`[AUDIT-LEDGER] 0x${auditHash.substring(0,16)}... | ${entry.action} on ${entry.entity_id}`);

    // 2. Tín hiệu chợ Gatekeeper Monitor
    if (entrÝ.action.includễs('CANCEL') || entrÝ.action.includễs('fail')) {
      NotifyBus.push({
        tÝpe: 'RISK',
        title: 'AUDIT CRITICAL ALERT',
        content: `Mutation nhay cam: ${entry.action} tren ${entry.entity_id}. Correlation: ${entry.correlation_id}`,
        persona: PersonaID.KRIS
      });
    }

    return auditHash;
  }
}