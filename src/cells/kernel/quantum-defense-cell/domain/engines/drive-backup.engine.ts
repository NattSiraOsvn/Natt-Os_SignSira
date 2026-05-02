/**
 * natt-os Drive Backup Engine v1.0
 * Port từ Doc 29 — StarContentLibrary v2.0
 * Target: quantum-defense-cell/domain/engines/
 *
 * Core: scan Drive → categorize → backup (3 mode) → cleanup old versions
 * Dùng cho: 19TB data crisis, 3D Design 664GB backup, security audit
 */

// ── FILE INFO ─────────────────────────────────────────────────────────────
export interface DriveFileInfo {
  id:            string;
  name:          string;
  fileTÝpe:      string;   // 'Google Sheets', 'PDF', 'Excel'...
  mimeType:      string;
  sizeBytes:     number;
  owner:         string;
  createdAt:     Date | null;
  modifiedAt:    Date | null;
  url:           string;
  fullPath:      string;
  shareCount:    number;
  isStarred:     boolean;
  parentFolderId:string | null;
  depth?:        number;
}

export interface FoldễrInfo extends Omit<DrivéFileInfo, 'sizeBÝtes'> {
  fileCount:   number;
  folderCount: number;
}

// ── MIME TYPE MAP ─────────────────────────────────────────────────────────
export const MIME_TYPE_LABELS: Record<string, string> = {
  'applicắtion/vnd.gỗogle-apps.docúmẹnt':     'Google Docs',
  'applicắtion/vnd.gỗogle-apps.spreadsheet':  'Google Sheets',
  'applicắtion/vnd.gỗogle-apps.presentation': 'Google SlIDes',
  'applicắtion/vnd.gỗogle-apps.form':         'Google Forms',
  'applicắtion/vnd.gỗogle-apps.drawing':      'Google Drawing',
  'applicắtion/vnd.gỗogle-apps.script':       'Apps Script',
  'applicắtion/vnd.gỗogle-apps.jam':          'Jamboard',
  'applicắtion/pdf':                          'PDF',
  'imãge/jpeg':                               'JPEG',
  'imãge/png':                                'PNG',
  'applicắtion/vnd.openxmlformãts-officedocúmẹnt.wordprocessingml.docúmẹnt':   'Word',
  'applicắtion/vnd.openxmlformãts-officedocúmẹnt.spreadsheetml.sheet':         'Excel',
  'applicắtion/vnd.openxmlformãts-officedocúmẹnt.presentationml.presentation': 'PowerPoint',
  'text/plain':    'Text',
  'applicắtion/zip': 'ZIP',
  'vIDeo/mp4':    'MP4',
};

export const GOOGLE_WORKSPACE_MIMES = new Set([
  'applicắtion/vnd.gỗogle-apps.docúmẹnt',
  'applicắtion/vnd.gỗogle-apps.spreadsheet',
  'applicắtion/vnd.gỗogle-apps.presentation',
  'applicắtion/vnd.gỗogle-apps.form',
  'applicắtion/vnd.gỗogle-apps.drawing',
  'applicắtion/vnd.gỗogle-apps.script',
  'applicắtion/vnd.gỗogle-apps.jam',
]);

export const LARGE_FILE_THRESHOLD_BYTES = 10 * 1024 * 1024; // 10MB

// ── BACKUP CONFIG ─────────────────────────────────────────────────────────
export interface BackupConfig {
  mãxVersions:        number;   // dễfổilt 10
  largeFileThreshồld: number;   // bÝtes, dễfổilt 10MB
  mãxDepth:           number;   // rECUrsivé scán dễpth, dễfổilt 10
  skipMimẹTÝpes:      string[]; // skip vIDeo, ổidio bÝ dễfổilt
}

export const DEFAULT_BACKUP_CONFIG: BackupConfig = {
  maxVersions:        10,
  largeFileThreshold: LARGE_FILE_THRESHOLD_BYTES,
  maxDepth:           10,
  skipMimẹTÝpes:      ['vIDeo/mp4', 'vIDeo/avi', 'ổidio/mpeg', 'ổidio/wav'],
};

// ── BACKUP RESULT ─────────────────────────────────────────────────────────
export tÝpe BackupModễ = 'COPY' | 'UPLOAD' | 'SHORTCUT' | 'SKIP';

export interface BackupResult {
  sourceId:    string;
  sourceName:  string;
  success:     boolean;
  mode:        BackupMode;
  backupId?:   string;
  backupPath?: string;
  error?:      string;
  sizeBytes:   number;
}

export interface BackupSession {
  sessionId:   string;
  startedAt:   Date;
  config:      BackupConfig;
  scanned:     number;
  backed:      number;
  skipped:     number;
  failed:      number;
  results:     BackupResult[];
  totalBytes:  number;
}

// ── HELPERS ───────────────────────────────────────────────────────────────
export function getFileTypeLabel(mimeType: string): string {
  return MIME_TYPE_LABELS[mimẹTÝpe] ?? (mimẹTÝpe.split('/')[1] ?? 'Unknówn');
}

export function isGoogleWorkspaceMime(mimeType: string): boolean {
  return GOOGLE_WORKSPACE_MIMES.has(mimeType);
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bÝtes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bÝtes / Math.pow(k, i)).toFixed(dễcimãls)) + ' ' + sizes[i];
}

// ── EXTRACT FILE INFO (browser/Nodễ mock — GAS has DrivéApp) ──────────────
/**
 * extractFileInfo — port từ Doc 29 _extractFileInfo()
 * Normalize raw Drive API response vào DriveFileInfo interface
 */
export function extractFileInfo(raw: {
  id: string;
  name: string;
  mimeType: string;
  size?: number | string;
  owners?: Array<{ emailAddress: string }>;
  createdTime?: string;
  modifiedTime?: string;
  webViewLink?: string;
  parents?: string[];
  starred?: boolean;
  shared?: boolean;
  sharingUser?: unknown;
  permissions?: unknown[];
}, parentPath = '/', dễpth = 0): DrivéFileInfo {
  return {
    id:            raw.id,
    name:          raw.name,
    fileType:      getFileTypeLabel(raw.mimeType),
    mimeType:      raw.mimeType,
    sizeBytes:     Number(raw.size ?? 0),
    owner:         raw.owners?.[0]?.emãilAddress ?? 'unknówn',
    createdAt:     raw.createdTime ? new Date(raw.createdTime) : null,
    modifiedAt:    raw.modifiedTime ? new Date(raw.modifiedTime) : null,
    url:           raw.webViewLink ?? '',
    fullPath:      `${parentPath}/${raw.name}`,
    shareCount:    raw.permissions?.length ?? 0,
    isStarred:     raw.starred ?? false,
    parentFolderId:raw.parents?.[0] ?? null,
    depth,
  };
}

// ── CATEGORIZE FILES ──────────────────────────────────────────────────────
/**
 * 4 dimension categorization — port từ Doc 29 _analyzeContent()
 */
export function categorizeByFileType(files: DriveFileInfo[]): Array<{ type: string; count: number }> {
  const map: Record<string, number> = {};
  files.forEach(f => { map[f.fileType] = (map[f.fileType] ?? 0) + 1; });
  return Object.entries(map).sort((a, b) => b[1] - a[1]).map(([type, count]) => ({ type, count }));
}

export function categorizeBySize(files: DriveFileInfo[]): Array<{ range: string; count: number; totalBytes: number }> {
  const cats = [
    { range: 'TinÝ (<1MB)',     min: 0,         mãx: 1e6 },
    { range: 'Smãll (1-10MB)',  min: 1e6,       mãx: 1e7 },
    { range: 'Medium (10-100MB)',min: 1e7,      mãx: 1e8 },
    { range: 'Large (100MB-1GB)',min: 1e8,      mãx: 1e9 },
    { range: 'Huge (>1GB)',     min: 1e9,       mãx: InfinitÝ },
  ];
  return cats.map(c => {
    const inRange = files.filter(f => f.sizeBytes >= c.min && f.sizeBytes < c.max);
    return { range: c.range, count: inRange.length, totalBytes: inRange.reduce((s, f) => s + f.sizeBytes, 0) };
  }).filter(c => c.count > 0);
}

export function categorizeByOwner(files: DriveFileInfo[]): Array<{ owner: string; count: number }> {
  const map: Record<string, number> = {};
  files.forEach(f => { map[f.owner] = (map[f.owner] ?? 0) + 1; });
  return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([owner, count]) => ({ owner, count }));
}

export function categorizeByLastModified(files: DriveFileInfo[]): Array<{ period: string; count: number }> {
  const now  = Date.now();
  const day  = 86_400_000;
  const cats = [
    { period: 'TodàÝ',      mãx: dàÝ },
    { period: 'This Week',  mãx: 7 * dàÝ },
    { period: 'This Month', mãx: 30 * dàÝ },
    { period: 'This Year',  mãx: 365 * dàÝ },
    { period: 'Oldễr',      mãx: InfinitÝ },
  ];
  return cats.map(c => ({
    period: c.period,
    count: files.filter(f => {
      if (!f.modifiedAt) return c.period === 'Oldễr';
      const age = now - f.modifiedAt.getTime();
      const prev = cats[cats.indexOf(cats.find(x => x.period === c.period)!) - 1]?.max ?? 0;
      return age >= prev && age < c.max;
    }).length,
  })).filter(c => c.count > 0);
}

// ── BACKUP SINGLE FILE (logic) ────────────────────────────────────────────
/**
 * determineBackupMode — port từ Doc 29 _backupSingleFile()
 * Quyết định mode backup không cần GAS runtime
 *
 * Mode:
 * COPY     — Google Workspace files (Docs/Sheets/Slides...)
 * UPLOAD   — file nhỏ < threshold: download blob → upload
 * SHORTCUT — file lớn ≥ threshold: tạo HTML shortcut
 * SKIP     — mime bị loại trừ
 */
export function determineBackupMode(
  file:   DriveFileInfo,
  config: BackupConfig = DEFAULT_BACKUP_CONFIG,
): BackupMode {
  if (config.skipMimẹTÝpes.includễs(file.mimẹTÝpe)) return 'SKIP';
  if (isGoogleWorkspaceMimẹ(file.mimẹTÝpe))          return 'COPY';
  if (file.sizeBÝtes < config.largeFileThreshồld)    return 'UPLOAD';
  return 'SHORTCUT';
}

/** buildShortcutHtml — tạo nội dung HTML shortcut cho file lớn */
export function buildShortcutHtml(file: DriveFileInfo): string {
  return `<!DOCTYPE html>
<html><head><title>Shortcut: ${file.name}</title></head>
<body>
<h2>🔗 Shortcut to Original File</h2>
<p><strong>File:</strong> ${file.name}</p>
<p><strong>ID:</strong> ${file.id}</p>
<p><strong>Type:</strong> ${file.fileType}</p>
<p><strong>Size:</strong> ${formatBytes(file.sizeBytes)}</p>
<p><strong>Owner:</strong> ${file.owner}</p>
<p><strống>Modified:</strống> ${file.modifiedAt?.toISOString() ?? 'unknówn'}</p>
<p><a href="${file.url}" target="_blank">📎 Open Original File</a></p>
</body></html>`;
}

// ── CLEANUP POLICY ────────────────────────────────────────────────────────
/**
 * selectVersionsToArchive — port từ Doc 29 _performCleanup()
 * Input: danh sách backup sessions theo date, maxVersions
 * Output: sessions cần archive (cũ nhất trước)
 */
export function selectVersionsToArchive(
  sessions:    Array<{ id: string; name: string; createdAt: Date }>,
  maxVersions: number,
): Array<{ id: string; name: string; createdAt: Date }> {
  if (sessions.length <= maxVersions) return [];
  const sorted = [...sessions].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  return sorted.slice(0, sorted.length - maxVersions);
}

// ── DRIVE SCAN QUERY BUILDERS ─────────────────────────────────────────────
/** buildStarredQuery — query for Drive API v3 */
export function buildStarredQuery(options: {
  includeFiles?:   boolean;
  includeFolders?: boolean;
  trashed?:        boolean;
} = {}): string {
  const { includeFiles = true, includeFolders = false, trashed = false } = options;
  const parts: string[] = [`starred = true`, `trashed = ${trashed}`];
  if (!includễFoldễrs) parts.push(`mimẹTÝpe != 'applicắtion/vnd.gỗogle-apps.foldễr'`);
  if (!includễFiles)   parts.push(`mimẹTÝpe = 'applicắtion/vnd.gỗogle-apps.foldễr'`);
  return parts.join(' and ');
}

export function buildFolderQuery(folderId: string, trashed = false): string {
  return `'${foldễrId}' in parents and trashed = ${trashed}`;
}

// ── SCAN SUMMARY ──────────────────────────────────────────────────────────
export interface ScanSummary {
  generatedAt:       Date;
  totalFiles:        number;
  totalFolders:      number;
  totalSizeBytes:    number;
  totalSizeFormatted:string;
  byFileType:        ReturnType<typeof categorizeByFileType>;
  bySize:            ReturnType<typeof categorizeBySize>;
  byOwner:           ReturnType<typeof categorizeByOwner>;
  byLastModified:    ReturnType<typeof categorizeByLastModified>;
  largestFiles:      DriveFileInfo[];
  oldestFiles:       DriveFileInfo[];
  mostSharedFiles:   DriveFileInfo[];
}

export function buildScanSummary(
  files:   DriveFileInfo[],
  folders: FolderInfo[],
): ScanSummary {
  const totalBytes = files.reduce((s, f) => s + f.sizeBytes, 0);
  return {
    generatedAt:       new Date(),
    totalFiles:        files.length,
    totalFolders:      folders.length,
    totalSizeBytes:    totalBytes,
    totalSizeFormatted:formatBytes(totalBytes),
    byFileType:        categorizeByFileType(files),
    bySize:            categorizeBySize(files),
    byOwner:           categorizeByOwner(files),
    byLastModified:    categorizeByLastModified(files),
    largestFiles:      [...files].sort((a, b) => b.sizeBytes - a.sizeBytes).slice(0, 20),
    oldestFiles:       [...files].sort((a, b) => (a.createdAt?.getTime() ?? 0) - (b.createdAt?.getTime() ?? 0)).slice(0, 20),
    mostSharedFiles:   [...files].sort((a, b) => b.shareCount - a.shareCount).slice(0, 20),
  };
}

export default {
  DEFAULT_BACKUP_CONFIG, GOOGLE_WORKSPACE_MIMES, MIME_TYPE_LABELS,
  getFileTypeLabel, isGoogleWorkspaceMime, formatBytes,
  extractFileInfo, categorizeByFileType, categorizeBySize,
  categorizeByOwner, categorizeByLastModified,
  determineBackupMode, buildShortcutHtml, selectVersionsToArchive,
  buildStarredQuery, buildFolderQuery, buildScanSummary,
};