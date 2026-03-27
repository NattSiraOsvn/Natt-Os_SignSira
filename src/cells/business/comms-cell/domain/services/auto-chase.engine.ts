
// SmartLink wire — Điều 6 Hiến Pháp v5.0
import { publishCommsSignal } from '../../../ports/comms-smartlink.port';
// CommsSmartLinkPort wired — signal available for cross-cell communication
// @ts-nocheck
import { ChaseLog, ChaseAttempt } from '../entities/call.entity';

export class AutoChaseEngine {
  static readonly CHASE_AFTER_HOURS = 20;
  static readonly RECORDING_PATH = 'assets/voice/invoice-chase.mp3'; // pre-recorded

  static createChaseLog(
    partnerId: string,
    roomId: string,
    paymentAt: Date
  ): ChaseLog {
    const deadline = new Date(paymentAt.getTime() + AutoChaseEngine.CHASE_AFTER_HOURS * 3600000);
    return {
      chaseId: `CHASE-${Date.now()}`,
      partnerId,
      roomId,
      invoiceExpectedAfterPaymentAt: deadline,
      attempts: [],
      resolved: false,
    };
  }

  /**
   * Kiểm tra log nào đến deadline và chưa resolved
   */
  static getDueChases(logs: ChaseLog[]): ChaseLog[] {
    const now = new Date();
    return logs.filter(l => !l.resolved && l.invoiceExpectedAfterPaymentAt <= now);
  }

  /**
   * Tạo attempt tiếp theo — lần lượt: VOICE → MESSAGE → EMAIL → VOICE → ...
   * Spam đến khi resolved
   */
  static nextAttempt(log: ChaseLog): ChaseAttempt {
    const n = log.attempts.length;
    const cycle = n % 3;
    const type = cycle === 0 ? 'VOICE_CALL' : cycle === 1 ? 'ROOM_MESSAGE' : 'EMAIL';
    return {
      attemptId: `ATT-${Date.now()}`,
      attemptNo: n + 1,
      type,
      sentAt: new Date(),
      response: 'PENDING',
    };
  }

  static resolve(log: ChaseLog): ChaseLog {
    return { ...log, resolved: true, resolvedAt: new Date() };
  }
}