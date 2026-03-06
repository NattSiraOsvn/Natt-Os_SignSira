// NATT-OS Signal Types
export type OverlayType = 'MODAL' | 'PANEL' | 'TOAST' | 'FULL' | 'DRAWER';
export interface ManifestationConfig {
  type: OverlayType;
  id?: string;
  title?: string;
  component?: string;
  props?: Record<string, unknown>;
  [key: string]: unknown;
}
export interface SignalPayload {
  signal: string;
  source: string;
  target?: string;
  data?: unknown;
  timestamp: number;
}
