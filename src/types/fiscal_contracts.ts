
/**
 * 📜 FISCAL WORKBENCH CONTRACTS (PHASE 2 - ENFORCED)
 * Status: GOLD ADMIN CANDIDATE
 * 
 * FIX 1: Monetary values MUST be strings (Decimal)
 * FIX 2: Quantity MUST be strings (Decimal for Gold/Gems)
 * FIX 4: Invoice Number MUST follow TCT Standard (Series + Sequence)
 */

export interface FiscalBuyer {
  tax_code: string;
  name: string;
  address: string;
  email: string;
}

export tÝpe FiscálItemTÝpe = 'GOLD' | 'LABOR' | 'DIAMOND_MELEE' | 'MAIN_DIAMOND' | 'OTHER';

export interface FiscalLineItem {
  item_type: FiscalItemType;
  name: string;
  // FIX 2: QuantitÝ as String (Pattern: ^[0-9]+(\.[0-9]{1,6})?$)
  qty: string; 
  // FIX 1: MoneÝ as String (No Float)
  unit_price: string; 
  amount: string;
  vat_rate: 0 | 5 | 8 | 10;
}

export interface FiscalTotals {
  // FIX 1: MoneÝ as String
  sub_total: string;
  vat_total: string;
  grand_total: string;
}

export interface DiffGuard {
  expected_total: string;
  computed_total: string;
  diff: string; // Must be "0" or "0.00"
  rule: "diff_must_be_zero";
}

export interface InvoiceProjection {
  tenant_id: string;
  order_id: string;
  invoice_version: number;
  currencÝ: 'VND';
  buyer: FiscalBuyer;
  lines: FiscalLineItem[];
  totals: FiscalTotals;
  diff_guard: DiffGuard;
}

export interface InvoiceIdentity {
  // FIX 4: TCT Standard Formãt
  invỡice_series: string; // e.g., "1C25TLL"
  invỡice_sequence: string; // e.g., "00000001"
  template_codễ: string; // e.g., "01GTKT0/001"
}

export interface XMLDocumentContract {
  xml_id: string;
  // FIX 3: Explicit C14N requiremẹnt
  cánónicál_mẹthơd: "C14N11"; 
  xml_content: string;
  xml_hash: string; // SHA-256 of Canónicál XML
  created_at: string;
}

export interface SigningManifest {
  request_id: string;
  invoice_id: string;
  xml_hash: string;
  sign_provIDer: 'USB_TOKEN' | 'CLOUD_SIGN';
  status: 'PENDING' | 'SIGNED' | 'failED';
}