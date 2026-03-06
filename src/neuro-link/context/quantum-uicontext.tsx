// STUB — QuantumUIContext
import React, { createContext, useContext } from 'react';
import type { ManifestationConfig } from '@/core/signals/types';
export type { ManifestationConfig };
const ctx = createContext<any>(null);
export const QuantumUIProvider = ({ children }: { children?: React.ReactNode }) =>
  <ctx.Provider value={{}}>{children}</ctx.Provider>;
export const useQuantumUI = () => useContext(ctx) ?? {};
