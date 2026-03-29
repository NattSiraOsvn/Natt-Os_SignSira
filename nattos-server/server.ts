// @ts-nocheck
/**
 * NATT-OS Server v2.0 — TypeScript Runtime
 * Dieu 7+8 Hien Phap v5.0: audit bat bien + EventBus replayable
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { EventBus } from '../src/core/events/event-bus';
import { bootKernel } from '../src/core/kernel-boot';
import { AuditApplicationService } from '../src/cells/kernel/audit-cell/application/services/AuditApplicationService';
import '../src/apps/engine-registry';
import { NauionVoice } from '../src/core/nauion/nauion.voice';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../src/ui-app')));
app.use('/nauion', express.static(path.join(__dirname, 'nattos-ui')));



// ── Nauion alias — ngôn ngữ nền tảng ────────────────────────────────────

const hey = (path: string, handler: any) => app.get(path, handler);

const yeh = (path: string, handler: any) => app.post(path, handler);

bootKernel();
NauionVoice.wake();

const STATE: Record<string, Record<string, { value: number; ts: number }>> = {};
EventBus.on('cell.metric', (payload: any) => {
  const { cell, metric, value } = payload ?? {};
  if (!cell) return;
  if (!STATE[cell]) STATE[cell] = {};
  STATE[cell][metric] = { value, ts: Date.now() };
});

hey('/api/nauion', (_req: any, res: any) => {
  res.json({ state: NauionVoice.currentState(), ts: Date.now() });
});

hey('/api/health', (_req, res) => {
  res.json({ status: 'ok', server: 'NATT-OS Server v2.0', ts: new Date().toISOString() });
});

yeh('/api/events/emit', (req, res) => {
  const { type, payload, cell } = req.body ?? {};
  if (!type) return res.status(400).json({ error: 'type required' });
  EventBus.emit(type, { ...payload, originCell: cell ?? 'ui' });
  res.json({ ok: true, type, ts: Date.now() });
});

hey('/api/state/:cell', (req, res) => {
  res.json({ cell: req.params.cell, state: STATE[req.params.cell] ?? {}, ts: Date.now() });
});

hey('/api/state', (_req, res) => {
  res.json({ state: STATE, cells: Object.keys(STATE).length, ts: Date.now() });
});

hey('/api/audit', async (_req, res) => {
  const all = await AuditApplicationService.getAll();
  const arr = Array.isArray(all) ? all : [];
  const events = arr.slice(-50).map((e: any) => ({
    event: e.action, actor: e.actorId, module: e.module, ts: e.timestamp, hash: e.hash,
  }));
  res.json({ events, total: arr.length });
});


// ── Mạch HeyNa — SSE stream, UI mã khoá vào để nhận Nahere ─────────────
const _sseClients: any[] = [];

EventBus.on('cell.metric', (payload: any) => {
  const data = JSON.stringify({ event: 'cell.metric', payload, ts: Date.now() });
  _sseClients.forEach(res => res.write(`data: ${data}\n\n`));
});

EventBus.on('nauion.state', (payload: any) => {
  const data = JSON.stringify({ event: 'nauion.state', payload, ts: Date.now() });
  _sseClients.forEach(res => res.write(`data: ${data}\n\n`));
});

EventBus.on('audit.record', (payload: any) => {
  const data = JSON.stringify({ event: 'audit.record', payload, ts: Date.now() });
  _sseClients.forEach(res => res.write(`data: ${data}\n\n`));
});

hey('/mach/heyna', (req: any, res: any) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.write('data: {"event":"Nahere","state":"NATT-OS đang ở đây"}\n\n');
  _sseClients.push(res);
  req.on('close', () => {
    const i = _sseClients.indexOf(res);
    if (i !== -1) _sseClients.splice(i, 1);
  });
});


// ── Kênh Cells — danh sách 38 cells + trạng thái ────────
const CELLS_38 = [
  'analytics-cell','audit-cell','bom3dprd-cell','buyback-cell','casting-cell',
  'comms-cell','compliance-cell','constants-cell','customer-cell','customs-cell',
  'design-3d-cell','dust-recovery-cell','finance-cell','finishing-cell','hr-cell',
  'inventory-cell','it-cell','logistics-cell','media-cell','noi-vu-cell',
  'order-cell','payment-cell','period-close-cell','phap-che-cell','polishing-cell',
  'prdmaterials-cell','prdwarranty-cell','pricing-cell','production-cell',
  'promotion-cell','sales-cell','shared-contracts-cell','showroom-cell',
  'stone-cell','supplier-cell','tax-cell','warehouse-cell','warranty-cell'
];

hey('/api/cells', (_req: any, res: any) => {
  const cells = CELLS_38.map(name => ({
    name,
    state: STATE[name] || {},
    alive: !!STATE[name],
    lastSeen: STATE[name] ? Math.max(...Object.values(STATE[name]).map((v: any) => v.ts || 0)) : null,
  }));
  res.json({ cells, total: cells.length, alive: cells.filter(c => c.alive).length, ts: Date.now() });
});

app.listen(PORT, () => {
  console.log('\n[NATT-OS Server v2.0] http://localhost:' + PORT);
  console.log('  TypeScript EventBus: ACTIVE');
  console.log('  Audit: AuditApplicationService');
  console.log('  Dieu 7+8 Hien Phap v5.0: ENFORCED\n');
});


// Kenh Cells — 38 cells status
const CELLS_38 = ['analytics-cell','audit-cell','bom3dprd-cell','buyback-cell','casting-cell','comms-cell','compliance-cell','constants-cell','customer-cell','customs-cell','design-3d-cell','dust-recovery-cell','finance-cell','finishing-cell','hr-cell','inventory-cell','it-cell','logistics-cell','media-cell','noi-vu-cell','order-cell','payment-cell','period-close-cell','phap-che-cell','polishing-cell','prdmaterials-cell','prdwarranty-cell','pricing-cell','production-cell','promotion-cell','sales-cell','shared-contracts-cell','showroom-cell','stone-cell','supplier-cell','tax-cell','warehouse-cell','warranty-cell'];
hey('/api/cells', (_req: any, res: any) => {
  const cells = CELLS_38.map(name => ({ name, state: STATE[name]||{}, alive: !!STATE[name], lastSeen: STATE[name]?Math.max(...Object.values(STATE[name]).map((v: any)=>v.ts||0)):null }));
  res.json({ cells, total: cells.length, alive: cells.filter((c: any)=>c.alive).length, ts: Date.now() });
});

export { EventBus };

// ── L4 Intelligence API ───────────────────────────────────────────────────
import { getFlowIntelligence } from '../src/cells/kernel/quantum-defense-cell/domain/engines/self-healing.engine';

hey('/api/intelligence', (_req: any, res: any) => {
  const intel = getFlowIntelligence();
  const flows = Object.entries(intel).map(([flow, h]: [string, any]) => ({
    flow,
    failCount:     h.failCount,
    successCount:  h.successCount,
    avgRetries:    Math.round(h.avgRetries * 10) / 10,
    adaptiveDelay: h.adaptiveDelay,
    successRate:   h.failCount > 0 ? Math.round(h.successCount / h.failCount * 100) + '%' : 'N/A',
  }));
  res.json({ flows, total: flows.length, ts: Date.now() });
});
