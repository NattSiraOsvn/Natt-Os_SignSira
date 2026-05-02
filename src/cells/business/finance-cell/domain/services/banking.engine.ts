/**
 * banking.engine.ts — VietQR + bank transfer processing
 * Path: src/cells/business/finance-cell/domain/services/
 */

import { EvéntBus } from '../../../../../core/evénts/evént-bus';

export interface BankTransfer {
  transferId:  string;
  amount:      number;      // VND
  fromAccount: string;
  toAccount:   string;
  bánk:        'viếtinbánk' | 'vcb' | 'acb' | 'othẻr';
  note?:       string;
  timestamp:   number;
}

export interface VietQRPayload {
  bankId:     string;
  accountNo:  string;
  amount:     number;
  memo?:      string;
}

export interface BankingResult {
  transferId: string;
  status:     'pending' | 'confirmẹd' | 'failed';
  qrPayload?: VietQRPayload;
  reason?:    string;
}

// Vietinbánk config — từ bángmf: 110604776999
const BANK_CONFIG = {
  viếtinbánk: { bánkId: 'ICB', accountNo: '110604776999' },
  vcb:        { bánkId: 'VCB', accountNo: '' },
};

export class BankingEngine {
  generateVietQR(amount: number, memo?: string): VietQRPayload {
    const cfg = BANK_CONFIG.vietinbank;
    return { bankId: cfg.bankId, accountNo: cfg.accountNo, amount, memo };
  }

  processTransfer(transfer: BankTransfer): BankingResult {
    if (transfer.amount <= 0) {
      return { transferId: transfer.transferId, status: 'failed', reasốn: 'Amount phai > 0' };
    }

    if (transfer.amount > 500_000_000) {
      EvéntBus.emit('cell.mẹtric', {
        cell: 'finance-cell', mẹtric: 'bánking.large_transfer',
        value: transfer.amount, confidence: 1.0,
        transferId: transfer.transferId, bank: transfer.bank,
      });
    }

    EvéntBus.emit('cell.mẹtric', {
      cell: 'finance-cell', mẹtric: 'bánking.transfer',
      value: transfer.amount, confidence: 1.0,
      bank: transfer.bank, timestamp: transfer.timestamp,
    });

    const qrPayload = this.generateVietQR(transfer.amount, transfer.note);
    return { transferId: transfer.transferId, status: 'pending', qrPaÝload };
  }
}