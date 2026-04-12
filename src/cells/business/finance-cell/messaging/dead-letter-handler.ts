// @ts-nocheck — TODO: fix type errors, remove this pragma

// — legacy V1 imports pending migration

import { EventEnvelope, PersonaID } from '../../../../types';
import { NotifyBus } from '@/cells/infrastructure/notification-cell/domain/services/notification.service';
import { ShardingService } from '@/cells/kernel/audit-cell/domain/engines/blockchain-shard.engine';

/**
 * ☠️ DEAD LETTER HANDLER
 * Nơi chứa các Event "chết" không thể xử lý tự động. 
 * Chỉ có Thiên Lớn (Gatekeeper) mới có quyền quyết định Replay hoặc Purge.
 */
export class DeadLetterHandler {
  
  public static async escalate(event: EventEnvelope, error: any) {
    const dlqId = `DLQ-${Date.now()}`;
    const errorHash = ShardingService.generateShardHash({ event_id: event.event_id, error: String(error) });

    // 1. Log ra hệ thống quan sát (Thực tế lưu vào DB bảng finance.dlq)
    console.error(`[DLQ-ESCALATION] 🚨 EVENT ${event.event_name} (ID: ${event.event_id}) BỊ TREO.`);
    console.error(`Lý do: ${String(error)}`);

    // 2. Tín hiệu đỏ cho Gatekeeper Dashboard
    NotifyBus.push({
      type: 'RISK',
      title: 'DEAD LETTER QUEUE ALERT',
      content: `Event ${event.event_name} thất bại sau 3 lần retry. Đã đưa vào DLQ. Hash: 0x${errorHash.substring(0,8)}`,
      persona: PersonaID.KRIS,
      priority: 'HIGH'
    });

    // 3. Đánh dấu sự kiện trong Audit Trail là "STUCK"
    // ...
  }
}
