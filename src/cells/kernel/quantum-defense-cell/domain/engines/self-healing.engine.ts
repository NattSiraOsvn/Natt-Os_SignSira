/**
 * self-healing.engine.ts — L2 Intelligence
 * Khi anomaly.detected → tự retry event đã gãy
 *
 * Nguyên tắc:
 * - KHÔNG retry vô hạn — max 3 lần
 * - KHÔNG retry CRITICAL ngay — escalate trước
 * - Mỗi retry phải được audit
 * - Guard: retry key theo orderId + from
 */

import { EventBus } from '@/core/events/event-bus';
import { typedEmit } from '@/core/events/typed-eventbus';
import * as fs from 'fs';
import * as path from 'path';

const HISTORY_FILE = path.join(process.cwd(), '.nattos-twin', 'flow-history.json');

function loadHistory(): void {
  try {
    if (fs.existsSync(HISTORY_FILE)) {
      const data = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));
      Object.entries(data).forEach(([k, v]: [string, any]) => _flowHistory.set(k, v));
      console.info(`[L4] Flow history loaded — ${_flowHistory.size} flows`);
    }
  } catch { /* silent */ }
}

function saveHistory(): void {
  try {
    const data: Record<string, any> = {};
    _flowHistory.forEach((v, k) => { data[k] = v; });
    fs.mkdirSync(path.dirname(HISTORY_FILE), { recursive: true });
    /* TWIN_PERSIST: intentional disk write — digital twin / audit infrastructure, not business logic */
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(data, null, 2));
  } catch { /* silent */ }
}

const _retryCount: Map<string, number> = new Map();
const MAX_RETRY = 3;
const RETRY_DELAY_MS = 2000;

// ── L4 LEARNING — Retry history + adaptive timeout ────────────────────────
interface FlowHistory {
  failCount:    number;   // tổng số lần fail
  successCount: number;   // tổng số lần recover thành công
  avgRetries:   number;   // trung bình số lần retry trước khi recover
  lastFail:     number;   // timestamp lần fail gần nhất
  adaptiveDelay: number;  // delay hiện tại (ms) — tăng khi fail nhiều
}
const _flowHistory: Map<string, FlowHistory> = new Map();
const BASE_DELAY = 2000;
const MAX_ADAPTIVE_DELAY = 30000; // cap 30s

function getHistory(flowKey: string): FlowHistory {
  if (!_flowHistory.has(flowKey)) {
    _flowHistory.set(flowKey, {
      failCount: 0, successCount: 0, avgRetries: 0,
      lastFail: 0, adaptiveDelay: BASE_DELAY,
    });
  }
  return _flowHistory.get(flowKey)!;
}

function recordFailure(flowKey: string, retries: number): void {
  const h = getHistory(flowKey);
  h.failCount++;
  h.lastFail = Date.now();
  h.avgRetries = (h.avgRetries * (h.failCount - 1) + retries) / h.failCount;
  // Adaptive delay: tăng 50% mỗi lần fail liên tiếp, cap 30s
  h.adaptiveDelay = Math.min(h.adaptiveDelay * 1.5, MAX_ADAPTIVE_DELAY);
  _flowHistory.set(flowKey, h);
  saveHistory();
}

function recordSuccess(flowKey: string, retries: number): void {
  const h = getHistory(flowKey);
  h.successCount++;
  h.avgRetries = (h.avgRetries * h.failCount + retries) / (h.failCount + 1);
  // Reset adaptive delay sau khi recover
  h.adaptiveDelay = Math.max(BASE_DELAY, h.adaptiveDelay * 0.75);
  _flowHistory.set(flowKey, h);
  saveHistory();
}

export function getFlowIntelligence(): Record<string, FlowHistory> {
  const out: Record<string, FlowHistory> = {};
  _flowHistory.forEach((v, k) => { out[k] = v; });
  return out;
}

export function bootstrapSelfHealingEngine(): void {
  EventBus.on('anomaly.detected' as any, (env: any) => {
    const p = env?.payload ?? env;
    if (p?.type !== 'FLOW_BREAK') return;

    const key = `${p.from}:${p.orderId}`;
    const count = _retryCount.get(key) ?? 0;

    // CRITICAL — escalate thay vì retry
    if (p.severity === 'CRITICAL') {
      typedEmit('audit.record', {
        action:   'self-healing.escalated',
        actor:    { id: 'self-healing-engine', type: 'system' },
        resource: p.orderId,
        result:   'escalated',
        timestamp: Date.now(),
        trace:    { causationId: 'anomaly.detected', correlationId: p.orderId },
      }, 'self-healing');
      return;
    }

    // L3.5 DECISION — No subscriber → escalate ngay, không retry vô ích
    if (!EventBus.hasSubscriber(p.expected)) {
      console.warn(`[SelfHealing] No subscriber for '${p.expected}' — skip retry, escalate`);
      typedEmit('audit.record', {
        action:   'self-healing.escalated',
        actor:    { id: 'self-healing-engine', type: 'system' },
        resource: p.orderId,
        result:   'no-subscriber',
        timestamp: Date.now(),
        trace:    { causationId: 'anomaly.detected', correlationId: p.orderId, reason: 'NO_SUBSCRIBER' },
      }, 'self-healing');
      return;
    }

    // Duplicate guard — chỉ retry 1 lần tại 1 thời điểm
    if (_retryCount.has(key)) return;

    // Max retry guard
    if (count >= MAX_RETRY) {
      console.warn(`[SelfHealing] MAX RETRY reached for ${key} — giving up`);
      typedEmit('audit.record', {
        action:   'self-healing.exhausted',
        actor:    { id: 'self-healing-engine', type: 'system' },
        resource: p.orderId,
        result:   'fail',
        timestamp: Date.now(),
        trace:    { causationId: 'anomaly.detected', correlationId: p.orderId },
      }, 'self-healing');
      _retryCount.delete(key);
      return;
    }

    // Success cleanup — khi expected event đến, reset count
    const successUnsub = EventBus.on(p.expected as any, (env2: any) => {
      const ep = env2?.payload ?? env2;
      if (ep?.orderId === p.orderId || ep?.originCell === p.orderId) {
        _retryCount.delete(key);
        successUnsub();
      }
    });

    // L4 — record failure + get adaptive delay
    const flowKey = `${p.from}→${p.expected}`;
    const history = getHistory(flowKey);
    recordFailure(flowKey, count + 1);

    // Retry
    _retryCount.set(key, count + 1);
    console.info(`[SelfHealing] Retry ${count + 1}/${MAX_RETRY} — re-emit: ${p.from} | orderId: ${p.orderId}`);

    setTimeout(() => {
      // Audit retry
      typedEmit('audit.record', {
        action:   'self-healing.retry',
        actor:    { id: 'self-healing-engine', type: 'system' },
        resource: p.orderId,
        result:   'retry',
        timestamp: Date.now(),
        trace:    { causationId: 'anomaly.detected', correlationId: p.orderId },
      }, 'self-healing');

      // Re-emit event gãy
      EventBus.emit(p.from, {
        orderId:  p.orderId,
        retry:    true,
        retryCount: count + 1,
        source:   'self-healing-engine',
        ts:       Date.now(),
      }, 'self-healing');
    }, history.adaptiveDelay * (count + 1)); // L4 adaptive delay
  });

  loadHistory();
  console.info('[SelfHealingEngine] L4 Learning active — max retry: ' + MAX_RETRY);
}
