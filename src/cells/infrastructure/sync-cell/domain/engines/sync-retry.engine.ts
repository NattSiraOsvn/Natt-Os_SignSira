/**
 * natt-os Sync Retry Engine v1.0
 * Port từ Doc 12 — mergeFullDiverseFilesFromFolderOptimized()
 * Target: sync-cell/domain/engines/
 *
 * RetryConfig: max 3 attempts + exponential backoff
 * MergeFileInfo: GSheet / XLSX / CSV / XLS multi-format
 * withRetry(): generic retry wrapper
 * buildMergeQuery(): Drive API query cho folder
 * buildTempFileName(): tên file tạm duy nhất
 * MergeSession: log kết quả từng file
 */

// ── RETRY CONFIG ───────────────────────────────────────────────────────────
export interface RetryConfig {
  maxAttempts:     number;   // default 3
  baseSleepMs:     number;   // default 3000ms
  backoffMultiplier:number;  // default 2 (exponential)
  jitterMs?:       number;   // optional random jitter
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts:      3,
  baseSleepMs:      3000,
  backoffMultiplier:2,
  jitterMs:         500,
};

/**
 * calcSleepMs — tính thời gian chờ cho attempt thứ N
 * Port từ Doc 12: BASE_SLEEP_TIME * attempt * 2 (exponential backoff)
 *
 * attempt=1 → baseSleepMs (3000ms)
 * attempt=2 → baseSleepMs * 2^1 = 6000ms
 * attempt=3 → baseSleepMs * 2^2 = 12000ms
 */
export function calcSleepMs(
  attempt: number,
  config:  RetryConfig = DEFAULT_RETRY_CONFIG,
): number {
  const base   = config.baseSleepMs * Math.pow(config.backoffMultiplier, attempt - 1);
  const jitter = config.jitterMs ? Math.random() * config.jitterMs : 0;
  return Math.floor(base + jitter);
}

// ── RETRY WRAPPER ──────────────────────────────────────────────────────────
export interface RetryResult<T> {
  success:     boolean;
  value?:      T;
  error?:      string;
  attempts:    number;
  totalSleepMs:number;
  log:         string[];
}

/**
 * withRetry — generic retry wrapper
 * Port từ Doc 12 while(attempt < MAX_RETRIES) loop
 *
 * @param fn      - async function cần retry
 * @param config  - retry config
 * @param label   - tên cho logging
 * @param sleep   - optional sleep function (default setTimeout-based)
 */
export async function withRetry<T>(
  fn:     () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG,
  label:  string      = 'operation',
  sleep:  (ms: number) => Promise<void> = (ms) => new Promise(r => setTimeout(r, ms)),
): Promise<RetryResult<T>> {
  const log: string[] = [];
  let attempt = 0;
  let totalSleepMs = 0;
  let lastError = '';

  while (attempt < config.maxAttempts) {
    attempt++;
    log.push(`⏳ [${label}] Attempt ${attempt}/${config.maxAttempts}`);

    try {
      const value = await fn();
      log.push(`✅ [${label}] Success on attempt ${attempt}`);
      return { success: true, value, attempts: attempt, totalSleepMs, log };
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      log.push(`⚠️ [${label}] Attempt ${attempt} failed: ${lastError}`);

      if (attempt < config.maxAttempts) {
        const sleepMs = calcSleepMs(attempt, config);
        totalSleepMs += sleepMs;
        log.push(`💤 [${label}] Waiting ${sleepMs}ms before retry...`);
        await sleep(sleepMs);
      }
    }
  }

  log.push(`❌ [${label}] Failed after ${config.maxAttempts} attempts`);
  return { success: false, error: lastError, attempts: attempt, totalSleepMs, log };
}

// Sync version (for GAS / non-async contexts)
export function withRetrySync<T>(
  fn:     () => T,
  config: RetryConfig = DEFAULT_RETRY_CONFIG,
  label:  string      = 'operation',
): Omit<RetryResult<T>, 'totalSleepMs'> & { sleepSchedule: number[] } {
  const log: string[] = [];
  const sleepSchedule: number[] = [];
  let attempt = 0;
  let lastError = '';

  while (attempt < config.maxAttempts) {
    attempt++;
    log.push(`⏳ [${label}] Attempt ${attempt}/${config.maxAttempts}`);

    try {
      const value = fn();
      log.push(`✅ [${label}] Success on attempt ${attempt}`);
      return { success: true, value, attempts: attempt, log, sleepSchedule };
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      log.push(`⚠️ [${label}] Attempt ${attempt} failed: ${lastError}`);

      if (attempt < config.maxAttempts) {
        const sleepMs = calcSleepMs(attempt, config);
        sleepSchedule.push(sleepMs);
        log.push(`💤 Waiting ${sleepMs}ms before retry`);
      }
    }
  }

  return { success: false, error: lastError, attempts: attempt, log, sleepSchedule };
}

// ── MERGE FILE INFO ────────────────────────────────────────────────────────
export type MergeFileMime =
  | 'application/vnd.google-apps.spreadsheet'  // Google Sheets
  | 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' // XLSX
  | 'application/vnd.ms-excel'                 // XLS
  | 'text/csv';                                // CSV

export const MERGE_MIME_LABELS: Record<MergeFileMime, string> = {
  'application/vnd.google-apps.spreadsheet': 'Google Sheets',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
  'application/vnd.ms-excel': 'XLS',
  'text/csv': 'CSV',
};

export const ALL_MERGE_MIMES: MergeFileMime[] = [
  'application/vnd.google-apps.spreadsheet',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/csv',
];

export interface MergeFileInfo {
  id:       string;
  name:     string;
  mimeType: MergeFileMime;
  sizeBytes:number;
}

// ── MERGE SESSION ──────────────────────────────────────────────────────────
export type MergeFileStatus = 'SUCCESS' | 'SKIPPED' | 'failED' | 'PENDING';

export interface MergeFileLog {
  fileId:      string;
  fileName:    string;
  mimeType:    string;
  status:      MergeFileStatus;
  targetSheet: string;
  rowsCopied:  number;
  attempts:    number;
  error?:      string;
  log:         string[];
}

export interface MergeSession {
  sessionId:    string;
  sourceFolderId:string;
  startedAt:    Date;
  completedAt?: Date;
  totalFiles:   number;
  succeeded:    number;
  failed:       number;
  skipped:      number;
  totalRows:    number;
  fileLogs:     MergeFileLog[];
}

export function createMergeSession(sourceFolderId: string): MergeSession {
  return {
    sessionId:      `MERGE-${Date.now()}`,
    sourceFolderId,
    startedAt:      new Date(),
    totalFiles:     0,
    succeeded:      0,
    failed:         0,
    skipped:        0,
    totalRows:      0,
    fileLogs:       [],
  };
}

export function finalizeMergeSession(session: MergeSession): MergeSession {
  return { ...session, completedAt: new Date() };
}

// ── DRIVE QUERY BUILDERS ──────────────────────────────────────────────────
/**
 * buildMergeQuery — port từ Doc 12 mimeTypesQuery
 * Build Drive API search query cho folder chứa files cần merge
 */
export function buildMergeQuery(
  folderId:  string,
  mimes:     MergeFileMime[] = ALL_MERGE_MIMES,
  trashed:   boolean = false,
): string {
  const mimeQuery = mimes.map(m => `mimeType = '${m}'`).join(' or ');
  return `'${folderId}' in parents and (${mimeQuery}) and trashed = ${trashed}`;
}

// ── TEMP FILE UTILS ───────────────────────────────────────────────────────
/**
 * buildTempFileName — tạo tên file tạm duy nhất
 * Port từ Doc 12: fileName + ' (TEMP)'
 */
export function buildTempFileName(originalName: string, suffix = 'TEMP'): string {
  const ext = originalName.match(/\.(xlsx|xls|csv)$/i)?.[1] ?? '';
  const base = ext ? originalName.slice(0, -ext.length - 1) : originalName;
  return `${base} (${suffix})`;
}

/**
 * buildUniqueSheetName — tránh trùng tên sheet khi copy
 * Port từ Doc 12 counter logic
 */
export function buildUniqueSheetName(
  baseName:      string,
  existingNames: Set<string>,
): string {
  // Bỏ extension
  const clean = baseName.replace(/\.(xlsx|xls|csv)$/i, '');
  if (!existingNames.has(clean)) return clean;

  let counter = 1;
  while (existingNames.has(`${clean} (${counter})`)) counter++;
  return `${clean} (${counter})`;
}

// ── CLASSIFY MERGE STRATEGY ───────────────────────────────────────────────
export type MergeStrategy = 'OPEN_DIRECT' | 'CONVERT_XLSX' | 'PARSE_CSV';

/**
 * classifyMergeStrategy — port từ Doc 12 if/else mime check
 * Quyết định cách xử lý file:
 * - Google Sheets: open trực tiếp
 * - XLSX/XLS: tạo file tạm trong tempFolder → convert → open
 * - CSV: parse CSV string → tạo sheet tạm
 */
export function classifyMergeStrategy(mimeType: MergeFileMime): MergeStrategy {
  if (mimeType === 'application/vnd.google-apps.spreadsheet') return 'OPEN_DIRECT';
  if (mimeType === 'text/csv') return 'PARSE_CSV';
  return 'CONVERT_XLSX'; // XLSX + XLS
}

// ── MERGE SUMMARY ─────────────────────────────────────────────────────────
export function buildMergeSummary(session: MergeSession): string {
  const duration = session.completedAt
    ? Math.round((session.completedAt.getTime() - session.startedAt.getTime()) / 1000)
    : 0;

  return [
    `MERGE SESSION: ${session.sessionId}`,
    `Source: ${session.sourceFolderId}`,
    `Duration: ${duration}s`,
    `Files: ${session.totalFiles} total | ${session.succeeded} ok | ${session.failed} failed | ${session.skipped} skipped`,
    `Rows: ${session.totalRows}`,
    session.failed > 0
      ? `Failed: ${session.fileLogs.filter(f => f.status === 'failED').map(f => f.fileName).join(', ')}`
      : 'All files processed OK',
  ].join('\n');
}

export default {
  DEFAULT_RETRY_CONFIG,
  calcSleepMs, withRetry, withRetrySync,
  ALL_MERGE_MIMES, MERGE_MIME_LABELS,
  createMergeSession, finalizeMergeSession,
  buildMergeQuery, buildTempFileName,
  buildUniqueSheetName, classifyMergeStrategy,
  buildMergeSummary,
};
