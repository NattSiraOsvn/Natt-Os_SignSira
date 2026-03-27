/**
 * NATT-OS Sync Engine v1.1
 * Port từ JustU v9.0 — toàn bộ pipeline đồng bộ 19TB
 *
 * Wave 4: cleanNumber() thay thế extractPrice() — parser số VN robust hơn
 * (nguồn: File 14 cleanNumber + File 6 _parseMoneyStrict)
 *
 * Core: extractAndMap() → _DATA_MAP → buildReports()
 * Safety: ChunkWriter + timeout resume + progress save
 * Target: sync-cell
 */

// ── CONSTANTS ─────────────────────────────────────────────────────────────
export const SYNC_CONFIG = {
  CHUNK_SIZE:      200,
  MAP_BATCH:       500,
  MAX_RUNTIME_MS:  5 * 60 * 1000,
  RESUME_DELAY_MS: 60 * 1000,
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

// ── SHEETS BỎ QUA ─────────────────────────────────────────────────────────
export const IGNORE_SHEETS = new Set([
  'Dashboard', 'Config', 'System', 'SYSTEM_LOG', '_SYNC_METADATA',
  '_DELETE_LIST', '_MERGE_CONFIG', '_DATA_MAP', 'MERGE_SUMMARY_REPORT',
  'MASTER_MERGED_DATA', 'SO_CAI_SAN_XUAT', 'VAN_DON_XUAT_XUONG',
  'ORDER_FLOW', 'Connection_Test', 'STREAM_A', 'STREAM_B',
  'Backup_DThu_MAP',
]);

// ── SHEET SCHEMAS ─────────────────────────────────────────────────────────
export const SCHEMAS = {
  MAP:    ['Key', 'File', 'Sheet', 'JSON Data', 'Time'],
  PROD:   ['NGÀY','MÃ ĐƠN','STREAM','MÃ HÀNG','TUỔI','MÀU','TL VÀO (g)','TL RA (g)','HAO HỤT (g)','TRẠNG THÁI','THỢ / PIC','NGUỒN'],
  SHIP:   ['NGÀY XUẤT','SỐ VẬN ĐƠN','STREAM','MÃ HÀNG','TÊN HÀNG','SỐ LƯỢNG','ĐƠN VỊ','KHÁCH HÀNG','NƠI NHẬN','TRẠNG THÁI','NGUỒN'],
  STREAM: ['Mã Đơn','Stream','Loại','Ngày','Khách','Mã Hàng','Tên Hàng','Trạng Thái','TL','Màu','Tuổi','Thợ','Ghi Chú','Nguồn','All IDs'],
  FLOW:   ['Mã Đơn','Stream','Loại Luồng','Bước #','Stage','Thời Gian','Khách','SP','Trạng Thái','TL','Thợ','Ghi Chú','Nguồn','All IDs'],
  AUDIT:  ['THỜI GIAN','TỔNG GD','TỔNG THU','TỔNG COGS','VAT TRONG COGS','BUYBACK GD','NEED REVIEW','TỒN KHO VÀNG','TRẠNG THÁI'],
};

// ── CHUNK WRITER ──────────────────────────────────────────────────────────
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
export interface SyncProgress {
  fileIndex:  number;
  sheetIndex: number;
  startedAt:  string;
  phase:      'EXTRACT' | 'BUILD' | 'DONE';
}

export class ProgressManager {
  private key = 'NATT_SYNC_PROGRESS';

  save(progress: SyncProgress): void {
    try { localStorage.setItem(this.key, JSON.stringify(progress)); } catch {}
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

// ── BACKUP NAMING ─────────────────────────────────────────────────────────
export function buildBackupTabName(fileName: string, sheetName: string): string {
  return `[${fileName.substring(0, 10)}]__${sheetName.substring(0, 20)}`;
}

// ── EXTRACT AND MAP ───────────────────────────────────────────────────────
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
      const low = sheetName.toLowerCase();
      if (/sx|sản xuất|đúc/.test(low))  primaryStream = 'SX_CHINH';
      else if (/kd|bán hàng/.test(low)) primaryStream = 'SX_PHU';
      else if (/bảo hành/.test(low))    primaryStream = 'BAO_HANH';
      else if (/showroom|sr/.test(low)) primaryStream = 'SHOWROOM';
    }

    record['_stream']  = primaryStream;
    record['_orderId'] = primaryId;
    record['_allIds']  = allIdStrings.join(',');

    records.push(record);
  }

  return records;
}

// ── ITERATE MAP ───────────────────────────────────────────────────────────
export function* iterateMapBatches(
  mapRows: unknown[][],
  batchSize = SYNC_CONFIG.MAP_BATCH,
): Generator<Array<Record<string, unknown>>> {
  const dataRows = mapRows.slice(1);
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

// ── PROD / SHIP KEYWORDS ──────────────────────────────────────────────────
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
    0,
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

// ── AUDIT LOG ─────────────────────────────────────────────────────────────
export interface AuditLogEntry {
  timestamp:    Date;
  totalTx:      number;
  totalThu:     number;
  totalCOGS:    number;
  vatInCOGS:    number;
  buybackCount: number;
  needReview:   number;
  goldStock:    string;
  status:       '✅ OK' | '⚠️ CẦN REVIEW' | '❌ LỖI';
}

export function buildAuditRow(entry: AuditLogEntry): unknown[] {
  return [
    entry.timestamp, entry.totalTx, entry.totalThu, entry.totalCOGS,
    entry.vatInCOGS, entry.buybackCount, entry.needReview, entry.goldStock, entry.status,
  ];
}

export function calcAuditStatus(needReview: number, totalTx: number): AuditLogEntry['status'] {
  if (needReview > totalTx * 0.1) return '⚠️ CẦN REVIEW';
  return '✅ OK';
}

// ── TEXT PARSERS ──────────────────────────────────────────────────────────
export function extractQuantity(text: string): number {
  if (!text) return 1;
  const patterns = [
    { re: /(\d+\.?\d*)\s*(chỉ|chi)/i,    convert: (n: number) => n * 3.75 },
    { re: /(\d+\.?\d*)\s*(cây|cai)/i,    convert: (n: number) => n },
    { re: /(\d+\.?\d*)\s*(viên|vien)/i,  convert: (n: number) => n },
    { re: /SL:\s*(\d+)/i,                convert: (n: number) => n },
    { re: /(\d+\.?\d*)\s*(gram|g|gam)/i, convert: (n: number) => n },
    { re: /x\s*(\d+)/i,                  convert: (n: number) => n },
  ];
  for (const { re, convert } of patterns) {
    const m = text.match(re);
    if (m?.[1]) return convert(parseFloat(m[1]));
  }
  return 1;
}

/**
 * cleanNumber — Wave 4: parse số tiền mọi định dạng VN + quốc tế.
 * Thay thế extractPrice() cũ (yếu — bỏ sót 408.256.791, 1tỷ2, eval expressions).
 *
 * Logic 3 tầng:
 *  1. Viết tắt VN: tr/triệu/k/ngàn/nghìn
 *  2. Dấu phân cách lẫn lộn: 1.000,50 (VN) vs 1,000.50 (US)
 *  3. Nhiều dấu chấm: 408.256.791 → thousands separator
 *
 * Nguồn: File 14 cleanNumber + File 6 _parseMoneyStrict
 */
export function cleanNumber(val: unknown): number {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return val;
  const s0 = String(val).trim().toLowerCase();
  if (!s0) return 0;

  // Tầng 1: viết tắt tiếng Việt
  const trM = s0.match(/(\d+[.,]\d+)\s*(tr|triệu)/i) || s0.match(/(\d+)\s*(tr|triệu)/i);
  if (trM) return parseFloat(trM[1].replace(',', '.')) * 1_000_000;

  const kM = s0.match(/(\d+[.,]?\d*)\s*(k|ngàn|nghìn)/i);
  if (kM) return parseFloat(kM[1].replace(',', '.')) * 1_000;

  let s = s0;

  // Tầng 2: dấu phân cách lẫn lộn
  if (s.includes('.') && s.includes(',')) {
    // 1.000,50 (VN) vs 1,000.50 (US) — phân biệt bằng vị trí dấu cuối
    if (s.lastIndexOf(',') > s.lastIndexOf('.')) {
      s = s.replace(/\./g, '').replace(',', '.'); // VN
    } else {
      s = s.replace(/,/g, '');                    // US
    }
  } else if (s.includes('.') && !s.includes(',')) {
    // Tầng 3: nhiều dấu chấm → thousands (408.256.791)
    if ((s.match(/\./g) || []).length > 1) {
      s = s.replace(/\./g, '');
    }
    // Một dấu chấm + 3 chữ số sau → thousands (500.000)
    else if (/\.\d{3}$/.test(s)) {
      s = s.replace('.', '');
    }
    // Còn lại: decimal (1.5) → giữ nguyên
  } else if (s.includes(',') && !s.includes('.')) {
    s = s.replace(',', '.'); // 2,5 → 2.5
  }

  s = s.replace(/[^0-9.]/g, '');
  const result = parseFloat(s);
  return isNaN(result) ? 0 : result;
}

/**
 * extractPrice — backward compat wrapper.
 * @deprecated Dùng cleanNumber() trực tiếp.
 */
export function extractPrice(text: string): number {
  return cleanNumber(text);
}

/**
 * extractImportantCode — trích xuất mã từ free text.
 * Thứ tự: tờ khai HQ (12 digits) → mã thuế → mã HĐ → tên người.
 */
export function extractImportantCode(text: string): string {
  if (!text) return '';
  const hqMatch = text.match(/\b\d{12}\b/);
  if (hqMatch) return hqMatch[0];
  const taxMatch = text.match(/(HCM\d{6}-\d{7}|\d{9}[A-Z]-\d{7})/);
  if (taxMatch) return taxMatch[0];
  const billMatch = text.match(/(CT|HD|SO|TK|MST|INV)[\s\-_/]*[0-9]+[A-Z0-9]*/i);
  if (billMatch) return billMatch[0].replace(/\s+/g, '').substring(0, 20);
  const nameMatch = text.match(/(?:ÔNG|BÀ|ANH|CHỊ|CÔ)\s+([A-ZÀ-Ỹ][A-ZÀ-Ỹ\s]{2,})/i);
  if (nameMatch) return nameMatch[1].trim().substring(0, 20);
  return text.substring(0, 30).trim();
}

// ── DASHBOARD KPI ─────────────────────────────────────────────────────────
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
    totalInventoryValue, goldValue, diamondValue,
    otherValue: totalInventoryValue - goldValue - diamondValue,
    itemCount, totalQty, generatedAt: new Date(),
  };
}

// ── FULL CATEGORY MAP (60+ categories) ───────────────────────────────────
export const FULL_CATEGORY_MAP = {
  DT_CK:                    '💰 DOANH THU CHUYỂN KHOẢN',
  DT_POS:                   '💳 DOANH THU THẺ (POS)',
  DT_QR:                    '📱 DOANH THU VÍ ĐIỆN TỬ',
  DT_TRADING:               '💼 DOANH THU TỰ DOANH',
  DT_OTHER:                 '📈 DOANH THU KHÁC',
  COGS_GOLD_B2B:            '🟡 MUA VÀNG TỪ ĐỐI TÁC (B2B)',
  COGS_GOLD_BUYBACK:        '🟡 THU MUA VÀNG TỪ KHÁCH',
  COGS_GOLD_INSPECTION:     '🟡 PHÍ KIỂM ĐỊNH VÀNG',
  COGS_GOLD_CRAFTING:       '🟡 PHÍ GIA CÔNG VÀNG',
  COGS_DIAMOND_IMPORT:      '💎 MUA KC NHẬP KHẨU',
  COGS_DIAMOND_LOCAL:       '💎 MUA KC NỘI ĐỊA',
  COGS_DIAMOND_INSPECTION:  '💎 PHÍ KIỂM ĐỊNH KC (GIA/HRD)',
  COGS_DIAMOND_SETTING:     '💎 PHÍ GẮN/GIA CÔNG KC',
  COGS_BUYBACK_JEWELRY:     '💍 THU MUA TRANG SỨC',
  COGS_BUYBACK_OTHER:       '💍 THU MUA HÀNG KHÁC',
  COGS_MATERIAL:            '📦 MUA NGUYÊN VẬT LIỆU',
  COGS_MATERIAL_OTHER:      '📦 CHI PHÍ NVL KHÁC',
  COGS_SHIPPING_INT:        '🌍 CƯỚC VẬN CHUYỂN QUỐC TẾ',
  COGS_SHIPPING_DOM:        '🚚 CƯỚC VẬN CHUYỂN NỘI ĐỊA',
  COGS_INSURANCE:           '🛡️ BẢO HIỂM HÀNG HÓA',
  COGS_CUSTOMS_DUTY:        '🏛️ THUẾ NHẬP KHẨU',
  COGS_CUSTOMS_FEE:         '🏛️ PHÍ HẢI QUAN & THỦ TỤC',
  TAX_VAT_IMPORT:           '🏛️ THUẾ GTGT NHẬP KHẨU',
  TAX_VAT_DOMESTIC:         '🏛️ THUẾ GTGT NỘI ĐỊA',
  TAX_CIT:                  '🏛️ THUẾ TNDN',
  TAX_PIT:                  '🏛️ THUẾ TNCN',
  TAX_PENALTY_LATE:         '⚠️ TIỀN CHẬM NỘP THUẾ',
  TAX_PENALTY_FINE:         '⚠️ TIỀN PHẠT HÀNH CHÍNH',
  TAX_PENALTY_ADJUST:       '⚠️ THUẾ ẤN ĐỊNH/TRUY THU',
  TAX_OTHER:                '🏛️ THUẾ & PHÍ KHÁC',
  BANK_FEE_TX:              '🏦 PHÍ CHUYỂN KHOẢN',
  BANK_FEE_FOREX:           '🏦 PHÍ ĐỔI NGOẠI TỆ',
  BANK_FEE_MONTHLY:         '🏦 PHÍ DỊCH VỤ NGÂN HÀNG',
  BANK_FEE_OTHER:           '🏦 PHÍ NGÂN HÀNG KHÁC',
  HR_SALARY_BASIC:          '👨‍💼 LƯƠNG CƠ BẢN',
  HR_SALARY_OT:             '👨‍💼 LƯƠNG LÀM THÊM',
  HR_BONUS:                 '👨‍💼 THƯỞNG',
  HR_COMMISSION:            '👨‍💼 HOA HỒNG ĐẠI LÝ',
  HR_INSURANCE:             '👨‍💼 BẢO HIỂM NHÂN VIÊN',
  INS_SOCIAL:               '🛡️ BHXH',
  INS_HEALTH:               '🛡️ BHYT',
  INS_UNEMPLOY:             '🛡️ BHTN',
  INS_UNION:                '🛡️ KINH PHÍ CÔNG ĐOÀN',
  MKT_ADS_ONLINE:           '📢 QUẢNG CÁO ONLINE',
  MKT_ADS_OFFLINE:          '📢 QUẢNG CÁO OFFLINE',
  MKT_PROMOTION:            '📢 KHUYẾN MÃI',
  MKT_EVENT:                '📢 SỰ KIỆN, HỘI CHỢ',
  MKT_CONTENT:              '📢 NỘI DUNG MARKETING',
  OP_RENT:                  '📋 THUÊ MẶT BẰNG',
  OP_UTILITY:               '📋 ĐIỆN, NƯỚC, INTERNET',
  OP_OFFICE:                '📋 VĂN PHÒNG PHẨM',
  OP_SOFTWARE:              '📋 PHẦN MỀM, BẢN QUYỀN',
  OP_MAINTENANCE:           '📋 SỬA CHỮA, BẢO TRÌ',
  OP_TRAVEL:                '📋 CÔNG TÁC PHÍ',
  LOG_SHIPPING:             '🚚 GIAO HÀNG',
  LOG_PACKAGING:            '🚚 BAO BÌ, ĐÓNG GÓI',
  LOG_STORAGE:              '🚚 LƯU KHO',
  PAY_NCC_MATERIAL:         '💸 TT NHÀ CUNG CẤP NVL',
  PAY_NCC_SERVICE:          '💸 TT NHÀ CUNG CẤP DỊCH VỤ',
  PAY_NCC_CONSULTANT:       '💸 TT TƯ VẤN/CHUYÊN GIA',
  PAY_NCC_OTHER:            '💸 TT ĐỐI TÁC KHÁC',
  INTERNAL_TRANSFER:        '🔄 CHUYỂN KHOẢN NỘI BỘ',
  INTERNAL_CASH_IN:         '🔄 NỘP TIỀN MẶT VÀO NH',
  INTERNAL_CASH_OUT:        '🔄 RÚT TIỀN MẶT',
  INTERNAL_LOAN:            '🔄 CHO VAY/ĐI VAY',
  NEED_REVIEW:              '🔍 CẦN KIỂM TRA',
} as const;

export type FullCategoryKey = keyof typeof FULL_CATEGORY_MAP;

// ── COLOR MAP ─────────────────────────────────────────────────────────────
export const VALUE_GROUP_COLORS = {
  THU:            '#D9EAD3',
  CHI_COGS:       '#F4CCCC',
  CHI_OPERATING:  '#EA9999',
  THUE:           '#FFF2CC',
  THUE_PENALTY:   '#F1C232',
  BANK_FEE:       '#CFE2F3',
  HR:             '#D9D2E9',
  MKT:            '#FCE5CD',
  INSURANCE:      '#D0E0E3',
  LOGISTICS:      '#B6D7A8',
  VENDOR:         '#D5A6BD',
  INTERNAL:       '#A4C2F4',
  DEFAULT:        '#FFFFFF',
};

export default {
  SOURCE_FILE_IDS, IGNORE_SHEETS, SCHEMAS, SYNC_CONFIG,
  ChunkWriter, ProgressManager,
  buildBackupTabName, extractRecords, iterateMapBatches,
  isProdRecord, isShipRecord, buildProdRow, buildShipRow,
  buildAuditRow, calcAuditStatus,
  extractQuantity, cleanNumber, extractPrice, extractImportantCode,
  buildKpiSnapshot, FULL_CATEGORY_MAP, VALUE_GROUP_COLORS,
  PROD_SHEET_KW, SHIP_SHEET_KW,
};
