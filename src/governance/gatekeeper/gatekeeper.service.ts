export type GatekeeperDecision = "ALLOW" | "DENY" | "QUARANTINE" | "REQUIRE_APPROVAL";

export interface GatekeeperRequest {
  requestId: string;
  fromCellId: string;
  toCellId: string;
  action: string;
  payload?: unknown;
  actorId: string;
  timestamp: number;
}

export interface GatekeeperAudit {
  request: GatekeeperRequest;
  decision: GatekeeperDecision;
  reason: string;
  decidedAt: number;
}

const _auditLog: GatekeeperAudit[] = [];
const _blockedCells = new Set<string>();
const _quarantinedCells = new Set<string>();

export const GatekeeperService = {
  // Điều 7: Gatekeeper là chủ quyền duy nhất — không bypass
  evaluate: (req: GatekeeperRequest): GatekeeperDecision => {
    if (_blockedCells.has(req.fromCellId)) {
      GatekeeperService._record(req, "DENY", "Cell bị chặn");
      return "DENY";
    }
    if (_quarantinedCells.has(req.fromCellId)) {
      GatekeeperService._record(req, "QUARANTINE", "Cell đang cách ly");
      return "QUARANTINE";
    }
    // Wave 3 cell cố gọi Wave 1 trực tiếp → yêu cầu duyệt
    const sensitiveActions = ["DELETE", "OVERRIDE", "PURGE", "ROLLBACK"];
    if (sensitiveActions.includes(req.action.toUpperCase())) {
      GatekeeperService._record(req, "REQUIRE_APPROVAL", `Hành động nhạy cảm: ${req.action}`);
      return "REQUIRE_APPROVAL";
    }
    GatekeeperService._record(req, "ALLOW", "OK");
    return "ALLOW";
  },

  _record: (req: GatekeeperRequest, decision: GatekeeperDecision, reason: string): void => {
    _auditLog.push({ request: req, decision, reason, decidedAt: Date.now() });
  },

  block:       (cellId: string): void => { _blockedCells.add(cellId); },
  unblock:     (cellId: string): void => { _blockedCells.delete(cellId); },
  quarantine:  (cellId: string): void => { _quarantinedCells.add(cellId); },
  release:     (cellId: string): void => { _quarantinedCells.delete(cellId); },

  getAuditLog:  (): GatekeeperAudit[]  => [..._auditLog],
  getBlocked:   (): string[]            => [..._blockedCells],
  getQuarantine:(): string[]            => [..._quarantinedCells],
  getDeniedCount: (): number            => _auditLog.filter(a => a.decision === "DENY").length,
};
