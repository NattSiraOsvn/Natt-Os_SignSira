/**
 * NATT-OS Sync Engine v1.0
 * Port từ JustU v9.0 — toàn bộ pipeline đồng bộ 19TB
 *
 * Core: extractAndMap() → _DATA_MAP → buildReports()
 * Safety: ChunkWriter + timeout resume + progress save
 * Target: sync-cell
 */

// ── CONSTANTS ─────────────────────────────────────────────────────────────
export const SYNC_CONFIG = {
  CHUNK_SIZE:      200,           // rows/write — tránh quota limit
  MAP_BATCH:       500,           // rows/read từ _DATA_MAP — tránh OOM
  MAX_RUNTIME_MS:  5 * 60 * 1000,// 5 phút — GAS limit
  RESUME_DELAY_MS: 60 * 1000,    // 1 phút trước khi resume
  SA_EMAIL: 'nattos-drive-sync-sa@sys-84301997471976129074482048.iam.gserviceaccount.com',
};

// ── 19 SOURCE FILE IDs (Tâm Luxury Google Sheets) ─────────────────────────
export const SOURCE_FILE_IDS = [
  '1hgjfgDLy55T-yS-iGImFdm8iUN5SQPA0z00Vaj8JLzc',
  '1GRZ-u_fxbzua--IHpepeVql-6iBc8MOojuFn2yAbCDQ',
  '1hgzVjtCE50HJnm3y49v0IMUIz3tvaqUnnIXlA9LQIv8',
  '1S0GvwQbaDuaDL1k0OAAo68jOAqu2SOES48BB_Vt2_M0',
  '1Yth_pfX-0_w6FNz4rPbmJm81IDCW3-d4C7E5QhfvAG8',
  '1YlbwhCwpKIBpFeF2iT-EBPyGESao0Vad3ABSL67lAmg',
  '1Eg0ASCDvKZZ1nqa6r5HhqWGb00-OFz0dy7d1cJqSYOk',
  '1j9qDMrkcfiRVBHJAQWstOq8lA8OWK5mhB3ClNaO9d-g', // ← Luồng SX Master
  '1VInd8649Mp12sVg3ye8YAyxxOJacedefeNy9p0vX3_8',
  '1abzPzXy31s62QAK4EisU-n2JfxV7RBMcdft5H_pCcbQ',
  '1lQeLKaSJ0b_HHmJp9XIIlDWlfCs6vbu1VAO9RWWcCnU',
  '1d55ted6MfpUB5BmUgPst9CHHAU_ygUSERW9LEuQIKDY',
  '1LHIvlYzPF_LcQigVXqN-hyW2bJ6VjDO-0kF8ygMIF4E',
  '1o9rsEPUhwUmCB1nkwoOy0Kxeq2hVXJU9v5xHRQmzRlg',
  '1Wk0hI8CHbsA2VWKN4ZyqWdH9DTUVMi8KMWA4_CpW_bY',
  '1ju4kunETVvzgK36WREdWrHb26ej5kxJGLL3tUJQHHBw',
  '1ocb3-BS6dyYoiaOR1e8-SfF6A8G3oyqmupuxvq2QPgA',
  '1Ufq-HDa9kv_p1ZFF3b5Cft-TP0PjkmRsrX0IjZ1Ee_8',
  '1lZV0uro17WIJGrbLTRLdvDXo1tJ_V6h42d_7-62Eocc',
];

// ── SHEETS BỎ QUA (không đồng bộ) ────────────────────────────────────────
export const IGNORE_SHEETS = new Set([
  'Dashboard', 'Config', 'System', 'SYSTEM_LOG', '_SYNC_METADATA',
  '_DELETE_LIST', '_MERGE_CONFIG', '_DATA_MAP', 'MERGE_SUMMARY_REPORT',
  'MASTER_MERGED_DATA', 'SO_CAI_SAN_XUAT', 'VAN_DON_XUAT_XUONG',
  'ORDER_FLOW', 'Connection_Test', 'STREAM_A', 'STREAM_B',
  'Backup_DThu_MAP',
]);

// ── SHEET SCHEMAS ─────────────────────────────────────────────────────────
export const SCHEMAS = {
  MAP:     ['Key', 'File', 'Sheet', 'JSON Data', 'Time'],
  PROD:    ['NGÀY','MÃ ĐƠN','STREAM','MÃ HÀNG','TUỔI','MÀU','TL VÀO (g)','TL RA (g)','HAO HỤT (g)','TRẠNG THÁI','THỢ / PIC','NGUỒN'],
  SHIP:    ['NGÀY XUẤT','SỐ VẬN ĐƠN','STREAM','MÃ HÀNG','TÊN HÀNG','SỐ LƯỢNG','ĐƠN VỊ','KHÁCH HÀNG','NƠI NHẬN','TRẠNG THÁI','NGUỒN'],
  STREAM:  ['Mã Đơn','Stream','Loại','Ngày','Khách','Mã Hàng','Tên Hàng','Trạng Thái','TL','Màu','Tuổi','Thợ','Ghi Chú','Nguồn','All IDs'],
  FLOW:    ['Mã Đơn','Stream','Loại Luồng','Bước #','Stage','Thời Gian','Khách','SP','Trạng Thái','TL','Thợ','Ghi Chú','Nguồn','All IDs'],
  AUDIT:   ['THỜI GIAN','TỔNG GD','TỔNG THU','TỔNG COGS','VAT TRONG COGS','BUYBACK GD','NEED REVIEW','TỒN KHO VÀNG','TRẠNG THÁI'],
};

// ── CHUNK WRITER ──────────────────────────────────────────────────────────
/**
 * Ghi theo lô nhỏ CHUNK_SIZE rows/lần
 * Tránh: Apps Script quota, memory overflow, timeout khi ghi lớn
 *
 * Usage:
 *   const cw = new ChunkWriter(targetRows, numCols)
 *   cw.push([...rowData])
 *   cw.flush() // bắt buộc gọi cuối
 */
export class ChunkWriter {
  private buf: unknown[][] = [];
  public total = 0;
  public numCols: number;

  constructor(
    private appendFn: (rows: unknown[][]) => void,
    numCols: number,
  ) {
    this.numCols = numCols;
  }

  push(row: unknown[]): void {
    // Pad/trim về đúng numCols
    while (row.length < this.numCols) row.push('');
    const normalized = row.slice(0, this.numCols).map(v => {
      if (v instanceof Date) return v.toISOString();
      if (v == null) return '';
      return v;
    });
    this.buf.push(normalized);
    if (this.buf.length >= SYNC_CONFIG.CHUNK_SIZE) this._flush();
  }

  private _flush(): void {
    if (!this.buf.length) return;
    this.appendFn([...this.buf]);
    this.total += this.buf.length;
    this.buf = [];
  }

  flush(): void { this._flush(); }
}

// ── PROGRESS MANAGER ──────────────────────────────────────────────────────
/**
 * Lưu/đọc progress để resume khi timeout
 * Dùng: localStorage (browser) hoặc PropertiesService (GAS)
 */
export interface SyncProgress {
  fileIndex:  number;
  sheetIndex: number;
  startedAt:  string;
  phase:      'EXTRACT' | 'BUILD' | 'DONE';
}

export class ProgressManager {
  private key = 'NATT_SYNC_PROGRESS';

  save(progress: SyncProgress): void {
    try {
      localStorage.setItem(this.key, JSON.stringify(progress));
    } catch {}
  }

  load(): SyncProgress | null {
    try {
      const raw = localStorage.getItem(this.key);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  clear(): void {
    try { localStorage.removeItem(this.key); } catch {}
  }

  isExpired(maxAgeMs = 24 * 60 * 60 * 1000): boolean {
    const p = this.load();
    if (!p) return true;
    return Date.now() - new Date(p.startedAt).getTime() > maxAgeMs;
  }
}

// ── BACKUP NAMING CONVENTION ──────────────────────────────────────────────
/**
 * Port từ JustU processBackup()
 * naming: [fileName_10chars]__SheetName_20chars
 * VD: "[Luồng SX ]__Cân Hàng Ngày " → tab trong master sheet
 */
export function buildBackupTabName(fileName: string, sheetName: string): string {
  return `[${fileName.substring(0, 10)}]__${sheetName.substring(0, 20)}`;
}

// ── EXTRACT AND MAP ───────────────────────────────────────────────────────
/**
 * Core pipeline: sheet rows → header detect → records → JSON → _DATA_MAP
 * Port từ JustU extractAndMap()
 *
 * Output format cho _DATA_MAP:
 *   Key:       fileId_sheetName
 *   File:      tên file nguồn
 *   Sheet:     tên sheet
 *   JSON Data: JSON.stringify(record) — mỗi record có _stream, _orderId
 *   Time:      timestamp sync
 */
export function extractRecords(
  rows: unknown[][],
  fileId: string,
  fileName: string,
  sheetName: string,
  headerRowIndex: number,
  headers: string[],
): Array<Record<string, unknown>> {
  const key = `${fileId}_${sheetName}`;
  const records: Array<Record<string, unknown>> = [];

  for (let i = headerRowIndex + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.every(c => c === null || c === undefined || c === '')) continue;

    const record: Record<string, unknown> = {
      _key:         key,
      _sourceFile:  fileName,
      _sourceSheet: sheetName,
      _syncTime:    new Date().toISOString(),
    };

    let hasValue = false;
    headers.forEach((h, j) => {
      if (h && row[j] !== null && row[j] !== undefined && row[j] !== '') {
        record[h] = row[j];
        hasValue = true;
      }
    });
    if (!hasValue) continue;

    // Extract order IDs từ tất cả values
    const allIdStrings: string[] = [];
    let primaryStream = 'UNKNOWN';
    let primaryId: string | null = null;

    Object.values(record).forEach(val => {
      const str = String(val || '');
      const matches = str.match(/\b(CT|KD|KB)\d{2}-\d{4,6}\b|\bVC\d{4,6}\b|\b28\d{3}\b/gi);
      if (matches) {
        matches.forEach(m => {
          const id = m.toUpperCase();
          if (!allIdStrings.includes(id)) allIdStrings.push(id);
        });
      }
    });

    if (allIdStrings.length > 0) {
      primaryId = allIdStrings[0];
      primaryStream = primaryId.startsWith('CT') ? 'SX_CHINH'
        : primaryId.startsWith('KD') ? 'SX_PHU'
        : primaryId.startsWith('KB') ? 'BAO_HANH'
        : primaryId.startsWith('VC') ? 'SHOWROOM'
        : 'SC_BH_KB';
    } else {
      // Fallback theo tên sheet
      const low = sheetName.toLowerCase();
      if (/sx|sản xuất|đúc/.test(low))   primaryStream = 'SX_CHINH';
      else if (/kd|bán hàng/.test(low))  primaryStream = 'SX_PHU';
      else if (/bảo hành/.test(low))     primaryStream = 'BAO_HANH';
      else if (/showroom|sr/.test(low))  primaryStream = 'SHOWROOM';
    }

    record['_stream']   = primaryStream;
    record['_orderId']  = primaryId;
    record['_allIds']   = allIdStrings.join(',');

    records.push(record);
  }

  return records;
}

// ── ITERATE MAP ───────────────────────────────────────────────────────────
/**
 * Đọc _DATA_MAP theo batch MAP_BATCH rows — tránh OOM với 19TB
 * Port từ JustU _iterateMap()
 *
 * Usage:
 *   for (const batch of iterateMapBatches(allRows)) {
 *     batch.forEach(record => process(record))
 *   }
 */
export function* iterateMapBatches(
  mapRows: unknown[][],
  batchSize = SYNC_CONFIG.MAP_BATCH,
): Generator<Array<Record<string, unknown>>> {
  const dataRows = mapRows.slice(1); // skip header
  for (let i = 0; i < dataRows.length; i += batchSize) {
    const batch: Array<Record<string, unknown>> = [];
    const slice = dataRows.slice(i, i + batchSize);
    for (const row of slice) {
      try {
        const jsonStr = (row as unknown[])[3] as string;
        if (!jsonStr) continue;
        batch.push(JSON.parse(jsonStr));
      } catch {}
    }
    yield batch;
  }
}

// ── BUILD PRODUCTION LEDGER ───────────────────────────────────────────────
/**
 * Keywords nhận dạng sheet SX (port từ JustU + MEGA)
 * Dùng để lọc records phù hợp từ _DATA_MAP
 */
export const PROD_SHEET_KW = [
  'đúc','phôi','láp','info','3d','trọng lượng','vàng','đá','sáp',
  'nguyên liệu','nguội','hột','nhám bóng','xi','qc','cân bột',
  'cân nguyên liệu','giao nhận thợ','sổ giao thợ',
];

export const SHIP_SHEET_KW = [
  'xuất xưởng','vận đơn','xuất kho','giao hàng','thành phẩm',
  'shipping','delivery','order','bán hàng','đơn hàng ngày',
];

export function isProdRecord(record: Record<string, unknown>): boolean {
  const low = String(record['_sourceSheet'] || '').toLowerCase();
  return PROD_SHEET_KW.some(kw => low.includes(kw));
}

export function isShipRecord(record: Record<string, unknown>): boolean {
  const low = String(record['_sourceSheet'] || '').toLowerCase();
  return SHIP_SHEET_KW.some(kw => low.includes(kw));
}

export function buildProdRow(record: Record<string, unknown>): unknown[] {
  return [
    record['ngày'] || record['ngày yêu cầu đúc'] || record['ngày lên mã'] || record['_syncTime'] || '',
    record['_orderId'] || record['mã đơn'] || record['số phiếu'] || record['láp'] || '---',
    record['_stream'] || '---',
    record['mã hàng'] || record['mã sp'] || record['mã chính thức'] || '---',
    record['tuổi vàng'] || record['tuổi'] || '---',
    record['màu'] || record['màu sp'] || '---',
    record['trọng lượng vàng yêu cầu'] || record['trọng lượng đầu vào'] || 0,
    record['trọng lượng phôi'] || record['trọng lượng thực tế'] || 0,
    0, // hao hụt — tính sau
    record['trạng thái đúc'] || record['trạng thái phôi'] || record['trạng thái'] || '---',
    record['tên thợ'] || record['người nhận'] || record['họ và tên'] || '---',
    `${record['_sourceFile']} › ${record['_sourceSheet']}`,
  ];
}

export function buildShipRow(record: Record<string, unknown>): unknown[] {
  return [
    record['ngày'] || record['ngày xuất'] || record['ngày giao'] || '',
    record['_orderId'] || record['số vận đơn'] || record['mã đơn'] || '---',
    record['_stream'] || '---',
    record['mã hàng'] || record['mã sp'] || '---',
    record['tên hàng'] || record['sản phẩm'] || '---',
    record['số lượng'] || 0,
    record['đơn vị'] || 'cái',
    record['khách hàng'] || record['tên khách'] || '---',
    record['nơi nhận'] || record['địa chỉ'] || '---',
    record['trạng thái'] || 'Đã xuất',
    `${record['_sourceFile']} › ${record['_sourceSheet']}`,
  ];
}

// ── AUDIT LOG BUILDER ─────────────────────────────────────────────────────
/**
 * Schema audit log 9 cột — port từ MEGA v10.1 _createAuditLog()
 * Dùng trong audit-cell để track mỗi lần sync/process
 */
export interface AuditLogEntry {
  timestamp:    Date;
  totalTx:      number;
  totalThu:     number;
  totalCOGS:    number;
  vatInCOGS:    number;
  buybackCount: number;
  needReview:   number;
  goldStock:    string;  // "SL: X chỉ - GT: Yđ"
  status:       '✅ OK' | '⚠️ CẦN REVIEW' | '❌ LỖI';
}

export function buildAuditRow(entry: AuditLogEntry): unknown[] {
  return [
    entry.timestamp,
    entry.totalTx,
    entry.totalThu,
    entry.totalCOGS,
    entry.vatInCOGS,
    entry.buybackCount,
    entry.needReview,
    entry.goldStock,
    entry.status,
  ];
}

export function calcAuditStatus(needReview: number, totalTx: number): AuditLogEntry['status'] {
  if (needReview > totalTx * 0.1) return '⚠️ CẦN REVIEW';
  return '✅ OK';
}

// ── TEXT PARSERS (port từ MEGA) ───────────────────────────────────────────
/**
 * Trích xuất số lượng từ text mô tả ngân hàng
 * VD: "mua 10 chỉ vàng" → 37.5 (gram)
 *     "5 viên kim cương" → 5
 */
export function extractQuantity(text: string): number {
  if (!text) return 1;
  const patterns = [
    { re: /(\d+\.?\d*)\s*(chỉ|chi)/i,    convert: (n: number) => n * 3.75 }, // chỉ → gram
    { re: /(\d+\.?\d*)\s*(cây|cai)/i,    convert: (n: number) => n },
    { re: /(\d+\.?\d*)\s*(viên|vien)/i,  convert: (n: number) => n },
    { re: /SL:\s*(\d+)/i,                convert: (n: number) => n },
    { re: /(\d+\.?\d*)\s*(gram|g|gam)/i, convert: (n: number) => n },
    { re: /x\s*(\d+)/i,                  convert: (n: number) => n }, // "x 5"
  ];
  for (const { re, convert } of patterns) {
    const m = text.match(re);
    if (m?.[1]) return convert(parseFloat(m[1]));
  }
  return 1;
}

/**
 * Trích xuất giá từ text
 * VD: "900,000đ" → 900000, "1.5tr" → 1500000
 */
export function extractPrice(text: string): number {
  if (!text) return 0;
  const str = String(text);
  // "1.5tr" hoặc "1,5 triệu"
  const trMatch = str.match(/(\d+[.,]\d+)\s*(tr|triệu)/i) || str.match(/(\d+)\s*(tr|triệu)/i);
  if (trMatch) return parseFloat(trMatch[1].replace(',', '.')) * 1_000_000;
  // Số có dấu phẩy/chấm phân cách
  const numMatch = str.match(/(\d[\d.,]+\d)\s*(đ|vnd|vnđ|đồng)?/gi);
  if (numMatch) {
    const clean = numMatch[0].replace(/[^\d]/g, '');
    return parseInt(clean) || 0;
  }
  return 0;
}

/**
 * Trích xuất mã quan trọng từ free text
 * Thứ tự: tờ khai HQ (12 digits) → mã thuế → mã HĐ → tên người
 */
export function extractImportantCode(text: string): string {
  if (!text) return '';
  // Số tờ khai HQ: 12 chữ số
  const hqMatch = text.match(/\b\d{12}\b/);
  if (hqMatch) return hqMatch[0];
  // Mã thuế pattern: HCM\d{6}-\d{7}
  const taxMatch = text.match(/(HCM\d{6}-\d{7}|\d{9}[A-Z]-\d{7})/);
  if (taxMatch) return taxMatch[0];
  // Mã hóa đơn: CT/HD/SO/TK + số
  const billMatch = text.match(/(CT|HD|SO|TK|MST|INV)[\s\-_/]*[0-9]+[A-Z0-9]*/i);
  if (billMatch) return billMatch[0].replace(/\s+/g, '').substring(0, 20);
  // Tên người (nếu là cá nhân)
  const nameMatch = text.match(/(?:ÔNG|BÀ|ANH|CHỊ|CÔ)\s+([A-ZÀ-Ỹ][A-ZÀ-Ỹ\s]{2,})/i);
  if (nameMatch) return nameMatch[1].trim().substring(0, 20);
  return text.substring(0, 30).trim();
}

// ── DASHBOARD KPI AGGREGATION (port từ MEGA) ─────────────────────────────
export interface KpiSnapshot {
  totalInventoryValue: number;
  goldValue:           number;
  diamondValue:        number;
  otherValue:          number;
  itemCount:           number;
  totalQty:            number;
  generatedAt:         Date;
}

export function buildKpiSnapshot(inventoryRows: unknown[][]): KpiSnapshot {
  let totalInventoryValue = 0, goldValue = 0, diamondValue = 0, itemCount = 0, totalQty = 0;

  for (const row of inventoryRows.slice(1)) {
    const [code, , qty, val, , type] = row as [string, string, number, number, number, string];
    if (!code) continue;
    const v = Number(val) || 0;
    const q = Number(qty) || 0;
    totalInventoryValue += v;
    totalQty            += q;
    itemCount++;
    if (String(type).includes('GOLD'))    goldValue    += v;
    if (String(type).includes('DIAMOND')) diamondValue += v;
  }

  return {
    totalInventoryValue,
    goldValue,
    diamondValue,
    otherValue: totalInventoryValue - goldValue - diamondValue,
    itemCount,
    totalQty,
    generatedAt: new Date(),
  };
}

// ── FULL CATEGORY MAP (port từ MEGA — đầy đủ 60+ categories) ─────────────
export const FULL_CATEGORY_MAP = {
  // THU
  DT_CK:                    '💰 DOANH THU CHUYỂN KHOẢN',
  DT_POS:                   '💳 DOANH THU THẺ (POS)',
  DT_QR:                    '📱 DOANH THU VÍ ĐIỆN TỬ',
  DT_TRADING:               '💼 DOANH THU TỰ DOANH',
  DT_OTHER:                 '📈 DOANH THU KHÁC',
  // COGS — VÀNG
  COGS_GOLD_B2B:            '🟡 MUA VÀNG TỪ ĐỐI TÁC (B2B)',
  COGS_GOLD_BUYBACK:        '🟡 THU MUA VÀNG TỪ KHÁCH',
  COGS_GOLD_INSPECTION:     '🟡 PHÍ KIỂM ĐỊNH VÀNG',
  COGS_GOLD_CRAFTING:       '🟡 PHÍ GIA CÔNG VÀNG',
  // COGS — KIM CƯƠNG
  COGS_DIAMOND_IMPORT:      '💎 MUA KC NHẬP KHẨU',
  COGS_DIAMOND_LOCAL:       '💎 MUA KC NỘI ĐỊA',
  COGS_DIAMOND_INSPECTION:  '💎 PHÍ KIỂM ĐỊNH KC (GIA/HRD)',
  COGS_DIAMOND_SETTING:     '💎 PHÍ GẮN/GIA CÔNG KC',
  // COGS — THU MUA
  COGS_BUYBACK_JEWELRY:     '💍 THU MUA TRANG SỨC',
  COGS_BUYBACK_OTHER:       '💍 THU MUA HÀNG KHÁC',
  // COGS — NVL
  COGS_MATERIAL:            '📦 MUA NGUYÊN VẬT LIỆU',
  COGS_MATERIAL_OTHER:      '📦 CHI PHÍ NVL KHÁC',
  // COGS — LOGISTICS/HQ
  COGS_SHIPPING_INT:        '🌍 CƯỚC VẬN CHUYỂN QUỐC TẾ',
  COGS_SHIPPING_DOM:        '🚚 CƯỚC VẬN CHUYỂN NỘI ĐỊA',
  COGS_INSURANCE:           '🛡️ BẢO HIỂM HÀNG HÓA',
  COGS_CUSTOMS_DUTY:        '🏛️ THUẾ NHẬP KHẨU',
  COGS_CUSTOMS_FEE:         '🏛️ PHÍ HẢI QUAN & THỦ TỤC',
  // THUẾ
  TAX_VAT_IMPORT:           '🏛️ THUẾ GTGT NHẬP KHẨU',
  TAX_VAT_DOMESTIC:         '🏛️ THUẾ GTGT NỘI ĐỊA',
  TAX_CIT:                  '🏛️ THUẾ TNDN',
  TAX_PIT:                  '🏛️ THUẾ TNCN',
  TAX_PENALTY_LATE:         '⚠️ TIỀN CHẬM NỘP THUẾ',
  TAX_PENALTY_FINE:         '⚠️ TIỀN PHẠT HÀNH CHÍNH',
  TAX_PENALTY_ADJUST:       '⚠️ THUẾ ẤN ĐỊNH/TRUY THU',
  TAX_OTHER:                '🏛️ THUẾ & PHÍ KHÁC',
  // NGÂN HÀNG
  BANK_FEE_TX:              '🏦 PHÍ CHUYỂN KHOẢN',
  BANK_FEE_FOREX:           '🏦 PHÍ ĐỔI NGOẠI TỆ',
  BANK_FEE_MONTHLY:         '🏦 PHÍ DỊCH VỤ NGÂN HÀNG',
  BANK_FEE_OTHER:           '🏦 PHÍ NGÂN HÀNG KHÁC',
  // NHÂN SỰ
  HR_SALARY_BASIC:          '👨‍💼 LƯƠNG CƠ BẢN',
  HR_SALARY_OT:             '👨‍💼 LƯƠNG LÀM THÊM',
  HR_BONUS:                 '👨‍💼 THƯỞNG',
  HR_COMMISSION:            '👨‍💼 HOA HỒNG ĐẠI LÝ',
  HR_INSURANCE:             '👨‍💼 BẢO HIỂM NHÂN VIÊN',
  // BẢO HIỂM BẮT BUỘC
  INS_SOCIAL:               '🛡️ BHXH',
  INS_HEALTH:               '🛡️ BHYT',
  INS_UNEMPLOY:             '🛡️ BHTN',
  INS_UNION:                '🛡️ KINH PHÍ CÔNG ĐOÀN',
  // MARKETING
  MKT_ADS_ONLINE:           '📢 QUẢNG CÁO ONLINE',
  MKT_ADS_OFFLINE:          '📢 QUẢNG CÁO OFFLINE',
  MKT_PROMOTION:            '📢 KHUYẾN MÃI',
  MKT_EVENT:                '📢 SỰ KIỆN, HỘI CHỢ',
  MKT_CONTENT:              '📢 NỘI DUNG MARKETING',
  // VẬN HÀNH
  OP_RENT:                  '📋 THUÊ MẶT BẰNG',
  OP_UTILITY:               '📋 ĐIỆN, NƯỚC, INTERNET',
  OP_OFFICE:                '📋 VĂN PHÒNG PHẨM',
  OP_SOFTWARE:              '📋 PHẦN MỀM, BẢN QUYỀN',
  OP_MAINTENANCE:           '📋 SỬA CHỮA, BẢO TRÌ',
  OP_TRAVEL:                '📋 CÔNG TÁC PHÍ',
  // LOGISTICS
  LOG_SHIPPING:             '🚚 GIAO HÀNG',
  LOG_PACKAGING:            '🚚 BAO BÌ, ĐÓNG GÓI',
  LOG_STORAGE:              '🚚 LƯU KHO',
  // THANH TOÁN NCC
  PAY_NCC_MATERIAL:         '💸 TT NHÀ CUNG CẤP NVL',
  PAY_NCC_SERVICE:          '💸 TT NHÀ CUNG CẤP DỊCH VỤ',
  PAY_NCC_CONSULTANT:       '💸 TT TƯ VẤN/CHUYÊN GIA',
  PAY_NCC_OTHER:            '💸 TT ĐỐI TÁC KHÁC',
  // NỘI BỘ
  INTERNAL_TRANSFER:        '🔄 CHUYỂN KHOẢN NỘI BỘ',
  INTERNAL_CASH_IN:         '🔄 NỘP TIỀN MẶT VÀO NH',
  INTERNAL_CASH_OUT:        '🔄 RÚT TIỀN MẶT',
  INTERNAL_LOAN:            '🔄 CHO VAY/ĐI VAY',
  // CHƯA XÁC ĐỊNH
  NEED_REVIEW:              '🔍 CẦN KIỂM TRA',
} as const;

export type FullCategoryKey = keyof typeof FULL_CATEGORY_MAP;

// ── COLOR MAP per VALUE GROUP ─────────────────────────────────────────────
export const VALUE_GROUP_COLORS = {
  THU:            '#D9EAD3', // xanh nhạt
  CHI_COGS:       '#F4CCCC', // đỏ nhạt
  CHI_OPERATING:  '#EA9999', // đỏ đậm
  THUE:           '#FFF2CC', // vàng nhạt
  THUE_PENALTY:   '#F1C232', // vàng đậm
  BANK_FEE:       '#CFE2F3', // xanh dương nhạt
  HR:             '#D9D2E9', // tím nhạt
  MKT:            '#FCE5CD', // cam nhạt
  INSURANCE:      '#D0E0E3', // xanh ngọc
  LOGISTICS:      '#B6D7A8', // xanh lá
  VENDOR:         '#D5A6BD', // hồng nhạt
  INTERNAL:       '#A4C2F4', // xanh da trời
  DEFAULT:        '#FFFFFF',
};

export default {
  SOURCE_FILE_IDS, IGNORE_SHEETS, SCHEMAS, SYNC_CONFIG,
  ChunkWriter, ProgressManager,
  buildBackupTabName, extractRecords, iterateMapBatches,
  isProdRecord, isShipRecord, buildProdRow, buildShipRow,
  buildAuditRow, calcAuditStatus,
  extractQuantity, extractPrice, extractImportantCode,
  buildKpiSnapshot, FULL_CATEGORY_MAP, VALUE_GROUP_COLORS,
  PROD_SHEET_KW, SHIP_SHEET_KW,
};
