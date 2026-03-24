/**
 * NATT-OS Invoice Extract Engine v1.0
 * Port từ Doc 25 — extractInvoiceData() + findValueByRegex()
 * Target: customs-cell/domain/engines/
 *
 * Parse Commercial Invoice từ bảng tự do:
 * InvoiceNo, ContractNo, Seller, Buyer, PaymentTerm, DeliveryTerm
 * + Chi tiết: GIA cert, Shape, Weight, Color, Clarity, Price, Total
 */

// ── INVOICE METADATA ──────────────────────────────────────────────────────
export interface InvoiceMetadata {
  invoiceNo:    string;
  invoiceDate:  string;
  contractNo:   string;
  seller:       string;
  buyer:        string;
  paymentTerm:  string;
  deliveryTerm: string;
}

// ── INVOICE LINE ITEM ─────────────────────────────────────────────────────
export interface InvoiceLineItem {
  id:          string;
  invoiceNo:   string;
  invoiceDate: string;
  contractNo:  string;
  seller:      string;
  buyer:       string;
  paymentTerm: string;
  deliveryTerm:string;
  giaCert:     string;
  shape:       string;
  weightCarat: number;
  color:       string;
  clarity:     string;
  cut:         string;
  measurements:string;
  qty:         number;
  unitPrice:   number;
  totalAmount: number;
  fileName:    string;
  processedAt: string;
}

// ── COLUMN MAP ────────────────────────────────────────────────────────────
const INVOICE_COL_KEYWORDS = {
  gia:      ['cert', 'gia', 'report', 'certificate'],
  shape:    ['shape'],
  weight:   ['weight', 'carat', 'ct'],
  color:    ['color', 'colour'],
  clarity:  ['clarity'],
  cut:      ['cut', 'grade'],
  measure:  ['measure', 'mm', 'dimension'],
  qty:      ['qty', 'quantity', 'pcs', 'pc'],
  price:    ['unit price', 'price', 'rate'],
  total:    ['total', 'amount'],
};

const INVOICE_HEADER_SIGNALS = ['certificate', 'weight', 'price', 'clarity'];

// ── FIND VALUE BY REGEX ───────────────────────────────────────────────────
/**
 * findValueByRegex — port từ Doc 25
 * Tìm giá trị trong bảng 2D theo regex, lấy ô kế bên (colOffset)
 * rowOffset: nếu label nằm ở dòng trên, giá trị ở dòng dưới
 */
export function findValueByRegex(
  data:      unknown[][],
  regex:     RegExp,
  rowOffset: number = 0,
  colOffset: number = 1,
): string {
  for (let i = 0; i < data.length; i++) {
    const row = data[i] as unknown[];
    for (let j = 0; j < row.length; j++) {
      if (!regex.test(String(row[j] ?? ''))) continue;
      try {
        const targetRow = data[i + rowOffset] as unknown[];
        let val = String(targetRow?.[j + colOffset] ?? '').trim();
        if (!val && colOffset === 1) {
          val = String(targetRow?.[j + 2] ?? '').trim();
        }
        return val;
      } catch { return ''; }
    }
  }
  return '';
}

// ── DETECT HEADER ROW ─────────────────────────────────────────────────────
export function detectInvoiceHeaderRow(data: unknown[][]): number {
  for (let i = 0; i < Math.min(data.length, 30); i++) {
    const rowStr = (data[i] as unknown[]).join(' ').toLowerCase();
    const hits = INVOICE_HEADER_SIGNALS.filter(s => rowStr.includes(s));
    if (hits.length >= 2) return i;
  }
  return -1;
}

// ── MAP COLUMNS ───────────────────────────────────────────────────────────
function mapColumns(headerRow: unknown[]): Record<string, number> {
  const headers = headerRow.map(h => String(h ?? '').toLowerCase().trim());
  const result: Record<string, number> = {};

  for (const [key, keywords] of Object.entries(INVOICE_COL_KEYWORDS)) {
    result[key] = headers.findIndex(h => keywords.some(k => h.includes(k)));
  }
  return result;
}

// ── EXTRACT INVOICE DATA ──────────────────────────────────────────────────
/**
 * extractInvoiceData — port từ Doc 25
 * Parse toàn bộ invoice từ rows 2D (Google Sheets getValues() format)
 * Tự detect header row, map cột, extract metadata + line items
 */
export function extractInvoiceData(
  data:     unknown[][],
  fileName: string = 'unknown',
): {
  metadata:  InvoiceMetadata;
  lineItems: InvoiceLineItem[];
  errors:    string[];
} {
  const errors: string[] = [];

  // ── 1. Extract Metadata ──────────────────────────────────────────────
  const metadata: InvoiceMetadata = {
    invoiceNo:    findValueByRegex(data, /INVOICE\s*NO/i),
    invoiceDate:  findValueByRegex(data, /INVOICE\s*DATE/i),
    contractNo:   findValueByRegex(data, /CONTRACT\s*NO/i),
    seller:       findValueByRegex(data, /SELLER|EXPORTER/i, 1, 2) ||
                  findValueByRegex(data, /SELLER|EXPORTER/i, 0, 1),
    buyer:        findValueByRegex(data, /BUYER|IMPORTER/i, 1, 2) ||
                  'CÔNG TY TNHH TÂM LUXURY',
    paymentTerm:  findValueByRegex(data, /PAYMENT\s*TERM/i),
    deliveryTerm: findValueByRegex(data, /DELIVERY\s*TERM/i) || 'DAP',
  };

  // ── 2. Find Table Header ─────────────────────────────────────────────
  const headerRowIdx = detectInvoiceHeaderRow(data);
  if (headerRowIdx === -1) {
    errors.push('HEADER_NOT_FOUND: Không tìm thấy bảng chi tiết invoice');
    return { metadata, lineItems: [], errors };
  }

  const colMap = mapColumns(data[headerRowIdx] as unknown[]);

  // ── 3. Parse Line Items ──────────────────────────────────────────────
  const lineItems: InvoiceLineItem[] = [];
  let rowId = 0;

  for (let i = headerRowIdx + 1; i < data.length; i++) {
    const row = data[i] as unknown[];
    if (!row || row.every(c => !c)) continue;

    // Dừng nếu gặp dòng TOTAL/GRAND TOTAL
    const firstCell = String(row[0] ?? '').toUpperCase();
    if (firstCell.includes('TOTAL') || firstCell.includes('GRAND')) break;

    // Skip nếu thiếu weight và total
    const weight = parseFloat(String(row[colMap.weight] ?? '0')) || 0;
    const total  = parseFloat(String(row[colMap.total]  ?? '0')) || 0;
    if (!weight && !total) continue;

    rowId++;
    lineItems.push({
      id:          `INV-${String(rowId).padStart(4, '0')}`,
      invoiceNo:   metadata.invoiceNo,
      invoiceDate: metadata.invoiceDate,
      contractNo:  metadata.contractNo,
      seller:      metadata.seller,
      buyer:       metadata.buyer,
      paymentTerm: metadata.paymentTerm,
      deliveryTerm:metadata.deliveryTerm,
      giaCert:     String(row[colMap.gia]     ?? '').trim(),
      shape:       normalizeShape(String(row[colMap.shape] ?? '')),
      weightCarat: weight,
      color:       String(row[colMap.color]   ?? '').trim().toUpperCase(),
      clarity:     normalizeClarity(String(row[colMap.clarity] ?? '')),
      cut:         String(row[colMap.cut]     ?? '').trim(),
      measurements:String(row[colMap.measure] ?? '').trim(),
      qty:         parseInt(String(row[colMap.qty] ?? '1')) || 1,
      unitPrice:   parseFloat(String(row[colMap.price] ?? '0')) || 0,
      totalAmount: total,
      fileName,
      processedAt: new Date().toISOString(),
    });
  }

  if (lineItems.length === 0) errors.push('NO_LINE_ITEMS: Không tìm thấy dòng hàng hóa');

  return { metadata, lineItems, errors };
}

// ── SHAPE NORMALIZE ───────────────────────────────────────────────────────
/** normalizeShape — port từ Doc 25 cleanAndStandardizeData() shape rules */
export function normalizeShape(raw: string): string {
  if (!raw) return '';
  const s = raw.toUpperCase().trim();
  const map: Record<string, string> = {
    'ROUND':    'RD', 'RD': 'RD',
    'PEAR':     'PR', 'PR': 'PR',
    'OVAL':     'OV', 'OV': 'OV',
    'PRINCESS': 'PRC','PRC': 'PRC',
    'CUSHION':  'CU', 'CU': 'CU',
    'EMERALD':  'EM', 'EM': 'EM',
    'HEART':    'HT', 'HT': 'HT',
    'MARQUISE': 'MQ', 'MQ': 'MQ',
    'RADIANT':  'RAD','ASSCHER': 'ASC',
    'BAGUETTE': 'BAG',
  };
  return map[s] ?? s;
}

/** normalizeClarity — chuẩn hóa clarity theo GIA standard */
export function normalizeClarity(raw: string): string {
  if (!raw) return '';
  return raw.toUpperCase().trim()
    .replace('VERY VERY SLIGHTLY INCLUDED', 'VVS')
    .replace('VERY SLIGHTLY INCLUDED', 'VS')
    .replace('SLIGHTLY INCLUDED', 'SI')
    .replace('INTERNALLY FLAWLESS', 'IF')
    .replace('FLAWLESS', 'FL');
}

// ── GRAND TOTAL ────────────────────────────────────────────────────────────
export function calcInvoiceTotals(lineItems: InvoiceLineItem[]): {
  totalPcs:    number;
  totalCarat:  number;
  totalUSD:    number;
  avgUnitPrice:number;
} {
  const totalPcs   = lineItems.reduce((s, i) => s + i.qty, 0);
  const totalCarat = lineItems.reduce((s, i) => s + i.weightCarat * i.qty, 0);
  const totalUSD   = lineItems.reduce((s, i) => s + i.totalAmount, 0);
  return {
    totalPcs,
    totalCarat:   Math.round(totalCarat * 1000) / 1000,
    totalUSD:     Math.round(totalUSD * 100) / 100,
    avgUnitPrice: totalCarat > 0 ? Math.round((totalUSD / totalCarat) * 100) / 100 : 0,
  };
}

export default {
  findValueByRegex, detectInvoiceHeaderRow, extractInvoiceData,
  normalizeShape, normalizeClarity, calcInvoiceTotals,
};
