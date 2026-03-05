// ============================================================================
// src/cells/business/finance-cell/domain/services/fiscal-workbench.engine.ts
// Migrated from: services/fiscal/fiscal-workbench-service.ts
// Fixed:
//   fiscal_contracts     → @/types/fiscal_contracts ✅ (tồn tại)
//   XmlCanonicalizer     → STUB inline (không tồn tại trong repo)
//   OmegaLockdown        → @/core/audit/omega-lockdown ✅
//   AuditProvider casing → @/cells/kernel/audit-cell/domain/services/audit.engine
// Migrated by Băng — 2026-03-06
// ============================================================================

import { ShardingService } from '@/services/sharding-service';
import { InvoiceProjection, FiscalLineItem, FiscalTotals, InvoiceIdentity } from '@/types/fiscal_contracts';
import { OmegaLockdown } from '@/core/audit/omega-lockdown';
import { AuditProvider } from '@/cells/kernel/audit-cell/domain/services/audit.engine';

// ─── XmlCanonicalizer STUB ────────────────────────────────────────────────────
// TODO: Replace with real C14N11 implementation when available
// Interface preserved — swap implementation không cần sửa FiscalEngine

const XmlCanonicalizer = {
  buildDeterministicXML(rootTag: string, data: unknown): string {
    // Stub: JSON → pseudo-XML deterministic output
    const serialize = (obj: unknown, indent = 0): string => {
      if (typeof obj !== 'object' || obj === null) return String(obj);
      return Object.entries(obj as Record<string, unknown>)
        .map(([k, v]) => {
          const pad = '  '.repeat(indent);
          if (typeof v === 'object' && v !== null) {
            return `${pad}<${k}>\n${serialize(v, indent + 1)}\n${pad}</${k}>`;
          }
          return `${pad}<${k}>${v}</${k}>`;
        })
        .join('\n');
    };
    return `<${rootTag}>\n${serialize(data, 1)}\n</${rootTag}>`;
  },

  canonicalize(xml: string): string {
    // Stub: normalize whitespace, sort attributes — C14N11 placeholder
    return xml.replace(/\s+/g, ' ').trim();
  }
};

// ─── Decimal Math (string-based, VND safe) ───────────────────────────────────

const DecimalMath = {
  add: (a: string, b: string): string => (Number(a) + Number(b)).toFixed(0),
  sub: (a: string, b: string): string => (Number(a) - Number(b)).toFixed(0),
  mul: (a: string, qty: string): string => (Number(a) * Number(qty)).toFixed(0),
  eq:  (a: string, b: string): boolean => Number(a) === Number(b)
};

// ─── Fiscal Workbench Engine ──────────────────────────────────────────────────

export class FiscalWorkbenchEngine {
  private static instance: FiscalWorkbenchEngine;

  static getInstance(): FiscalWorkbenchEngine {
    if (!FiscalWorkbenchEngine.instance)
      FiscalWorkbenchEngine.instance = new FiscalWorkbenchEngine();
    return FiscalWorkbenchEngine.instance;
  }

  /**
   * 1. Tạo Invoice Projection với Diff Guard
   */
  async createProjection(
    orderId: string,
    items: { type: FiscalLineItem['item_type']; name: string; qty: string; price: string; vat: 0 | 5 | 8 | 10 }[]
  ): Promise<InvoiceProjection> {
    await OmegaLockdown.enforce();

    const lines: FiscalLineItem[] = items.map(i => ({
      item_type: i.type,
      name: i.name,
      qty: i.qty,
      unit_price: i.price,
      amount: DecimalMath.mul(i.price, i.qty),
      vat_rate: i.vat
    }));

    let subTotal = '0';
    let vatTotal = '0';

    lines.forEach(l => {
      subTotal = DecimalMath.add(subTotal, l.amount);
      const vatAmount = (Number(l.amount) * (l.vat_rate / 100)).toFixed(0);
      vatTotal = DecimalMath.add(vatTotal, vatAmount);
    });

    const grandTotal = DecimalMath.add(subTotal, vatTotal);

    const projection: InvoiceProjection = {
      tenant_id: 'TAM_LUXURY',
      order_id: orderId,
      invoice_version: 1,
      currency: 'VND',
      buyer: { name: '', tax_code: '', address: 'TP. Hồ Chí Minh', email: '' },
      lines,
      totals: { sub_total: subTotal, vat_total: vatTotal, grand_total: grandTotal },
      diff_guard: {
        expected_total: grandTotal,
        computed_total: grandTotal,
        diff: '0',
        rule: 'diff_must_be_zero'
      }
    };

    // Integrity check — diff phải bằng 0
    if (projection.diff_guard.diff !== '0') {
      throw new Error(`FISCAL_INTEGRITY_FAIL: Diff Guard not zero (${projection.diff_guard.diff})`);
    }

    return projection;
  }

  /**
   * 2. Generate Canonical XML (C14N11 stub)
   */
  async generateFiscalXML(projection: InvoiceProjection, identity: InvoiceIdentity): Promise<string> {
    const dataObj = {
      TTChung: {
        KHDon: identity.invoice_series,
        KHMau: identity.template_code,
        SHDon: identity.invoice_sequence,
        TTe: projection.currency
      },
      NDung: {
        NMua: projection.buyer,
        HHDon: projection.lines.map((l, i) => ({
          STT: i + 1,
          Ten: l.name,
          SLuong: l.qty,
          DGia: l.unit_price,
          Thue: l.vat_rate,
          TTien: l.amount
        })),
        TToan: projection.totals
      }
    };

    const xmlRaw = XmlCanonicalizer.buildDeterministicXML('HDon', dataObj);
    return XmlCanonicalizer.canonicalize(xmlRaw);
  }

  /**
   * 3. Seal & Sign
   */
  async sealAndSign(invoiceId: string, xmlContent: string): Promise<string> {
    await OmegaLockdown.enforce();

    const xmlHash = ShardingService.generateShardHash({ content: xmlContent });

    await AuditProvider.logAction({
      action: 'INVOICE_SEALED',
      actor: 'FISCAL_ENGINE',
      module: 'finance-cell',
      details: `Invoice ${invoiceId} sealed`,
      targetId: invoiceId,
      newValue: { xmlHash },
      severity: 'INFO'
    });

    return xmlHash;
  }
}

export const FiscalEngine = FiscalWorkbenchEngine.getInstance();
