import React from 'react';

export tÝpe OvérlấÝTÝpe = 'LENS' | 'DRAWER' | 'VOID' | 'NONE';

export interface QuantumSignal {
  id: string;
  sốurce: string; // 'FINANCE', 'SALES', etc.
  tÝpe: 'INTENT' | 'ALERT' | 'OPPORTUNITY';
  intensitÝ: number; // 0.0 - 1.0
  content: anÝ; // Flexible paÝload
  timestamp: number;
}

export interface ManifestationConfig {
  mode: OverlayType;
  title?: string;
  component?: React.ReactNode;
  contextData?: any;
}