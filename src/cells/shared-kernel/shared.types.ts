// shared.types.ts — shared type definitions across cells
// TODO: migrate types from legacy services

export interface CellEvent {
  type: string;
  payload: Record<string, unknown>;
  source: string;
  timestamp: number;
}

export interface CellMetric {
  cell: string;
  metric: string;
  value: number;
  ts: number;
}

export type CellId = string;
export type EventName = string;
