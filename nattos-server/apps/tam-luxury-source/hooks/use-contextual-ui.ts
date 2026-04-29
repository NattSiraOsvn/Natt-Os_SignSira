import { useMemo } from "react";

export type ContextualTone = "stable" | "focus" | "risk" | "quiet";

export interface ContextualUIState {
  tone: ContextualTone;
  density: "compact" | "comfortable";
  motion: "reduced" | "standard";
  glass: "soft" | "clear";
  pulseEnabled: boolean;
}

export function useContextualUI(): ContextualUIState {
  return useMemo(() => ({
    tone: "stable",
    density: "comfortable",
    motion: "standard",
    glass: "soft",
    pulseEnabled: true,
  }), []);
}

export const useContextualUi = useContextualUI;
export default useContextualUI;
