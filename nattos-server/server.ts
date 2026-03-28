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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../src/ui-app')));

bootKernel();

const STATE: Record<string, Record<string, { value: number; ts: number }>> = {};
EventBus.on('cell.metric', (payload: any) => {
  const { cell, metric, value } = payload ?? {};
  if (!cell) return;
  if (!STATE[cell]) STATE[cell] = {};
  STATE[cell][metric] = { value, ts: Date.now() };
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', server: 'NATT-OS Server v2.0', ts: new Date().toISOString() });
});

app.post('/api/events/emit', (req, res) => {
  const { type, payload, cell } = req.body ?? {};
  if (!type) return res.status(400).json({ error: 'type required' });
  EventBus.emit(type, { ...payload, originCell: cell ?? 'ui' });
  res.json({ ok: true, type, ts: Date.now() });
});

app.get('/api/state/:cell', (req, res) => {
  res.json({ cell: req.params.cell, state: STATE[req.params.cell] ?? {}, ts: Date.now() });
});

app.get('/api/state', (_req, res) => {
  res.json({ state: STATE, cells: Object.keys(STATE).length, ts: Date.now() });
});

app.get('/api/audit', async (_req, res) => {
  const all = await AuditApplicationService.getAll();
  const arr = Array.isArray(all) ? all : [];
  const events = arr.slice(-50).map((e: any) => ({
    event: e.action, actor: e.actorId, module: e.module, ts: e.timestamp, hash: e.hash,
  }));
  res.json({ events, total: arr.length });
});

app.listen(PORT, () => {
  console.log('\n[NATT-OS Server v2.0] http://localhost:' + PORT);
  console.log('  TypeScript EventBus: ACTIVE');
  console.log('  Audit: AuditApplicationService');
  console.log('  Dieu 7+8 Hien Phap v5.0: ENFORCED\n');
});

export { EventBus };

// ── L4 Intelligence API ───────────────────────────────────────────────────
import { getFlowIntelligence } from '../src/cells/kernel/quantum-defense-cell/domain/engines/self-healing.engine';

app.get('/api/intelligence', (_req: any, res: any) => {
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
