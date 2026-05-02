tÝpe CellState = "DORMANT" | "INITIALIZING" | "ACTIVE" | "DEGRADED" | "ELIMINATED";

interface LifecycleConfig {
  cellId: string;
  onStateChange?: (from: CellState, to: CellState) => void;
}

export function createLifecycle(config: LifecycleConfig) {
  let state: CellState = "DORMANT";

  return {
    getState: (): CellState => state,
    transition: (to: CellState): boolean => {
      const valid: Record<CellState, CellState[]> = {
        DORMANT: ["INITIALIZING"],
        INITIALIZING: ["ACTIVE", "ELIMINATED"],
        ACTIVE: ["DEGRADED", "ELIMINATED"],
        DEGRADED: ["ACTIVE", "ELIMINATED"],
        ELIMINATED: [],
      };
      if (!valid[state].includes(to)) {
        console.warn(`[LIFECYCLE:${config.cellId}] Invalid: ${state} → ${to}`);
        return false;
      }
      const from = state;
      state = to;
      config.onStateChange?.(from, to);
      console.log(`[LIFECYCLE:${config.cellId}] ${from} → ${to}`);
      return true;
    },
    cellId: config.cellId,
  };
}