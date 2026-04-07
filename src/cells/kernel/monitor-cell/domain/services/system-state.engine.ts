/**
 * NATT-OS System State Engine v1.0 — V5 Condition 2
 */
import * as fs from "fs";
import * as path from "path";
import { getEventFrequency } from "./flow-chain.engine";

const TWIN_DIR = ".nattos-twin";
const STATE_FILE = path.join(TWIN_DIR, "system-state-v5.json");

export type SystemState = "HEALTHY" | "STABLE" | "WARNING" | "CRITICAL";

export interface StateSnapshot {
  state: SystemState;
  riskScore: number;
  timestamp: number;
  signals: {
    orphanEvents: number;
    deadEngines: number;
    blindCells: number;
    healthyFlows: number;
    eventFrequency: number;
  };
  issues: string[];
  strengths: string[];
}


// ── computeSystemImpedance — Z từ runtime signals ──
// IMPEDANCE_Z: derived từ event_rate + error_ratio + latency + anomaly
export function computeSystemImpedance(signals: {
  errorRatio?: number;   // 0..1
  latencyNorm?: number;  // 0..1 (latency_avg_ms / 1000)
  anomalyScore?: number; // 0..1
  eventRate?: number;    // events/min, 0 = silent
}): number {
  const Z0 = 1.0;
  const errorRatio   = signals.errorRatio   ?? 0;
  const latencyNorm  = signals.latencyNorm  ?? 0;
  const anomalyScore = signals.anomalyScore ?? 0;
  const eventRate    = signals.eventRate    ?? 0;

  // Drift từ baseline: mỗi factor đẩy Z lên khi xấu
  const drift =
    (errorRatio   * 1.5) +
    (latencyNorm  * 0.8) +
    (anomalyScore * 2.0) +
    (eventRate === 0 ? 0.5 : 0); // silent system = drift nhẹ

  return Math.min(5.0, Math.max(0.1, Z0 + drift));
}

export function inferSystemState(signals: StateSnapshot["signals"]): {
  state: SystemState; riskScore: number; issues: string[]; strengths: string[];
} {
  let risk = 0;
  const issues: string[] = [];
  const strengths: string[] = [];
  if (signals.orphanEvents > 10) { issues.push(`EVENT_LEAK: ${signals.orphanEvents}`); risk += 20; }
  else if (signals.orphanEvents > 3) { issues.push(`MINOR_LEAK: ${signals.orphanEvents}`); risk += 8; }
  else strengths.push(`Event coverage clean`);
  if (signals.deadEngines > 10) { issues.push(`DEAD_WEIGHT: ${signals.deadEngines}`); risk += 15; }
  else if (signals.deadEngines > 3) { issues.push(`ENGINE_WASTE: ${signals.deadEngines}`); risk += 5; }
  else strengths.push(`Engine wiring healthy`);
  if (signals.blindCells > 10) { issues.push(`SENSORY_DEFICIT: ${signals.blindCells}`); risk += 20; }
  else if (signals.blindCells > 5) { issues.push(`PARTIAL_BLINDNESS: ${signals.blindCells}`); risk += 10; }
  else strengths.push(`Signal coverage healthy`);
  if (signals.healthyFlows > 20) strengths.push(`Flows: ${signals.healthyFlows} healthy`);
  else if (signals.healthyFlows > 10) strengths.push(`Flows: ${signals.healthyFlows} adequate`);
  else { issues.push(`FLOW_DEFICIT: ${signals.healthyFlows}`); risk += 15; }
  if (signals.eventFrequency > 0) strengths.push(`Runtime active: ${signals.eventFrequency} events/min`);
  else { issues.push(`RUNTIME_SILENT`); risk += 5; }
  const state: SystemState = risk >= 50 ? "CRITICAL" : risk >= 25 ? "WARNING" : risk >= 10 ? "STABLE" : "HEALTHY";
  return { state, riskScore: risk, issues, strengths };
}

export function captureStateSnapshot(signals: Partial<StateSnapshot["signals"]>): StateSnapshot {
  const freq = (Object.values(getEventFrequency(60000)) as number[]).reduce((a, b) => a + b, 0);
  const fullSignals: StateSnapshot["signals"] = {
    orphanEvents: signals.orphanEvents ?? 0,
    deadEngines: signals.deadEngines ?? 0,
    blindCells: signals.blindCells ?? 0,
    healthyFlows: signals.healthyFlows ?? 0,
    eventFrequency: freq,
  };
  const { state, riskScore, issues, strengths } = inferSystemState(fullSignals);
  const snapshot: StateSnapshot = { state, riskScore, timestamp: Date.now(), signals: fullSignals, issues, strengths };
  try {
    if (!fs.existsSync(TWIN_DIR)) fs.mkdirSync(TWIN_DIR, { recursive: true });
    /* TWIN_PERSIST: intentional disk write — digital twin / audit infrastructure, not business logic */
//     fs.writeFileSync(STATE_FILE, JSON.stringify(snapshot, null, 2));
  } catch { /* silent */ }
  return snapshot;
}

export function getLastState(): StateSnapshot | null {
  try {
    if (!fs.existsSync(STATE_FILE)) return null;
    return JSON.parse(fs.readFileSync(STATE_FILE, "utf-8"));
  } catch { return null; }
}

// ── cell.metric heartbeat ──
import { EventBus } from '@/core/events/event-bus';
EventBus.publish({ type: 'cell.metric' as any, payload: { cell: 'monitor-cell', metric: 'alive', value: 1, ts: Date.now() } }, 'monitor-cell', undefined);
