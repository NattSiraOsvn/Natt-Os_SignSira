// — BCTC flow wiring
/**
 * period-close.wiring.ts
 * 
 * Wire period-close-cell engines → SmartLink port.
 * BCTC flow: sales → finance → PERIOD-CLOSE → tax → BCTC output
 * 
 * Điều 9 Constitution: 6 components. Port đã có, engine đã có.
 * File này = dây nối giữa engine ↔ port ↔ SmartLink network.
 * 
 * Rules from real audit:
 *   TR-001: TK154 cuối kỳ > 0 nếu xưởng đang SX
 *   TR-002: Lock giá BQ sau khi kết sổ — immutable snapshot
 *   TR-003: Cảnh báo CP/DT < 10% ngành SX
 *   TR-005: Validate nhập kho TP theo completion event
 *   TR-006: DUST_CLOSE_REPORT APPROVED trước PERIOD_CLOSE
 */

import { forgeSmartLinkPort } from "@/satellites/port-forge";

// ═══════════ SMARTLINK PORT (re-export with wiring) ═══════════

export const PeriodCloseWiring = forgeSmartLinkPort({
  cellId: "period-close-cell",
  signals: {
    // Inbound: nhận từ finance-cell + dust-recovery-cell + production-cell
    FINANCE_PERIOD_ready:   { eventType: "FinancePeriodReady",   routeTo: "period-close-cell" },
    DUST_CLOSE_APPROVED:    { eventType: "DustCloseApproved",    routeTo: "period-close-cell" },
    PRODUCTION_WIP_STATUS:  { eventType: "ProductionWipStatus",  routeTo: "period-close-cell" },

    // Outbound: gửi đi
    PERIOD_CLOSE_STARTED:   { eventType: "PeriodCloseStarted",   routeTo: "audit-cell" },
    PERIOD_CLOSE_BLOCKED:   { eventType: "PeriodCloseBlocked",   routeTo: "audit-cell" },
    PERIOD_CLOSE_COMPLETED: { eventType: "PeriodCloseCompleted", routeTo: "tax-cell" },
    GATEKEEPER_APPROVAL_REQUIRED: { eventType: "GatekeeperApprovalRequired", routeTo: "quantum-defense-cell" },
  },
});

// ═══════════ PRE-CLOSE CHECKS ═══════════

export interface PeriodCloseRequest {
  period: string;          // "2025-12"
  requestedBy: string;
  timestamp: number;
}

export interface PreCloseCheckResult {
  canClose: boolean;
  checks: Array<{
    rule: string;
    passed: boolean;
    detail: string;
  }>;
  blockReasons: string[];
}

/**
 * Validate tất cả điều kiện trước khi cho phép kết sổ.
 * Gọi bởi closing.executor.ts
 */
export function runPreCloseChecks(input: {
  period: string;
  dustCloseApproved: boolean;
  wipBalance: number;
  productionActive: boolean;
  openFraudAlerts: number;
  gatekeeperApproved: boolean;
  cpDtRatio: number;
}): PreCloseCheckResult {
  const checks: PreCloseCheckResult["checks"] = [];
  const blockReasons: string[] = [];

  // TR-006: Bụi phải nấu + PHỔ phải approved
  const dustOk = input.dustCloseApproved;
  checks.push({
    rule: "TR-006",
    passed: dustOk,
    detail: dustOk
      ? "DUST_CLOSE_REPORT đã APPROVED"
      : "CHƯA có DUST_CLOSE_REPORT approved — bụi chưa nấu hoặc PHỔ chưa phân tích",
  });
  if (!dustOk) blockReasons.push("TR-006: Bụi chưa xử lý");

  // TR-001: TK154 WIP > 0 nếu SX active
  const wipOk = !input.productionActive || input.wipBalance > 0;
  checks.push({
    rule: "TR-001",
    passed: wipOk,
    detail: wipOk
      ? `WIP = ${input.wipBalance} — hợp lý`
      : `WIP = 0 nhưng xưởng đang SX — phi thực tế (KTT ép 154=0?)`,
  });
  if (!wipOk) blockReasons.push("TR-001: WIP=0 khi SX active");

  // TR-003: CP/DT ratio
  const ratioOk = input.cpDtRatio >= 0.10;
  checks.push({
    rule: "TR-003",
    passed: ratioOk,
    detail: ratioOk
      ? `CP/DT = ${(input.cpDtRatio * 100).toFixed(1)}% — hợp lý`
      : `CP/DT = ${(input.cpDtRatio * 100).toFixed(1)}% < 10% — phi lý cho ngành SX 130+ NV`,
  });
  if (!ratioOk) blockReasons.push("TR-003: CP/DT ratio bất thường");

  // Anti-fraud: open alerts
  const fraudOk = input.openFraudAlerts === 0;
  checks.push({
    rule: "ANTI-FRAUD",
    passed: fraudOk,
    detail: fraudOk
      ? "Không có cảnh báo fraud chưa giải quyết"
      : `${input.openFraudAlerts} cảnh báo fraud RED/BLACK chưa xử lý`,
  });
  if (!fraudOk) blockReasons.push(`ANTI-FRAUD: ${input.openFraudAlerts} alerts chưa resolve`);

  // Gatekeeper: TK4211/4212 profit retention
  const gkOk = input.gatekeeperApproved;
  checks.push({
    rule: "CONSTITUTION",
    passed: gkOk,
    detail: gkOk
      ? "Gatekeeper đã phê duyệt kết chuyển lợi nhuận"
      : "CHƯA có Gatekeeper approval cho TK4211→4212",
  });
  if (!gkOk) blockReasons.push("CONSTITUTION: Thiếu Gatekeeper approval");

  const canClose = blockReasons.length === 0;

  // Emit events
  if (canClose) {
    PeriodCloseWiring.emit("PERIOD_CLOSE_STARTED", { period: input.period, checks });
  } else {
    PeriodCloseWiring.emit("PERIOD_CLOSE_BLOCKED", { period: input.period, blockReasons, checks });
    if (!gkOk) {
      PeriodCloseWiring.emit("GATEKEEPER_APPROVAL_REQUIRED", {
        period: input.period,
        reason: "Kết chuyển lợi nhuận TK4211→4212 cần Gatekeeper ký",
      });
    }
  }

  return { canClose, checks, blockReasons };
}

/**
 * Hoàn tất kết sổ — gọi sau khi tất cả checks passed
 */
export function completePeriodClose(period: string, approvedBy: string): void {
  PeriodCloseWiring.emit("PERIOD_CLOSE_COMPLETED", {
    period,
    approvedBy,
    timestamp: Date.now(),
    checksPassedCount: 5,
  });
}
