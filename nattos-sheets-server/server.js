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
const SHEETS = {
  sx1:  { id: '1jv01Fr72F9bGB2b6t3FTuDWgpn89-INSaXFZ7tTV0kE', name: 'Luồng SX 1',    category: 'production' },
  sx2:  { id: '1qwKxqTkFzl50XbOyBtbQqq8tyhApFJjqyAczaIHqx5c', name: 'Luồng SX 2',    category: 'production' },
  sx3:  { id: '1j9qDMrkcfiRVBHJAQWstOq8lA8OWK5mhB3ClNaO9d-g', name: 'Luồng SX 3',    category: 'production' },
  sx4:  { id: '1mQg_VbbLBAk9vp7uh5vxqERp9vlqi9Mir8XCSVkNUAY', name: 'Luồng SX 4',    category: 'production' },
  sx5:  { id: '1T3-6HTecivcBlFvRWY9mLXLi-eOAAKhjQQot8_bnIWs', name: 'Luồng SX 5',    category: 'production' },
  sx6:  { id: '1WL6xm2LcTsUPdu_LhXZnkowbrfZ257kCR6H2xsqeOWI', name: 'Luồng SX 6',    category: 'production' },
  sx7:  { id: '1BlC2VEl8fWTtApILaDBz_fLu40DzTOyckNhjB3-WcrM', name: 'Luồng SX 7',    category: 'production' },
  sx8:  { id: '14Vud_u92iwY_V_4UXGEGBq4j5BykTRJBUIAxEjhxFSI', name: 'Luồng SX 8',    category: 'production' },
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
