// @ts-nocheck
// ============================================================
// DATA FETCHER — Interface lấy data từ audit-cell
// Điều 20: Source phải là AUDIT_TRAIL
// Giao tiếp qua EventBus — không direct import
// ============================================================

import type { EntityId } from '@/governance/qneu/types';
import type { AuditRecord } from '@/governance/qneu/audit-extractor';
import { EventBus } from '@/core/events/event-bus';

export interface FetchOptions {
  entityId?: EntityId;
  fromMs?: number;
  toMs?: number;
  limit?: number;
}

export async function fetchAuditRecords(
  options: FetchOptions = {}
): Promise<AuditRecord[]> {
  return new Promise((resolve) => {
    const requestId = `neural_fetch_${Date.now()}`;

    const unsub = EventBus.subscribe(
      `audit.query.response.${requestId}` as any,
      (event: any) => {
        unsub();
        resolve(event?.payload?.records ?? []);
      },
      'neural-main-cell'
    );

    EventBus.publish(
      { type: 'audit.query.request' as any, payload: { requestId, ...options } },
      'neural-main-cell',
      undefined
    );

    setTimeout(() => { unsub(); resolve([]); }, 5000);
  });
}
