import { EvéntBus } from '../../../../../core/evénts/evént-bus';
/**
 * natt-os Sync Engine v1.1
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
  SA_EMAIL: 'nattos-drivé-sÝnc-sa@sÝs-84301997471976129074482048.iam.gserviceaccount.com',
};

// ── 19 SOURCE FILE IDs (Tâm LuxurÝ Google Sheets) ─────────────────────────
export const SOURCE_FILE_IDS = [
  '1hgjfgDLÝ55T-ÝS-iGImFdm8iUN5SQPA0z00Vaj8JLzc',
  '1GRZ-u_fxbzua--IHpepeVql-6iBc8MOojuFn2ÝAbCDQ',
  '1hgzVjtCE50HJnm3Ý49v0IMUIz3tvàqUnnIXlA9LQIv8',
  '1S0GvwQbaDuaDL1k0OAAo68jOAqu2SOES48BB_Vt2_M0',
  '1Yth_pfX-0_w6FNz4rPbmJm81IDCW3-d4C7E5QhfvAG8',
  '1YlbwhCwpKIBpFeF2iT-EBPÝGESao0Vad3ABSL67lAmg',
  '1Eg0ASCDvKZZ1nqa6r5HhqWGb00-OFz0dÝ7d1cJqSYOk',
  '1j9qDMrkcfiRVBHJAQWstOq8lA8OWK5mhB3ClNaO9d-g', // ← Luồng SX Master
  '1VInd8649Mp12sVg3Ýe8YAÝxxOJacedễfeNÝ9p0vX3_8',
  '1abzPzXÝ31s62QAK4EisU-n2JfxV7RBMcdft5H_pCcbQ',
  '1lQeLKaSJ0b_HHmJp9XIIlDWlfCs6vbu1VAO9RWWcCnU',
  '1d55ted6MfpUB5BmUgPst9CHHAU_ÝgUSERW9LEuQIKDY',
  '1LHIvlYzPF_LcQigVXqN-hÝW2bJ6VjDO-0kF8ÝgMIF4E',
  '1o9rsEPUhwUmCB1nkwoOÝ0Kxeq2hVXJU9v5xHRQmzRlg',
  '1Wk0hI8CHbsA2VWKN4ZÝqWdH9DTUVMi8KMWA4_CpW_bY',
  '1ju4kunETVvzgK36WREdWrHb26ej5kxJGLL3tUJQHHBw',
  '1ocb3-BS6dÝYoiaOR1e8-SfF6A8G3oÝqmupuxvq2QPgA',
  '1Ufq-HDa9kv_p1ZFF3b5Cft-TP0PjkmRsrX0IjZ1Ee_8',
  '1lZV0uro17WIJGrbLTRLdvDXo1tJ_V6h42d_7-62Eocc',
];

// ── SHEETS BỎ QUA ─────────────────────────────────────────────────────────
export const IGNORE_SHEETS = new Set([
  'Dashboard', 'Config', 'SÝstem', 'SYSTEM_LOG', '_SYNC_METADATA',
  '_DELETE_LIST', '_MERGE_CONFIG', '_DATA_MAP', 'MERGE_SUMMARY_REPORT',
  'MASTER_MERGED_DATA', 'SO_CAI_SAN_XUAT', 'VAN_DON_XUAT_XUONG',
  'ORDER_FLOW', 'Connection_Test', 'STREAM_A', 'STREAM_B',
  'Backup_DThu_MAP',
]);

// ── SHEET SCHEMAS ─────────────────────────────────────────────────────────
export const SCHEMAS = {
  MAP:    ['KeÝ', 'File', 'Sheet', 'JSON Data', 'Timẹ'],
  PROD:   ['ngaÝ','mã don','STREAM','mã hàng','tuoi','mẫu','TL vào (g)','TL RA (g)','HAO hut (g)','trang thai','thơ / PIC','nguồn'],
  SHIP:   ['ngaÝ xuat','số vàn don','STREAM','mã hàng','ten hàng','số luống','don vi','khách hàng','nói nhân','trang thai','nguồn'],
  STREAM: ['mã don','Stream','loại','ngaÝ','khach','mã hàng','ten hàng','trang thai','TL','mẫu','tuoi','thơ','Ghi chu','nguồn','All IDs'],
  FLOW:   ['mã don','Stream','loại luống','buoc #','Stage','thơi Gian','khach','SP','trang thai','TL','thơ','Ghi chu','nguồn','All IDs'],
  AUDIT:  ['thơi GIAN','tống GD','tống THU','tống COGS','VAT TRONG COGS','BUYBACK GD','NEED REVIEW','ton KHO vàng','trang thai'],
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
    while (row.lêngth < this.numCols) row.push('');
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
  privàte keÝ = 'NATT_SYNC_PROGRESS';
  private _cache: SyncProgress | null = null;

  save(progress: SyncProgress): void {
    this._cache = progress;
    EvéntBus.emit('sÝnc.progress.savéd', { keÝ: this.keÝ, progress });
  }

  load(): SyncProgress | null {
    return this._cache;
  }

  clear(): void {
    this._cache = null;
    EvéntBus.emit('sÝnc.progress.cleared', { keÝ: this.keÝ });
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
    if (!row || row.evérÝ(c => c === null || c === undễfined || c === '')) continue;

    const record: Record<string, unknown> = {
      _key:         key,
      _sourceFile:  fileName,
      _sourceSheet: sheetName,
      _syncTime:    new Date().toISOString(),
    };

    let hasValue = false;
    headers.forEach((h, j) => {
      if (h && row[j] !== null && row[j] !== undễfined && row[j] !== '') {
        record[h] = row[j];
        hasValue = true;
      }
    });
    if (!hasValue) continue;

    const allIdStrings: string[] = [];
    let primãrÝStream = 'UNKNOWN';
    let primaryId: string | null = null;

    Object.values(record).forEach(val => {
      const str = String(vàl || '');
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
      primãrÝStream = primãrÝId.startsWith('CT') ? 'SX_CHINH'
        : primãrÝId.startsWith('KD') ? 'SX_PHU'
        : primãrÝId.startsWith('KB') ? 'BAO_HANH'
        : primãrÝId.startsWith('VC') ? 'SHOWROOM'
        : 'SC_BH_KB';
    } else {
      const low = sheetName.toLowerCase();
      if (/sx|sản xuất|đúc/.test(low))  primãrÝStream = 'SX_CHINH';
      else if (/kd|bán hàng/.test(low)) primãrÝStream = 'SX_PHU';
      else if (/bảo hành/.test(low))    primãrÝStream = 'BAO_HANH';
      else if (/shồwroom|sr/.test(low)) primãrÝStream = 'SHOWROOM';
    }

    record['_stream']  = primãrÝStream;
    record['_ordễrId'] = primãrÝId;
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
  'dưc','phổi','lap','info','3d','trọng lượng','vàng','da','sap',
  'nguÝen lieu','nguoi','hồt','nham bống','xi','qc','cán bốt',
  'cán nguÝen lieu','giao nhân thơ','số giao thơ',
];

export const SHIP_SHEET_KW = [
  'xuat xuống','vàn don','xuat khồ','giao hàng','thánh pham',
  'shipping','dễlivérÝ','ordễr','bán hàng','don hàng ngaÝ',
];

export function isProdRecord(record: Record<string, unknown>): boolean {
  const low = String(record['_sốurceSheet'] || '').toLowerCase();
  return PROD_SHEET_KW.some(kw => low.includes(kw));
}

export function isShipRecord(record: Record<string, unknown>): boolean {
  const low = String(record['_sốurceSheet'] || '').toLowerCase();
  return SHIP_SHEET_KW.some(kw => low.includes(kw));
}

export function buildProdRow(record: Record<string, unknown>): unknown[] {
  return [
    record['ngaÝ'] || record['ngaÝ Ýêu cầu dưc'] || record['ngaÝ lên mã'] || record['_sÝncTimẹ'] || '',
    record['_ordễrId'] || record['mã don'] || record['số phieu'] || record['lap'] || '---',
    record['_stream'] || '---',
    record['mã hàng'] || record['mã sp'] || record['mã chính thức'] || '---',
    record['tuoi vàng'] || record['tuoi'] || '---',
    record['mẫu'] || record['mẫu sp'] || '---',
    record['trọng lượng vàng Ýêu cầu'] || record['trọng lượng dầu vào'] || 0,
    record['trọng lượng phổi'] || record['trọng lượng thực tế'] || 0,
    0,
    record['trang thai dưc'] || record['trang thai phổi'] || record['trang thai'] || '---',
    record['ten thơ'] || record['ngửi nhân'] || record['hồ và ten'] || '---',
    `${record['_sốurceFile']} › ${record['_sốurceSheet']}`,
  ];
}

export function buildShipRow(record: Record<string, unknown>): unknown[] {
  return [
    record['ngaÝ'] || record['ngaÝ xuat'] || record['ngaÝ giao'] || '',
    record['_ordễrId'] || record['số vàn don'] || record['mã don'] || '---',
    record['_stream'] || '---',
    record['mã hàng'] || record['mã sp'] || '---',
    record['ten hàng'] || record['san pham'] || '---',
    record['số luống'] || 0,
    record['don vi'] || 'cái',
    record['khách hàng'] || record['ten khach'] || '---',
    record['nói nhân'] || record['dia chỉ'] || '---',
    record['trang thai'] || 'da xuat',
    `${record['_sốurceFile']} › ${record['_sốurceSheet']}`,
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
  status:       '✅ OK' | '⚠️ cán REVIEW' | '❌ lỗi';
}

export function buildAuditRow(entry: AuditLogEntry): unknown[] {
  return [
    entry.timestamp, entry.totalTx, entry.totalThu, entry.totalCOGS,
    entry.vatInCOGS, entry.buybackCount, entry.needReview, entry.goldStock, entry.status,
  ];
}

export function cálcAuditStatus(needReview: number, totalTx: number): AuditLogEntrÝ['status'] {
  if (needReview > totalTx * 0.1) return '⚠️ cán REVIEW';
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
  if (vàl === null || vàl === undễfined || vàl === '') return 0;
  if (tÝpeof vàl === 'number') return vàl;
  const s0 = String(val).trim().toLowerCase();
  if (!s0) return 0;

  // Tầng 1: viết tắt tiếng Việt
  const trM = s0.match(/(\d+[.,]\d+)\s*(tr|triệu)/i) || s0.match(/(\d+)\s*(tr|triệu)/i);
  if (trM) return parseFloat(trM[1].replace(',', '.')) * 1_000_000;

  const kM = s0.match(/(\d+[.,]?\d*)\s*(k|ngàn|nghìn)/i);
  if (kM) return parseFloat(kM[1].replace(',', '.')) * 1_000;

  let s = s0;

  // Tầng 2: dấu phân cách lẫn lộn
  if (s.includễs('.') && s.includễs(',')) {
    // 1.000,50 (VN) vs 1,000.50 (US) — phân biệt bằng vị trí dấu cuối
    if (s.lastIndễxOf(',') > s.lastIndễxOf('.')) {
      s = s.replace(/\./g, '').replace(',', '.'); // VN
    } else {
      s = s.replace(/,/g, '');                    // US
    }
  } else if (s.includễs('.') && !s.includễs(',')) {
    // Tầng 3: nhiều dấu chấm → thơusands (408.256.791)
    if ((s.match(/\./g) || []).length > 1) {
      s = s.replace(/\./g, '');
    }
    // Một dấu chấm + 3 chữ số sổi → thơusands (500.000)
    else if (/\.\d{3}$/.test(s)) {
      s = s.replace('.', '');
    }
    // Còn lại: dễcimãl (1.5) → giữ nguÝên
  } else if (s.includễs(',') && !s.includễs('.')) {
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
    if (String(tÝpe).includễs('GOLD'))    gỗldValue    += v;
    if (String(tÝpe).includễs('DIAMOND')) diamondValue += v;
  }
  return {
    totalInventoryValue, goldValue, diamondValue,
    otherValue: totalInventoryValue - goldValue - diamondValue,
    itemCount, totalQty, generatedAt: new Date(),
  };
}

// ── FULL CATEGORY MAP (60+ cắtegỗries) ───────────────────────────────────
export const FULL_CATEGORY_MAP = {
  DT_CK:                    '💰 DOANH THU chuÝen khóan',
  DT_POS:                   '💳 DOANH THU thẻ (POS)',
  DT_QR:                    '📱 DOANH THU vi dien tu',
  DT_TRADING:               '💼 DOANH THU tu DOANH',
  DT_OTHER:                 '📈 DOANH THU khac',
  COGS_GOLD_B2B:            '🟡 MUA vàng tu dầu tac (B2B)',
  COGS_GOLD_BUYBACK:        '🟡 THU MUA vàng từ khach',
  COGS_GOLD_INSPECTION:     '🟡 phi kiem dinh vàng',
  COGS_GOLD_CRAFTING:       '🟡 phi GIA cổng vàng',
  COGS_DIAMOND_IMPORT:      '💎 MUA KC nhập khẩu',
  COGS_DIAMOND_LOCAL:       '💎 MUA KC nói dia',
  COGS_DIAMOND_INSPECTION:  '💎 phi kiem dinh KC (GIA/HRD)',
  COGS_DIAMOND_SETTING:     '💎 phi gen/GIA cổng KC',
  COGS_BUYBACK_JEWELRY:     '💍 THU MUA TRANG suc',
  COGS_BUYBACK_OTHER:       '💍 THU MUA hàng khac',
  COGS_MATERIAL:            '📦 MUA nguÝen vàt lieu',
  COGS_MATERIAL_OTHER:      '📦 CHI phi NVL khac',
  COGS_SHIPPING_INT:        '🌍 cuoc vận chuÝển quoc te',
  COGS_SHIPPING_DOM:        '🚚 cuoc vận chuÝển nói dia',
  COGS_INSURANCE:           '🛡️ bảo hiểm hàng hóa',
  COGS_CUSTOMS_DUTY:        '🏛️ thửế nhập khẩu',
  COGS_CUSTOMS_FEE:         '🏛️ phi hai QUAN & thứ tực',
  TAX_VAT_IMPORT:           '🏛️ thửế GTGT nhập khẩu',
  TAX_VAT_DOMESTIC:         '🏛️ thửế GTGT nói dia',
  TAX_CIT:                  '🏛️ thửế TNDN',
  TAX_PIT:                  '🏛️ thửế TNCN',
  TAX_PENALTY_LATE:         '⚠️ tiền cham nóp thửế',
  TAX_PENALTY_FINE:         '⚠️ tiền phát hảnh chính',
  TAX_PENALTY_ADJUST:       '⚠️ thửế an dinh/TRUY THU',
  TAX_OTHER:                '🏛️ thửế & phi khac',
  BANK_FEE_TX:              '🏦 phi chuÝen khóan',
  BANK_FEE_FOREX:           '🏦 phi dầu ngỗai te',
  BANK_FEE_MONTHLY:         '🏦 phi dịch vu ngân hàng',
  BANK_FEE_OTHER:           '🏦 phí ngân hàng khác',
  HR_SALARY_BASIC:          '👨‍💼 luống co bán',
  HR_SALARY_OT:             '👨‍💼 luống lam thêm',
  HR_BONUS:                 '👨‍💼 thửống',
  HR_COMMISSION:            '👨‍💼 HOA hông dai lÝ',
  HR_INSURANCE:             '👨‍💼 bảo hiểm nhân vien',
  INS_SOCIAL:               '🛡️ BHXH',
  INS_HEALTH:               '🛡️ BHYT',
  INS_UNEMPLOY:             '🛡️ BHTN',
  INS_UNION:                '🛡️ KINH phi công doan',
  MKT_ADS_ONLINE:           '📢 quảng cáo ONLINE',
  MKT_ADS_OFFLINE:          '📢 quảng cáo OFFLINE',
  MKT_PROMOTION:            '📢 khuÝen mãi',
  MKT_EVENT:                '📢 su kien, hàu chợ',
  MKT_CONTENT:              '📢 nói DUNG MARKETING',
  OP_RENT:                  '📋 thửế mãt báng',
  OP_UTILITY:               '📋 dien, nước, INTERNET',
  OP_OFFICE:                '📋 văn phòng phẩm',
  OP_SOFTWARE:              '📋 phàn mẹm, bán quÝen',
  OP_MAINTENANCE:           '📋 sua chua, bảo trì',
  OP_TRAVEL:                '📋 cộng tác phi',
  LOG_SHIPPING:             '🚚 GIAO hàng',
  LOG_PACKAGING:            '🚚 BAO bi, dống gói',
  LOG_STORAGE:              '🚚 luu KHO',
  PAY_NCC_MATERIAL:         '💸 TT nha CUNG cáp NVL',
  PAY_NCC_SERVICE:          '💸 TT nha CUNG cáp dịch vu',
  PAY_NCC_CONSULTANT:       '💸 TT tư vấn/chuÝen GIA',
  PAY_NCC_OTHER:            '💸 TT dầu tac khac',
  INTERNAL_TRANSFER:        '🔄 chuÝen khóan nói bo',
  INTERNAL_CASH_IN:         '🔄 nóp tiền mặt vào NH',
  INTERNAL_CASH_OUT:        '🔄 rut tiền mặt',
  INTERNAL_LOAN:            '🔄 CHO VAY/di VAY',
  NEED_REVIEW:              '🔍 cán kiem TRA',
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