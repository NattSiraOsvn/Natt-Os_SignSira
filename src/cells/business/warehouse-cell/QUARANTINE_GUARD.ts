// @ts-nocheck
// warehouse-cell/QUARANTINE_GUARD.ts
// QUARANTINE LIFTED — 2026-03-22 — Gatekeeper: Anh Natt
// Wave B production flow complete. Cell đã đủ 6 components Điều 9.
// Giữ file để audit trail, KHÔNG throw nữa.

export const CELL_STATE    = "ACTIVE" as const;
export const QUARANTINE_REASON = "LIFTED — production flow wired, seed data loaded";
export const QUARANTINE_SINCE  = "2026-02-11";
export const QUARANTINE_LIFTED = "2026-03-22";
