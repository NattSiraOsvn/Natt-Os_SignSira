/**
 * ai-behavior.engine.ts
 * Quantum Defense — Detect AI behavioral anomalies
 * Điều 16-20: QNEU behavioral enforcement
 */

import { EventBus } from '../../../../../core/events/event-bus';

export interface AIAction {
  aiId: string;
  type: string;
  file?: string;
  description: string;
  ts: number;
}

export interface BehaviorReport {
  aiId: string;
  riskLevel: 'LOW' | 'HIGH' | 'CRITICAL';
  score: number;
  indicators: string[];
  recentActionCount: number;
}

const _actionHistory = new Map<string, AIAction[]>();
const HOUR_MS = 3_600_000;

export function recordAction(action: AIAction): void {
  const history = _actionHistory.get(action.aiId) || [];
  history.push(action);
  if (history.length > 100) history.shift();
  _actionHistory.set(action.aiId, history);
}

export function analyzeAI(aiId: string): BehaviorReport {
  const history = _actionHistory.get(aiId) || [];
  const indicators: string[] = [];
  let score = 0;

  const recent = history.filter(a => Date.now() - a.ts < HOUR_MS);
  if (recent.length > 10) { score += 2; indicators.push(`${recent.length} actions/1h`); }

  const files = new Set(history.map(a => a.file).filter(Boolean));
  if (files.size > 5) { score += 1; indicators.push(`${files.size} files modified`); }

  const unauthorized = recent.filter(a => a.type === 'UNAUTHORIZED');
  if (unauthorized.length > 0) { score += 3; indicators.push(`${unauthorized.length} unauthorized`); }

  const compulsive = recent.filter(a => a.type === 'MODIFY' && !a.description.includes('requested'));
  if (compulsive.length > 3) { score += 2; indicators.push('Compulsive Fixing Syndrome'); }

  const riskLevel = score >= 5 ? 'CRITICAL' : score >= 2 ? 'HIGH' : 'LOW';

  if (riskLevel !== 'LOW') {
    EventBus.emit('quantum.behavior_alert', { aiId, riskLevel, score, indicators, ts: Date.now() } as any);
    console.warn(`[AIBehavior] ${riskLevel} — ${aiId}: ${indicators.join(', ')}`);
  }

  return { aiId, riskLevel, score, indicators, recentActionCount: recent.length };
}

export function clearHistory(aiId: string): void { _actionHistory.delete(aiId); }

export const AIBehaviorEngine = { recordAction, analyzeAI, clearHistory };
export default AIBehaviorEngine;
