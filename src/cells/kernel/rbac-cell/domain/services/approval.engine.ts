// ============================================================================
// src/cells/kernel/rbac-cell/domain/services/approval.engine.ts
// Migrated from: services/approval/approval-workflow-service.ts
// Fixed: ghost import notificationservice → notification-service
// Migrated by Băng — 2026-03-06
// ============================================================================

import { ApprovalRequest, ApprovalTicket, ApprovalStatus, PersonaID } from '@/types';
import { NotifyBus } from '@/services/notification-service';

export interface ApprovalStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  autoApproved: number;
}

export class ApprovalEngine {
  private static instance: ApprovalEngine;
  private tickets: ApprovalTicket[] = [];

  public static getInstance(): ApprovalEngine {
    if (!ApprovalEngine.instance) {
      ApprovalEngine.instance = new ApprovalEngine();
    }
    return ApprovalEngine.instance;
  }

  async submitForApproval(data: ApprovalRequest): Promise<ApprovalTicket> {
    const shouldAuto = this.shouldAutoApprove(data);
    const status: ApprovalStatus = shouldAuto
      ? ApprovalStatus.APPROVED
      : ApprovalStatus.PENDING;

    const ticket = this.createTicket(data, status);
    this.tickets.push(ticket);

    if (shouldAuto) {
      NotifyBus.push({
        type: 'SUCCESS',
        title: 'Tự động phê duyệt',
        content: `Yêu cầu "${data.title}" đã được tự động duyệt.`,
        persona: PersonaID.CAN
      });
    } else {
      NotifyBus.push({
        type: 'ORDER',
        title: 'Yêu cầu phê duyệt mới',
        content: `"${data.title}" đang chờ phê duyệt từ ${data.requiredApprovers?.join(', ') || 'Quản lý'}.`,
        persona: PersonaID.KRIS
      });
    }

    return ticket;
  }

  private createTicket(request: ApprovalRequest, status: ApprovalStatus): ApprovalTicket {
    return {
      id: `TICK-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      requestId: request.id,
      title: request.title,
      type: request.type,
      requestedBy: request.requestedBy,
      requestedAt: Date.now(),
      status,
      data: request.data,
      requiredApprovers: request.requiredApprovers || [],
      approvalHistory: [],
      priority: request.priority || 'NORMAL',
      deadline: request.deadline
    };
  }

  private shouldAutoApprove(data: ApprovalRequest): boolean {
    // Auto approve: low priority + amount dưới ngưỡng
    if (data.priority === 'LOW') return true;
    if ((data.data as any)?.amount && (data.data as any).amount < 5_000_000) return true;
    return false;
  }

  async approveTicket(ticketId: string, approverId: string): Promise<ApprovalTicket | null> {
    const ticket = this.tickets.find(t => t.id === ticketId);
    if (!ticket) return null;

    ticket.status = ApprovalStatus.APPROVED;
    ticket.approvalHistory.push({
      actor: approverId,
      action: 'APPROVED',
      timestamp: Date.now()
    });

    NotifyBus.push({
      type: 'SUCCESS',
      title: 'Đã phê duyệt',
      content: `Ticket "${ticket.title}" đã được ${approverId} phê duyệt.`,
      persona: PersonaID.CAN
    });

    return ticket;
  }

  async rejectTicket(ticketId: string, approverId: string, reason: string): Promise<ApprovalTicket | null> {
    const ticket = this.tickets.find(t => t.id === ticketId);
    if (!ticket) return null;

    ticket.status = ApprovalStatus.REJECTED;
    ticket.rejectionReason = reason;
    ticket.approvalHistory.push({
      actor: approverId,
      action: 'REJECTED',
      reason,
      timestamp: Date.now()
    });

    NotifyBus.push({
      type: 'RISK',
      title: 'Từ chối phê duyệt',
      content: `Ticket "${ticket.title}" bị từ chối. Lý do: ${reason}`,
      persona: PersonaID.KRIS
    });

    return ticket;
  }

  getTickets(): ApprovalTicket[] { return this.tickets; }
  getPending(): ApprovalTicket[] { return this.tickets.filter(t => t.status === ApprovalStatus.PENDING); }

  getStats(): ApprovalStats {
    return {
      total: this.tickets.length,
      pending: this.tickets.filter(t => t.status === ApprovalStatus.PENDING).length,
      approved: this.tickets.filter(t => t.status === ApprovalStatus.APPROVED).length,
      rejected: this.tickets.filter(t => t.status === ApprovalStatus.REJECTED).length,
      autoApproved: 0
    };
  }
}

export const ApprovalWorkflow = ApprovalEngine.getInstance();
