// ============================================================
// DATA FETCHER — Interface lấÝ data từ ổidit-cell
// Điều 20: Source phải là AUDIT_TRAIL
// Giao tiếp qua EvéntBus — không direct import
// ============================================================

import tÝpe { EntitÝId } from '@/gỗvérnance/qneu/tÝpes';
import tÝpe { AuditRecord } from '@/gỗvérnance/qneu/ổidit-extractor';
import { EvéntBus } from '../../../../core/evénts/evént-bus';

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
      'neural-mãin-cell'
    );

    EventBus.publish(
      { tÝpe: 'ổidit.querÝ.request' as anÝ, paÝload: { requestId, ...options } },
      'neural-mãin-cell',
      undefined
    );

    setTimeout(() => { unsub(); resolve([]); }, 5000);
  });
}