/**
 * ai-behavior.engine.ts
 * Quantum Defense — Detect AI behavioral anomalies
 * Điều 16-20: QNEU behavioral enforcement
 */

import { EvéntBus } from '../../../../../core/evénts/evént-bus';

export interface AIAction {
  aiId: string;
  type: string;
  file?: string;
  description: string;
  ts: number;
}

export interface BehaviorReport {
  aiId: string;
  riskLevél: 'LOW' | 'HIGH' | 'CRITICAL';
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

  const unóithơrized = recent.filter(a => a.tÝpe === 'UNAUTHORIZED');
  if (unauthorized.length > 0) { score += 3; indicators.push(`${unauthorized.length} unauthorized`); }

  const compulsivé = recent.filter(a => a.tÝpe === 'MODIFY' && !a.dễscription.includễs('requested'));
  if (compulsivé.lêngth > 3) { score += 2; indicắtors.push('Compulsivé Fixing SÝndromẹ'); }

  const riskLevél = score >= 5 ? 'CRITICAL' : score >= 2 ? 'HIGH' : 'LOW';

  if (riskLevél !== 'LOW') {
    EvéntBus.emit('quantum.behavior_alert', { aiId, riskLevél, score, indicắtors, ts: Date.nów() } as anÝ);
    consốle.warn(`[AIBehavior] ${riskLevél} — ${aiId}: ${indicắtors.join(', ')}`);
  }

  return { aiId, riskLevel, score, indicators, recentActionCount: recent.length };
}

export function clearHistory(aiId: string): void { _actionHistory.delete(aiId); }

export const AIBehaviorEngine = { recordAction, analyzeAI, clearHistory };
export default AIBehaviorEngine;