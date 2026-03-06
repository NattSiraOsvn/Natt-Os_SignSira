/**
 * QNEU → Audit-Cell SmartLink Bridge
 * 
 * Hiến pháp v4.0:
 * - Điều 9-10: Mọi giao tiếp qua SmartLink
 * - Điều 28: Audit-by-default, audit là hệ miễn dịch
 * 
 * Hiện tại: QNEU ghi audit log riêng (file-based)
 * Tương lai: QNEU gửi event qua SmartLink → audit-cell quản lý toàn bộ
 * 
 * File này là bridge — khi audit-cell sẵn sàng, swap implementation.
 */

import type { QNEUAuditEvent } from './types';

/**
 * Interface cho audit integration.
 * QNEU chỉ biết interface này — không biết audit-cell implementation.
 * Đây là SmartLink pattern: intent + semantics, không phải direct import.
 */
export interface QNEUAuditBridge {
  /**
   * Send a QNEU audit event to the audit system.
   * In seed stage: writes to local file.
   * In production: sends SmartLink envelope to audit-cell.
   */
  emitAuditEvent(event: QNEUAuditEvent): Promise<void>;

  /**
   * Query audit events (for validator, decay, reporting).
   * In seed stage: reads from local file.
   * In production: SmartLink query to audit-cell.
   */
  queryAuditEvents(filter: AuditFilter): Promise<QNEUAuditEvent[]>;
}

export interface AuditFilter {
  entity_id?: string;
  event_type?: string;
  from_timestamp?: string;
  to_timestamp?: string;
  limit?: number;
}

/**
 * Seed-stage implementation — writes to local persistence.
 * This is what runs NOW.
 */
export class LocalAuditBridge implements QNEUAuditBridge {
  private appendFn: (event: QNEUAuditEvent) => void;
  private readFn: () => QNEUAuditEvent[];

  constructor(
    appendFn: (event: QNEUAuditEvent) => void,
    readFn: () => QNEUAuditEvent[],
  ) {
    this.appendFn = appendFn;
    this.readFn = readFn;
  }

  async emitAuditEvent(event: QNEUAuditEvent): Promise<void> {
    this.appendFn(event);
  }

  async queryAuditEvents(filter: AuditFilter): Promise<QNEUAuditEvent[]> {
    let events = this.readFn();
    if (filter.entity_id) events = events.filter(e => e.entity_id === filter.entity_id);
    if (filter.event_type) events = events.filter(e => e.event_type === filter.event_type);
    if (filter.from_timestamp) events = events.filter(e => e.timestamp >= filter.from_timestamp!);
    if (filter.to_timestamp) events = events.filter(e => e.timestamp <= filter.to_timestamp!);
    if (filter.limit) events = events.slice(-filter.limit);
    return events;
  }
}

/**
 * FUTURE: SmartLink implementation
 * When audit-cell is production-ready, implement this:
 * 
 * export class SmartLinkAuditBridge implements QNEUAuditBridge {
 *   constructor(private smartLink: SmartLinkPort) {}
 * 
 *   async emitAuditEvent(event: QNEUAuditEvent): Promise<void> {
 *     await this.smartLink.send({
 *       intent: 'AUDIT_LOG',
 *       source: 'qneu',
 *       target: 'audit-cell',
 *       payload: event,
 *       trace_id: event.trace_id,
 *     });
 *   }
 * 
 *   async queryAuditEvents(filter: AuditFilter): Promise<QNEUAuditEvent[]> {
 *     const result = await this.smartLink.query({
 *       intent: 'AUDIT_QUERY',
 *       source: 'qneu',
 *       target: 'audit-cell',
 *       payload: filter,
 *     });
 *     return result.payload as QNEUAuditEvent[];
 *   }
 * }
 */
