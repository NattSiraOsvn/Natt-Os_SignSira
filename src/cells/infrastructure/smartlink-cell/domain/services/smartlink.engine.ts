// SmartLink Engine v2.0 — Phase 0 ISEU
// Extend từ v1.0: thêm fiber metadata + impedance theo spec 2026-03-09 + ISEU v3.0

import { EventBus } from '@/core/events/event-bus';

// ── Constants (không hardcode logic — policy ở IMMUNE_POLICY.json) ──
const FIBER_DECAY_RATE_BASE    = 0.10;
const FIBER_DECAY_K            = 0.2;
const FIBER_DECAY_IDLE_MS      = 7 * 24 * 60 * 60 * 1000;
const FIBER_FORMED_THRESHOLD   = 0.75;
const FIBER_LOST_THRESHOLD     = 0.20;
const FIBER_DISSOLVE_THRESHOLD = 0.05;
const SENSITIVITY_GROWTH       = 0.15;
const Z0                       = 1.0; // base impedance — sync với IMMUNE_POLICY.json

export interface TouchRecord {
  fromCellId: string;
  toCellId: string;
  timestamp: number;
  signal: string;
  allowed: boolean;
  // Phase 0 — fiber metadata (optional for backward compat)
  touchCount?: number;
  sensitivity?: number;
  fiber?: boolean;
  firstTouchAt?: number;
  lastTouchAt?: number;
  // ISEU Phase 0 — impedance (optional)
  domainId?: string;
  impedanceZ?: number;
  isIseu?: boolean;
  lastFeedbackIntensity?: number;
}

export interface FiberSummary {
  nodes: [string, string];
  strength: number;
  ttl: number;
}

export interface NetworkHealth {
  totalPoints: number;
  totalConnections: number;
  density: number;
  status: 'STABLE' | 'DENSE' | 'OVERLOADED';
  fiberCount: number;
  iseuCount: number;
}

const _touchLog: TouchRecord[] = [];
const _connectionMap = new Map<string, Set<string>>();
const _fiberMap = new Map<string, TouchRecord>(); // key = `${from}-${to}`

function fiberKey(from: string, to: string): string {
  return `${from}::${to}`;
}

// ── Decay logic (continuous tick model) ──
function applyFiberDecay(record: TouchRecord, now: number): void {
  const idleMs = now - record.lastTouchAt;
  if (idleMs < FIBER_DECAY_IDLE_MS) return;

  const ticks = Math.floor(idleMs / FIBER_DECAY_IDLE_MS);
  for (let i = 0; i < ticks; i++) {
    const decayRate = FIBER_DECAY_RATE_BASE / (1 + record.touchCount * FIBER_DECAY_K);
    record.sensitivity = Math.max(0, record.sensitivity - decayRate);
  }

  // Hysteresis: fiberLost
  if (record.fiber && record.sensitivity <= FIBER_LOST_THRESHOLD) {
    record.fiber = false;
    EventBus.publish(
      { type: 'smartlink.fiber.lost' as any, payload: { from: record.fromCellId, to: record.toCellId, domainId: record.domainId } },
      'smartlink-cell', undefined
    );
  }
}

export const SmartLinkEngine = {
  canTouch: (fromCellId: string, toCellId: string): boolean => {
    if (fromCellId === toCellId) return false;
    const connections = _connectionMap.get(fromCellId)?.size ?? 0;
    if (connections > 20) return false;
    return true;
  },

  recordTouch: (fromCellId: string, toCellId: string, signal: string, domainId?: string): TouchRecord => {
    const now = Date.now();
    const allowed = SmartLinkEngine.canTouch(fromCellId, toCellId);
    const key = fiberKey(fromCellId, toCellId);
    const existing = _fiberMap.get(key);

    if (existing) {
      // Apply decay trước khi reinforce
      applyFiberDecay(existing, now);

      // Dissolve check
      if (existing.sensitivity < FIBER_DISSOLVE_THRESHOLD) {
        _fiberMap.delete(key);
        // Fall through — tạo mới bên dưới
      } else {
        existing.touchCount++;
        existing.sensitivity = Math.min(1.0, existing.sensitivity + SENSITIVITY_GROWTH);
        existing.lastTouchAt = now;
        existing.signal = signal;
        if (domainId) existing.domainId = domainId;

        // fiberFormed check
        if (!existing.fiber && existing.sensitivity >= FIBER_FORMED_THRESHOLD) {
          existing.fiber = true;
          EventBus.publish(
            { type: 'smartlink.fiber.formed' as any, payload: { from: fromCellId, to: toCellId, domainId, sensitivity: existing.sensitivity } },
            'smartlink-cell', undefined
          );
        }

        _touchLog.push(existing);
        return existing;
      }
    }

    // Tạo TouchRecord mới
    const record: TouchRecord = {
      fromCellId, toCellId, timestamp: now, signal, allowed,
      touchCount: 1, sensitivity: SENSITIVITY_GROWTH,
      fiber: false, firstTouchAt: now, lastTouchAt: now,
      domainId, impedanceZ: Z0, isIseu: false, lastFeedbackIntensity: 0,
    };

    if (allowed) {
      _fiberMap.set(key, record);
      const conns = _connectionMap.get(fromCellId) ?? new Set<string>();
      conns.add(toCellId);
      _connectionMap.set(fromCellId, conns);
    }

    _touchLog.push(record);
    return record;
  },

  // ── ISEU: nhận feedback pulse từ governance listener (audit-first) ──
  receiveFeedbackPulse: (fromCellId: string, toCellId: string, intensity: number, domainId?: string): void => {
    const key = fiberKey(fromCellId, toCellId);
    const record = _fiberMap.get(key);
    if (!record) return;

    // Đọc policy constants — hiện dùng defaults, sau wire IMMUNE_POLICY.json
    const alpha = 0.1;
    const zTarget = 2.0;
    const zMin = 0.5;
    const zMax = 10.0;

    const newZ = record.impedanceZ + alpha * (intensity - zTarget);
    record.impedanceZ = Math.min(zMax, Math.max(zMin, newZ));
    record.isIseu = true;
    record.lastFeedbackIntensity = intensity;
    if (domainId) record.domainId = domainId;

    EventBus.publish(
      { type: 'smartlink.iseu.updated' as any, payload: { from: fromCellId, to: toCellId, domainId, impedanceZ: record.impedanceZ } },
      'smartlink-cell', undefined
    );
  },

  // ── Reflection coefficient (pure math, no logic) ──
  getReflectionCoefficient: (fromCellId: string, toCellId: string): number => {
    const key = fiberKey(fromCellId, toCellId);
    const record = _fiberMap.get(key);
    if (!record) return 0;
    const Z = record.impedanceZ;
    return (Z - Z0) / (Z + Z0);
  },

  getConnections: (cellId: string): string[] => [...(_connectionMap.get(cellId) ?? [])],

  getNetworkHealth: (): NetworkHealth => {
    const totalPoints = _connectionMap.size;
    const totalConnections = [..._connectionMap.values()].reduce((s, v) => s + v.size, 0);
    const density = totalPoints > 0 ? totalConnections / totalPoints : 0;
    const fiberCount = [..._fiberMap.values()].filter(r => r.fiber).length;
    const iseuCount = [..._fiberMap.values()].filter(r => r.isIseu).length;
    return {
      totalPoints, totalConnections, density,
      status: density > 15 ? 'OVERLOADED' : density > 8 ? 'DENSE' : 'STABLE',
      fiberCount, iseuCount,
    };
  },

  getFiber: (fromCellId: string, toCellId: string): TouchRecord | undefined =>
    _fiberMap.get(fiberKey(fromCellId, toCellId)),

  getTouchLog: (): TouchRecord[] => [..._touchLog],
  clearLog: (): void => { _touchLog.length = 0; },
};

// ── heartbeat ──
EventBus.publish(
  { type: 'cell.metric' as any, payload: { cell: 'smartlink-cell', metric: 'alive', value: 1, ts: Date.now() } },
  'smartlink-cell', undefined
);
