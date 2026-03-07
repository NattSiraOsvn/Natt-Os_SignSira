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
