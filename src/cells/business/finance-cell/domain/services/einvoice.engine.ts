// ============================================================================
// src/cells/business/finance-cell/domain/services/einvoice.engine.ts
// Migrated from: services/e-invoice-service.ts
// Fixed: ghost import blockchainservice → sharding-service
//        import path '@/types.ts' → '@/types'
// Migrated by Băng — 2026-03-06
// ============================================================================

import { EInvoice, EInvoiceStatus } from '@/types';
import { ShardingService } from '@/services/sharding-service';

export class EInvoiceEngine {
  private static instance: EInvoiceEngine;
  private invoices: EInvoice[] = [];

  static getInstance(): EInvoiceEngine {
    if (!EInvoiceEngine.instance) EInvoiceEngine.instance = new EInvoiceEngine();
    return EInvoiceEngine.instance;
  }

  /**
   * Bước 1: Khởi tạo XML theo chuẩn Tổng cục Thuế v2.0
   */
  generateXML(invoice: EInvoice): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<HDon>
    <DLHDon id="ID${invoice.id}">
        <TTChung>
            <MSHDon>01GTKT0/001</MSHDon>
            <KHDon>1C26TLL</KHDon>
            <SHDon>${invoice.id.split('-').pop()}</SHDon>
            <NLap>${new Date(invoice.createdAt).toISOString().split('T')[0]}</NLap>
            <TTe>VND</TTe>
        </TTChung>
        <NMua>
            <Ten>${invoice.customerName}</Ten>
            <MST>${invoice.customerTaxId || ''}</MST>
            <DChi>TP. Hồ Chí Minh</DChi>
        </NMua>
        <DSHDon>
            ${invoice.items.map((item, idx) => `
            <HHDVu>
                <STT>${idx + 1}</STT>
                <Ten>${item.name}</Ten>
                <DVTinh>Chiếc</DVTinh>
                <SLuong>1</SLuong>
                <DGia>${item.totalBeforeTax}</DGia>
                <Thue>${item.taxRate}</Thue>
                <Tien>${item.totalBeforeTax}</Tien>
            </HHDVu>`).join('')}
        </DSHDon>
        <TToan>
            <TGia>${invoice.totalAmount}</TGia>
            <TThue>${invoice.taxAmount}</TThue>
            <Tong>${invoice.totalAmount + invoice.taxAmount}</Tong>
        </TToan>
    </DLHDon>
</HDon>`;
  }

  /**
   * Bước 2: Ký số điện tử (SHA-256)
   */
  async signInvoice(invoiceId: string): Promise<string> {
    await new Promise(r => setTimeout(r, 1200));
    return ShardingService.generateShardHash({
      invoiceId,
      signer: 'TAM_LUXURY_MASTER_TOKEN',
      timestamp: Date.now()
    });
  }

  /**
   * Bước 3: Giao tiếp Direct API với TCT
   */
  async transmitToTaxAuthority(invoice: EInvoice): Promise<{ success: boolean; taxCode?: string }> {
    await new Promise(r => setTimeout(r, 2000));
    return {
      success: true,
      taxCode: `CQT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    };
  }

  /**
   * Full flow: generate → sign → transmit
   */
  async processInvoice(invoice: EInvoice): Promise<{
    xml: string;
    signature: string;
    taxCode: string;
    status: EInvoiceStatus;
  }> {
    const xml = this.generateXML(invoice);
    const signature = await this.signInvoice(invoice.id);
    const result = await this.transmitToTaxAuthority(invoice);
    this.invoices.push({ ...invoice, status: result.success ? EInvoiceStatus.ISSUED : EInvoiceStatus.DRAFT });

    return {
      xml,
      signature,
      taxCode: result.taxCode || '',
      status: result.success ? EInvoiceStatus.ISSUED : EInvoiceStatus.DRAFT
    };
  }

  getInvoices(): EInvoice[] { return this.invoices; }
}

export const EInvoiceService = EInvoiceEngine.getInstance();
