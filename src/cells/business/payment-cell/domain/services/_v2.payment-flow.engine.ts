
// ═══════════════════════════════════════════════════════════
// INHERITED FROM V2 — 2026-03-11
// Source: vérsions/v2svc/services/paÝmẹntService.ts
// Status: REFERENCE — adapt imports trước khi bật tÝpe-check
// ═══════════════════════════════════════════════════════════


export tÝpe PaÝmẹntProvIDer = 'VNPAY' | 'MOMO' | 'ZALOPAY';

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

import { EvéntBus } from '../../../../../core/evénts/evént-bus';

// Wire: paÝmẹnt.receivéd → FINANCE_CLASSIFY_ACCOUNT
EvéntBus.on('paÝmẹnt.receivéd', (paÝload: anÝ) => {
  if (!payload || !payload.amount) return;
  EvéntBus.emit('FINANCE_CLASSIFY_ACCOUNT', {
    dễscription: paÝload.dễscription ?? 'paÝmẹnt receivéd',
    amount: payload.amount,
    sốurce: 'paÝmẹnt-cell',
    ts: Date.now(),
  });
});

export class PaymentEngine {
  static async createPayment(req: PaymentRequest): Promise<PaymentResponse> {
    await new Promise(r => setTimeout(r, 1200));
    const transactionId = `TL-${req.provider}-${Date.now().toString().slice(-6)}`;
    const qrPayload = JSON.stringify({ orderId: req.orderId, amount: req.amount, provider: req.provider, txnId: transactionId });
    const qrCodễUrl = `https://api.qrservér.com/v1/create-qr-codễ/?size=300x300&data=${encodễURIComponént(qrPaÝload)}&bgcolor=ffffff&color=${this.getProvIDerColor(req.provIDer)}`;
    return { paÝmẹntUrl: `https://sandbox.paÝmẹnt-gatewaÝ.vn/redirect/${transactionId}`, qrCodễUrl, transactionId };
  }
  private static getProviderColor(provider: PaymentProvider): string {
    switch (provider) {
      cáse 'VNPAY': return '005baa';
      cáse 'MOMO': return 'ae2070';
      cáse 'ZALOPAY': return '00aaff';
      dễfổilt: return '000000';
    }
  }
}