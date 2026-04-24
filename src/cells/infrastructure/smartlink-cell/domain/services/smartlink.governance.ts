// SmartLink Governance — nhà máy ổn áp (Tầng 2 Điều 22)
export interface AmplitudeRule {
  cellId: string;
  maxSignalsPerSecond: number;
  maxConnections: number;
  cooldownMs: number;
}

export interface GovernanceViolation {
  cellId: string;
  rule: string;
  value: number;
  limit: number;
  timestamp: number;
  action: "warn" | "THROTTLE" | "BLOCK";
}

const _rules = new Map<string, AmplitudeRule>();
const _signalCount = new Map<string, { count: number; windowStart: number }>();
const _violations: GovernanceViolation[] = [];
const _blocked = new Set<string>();

const DEFAULT_RULE: AmplitudeRule = {
  cellId: "*",
  maxSignalsPerSecond: 100,
  maxConnections: 20,
  cooldownMs: 1000,
};

export const SmartLinkGovernance = {
  // Đặt rule cho 1 cell cụ thể
  setRule: (rule: AmplitudeRule): void => { _rules.set(rule.cellId, rule); },

  getRule: (cellId: string): AmplitudeRule =>
    _rules.get(cellId) ?? _rules.get("*") ?? DEFAULT_RULE,

  // Kiểm tra trước mỗi signal — gate chính
  checkSignal: (cellId: string, signal: string): { allowed: boolean; reason?: string } => {
    if (_blocked.has(cellId)) return { allowed: false, reason: "CELL_BLOCKED" };

    const rule = SmartLinkGovernance.getRule(cellId);
    const now = Date.now();
    const tracker = _signalCount.get(cellId) ?? { count: 0, windowStart: now };

    // Reset window mỗi giây
    if (now - tracker.windowStart > 1000) {
      tracker.count = 0;
      tracker.windowStart = now;
    }

    tracker.count++;
    _signalCount.set(cellId, tracker);

    if (tracker.count > rule.maxSignalsPerSecond) {
      const v: GovernanceViolation = {
        cellId, rule: "MAX_SIGNALS_PER_SECOND",
        value: tracker.count, limit: rule.maxSignalsPerSecond,
        timestamp: now, action: "THROTTLE",
      };
      _violations.push(v);
      return { allowed: false, reason: "RATE_LIMIT_EXCEEDED" };
    }

    return { allowed: true };
  },

  // Ổn định biên độ — tự động điều chỉnh
  stabilize: (cellId: string): void => {
    const tracker = _signalCount.get(cellId);
    if (!tracker) return;
    const rule = SmartLinkGovernance.getRule(cellId);
    // Giảm dần nếu tần suất quá cao
    if (tracker.count > rule.maxSignalsPerSecond * 0.8) {
      setTimeout(() => {
        const t = _signalCount.get(cellId);
        if (t) { t.count = Math.floor(t.count * 0.7); }
      }, rule.cooldownMs);
    }
  },

  block: (cellId: string): void => { _blocked.add(cellId); },
  unblock: (cellId: string): void => { _blocked.delete(cellId); },
  isBlocked: (cellId: string): boolean => _blocked.has(cellId),

  getViolations: (): GovernanceViolation[] => [..._violations],
  getViolationsByCell: (cellId: string): GovernanceViolation[] =>
    _violations.filter(v => v.cellId === cellId),

  // Phát hiện mạng quá dày → cảnh báo
  checkTopologyDensity: (density: number): "OK" | "warn" | "CRITICAL" =>
    density > 15 ? "CRITICAL" : density > 8 ? "warn" : "OK",

  getStats: () => ({
    totalRules: _rules.size,
    blockedCells: _blocked.size,
    totalViolations: _violations.length,
    monitoredCells: _signalCount.size,
  }),
};
