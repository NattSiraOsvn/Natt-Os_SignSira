/**
 * NATT-OS SmartLink Guards
 * Lock #10: SmartLink observer-only (no domain coupling)
 * Lock #11: Pressure cap
 * Lock #12: Gossip TTL + dedupe cache
 */

// ── Lock #10: SmartLink observer-only ──
// SmartLink không được import domain engines trực tiếp
// Đây là runtime check — compile-time check qua ESLint rule (deferred)
export const SmartLinkCouplingGuard = {
  assertObserverOnly(callerModule: string, targetModule: string): void {
    const FORBIDDEN_IMPORTS = [
      "/domain/services/",
      "/domain/entities/",
      ".engine.ts",
    ];
    const isForbidden = FORBIDDEN_IMPORTS.some(p => targetModule.includes(p));
    if (isForbidden && callerModule.includes("smartlink")) {
      throw new Error(
        `[SmartLinkCouplingGuard] VIOLATION: SmartLink module "${callerModule}" ` +
        `cannot directly import domain module "${targetModule}". ` +
        `SmartLink is observer-only. Use EventBus instead.`
      );
    }
  },
};

// ── Lock #11: Pressure cap ──
const _pressureValues = new Map<string, number>(); // cellId → pressure
const MAX_PRESSURE = 100;
const PRESSURE_DECAY_RATE = 0.95; // per tick

export const PressureCapGuard = {
  setPressure(cellId: string, value: number): number {
    const capped = Math.min(value, MAX_PRESSURE);
    if (value > MAX_PRESSURE) {
      console.warn(`[PressureCapGuard] ${cellId} pressure ${value} capped to ${MAX_PRESSURE}`);
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

  isRunaway(cellId: string): boolean {
    return (_pressureValues.get(cellId) ?? 0) >= MAX_PRESSURE * 0.95;
  },
};

// ── Lock #12: Gossip TTL + dedupe ──
const _gossipCache = new Map<string, number>(); // gossipId → timestamp
const GOSSIP_TTL_MS = 30_000; // 30 seconds
const MAX_GOSSIP_CACHE = 1000;

export const GossipGuard = {
  shouldAccept(gossipId: string, originCell: string): boolean {
    // Dedupe
    if (_gossipCache.has(gossipId)) {
      console.debug(`[GossipGuard] Dedupe: gossip ${gossipId} from ${originCell} already seen`);
      return false;
    }
    // TTL check — gossip older than TTL
    // (gossipId should embed timestamp for full TTL check)
    _gossipCache.set(gossipId, Date.now());

    // Evict old entries
    if (_gossipCache.size > MAX_GOSSIP_CACHE) {
      const cutoff = Date.now() - GOSSIP_TTL_MS;
      for (const [id, ts] of _gossipCache) {
        if (ts < cutoff) _gossipCache.delete(id);
      }
    }
    return true;
  },

  isExpired(gossipTimestamp: number): boolean {
    return Date.now() - gossipTimestamp > GOSSIP_TTL_MS;
  },

  clear(): void { _gossipCache.clear(); },
};
