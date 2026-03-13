// @ts-nocheck
import React, { createContext, useContext, useState, ReactNode } from "react";

interface QuantumUIState {
  theme: "DARK" | "LIGHT" | "QUANTUM";
  ambientLevel: number;
  activeCell: string | null;
  pulseActive: boolean;
}

interface QuantumUIContextType {
  state: QuantumUIState;
  setTheme: (t: QuantumUIState["theme"]) => void;
  setActiveCell: (id: string | null) => void;
  triggerPulse: () => void;
  overlayConfig?: Record<string, any>;
  collapseWave?: () => void;
}

const QuantumUIContext = createContext<QuantumUIContextType | null>(null);

export const QuantumUIProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<QuantumUIState>({
    theme: "DARK", ambientLevel: 0.5, activeCell: null, pulseActive: false,
  });
  return (
    <QuantumUIContext.Provider value={{
      state,
      setTheme: (theme) => setState(s => ({ ...s, theme })),
      setActiveCell: (activeCell) => setState(s => ({ ...s, activeCell })),
      triggerPulse: () => { setState(s => ({ ...s, pulseActive: true })); setTimeout(() => setState(s => ({ ...s, pulseActive: false })), 500); },
      overlayConfig: {},
      collapseWave: () => {},
    }}>
      {children}
    </QuantumUIContext.Provider>
  );
};

export const useQuantumUI = (): QuantumUIContextType => {
  const ctx = useContext(QuantumUIContext);
  if (!ctx) throw new Error("useQuantumUI must be used within QuantumUIProvider");
  return ctx;
};

export default QuantumUIContext;
