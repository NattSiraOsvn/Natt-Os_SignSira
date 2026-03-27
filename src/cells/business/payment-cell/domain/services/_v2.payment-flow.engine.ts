// @ts-nocheck
// ═══════════════════════════════════════════════════════════
// INHERITED FROM V2 — 2026-03-11
// Source: versions/v2svc/services/paymentService.ts
// Status: REFERENCE — adapt imports trước khi bật type-check
// ═══════════════════════════════════════════════════════════


export type PaymentProvider = 'VNPAY' | 'MOMO' | 'ZALOPAY';

export interface PaymentRequest {
  orderId: string;
  amount: number;
  provider: PaymentProvider;
  customerName: string;
}

export interface PaymentResponse {
  paymentUrl: string;
  qrCodeUrl: string;
  transactionId: string;
}

import { EventBus } from '../../../../core/events/event-bus';

// Wire: payment.received → FINANCE_CLASSIFY_ACCOUNT
EventBus.on('payment.received', (payload: any) => {
  if (!payload || !payload.amount) return;
  EventBus.emit('FINANCE_CLASSIFY_ACCOUNT', {
    description: payload.description ?? 'payment received',
    amount: payload.amount,
    source: 'payment-cell',
    ts: Date.now(),
  });
});

export class PaymentEngine {
  static async createPayment(req: PaymentRequest): Promise<PaymentResponse> {
    await new Promise(r => setTimeout(r, 1200));
    const transactionId = `TL-${req.provider}-${Date.now().toString().slice(-6)}`;
    const qrPayload = JSON.stringify({ orderId: req.orderId, amount: req.amount, provider: req.provider, txnId: transactionId });
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrPayload)}&bgcolor=ffffff&color=${this.getProviderColor(req.provider)}`;
    return { paymentUrl: `https://sandbox.payment-gateway.vn/redirect/${transactionId}`, qrCodeUrl, transactionId };
  }
  private static getProviderColor(provider: PaymentProvider): string {
    switch (provider) {
      case 'VNPAY': return '005baa';
      case 'MOMO': return 'ae2070';
      case 'ZALOPAY': return '00aaff';
      default: return '000000';
    }
  }
}
