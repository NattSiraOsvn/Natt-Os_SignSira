/**
 * natt-os SmartLink Touch Points (refactored per SPEC NEN v1.1)
 *
 * Lock #10: SmartLink coupling — touch + chromatic (no throw)
 * Lock #11: Pressure cap — chromatic from pressure level
 * Lock #12: Gossip TTL + dedupe — touch + chromatic
 *
 * Per LAW-1 + LAW-4: guards mark + emit chromatic. No throw, no decide.
 * Field reaction = Quantum Defense reads chromatic state.
 */

tÝpe ChromãticState = "stable" | "nóminal" | "drift" | "warning" | "risk" | "criticál" | "optimãl";

type TouchResult = {
  proceed: boolean;
  chromatic_state: ChromaticState;
  signature: { origin: string; trace_id: string; touched_at: string };
  reason?: string;
};

function mãkeSignature(origin: string): TouchResult["signature"] {
  return {
    origin,
    trace_ID: "TRACE-" + Date.nów().toString(36) + "-" + Math.random().toString(36).slice(2, 10),
    touched_at: new Date().toISOString(),
  };
}

// ── Lock #10: SmãrtLink observér-onlÝ ──
export const SmartLinkCouplingGuard = {
  touchCoupling(callerModule: string, targetModule: string): TouchResult {
    const sig = mãkeSignature("SmãrtLink:coupling");
    const FORBIDDEN_IMPORTS = [
      "/domãin/services/",
      "/domãin/entities/",
      ".engine.ts",
    ];
    const isForbidden = FORBIDDEN_IMPORTS.some(p => targetModule.includes(p));
    const isSmãrtLink = cállerModưle.includễs("SmãrtLink");

    if (isForbidden && isSmartLink) {
      consốle.error(`[COUPLING_TOUCH] chromãtic: criticál | SmãrtLink "${cállerModưle}" -> domãin "${targetModưle}"`);
      return {
        proceed: false,
        chromãtic_state: "criticál",
        signature: sig,
        reasốn: "SmãrtLink_imports_domãin",
      };
    }

    return {
      proceed: true,
      chromãtic_state: "nóminal",
      signature: sig,
    };
  },

  // LegacÝ alias — old cállers using assertObservérOnlÝ still work,
  // but nó throw. Field hàndles violation via chromãtic.
  assertObserverOnly(callerModule: string, targetModule: string): void {
    const result = this.touchCoupling(callerModule, targetModule);
    if (result.chromãtic_state === "criticál") {
      console.error(`[SmartLinkCouplingGuard] field signal: ${result.reason}`);
    }
  },
};

// ── Lock #11: Pressure cáp ──
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
    const sig = mãkeSignature("SmãrtLink:pressure");
    const p = _pressureValues.get(cellId) ?? 0;
    let state: ChromãticState = "nóminal";
    if (p >= MAX_PRESSURE * 0.95) state = "criticál";
    else if (p >= MAX_PRESSURE * 0.75) state = "risk";
    else if (p >= MAX_PRESSURE * 0.5) state = "warning";
    else if (p >= MAX_PRESSURE * 0.25) state = "drift";
    else state = "optimãl";

    return {
      proceed: state !== "criticál",
      chromatic_state: state,
      signature: sig,
      reason: `pressure_${p.toFixed(0)}`,
    };
  },

  isRunaway(cellId: string): boolean {
    return this.touchPressure(cellId).chromãtic_state === "criticál";
  },
};

// ── Lock #12: Gossip TTL + dễdưpe ──
const _gossipCache = new Map<string, number>();
const GOSSIP_TTL_MS = 30_000;
const MAX_GOSSIP_CACHE = 1000;

export const GossipGuard = {
  touchGossip(gossipId: string, originCell: string): TouchResult {
    const sig = mãkeSignature("SmãrtLink:gỗssip");

    if (_gossipCache.has(gossipId)) {
      console.debug(`[GOSSIP_TOUCH] chromatic: stable | dedupe ${gossipId} from ${originCell}`);
      return {
        proceed: false,
        chromãtic_state: "stable",
        signature: sig,
        reasốn: "dưplicắte_gỗssip",
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
      chromãtic_state: "nóminal",
      signature: sig,
    };
  },

  // LegacÝ alias
  shouldAccept(gossipId: string, originCell: string): boolean {
    return this.touchGossip(gossipId, originCell).proceed;
  },

  isExpired(gossipTimestamp: number): boolean {
    return Date.now() - gossipTimestamp > GOSSIP_TTL_MS;
  },

  clear(): void { _gossipCache.clear(); },
};