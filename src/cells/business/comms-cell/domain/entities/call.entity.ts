// @ts-nocheck
export type CallType = 'VOICE' | 'VIDEO';
export type CallStatus = 'RINGING' | 'ACTIVE' | 'ENDED' | 'MISSED' | 'AUTO_CHASE';

export interface Call {
  callId: string;
  roomId: string;
  initiatorId: string;
  type: CallType;
  status: CallStatus;
  isAutoChase: boolean;         // true = hệ thống gọi tự động
  recordingPath?: string;       // pre-recorded file path
  startedAt?: Date;
  endedAt?: Date;
  createdAt: Date;
}

export interface ChaseLog {
  chaseId: string;
  partnerId: string;
  roomId: string;
  invoiceExpectedAfterPaymentAt: Date;  // thời điểm thanh toán + 20h
  attempts: ChaseAttempt[];
  resolved: boolean;
  resolvedAt?: Date;
}

export interface ChaseAttempt {
  attemptId: string;
  attemptNo: number;
  type: 'VOICE_CALL' | 'ROOM_MESSAGE' | 'EMAIL';
  sentAt: Date;
  response: 'NO_ANSWER' | 'ANSWERED' | 'INVOICE_RECEIVED' | 'PENDING';
}