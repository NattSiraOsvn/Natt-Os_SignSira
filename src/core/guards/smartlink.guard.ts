/**
 * NATT-OS SmartLink Touch Points (refactored per SPEC NEN v1.1)
 *
 * Lock #10: SmartLink coupling — touch + chromatic (no throw)
 * Lock #11: Pressure cap — chromatic from pressure level
 * Lock #12: Gossip TTL + dedupe — touch + chromatic
 *
 * Per LAW-1 + LAW-4: guards mark + emit chromatic. No throw, no decide.
 * Field reaction = Quantum Defense reads chromatic state.
 */

type ChromaticState = "stable" | "nominal" | "drift" | "warning" | "risk" | "critical" | "optimal";

type TouchResult = {
  proceed: boolean;
  chromatic_state: ChromaticState;
  signature: { origin: string; trace_id: string; touched_at: string };
  reason?: string;
};

function makeSignature(origin: string): TouchResult["signature"] {
  return {
    origin,
    trace_id: "TRACE-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10),
    touched_at: new Date().toISOString(),
  };
}

// ── Lock #10: SmartLink observer-only ──
export const SmartLinkCouplingGuard = {
  touchCoupling(callerModule: string, targetModule: string): TouchResult {
    const sig = makeSignature("smartlink:coupling");
    const FORBIDDEN_IMPORTS = [
      "/domain/services/",
      "/domain/entities/",
      ".engine.ts",
    ];
    const isForbidden = FORBIDDEN_IMPORTS.some(p => targetModule.includes(p));
    const isSmartLink = callerModule.includes("smartlink");

    if (isForbidden && isSmartLink) {
      console.error(`[COUPLING_TOUCH] chromatic: critical | smartlink "${callerModule}" -> domain "${targetModule}"`);
      return {
        proceed: false,
        chromatic_state: "critical",
        signature: sig,
        reason: "smartlink_imports_domain",
      };
    }

    return {
      proceed: true,
      chromatic_state: "nominal",
      signature: sig,
    };
  },

  // Legacy alias — old callers using assertObserverOnly still work,
  // but no throw. Field handles violation via chromatic.
  assertObserverOnly(callerModule: string, targetModule: string): void {
    const result = this.touchCoupling(callerModule, targetModule);
    if (result.chromatic_state === "critical") {
      console.error(`[SmartLinkCouplingGuard] field signal: ${result.reason}`);
    }
  },
};

// ── Lock #11: Pressure cap ──
const _pressureValues = new Map<string, number>();
const MAX_PRESSURE = 100;
const PRESSURE_DECAY_RATE = 0.95;

export const PressureCapGuard = {
  setPressure(cellId: string, value: number): number {
    const capped = Math.min(value, MAX_PRESSURE);
    if (value > MAX_PRESSURE) {
      console.warn(`[PRESSURE_TOUCH] chromatic: warning | ${cellId} ${value} -> ${MAX_PRESSURE}`);
    }
    _pressureValues.set(cellId, capped);
    return capped;
  },

  getPressure(cellId: string): number { return _pressureValues.get(cellId) ?? 0; },

  decay(cellId: string): number {
    const current = _pressureValues.get(cellId) ?? 0;
    const decayed = current * PRESSURE_DECAY_RATE;
    _pressureValues.set(cellId, decayed);
    return decayed;
  },

  decayAll(): void {
    for (const [cellId, pressure] of _pressureValues) {
      _pressureValues.set(cellId, pressure * PRESSURE_DECAY_RATE);
    }
  },

  touchPressure(cellId: string): TouchResult {
    const sig = makeSignature("smartlink:pressure");
    const p = _pressureValues.get(cellId) ?? 0;
    let state: ChromaticState = "nominal";
    if (p >= MAX_PRESSURE * 0.95) state = "critical";
    else if (p >= MAX_PRESSURE * 0.75) state = "risk";
    else if (p >= MAX_PRESSURE * 0.5) state = "warning";
    else if (p >= MAX_PRESSURE * 0.25) state = "drift";
    else state = "optimal";

    return {
      proceed: state !== "critical",
      chromatic_state: state,
      signature: sig,
      reason: `pressure_${p.toFixed(0)}`,
    };
  },

  isRunaway(cellId: string): boolean {
    return this.touchPressure(cellId).chromatic_state === "critical";
  },
};

// ── Lock #12: Gossip TTL + dedupe ──
const _gossipCache = new Map<string, number>();
const GOSSIP_TTL_MS = 30_000;
const MAX_GOSSIP_CACHE = 1000;

export const GossipGuard = {
  touchGossip(gossipId: string, originCell: string): TouchResult {
    const sig = makeSignature("smartlink:gossip");

    if (_gossipCache.has(gossipId)) {
      console.debug(`[GOSSIP_TOUCH] chromatic: stable | dedupe ${gossipId} from ${originCell}`);
      return {
        proceed: false,
        chromatic_state: "stable",
        signature: sig,
        reason: "duplicate_gossip",
      };
    }

    _gossipCache.set(gossipId, Date.now());

    if (_gossipCache.size > MAX_GOSSIP_CACHE) {
      const cutoff = Date.now() - GOSSIP_TTL_MS;
      for (const [id, ts] of _gossipCache) {
        if (ts < cutoff) _gossipCache.delete(id);
      }
    }

    return {
      proceed: true,
      chromatic_state: "nominal",
      signature: sig,
    };
  },

  // Legacy alias
  shouldAccept(gossipId: string, originCell: string): boolean {
    return this.touchGossip(gossipId, originCell).proceed;
  },

  isExpired(gossipTimestamp: number): boolean {
    return Date.now() - gossipTimestamp > GOSSIP_TTL_MS;
  },

  clear(): void { _gossipCache.clear(); },
};
