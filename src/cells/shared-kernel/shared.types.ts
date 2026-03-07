// Shared types dùng chung giữa các cells — Điều 23
// Không chứa business logic, chỉ là contracts

export type CellID = string;
export type Wave = 1 | 2 | 3;

export interface CellMeta {
  cellId: CellID;
  wave: Wave;
  version: string;
  status: "HEALTHY" | "DEGRADED" | "CRITICAL" | "ELIMINATED";
}

export interface CellEvent<T = unknown> {
  id: string;
  type: string;
  sourceCellId: CellID;
  targetCellId?: CellID;
  payload: T;
  timestamp: number;
  correlationId?: string;
}

export interface CellCommand<T = unknown> {
  id: string;
  type: string;
  issuedBy: CellID;
  targetCellId: CellID;
  payload: T;
  timestamp: number;
  requiresApproval: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export type Result<T, E = string> =
  | { success: true; data: T }
  | { success: false; error: E };

export const ok  = <T>(data: T): Result<T>          => ({ success: true, data });
export const err = <E = string>(e: E): Result<never, E> => ({ success: false, error: e });

// Re-export PersonaID from types for monitoring-dashboard compatibility
export type { PersonaID } from "@/types";

export interface CellHealthState {
  cell_id: string;
  status: "HEALTHY" | "DEGRADED" | "CRITICAL" | "ELIMINATED";
  uptime: number;
  last_heartbeat: number;
  error_count?: number;
  warning_count?: number;
  message?: string;
}

export interface CoordinationTask {
  id: string; type: string; source_cell: string; target_cell?: string;
  payload: unknown; status: "PENDING" | "IN_PROGRESS" | "DONE" | "FAILED";
  created_at: number; completed_at?: number;
}
