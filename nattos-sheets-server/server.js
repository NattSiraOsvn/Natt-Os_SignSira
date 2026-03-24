/**
 * NATT-OS Google Sheets Monitoring Server v1.0
 * Tâm Luxury — Giám sát ngầm luồng SX + Kho + Doanh Thu
 *
 * Chạy: node server.js
 * Port: 3001 (song song với ui-app trên 3000)
 *
 * SA: nattos-drive-sync-sa@sys-84301997471976129074482048.iam.gserviceaccount.com
 */

const express = require('express');
const cors    = require('cors');
const { google } = require('googleapis');
const path    = require('path');
const fs      = require('fs');

const app  = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// ── SERVICE ACCOUNT AUTH ─────────────────────────────────────────────────────
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

// ── SHEET IDs CONFIG ──────────────────────────────────────────────────────────
// ── MASTER SHEET — Luồng SX (gộp tất cả tabs) ──
// Sheet ID: 1d5PQxqOYMOs_kVUcN-cxXSQLuUj97CHpyXC1XaRQECg
// Anh Natt gộp 8 sheets → 1 master sheet nhiều tabs
const MASTER_SHEET_ID = '1d5PQxqOYMOs_kVUcN-cxXSQLuUj97CHpyXC1XaRQECg';

// ── MASTER SHEET — Luồng SX ──
const MASTER_SHEET_ID = '1d5PQxqOYMOs_kVUcN-cxXSQLuUj97CHpyXC1XaRQECg';

// Tab names thật từ sheet (verified 2026-03-24)
const SHEETS = {
  // === ĐIỀU PHỐI ===
  dh_phu_luc:     { id: MASTER_SHEET_ID, name: 'Phụ Lục ĐH',         category: 'orders',      tab: '[ĐIỀU PHỐI ]__PHỤ LỤC' },
  dh_uyen:        { id: MASTER_SHEET_ID, name: 'ĐH Uyên',            category: 'orders',      tab: '[ĐIỀU PHỐI ]__ĐH UYÊN' },
  qtsx:           { id: MASTER_SHEET_ID, name: 'QTSX',               category: 'production',  tab: '[ĐIỀU PHỐI ]__QTSX' },
  dh_hangngay:    { id: MASTER_SHEET_ID, name: 'ĐH Hàng Ngày',      category: 'orders',      tab: '[ĐIỀU PHỐI ]__ĐH hàng ngày' },
  giao_nhan:      { id: MASTER_SHEET_ID, name: 'Báo Cáo Giao Nhận', category: 'logistics',   tab: '[ĐIỀU PHỐI ]__BÁO CÁO GIAO NHẬN' },
  tong_hop_cho:   { id: MASTER_SHEET_ID, name: 'Tổng Hợp Chờ',      category: 'orders',      tab: '[ĐIỀU PHỐI ]__TỔNG HỢP CHỜ' },
  da_chu:         { id: MASTER_SHEET_ID, name: 'Đá Chủ',             category: 'production',  tab: '[ĐIỀU PHỐI ]__Đá Chủ' },
  // === PSX THEO DÕI ===
  psx_tong_hop:   { id: MASTER_SHEET_ID, name: 'PSX Tổng Hợp',      category: 'production',  tab: '[PSX- THEO ]__Tổng Hợp' },
  psx_phu_luc:    { id: MASTER_SHEET_ID, name: 'PSX Phụ Lục',       category: 'production',  tab: '[PSX- THEO ]__Phụ Lục' },
  psx_data:       { id: MASTER_SHEET_ID, name: 'PSX Data Nguồn',    category: 'production',  tab: '[PSX- THEO ]__Data Nguồn' },
  // === HỆ THỐNG ===
  system_log:     { id: MASTER_SHEET_ID, name: 'System Log',        category: 'system',      tab: 'SYSTEM_LOG' },
  data_map:       { id: MASTER_SHEET_ID, name: 'Data Map',          category: 'system',      tab: '_DATA_MAP' },
};

// ── CACHE ─────────────────────────────────────────────────────────────────────
const cache = {};
const CACHE_TTL_MS = 30 * 1000; // 30 giây

function isCacheValid(key) {
  return cache[key] && (Date.now() - cache[key].ts) < CACHE_TTL_MS;
}

// ── READ SHEET ────────────────────────────────────────────────────────────────
async function readSheet(sheetId, range = 'A1:Z200') {
  const cacheKey = `${sheetId}:${range}`;
  if (isCacheValid(cacheKey)) return cache[cacheKey].data;

  try {
    const auth   = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const res    = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range,
    });
    const data = res.data.values || [];
    cache[cacheKey] = { ts: Date.now(), data };
    return data;
  } catch (err) {
    console.error(`[Sheets] Error reading ${sheetId}:`, err.message);
    throw err;
  }
}


// Helper: đọc theo tab name
async function readSheetTab(sheetId, tabName, range = 'A1:Z500') {
  const fullRange = tabName ? `${tabName}!${range}` : range;
  return readSheet(sheetId, fullRange);
}

// ── GET SHEET META ────────────────────────────────────────────────────────────
async function getSheetMeta(sheetId) {
  const cacheKey = `meta:${sheetId}`;
  if (isCacheValid(cacheKey)) return cache[cacheKey].data;

  try {
    const auth   = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const res    = await sheets.spreadsheets.get({
      spreadsheetId: sheetId,
      fields: 'properties,sheets.properties',
    });
    const data = {
      title:       res.data.properties?.title,
      sheetTabs:   res.data.sheets?.map(s => s.properties?.title),
      lastUpdated: new Date().toISOString(),
    };
    cache[cacheKey] = { ts: Date.now(), data };
    return data;
  } catch (err) {
    console.error(`[Sheets] Meta error ${sheetId}:`, err.message);
    throw err;
  }
}

// ── WRITE SHEET ───────────────────────────────────────────────────────────────
async function writeSheet(sheetId, range, values) {
  const auth   = getAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values },
  });
  // Invalidate cache
  Object.keys(cache).forEach(k => { if (k.startsWith(sheetId)) delete cache[k]; });
}

// ── APPEND TO SHEET ───────────────────────────────────────────────────────────
async function appendSheet(sheetId, range, values) {
  const auth   = getAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values },
  });
  Object.keys(cache).forEach(k => { if (k.startsWith(sheetId)) delete cache[k]; });
}

// ══════════════════════════════════════════════════════
// API ROUTES
// ══════════════════════════════════════════════════════

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    server: 'NATT-OS Sheets Server v1.0',
    sheets: Object.keys(SHEETS).length,
    sa: 'nattos-drive-sync-sa@sys-84301997471976129074482048.iam.gserviceaccount.com',
    timestamp: new Date().toISOString(),
  });
});

// List all configured sheets
app.get('/api/sheets', (req, res) => {
  res.json(SHEETS);
});

// Read a specific sheet
app.get('/api/sheets/:key', async (req, res) => {
  const { key } = req.params;
  const range   = req.query.range || 'A1:Z200';
  const sheet   = SHEETS[key];
  if (!sheet) return res.status(404).json({ error: 'Sheet key không tìm thấy' });

  try {
    const [data, meta] = await Promise.all([
      readSheet(sheet.id, range),
      getSheetMeta(sheet.id).catch(() => null),
    ]);
    res.json({
      key, sheet, meta,
      rows: data.length,
      data,
      headers: data[0] || [],
      records: data.slice(1),
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message, detail: 'Kiểm tra SA đã được share vào Sheet chưa' });
  }
});

// Read by Sheet ID directly
app.get('/api/read/:sheetId', async (req, res) => {
  const { sheetId } = req.params;
  const range = req.query.range || 'A1:Z200';
  try {
    const data = await readSheet(sheetId, range);
    res.json({ sheetId, rows: data.length, data, fetchedAt: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Write to sheet
app.post('/api/sheets/:key/write', async (req, res) => {
  const { key } = req.params;
  const { range, values } = req.body;
  const sheet = SHEETS[key];
  if (!sheet) return res.status(404).json({ error: 'Sheet key không tìm thấy' });
  try {
    await writeSheet(sheet.id, range, values);
    res.json({ ok: true, message: `Đã ghi vào ${sheet.name}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Append row
app.post('/api/sheets/:key/append', async (req, res) => {
  const { key } = req.params;
  const { range, values } = req.body;
  const sheet = SHEETS[key];
  if (!sheet) return res.status(404).json({ error: 'Sheet key không tìm thấy' });
  try {
    await appendSheet(sheet.id, range || 'A:Z', values);
    res.json({ ok: true, message: `Đã thêm dòng vào ${sheet.name}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Summary — đọc tất cả sheets cùng lúc
app.get('/api/summary', async (req, res) => {
  const results = {};
  const keys = Object.keys(SHEETS);

  await Promise.allSettled(
    keys.map(async key => {
      const sheet = SHEETS[key];
      try {
        const [data, meta] = await Promise.all([
          readSheet(sheet.id, 'A1:Z50'),
          getSheetMeta(sheet.id).catch(() => null),
        ]);
        results[key] = {
          ...sheet,
          meta,
          rows: data.length,
          headers: data[0] || [],
          preview: data.slice(1, 6), // 5 rows preview
          status: 'ok',
        };
      } catch (err) {
        results[key] = { ...sheet, status: 'error', error: err.message };
      }
    })
  );

  const okCount    = Object.values(results).filter(r => r.status === 'ok').length;
  const errorCount = Object.values(results).filter(r => r.status === 'error').length;

  res.json({
    summary: { total: keys.length, ok: okCount, errors: errorCount },
    sheets: results,
    fetchedAt: new Date().toISOString(),
  });
});

// Clear cache
app.post('/api/cache/clear', (req, res) => {
  const count = Object.keys(cache).length;
  Object.keys(cache).forEach(k => delete cache[k]);
  res.json({ ok: true, cleared: count });
});


// ── SOURCE FILE IDs (19 Tâm Luxury files — từ JustU v9.0) ────────────────
const SOURCE_FILE_IDS = [
  '1hgjfgDLy55T-yS-iGImFdm8iUN5SQPA0z00Vaj8JLzc',
  '1GRZ-u_fxbzua--IHpepeVql-6iBc8MOojuFn2yAbCDQ',
  '1hgzVjtCE50HJnm3y49v0IMUIz3tvaqUnnIXlA9LQIv8',
  '1S0GvwQbaDuaDL1k0OAAo68jOAqu2SOES48BB_Vt2_M0',
  '1Yth_pfX-0_w6FNz4rPbmJm81IDCW3-d4C7E5QhfvAG8',
  '1YlbwhCwpKIBpFeF2iT-EBPyGESao0Vad3ABSL67lAmg',
  '1Eg0ASCDvKZZ1nqa6r5HhqWGb00-OFz0dy7d1cJqSYOk',
  '1j9qDMrkcfiRVBHJAQWstOq8lA8OWK5mhB3ClNaO9d-g', // Luồng SX Master
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

// ── /api/sources — list tất cả file nguồn ────────────────────────────────
app.get('/api/sources', (req, res) => {
  res.json({ total: SOURCE_FILE_IDS.length, fileIds: SOURCE_FILE_IDS });
});

// ── /api/local/:tabName — upgrade: support tab fuzzy match ───────────────

// ── START ──────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n[NATT-OS Sheets Server] http://localhost:${PORT}`);
  console.log(`[SA] nattos-drive-sync-sa@sys-84301997471976129074482048.iam.gserviceaccount.com`);
  console.log(`[Sheets] ${Object.keys(SHEETS).length} sheets configured`);
  console.log(`\nAPI Endpoints:`);
  console.log(`  GET  /api/health`);
  console.log(`  GET  /api/summary           — tất cả sheets`);
  console.log(`  GET  /api/sheets/:key        — đọc sheet (sx1..sx8)`);
  console.log(`  GET  /api/read/:sheetId      — đọc theo ID trực tiếp`);
  console.log(`  POST /api/sheets/:key/write  — ghi vào sheet`);
  console.log(`  POST /api/sheets/:key/append — thêm dòng\n`);
});
/**
 * NATT-OS GSheets Sync Routes — P2
 * Thêm vào server.js (append trước dòng app.listen)
 *
 * /api/gsheets/sync  — pull 5 tab quan trọng từ master sheet → cache local
 * /api/gsheets/status — kiểm tra SA đã được share chưa
 * /api/live/:tabKey  — đọc GSheets realtime (fallback → local xlsx)
 */

const LIVE_TABS = {
  can_hang_ngay: {
    gsheetName: '[PSX- THEO ]__Cân Hàng Ngày',
    localName:  'Cân Hàng Ngày',
    priority:   'L6_PHO_MONITOR',
    maxRows:    2000,
  },
  can_nguyen_lieu: {
    gsheetName: '[PSX- THEO ]__Cân Nguyên Liệu',
    localName:  'Cân Nguyên Liệu',
    priority:   'L7_NL_PHU',
    maxRows:    5000,
  },
  data_giao_nhan: {
    gsheetName: '[PSX- THEO ]__Data Giao Nhận',
    localName:  'Data Giao Nhận',
    priority:   'L8_SC_WEIGHT',
    maxRows:    4000,
  },
  xn_daily: {
    gsheetName: '[MR. TIẾN []__X-N Daily',
    localName:  'MR. TIẾN X-N Daily',
    priority:   'L8_DIAMOND',
    maxRows:    6000,
  },
  qtsx: {
    gsheetName: '[ĐIỀU PHỐI ]__QTSX',
    localName:  'ĐIỀU PHỐI QTSX',
    priority:   'PRODUCTION_FLOW',
    maxRows:    20000,
  },
};

// In-memory sync cache
const liveCache = {};
let lastSyncAt  = null;
let syncStatus  = 'NEVER';

// ── PULL FROM GSHEETS ─────────────────────────────────────────────────────────
async function pullTabFromGSheets(tabKey) {
  const tab = LIVE_TABS[tabKey];
  if (!tab) return { error: 'Unknown tab key' };

  try {
    const auth   = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const range  = `'${tab.gsheetName}'!A1:Z${tab.maxRows}`;

    const resp = await sheets.spreadsheets.values.get({
      spreadsheetId: MASTER_SHEET_ID,
      range,
    });

    const rows    = resp.data.values || [];
    const headers = rows[0] || [];
    const records = rows.slice(1).map(row => {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = row[i] ?? ''; });
      return obj;
    });

    liveCache[tabKey] = {
      tabKey, gsheetName: tab.gsheetName, localName: tab.localName,
      headers, rows: rows.length, records,
      syncedAt: new Date().toISOString(), source: 'gsheets',
    };

    return liveCache[tabKey];
  } catch (err) {
    // Fallback: đọc từ local xlsx
    const localData = readLocalTab(tab.localName);
    if (localData) {
      liveCache[tabKey] = { ...localData, tabKey, source: 'local_fallback', error: err.message };
      return liveCache[tabKey];
    }
    return { error: err.message, tabKey, hint: 'Share sheet cho SA: nattos-drive-sync-sa@sys-84301997471976129074482048.iam.gserviceaccount.com' };
  }
}

// Helper đọc local xlsx theo tab name
function readLocalTab(tabName) {
  try {
    const XLSX      = require('xlsx');
    const xlsxPath  = path.join(__dirname, 'line-production.xlsx');
    const wb        = XLSX.readFile(xlsxPath);
    const ws        = wb.Sheets[tabName];
    if (!ws) return null;
    const rows    = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
    const headers = rows[0] || [];
    const records = rows.slice(1).map(row => {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = row[i] ?? ''; });
      return obj;
    });
    return { localName: tabName, headers, rows: rows.length, records };
  } catch { return null; }
}

// ── ROUTES ────────────────────────────────────────────────────────────────────

// P2 — Status: SA được share chưa?
app.get('/api/gsheets/status', async (req, res) => {
  const checks = {};
  try {
    const auth   = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    // Thử đọc 1 cell để check quyền
    const resp = await sheets.spreadsheets.values.get({
      spreadsheetId: MASTER_SHEET_ID,
      range: 'A1:B2',
    });
    checks.masterSheet = { ok: true, rows: resp.data.values?.length ?? 0 };
  } catch (err) {
    checks.masterSheet = {
      ok: false, error: err.message,
      fix: `Vào Google Sheets → Share → Thêm: nattos-drive-sync-sa@sys-84301997471976129074482048.iam.gserviceaccount.com (Viewer)`,
    };
  }

  res.json({
    sa: 'nattos-drive-sync-sa@sys-84301997471976129074482048.iam.gserviceaccount.com',
    masterSheetId: MASTER_SHEET_ID,
    lastSyncAt, syncStatus,
    cacheKeys: Object.keys(liveCache),
    checks,
  });
});

// P2 — Sync: pull 5 tab từ GSheets vào cache
app.post('/api/gsheets/sync', async (req, res) => {
  syncStatus = 'RUNNING';
  const results = {};
  const keys = Object.keys(LIVE_TABS);

  await Promise.allSettled(
    keys.map(async key => {
      const result = await pullTabFromGSheets(key);
      results[key] = {
        source:    result.source || 'error',
        rows:      result.rows   || 0,
        records:   result.records?.length || 0,
        syncedAt:  result.syncedAt,
        error:     result.error,
        priority:  LIVE_TABS[key].priority,
      };
    })
  );

  lastSyncAt = new Date().toISOString();
  const okCount = Object.values(results).filter(r => r.source !== 'error').length;
  syncStatus = okCount === keys.length ? 'OK' : okCount > 0 ? 'PARTIAL' : 'FAILED';

  res.json({
    ok: okCount > 0, syncStatus, lastSyncAt,
    summary: { total: keys.length, ok: okCount, failed: keys.length - okCount },
    results,
  });
});

// P2 — Live read: đọc tab từ cache hoặc pull realtime
app.get('/api/live/:tabKey', async (req, res) => {
  const { tabKey } = req.params;
  const forceRefresh = req.query.refresh === '1';

  if (!LIVE_TABS[tabKey]) {
    return res.status(404).json({
      error: 'Tab không tìm thấy',
      available: Object.keys(LIVE_TABS),
    });
  }

  // Serve from cache nếu còn mới (< 15 phút)
  const cached = liveCache[tabKey];
  const cacheAge = cached ? (Date.now() - new Date(cached.syncedAt).getTime()) : Infinity;
  const CACHE_TTL = 15 * 60 * 1000;

  if (!forceRefresh && cached && cacheAge < CACHE_TTL) {
    return res.json({ ...cached, cacheAge: Math.round(cacheAge / 1000) + 's' });
  }

  // Pull fresh
  const data = await pullTabFromGSheets(tabKey);
  res.json(data);
});

// P3 — L678 analysis endpoint
app.get('/api/l678/analyze', async (req, res) => {
  // Load 3 tab cần thiết
  const needed = ['can_hang_ngay', 'can_nguyen_lieu', 'data_giao_nhan', 'xn_daily'];
  const serverData = {};

  for (const key of needed) {
    const tab = LIVE_TABS[key];
    const cached = liveCache[key];
    if (cached) {
      serverData[tab.localName] = cached;
    } else {
      const pulled = await pullTabFromGSheets(key);
      serverData[tab.localName] = pulled;
    }
  }

  // Trả về raw data để client-side L678 engine xử lý
  const summary = {};
  for (const [name, data] of Object.entries(serverData)) {
    summary[name] = { rows: data.rows, records: data.records?.length, source: data.source };
  }

  res.json({
    ok: true,
    summary,
    data: serverData,
    hint: 'Client: gọi SmartGetData.runL678Analysis(response.data)',
  });
});
