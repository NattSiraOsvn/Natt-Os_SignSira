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
