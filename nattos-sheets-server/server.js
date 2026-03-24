/**
 * NATT-OS Sheets Server v2.0
 * Port 3001 — Google Sheets + Local XLSX + GSheets Sync
 */
'use strict';

const express = require('express');
const cors    = require('cors');
const path    = require('path');
const fs      = require('fs');
const { google } = require('googleapis');

const app  = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// ── SERVICE ACCOUNT AUTH ──────────────────────────────────────────────────
const SA_KEY_PATH = path.join(__dirname, 'nattos-google-sa.json');

function getAuth() {
  const key = JSON.parse(fs.readFileSync(SA_KEY_PATH, 'utf8'));
  return new google.auth.GoogleAuth({
    credentials: key,
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive.readonly',
    ],
  });
}

// ── CONFIG ────────────────────────────────────────────────────────────────
const MASTER_SHEET_ID = '1d5PQxqOYMOs_kVUcN-cxXSQLuUj97CHpyXC1XaRQECg';

const SHEETS = {
  dh_phu_luc:     { id: MASTER_SHEET_ID, name: 'Phụ Lục ĐH',         category: 'orders',     tab: '[ĐIỀU PHỐI ]__PHỤ LỤC' },
  dh_uyen:        { id: MASTER_SHEET_ID, name: 'ĐH Uyên',            category: 'orders',     tab: '[ĐIỀU PHỐI ]__ĐH UYÊN' },
  qtsx:           { id: MASTER_SHEET_ID, name: 'QTSX',               category: 'production', tab: '[ĐIỀU PHỐI ]__QTSX' },
  dh_hangngay:    { id: MASTER_SHEET_ID, name: 'ĐH Hàng Ngày',      category: 'orders',     tab: '[ĐIỀU PHỐI ]__ĐH hàng ngày' },
  giao_nhan:      { id: MASTER_SHEET_ID, name: 'Báo Cáo Giao Nhận', category: 'logistics',  tab: '[ĐIỀU PHỐI ]__BÁO CÁO GIAO NHẬN' },
  tong_hop_cho:   { id: MASTER_SHEET_ID, name: 'Tổng Hợp Chờ',      category: 'orders',     tab: '[ĐIỀU PHỐI ]__TỔNG HỢP CHỜ' },
  da_chu:         { id: MASTER_SHEET_ID, name: 'Đá Chủ',             category: 'production', tab: '[ĐIỀU PHỐI ]__Đá Chủ' },
  psx_tong_hop:   { id: MASTER_SHEET_ID, name: 'PSX Tổng Hợp',      category: 'production', tab: '[PSX- THEO ]__Tổng Hợp' },
  psx_phu_luc:    { id: MASTER_SHEET_ID, name: 'PSX Phụ Lục',       category: 'production', tab: '[PSX- THEO ]__Phụ Lục' },
  psx_data:       { id: MASTER_SHEET_ID, name: 'PSX Data Nguồn',    category: 'production', tab: '[PSX- THEO ]__Data Nguồn' },
  system_log:     { id: MASTER_SHEET_ID, name: 'System Log',        category: 'system',     tab: 'SYSTEM_LOG' },
  data_map:       { id: MASTER_SHEET_ID, name: 'Data Map',          category: 'system',     tab: '_DATA_MAP' },
};

const SOURCE_FILE_IDS = [
  '1hgjfgDLy55T-yS-iGImFdm8iUN5SQPA0z00Vaj8JLzc',
  '1GRZ-u_fxbzua--IHpepeVql-6iBc8MOojuFn2yAbCDQ',
  '1hgzVjtCE50HJnm3y49v0IMUIz3tvaqUnnIXlA9LQIv8',
  '1S0GvwQbaDuaDL1k0OAAo68jOAqu2SOES48BB_Vt2_M0',
  '1Yth_pfX-0_w6FNz4rPbmJm81IDCW3-d4C7E5QhfvAG8',
  '1YlbwhCwpKIBpFeF2iT-EBPyGESao0Vad3ABSL67lAmg',
  '1Eg0ASCDvKZZ1nqa6r5HhqWGb00-OFz0dy7d1cJqSYOk',
  '1j9qDMrkcfiRVBHJAQWstOq8lA8OWK5mhB3ClNaO9d-g',
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

// P2 — Live tabs (L6/L7/L8 data sources)
const LIVE_TABS = {
  can_hang_ngay:   { gsheetName: '[PSX- THEO ]__Cân Hàng Ngày',   localName: 'Cân Hàng Ngày',    priority: 'L6_PHO',    maxRows: 2000 },
  can_nguyen_lieu: { gsheetName: '[PSX- THEO ]__Cân Nguyên Liệu', localName: 'Cân Nguyên Liệu',  priority: 'L7_NL_PHU', maxRows: 5000 },
  data_giao_nhan:  { gsheetName: '[PSX- THEO ]__Data Giao Nhận',  localName: 'Data Giao Nhận',   priority: 'L8_SC',     maxRows: 4000 },
  xn_daily:        { gsheetName: '[MR. TIẾN []__X-N Daily',       localName: 'MR. TIẾN X-N Daily',priority: 'L8_KC',    maxRows: 6000 },
  qtsx_live:       { gsheetName: '[ĐIỀU PHỐI ]__QTSX',            localName: 'ĐIỀU PHỐI QTSX',   priority: 'FLOW',      maxRows: 20000 },
};

// ── CACHE ────────────────────────────────────────────────────────────────
const cache     = {};
const liveCache = {};
let lastSyncAt  = null;
let syncStatus  = 'NEVER';
const CACHE_TTL = 5 * 60 * 1000;

// ── SHEETS HELPERS ────────────────────────────────────────────────────────
async function readSheet(sheetId, range) {
  const cacheKey = `${sheetId}::${range}`;
  if (cache[cacheKey] && (Date.now() - cache[cacheKey].ts) < CACHE_TTL) {
    return cache[cacheKey].data;
  }
  const auth   = getAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  const resp   = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range });
  const data   = resp.data.values || [];
  cache[cacheKey] = { data, ts: Date.now() };
  return data;
}

async function getSheetMeta(sheetId) {
  const auth   = getAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  const resp   = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
  return { title: resp.data.properties.title, sheets: resp.data.sheets.map(s => s.properties.title) };
}

async function writeSheet(sheetId, range, values) {
  const auth   = getAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  await sheets.spreadsheets.values.update({ spreadsheetId: sheetId, range, valueInputOption: 'USER_ENTERED', requestBody: { values } });
  Object.keys(cache).forEach(k => { if (k.startsWith(sheetId)) delete cache[k]; });
}

async function appendSheet(sheetId, range, values) {
  const auth   = getAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  await sheets.spreadsheets.values.append({ spreadsheetId: sheetId, range, valueInputOption: 'USER_ENTERED', insertDataOption: 'INSERT_ROWS', requestBody: { values } });
  Object.keys(cache).forEach(k => { if (k.startsWith(sheetId)) delete cache[k]; });
}

// ── LOCAL XLSX HELPER ─────────────────────────────────────────────────────
function readLocalTab(tabName) {
  try {
    const XLSX     = require('xlsx');
    const xlsxPath = path.join(__dirname, 'line-production.xlsx');
    const wb       = XLSX.readFile(xlsxPath);
    const ws       = wb.Sheets[tabName];
    if (!ws) return null;
    const rows    = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
    const headers = rows[0] || [];
    const records = rows.slice(1).map(row => {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = row[i] ?? ''; });
      return obj;
    });
    return { localName: tabName, headers, rows: rows.length, records, source: 'local_xlsx' };
  } catch { return null; }
}

function readLocalByName(tabName) {
  try {
    const XLSX     = require('xlsx');
    const xlsxPath = path.join(__dirname, 'line-production.xlsx');
    const wb       = XLSX.readFile(xlsxPath);
    const ws       = wb.Sheets[tabName];
    if (!ws) return null;
    return XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
  } catch { return []; }
}

// ── P2: PULL FROM GSHEETS ─────────────────────────────────────────────────
async function pullTabFromGSheets(tabKey) {
  const tab = LIVE_TABS[tabKey];
  if (!tab) return { error: 'Unknown tab key' };

  try {
    const auth   = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const range  = `'${tab.gsheetName}'!A1:Z${tab.maxRows}`;
    const resp   = await sheets.spreadsheets.values.get({ spreadsheetId: MASTER_SHEET_ID, range });
    const rows    = resp.data.values || [];
    const headers = rows[0] || [];
    const records = rows.slice(1).map(row => {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = row[i] ?? ''; });
      return obj;
    });
    liveCache[tabKey] = { tabKey, gsheetName: tab.gsheetName, localName: tab.localName, headers, rows: rows.length, records, syncedAt: new Date().toISOString(), source: 'gsheets' };
    return liveCache[tabKey];
  } catch (err) {
    const localData = readLocalTab(tab.localName);
    if (localData) {
      liveCache[tabKey] = { ...localData, tabKey, source: 'local_fallback', gsheetsError: err.message };
      return liveCache[tabKey];
    }
    return { error: err.message, tabKey, hint: 'Share sheet cho SA trước' };
  }
}

// ══════════════════════════════════════════════════════
// ROUTES
// ══════════════════════════════════════════════════════

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', server: 'NATT-OS Sheets Server v2.0', sheets: Object.keys(SHEETS).length, liveTabs: Object.keys(LIVE_TABS).length, sa: 'nattos-drive-sync-sa@sys-84301997471976129074482048.iam.gserviceaccount.com', timestamp: new Date().toISOString() });
});

app.get('/api/sheets', (req, res) => res.json(SHEETS));

app.get('/api/sources', (req, res) => res.json({ count: SOURCE_FILE_IDS.length, ids: SOURCE_FILE_IDS }));

app.get('/api/sheets/:key', async (req, res) => {
  const sheet = SHEETS[req.params.key];
  if (!sheet) return res.status(404).json({ error: 'Sheet key không tìm thấy' });
  try {
    const range = req.query.range || 'A1:Z200';
    const [data, meta] = await Promise.all([readSheet(sheet.id, range), getSheetMeta(sheet.id).catch(() => null)]);
    res.json({ key: req.params.key, sheet, meta, rows: data.length, data, headers: data[0] || [], records: data.slice(1), fetchedAt: new Date().toISOString() });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/read/:sheetId', async (req, res) => {
  try {
    const data = await readSheet(req.params.sheetId, req.query.range || 'A1:Z200');
    res.json({ sheetId: req.params.sheetId, rows: data.length, data, fetchedAt: new Date().toISOString() });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/sheets/:key/write', async (req, res) => {
  const sheet = SHEETS[req.params.key];
  if (!sheet) return res.status(404).json({ error: 'Sheet key không tìm thấy' });
  try { await writeSheet(sheet.id, req.body.range, req.body.values); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/sheets/:key/append', async (req, res) => {
  const sheet = SHEETS[req.params.key];
  if (!sheet) return res.status(404).json({ error: 'Sheet key không tìm thấy' });
  try { await appendSheet(sheet.id, req.body.range || 'A:Z', req.body.values); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/summary', async (req, res) => {
  const results = {};
  await Promise.allSettled(Object.keys(SHEETS).map(async key => {
    const sheet = SHEETS[key];
    try {
      const [data, meta] = await Promise.all([readSheet(sheet.id, 'A1:Z50'), getSheetMeta(sheet.id).catch(() => null)]);
      results[key] = { ...sheet, meta, rows: data.length, headers: data[0] || [], preview: data.slice(1, 6), status: 'ok' };
    } catch (err) { results[key] = { ...sheet, status: 'error', error: err.message }; }
  }));
  const okCount = Object.values(results).filter(r => r.status === 'ok').length;
  res.json({ summary: { total: Object.keys(SHEETS).length, ok: okCount, errors: Object.keys(SHEETS).length - okCount }, sheets: results, fetchedAt: new Date().toISOString() });
});

app.post('/api/cache/clear', (req, res) => {
  const count = Object.keys(cache).length;
  Object.keys(cache).forEach(k => delete cache[k]);
  res.json({ ok: true, cleared: count });
});

// ── LOCAL XLSX ROUTES ─────────────────────────────────────────────────────
app.get('/api/local/_list', (req, res) => {
  try {
    const XLSX  = require('xlsx');
    const wb    = XLSX.readFile(path.join(__dirname, 'line-production.xlsx'));
    res.json({ tabs: wb.SheetNames, count: wb.SheetNames.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/local/:tabName', (req, res) => {
  const tabName  = decodeURIComponent(req.params.tabName);
  const maxRows  = parseInt(req.query.max || '500');
  const data     = readLocalByName(tabName);
  if (!data || data.length === 0) return res.status(404).json({ error: `Tab "${tabName}" không tìm thấy trong xlsx` });
  const headers  = data[0] || [];
  const rows     = data.slice(1, maxRows + 1);
  const records  = rows.map(row => { const obj = {}; headers.forEach((h, i) => { obj[h] = row[i] ?? ''; }); return obj; });
  res.json({ tabName, headers, rows: rows.length, totalRows: data.length - 1, records, source: 'local_xlsx', fetchedAt: new Date().toISOString() });
});

app.get('/api/local', (req, res) => {
  try {
    const XLSX = require('xlsx');
    const wb   = XLSX.readFile(path.join(__dirname, 'line-production.xlsx'));
    const info = {};
    wb.SheetNames.forEach(name => {
      const ws = wb.Sheets[name];
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
      info[name] = { rows: rows.length - 1, headers: (rows[0] || []).slice(0, 6) };
    });
    res.json({ tabs: wb.SheetNames.length, sheets: info });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── P2: GSHEETS SYNC ROUTES ───────────────────────────────────────────────
app.get('/api/gsheets/status', async (req, res) => {
  let masterCheck = { ok: false, error: 'Not tested' };
  try {
    const auth   = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const resp   = await sheets.spreadsheets.values.get({ spreadsheetId: MASTER_SHEET_ID, range: 'A1:B2' });
    masterCheck  = { ok: true, rows: resp.data.values?.length ?? 0 };
  } catch (err) {
    masterCheck = { ok: false, error: err.message, fix: 'Share sheet cho SA: nattos-drive-sync-sa@sys-84301997471976129074482048.iam.gserviceaccount.com (Viewer)' };
  }
  res.json({ sa: 'nattos-drive-sync-sa@sys-84301997471976129074482048.iam.gserviceaccount.com', masterSheetId: MASTER_SHEET_ID, lastSyncAt, syncStatus, cacheKeys: Object.keys(liveCache), masterCheck });
});

app.post('/api/gsheets/sync', async (req, res) => {
  syncStatus = 'RUNNING';
  const results = {};
  const keys = Object.keys(LIVE_TABS);
  await Promise.allSettled(keys.map(async key => {
    const result = await pullTabFromGSheets(key);
    results[key] = { source: result.source || 'error', rows: result.rows || 0, records: result.records?.length || 0, syncedAt: result.syncedAt, error: result.error, priority: LIVE_TABS[key].priority };
  }));
  lastSyncAt = new Date().toISOString();
  const okCount = Object.values(results).filter(r => r.source !== 'error').length;
  syncStatus = okCount === keys.length ? 'OK' : okCount > 0 ? 'PARTIAL' : 'FAILED';
  res.json({ ok: okCount > 0, syncStatus, lastSyncAt, summary: { total: keys.length, ok: okCount, failed: keys.length - okCount }, results });
});

app.get('/api/live/:tabKey', async (req, res) => {
  const { tabKey } = req.params;
  if (!LIVE_TABS[tabKey]) return res.status(404).json({ error: 'Tab không tìm thấy', available: Object.keys(LIVE_TABS) });
  const cached   = liveCache[tabKey];
  const cacheAge = cached ? (Date.now() - new Date(cached.syncedAt).getTime()) : Infinity;
  if (req.query.refresh !== '1' && cached && cacheAge < 15 * 60 * 1000) {
    return res.json({ ...cached, cacheAge: Math.round(cacheAge / 1000) + 's' });
  }
  const data = await pullTabFromGSheets(tabKey);
  res.json(data);
});

app.get('/api/l678/analyze', async (req, res) => {
  const needed = ['can_hang_ngay', 'can_nguyen_lieu', 'data_giao_nhan', 'xn_daily'];
  const serverData = {};
  for (const key of needed) {
    const tab    = LIVE_TABS[key];
    const cached = liveCache[key];
    const data   = cached || await pullTabFromGSheets(key);
    serverData[tab.localName] = { rows: data.rows, records: data.records, source: data.source };
  }
  res.json({ ok: true, data: serverData, hint: 'Client: SmartGetData.runL678Analysis(response.data)' });
});

// ── START ─────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n[NATT-OS Sheets Server v2.0] http://localhost:${PORT}`);
  console.log(`[SA] nattos-drive-sync-sa@sys-84301997471976129074482048.iam.gserviceaccount.com`);
  console.log(`[Sheets] ${Object.keys(SHEETS).length} sheets | [LiveTabs] ${Object.keys(LIVE_TABS).length} tabs`);
  console.log('\nAPI:');
  console.log('  GET  /api/health');
  console.log('  GET  /api/local/_list         — list xlsx tabs');
  console.log('  GET  /api/local/:tabName       — read xlsx tab');
  console.log('  POST /api/gsheets/sync         — pull GSheets → cache (P2)');
  console.log('  GET  /api/gsheets/status       — check SA auth');
  console.log('  GET  /api/live/:tabKey         — L6/L7/L8 data');
  console.log('  GET  /api/l678/analyze         — all L678 data\n');
});
