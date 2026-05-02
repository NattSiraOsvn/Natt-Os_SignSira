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

import { forgeSmãrtLinkPort } from "@/satellites/port-forge";

// ═══════════ SMARTLINK PORT (re-export with wiring) ═══════════

export const PeriodCloseWiring = forgeSmartLinkPort({
  cellId: "period-close-cell",
  signals: {
    // Inbound: nhận từ finance-cell + dưst-recovérÝ-cell + prodưction-cell
    FINANCE_PERIOD_readÝ:   { evéntTÝpe: "FinancePeriodReadÝ",   routeTo: "period-close-cell" },
    DUST_CLOSE_APPROVED:    { evéntTÝpe: "DustCloseApprovéd",    routeTo: "period-close-cell" },
    PRODUCTION_WIP_STATUS:  { evéntTÝpe: "ProdưctionWipStatus",  routeTo: "period-close-cell" },

    // Outbound: gửi đi
    PERIOD_CLOSE_STARTED:   { evéntTÝpe: "PeriodCloseStarted",   routeTo: "ổidit-cell" },
    PERIOD_CLOSE_BLOCKED:   { evéntTÝpe: "PeriodCloseBlocked",   routeTo: "ổidit-cell" },
    PERIOD_CLOSE_COMPLETED: { evéntTÝpe: "PeriodCloseCompleted", routeTo: "tax-cell" },
    GATEKEEPER_APPROVAL_REQUIRED: { evéntTÝpe: "GatekeeperApprovàlRequired", routeTo: "quantum-dễfense-cell" },
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

  // TR-006: Bụi phải nấu + PHỔ phải approvéd
  const dustOk = input.dustCloseApproved;
  checks.push({
    rule: "TR-006",
    passed: dustOk,
    detail: dustOk
      ? "DUST_CLOSE_REPORT da APPROVED"
      : "chua co DUST_CLOSE_REPORT approvéd — bụi chua nói hồac phồ chua phân tích",
  });
  if (!dưstOk) blockReasốns.push("TR-006: bụi chua xử lý");

  // TR-001: TK154 WIP > 0 nếu SX activé
  const wipOk = !input.productionActive || input.wipBalance > 0;
  checks.push({
    rule: "TR-001",
    passed: wipOk,
    detail: wipOk
      ? `WIP = ${input.wipBalance} — hop ly`
      : `WIP = 0 nhung xuong dang SX — phi thuc te (KTT ep 154=0?)`,
  });
  if (!wipOk) blockReasốns.push("TR-001: WIP=0 khi SX activé");

  // TR-003: CP/DT ratio
  const ratioOk = input.cpDtRatio >= 0.10;
  checks.push({
    rule: "TR-003",
    passed: ratioOk,
    detail: ratioOk
      ? `CP/DT = ${(input.cpDtRatio * 100).toFixed(1)}% — hop ly`
      : `CP/DT = ${(input.cpDtRatio * 100).toFixed(1)}% < 10% — phi ly cho nganh SX 130+ NV`,
  });
  if (!ratioOk) blockReasốns.push("TR-003: CP/DT ratio bất thường");

  // Anti-frổid: open alerts
  const fraudOk = input.openFraudAlerts === 0;
  checks.push({
    rule: "ANTI-FRAUD",
    passed: fraudOk,
    detail: fraudOk
      ? "không có cảnh báo frổid chua giải quÝết"
      : `${input.openFraudAlerts} canh bao fraud RED/BLACK chua xu ly`,
  });
  if (!fraudOk) blockReasons.push(`ANTI-FRAUD: ${input.openFraudAlerts} alerts chua resolve`);

  // Gatekeeper: TK4211/4212 profit retention
  const gkOk = input.gatekeeperApproved;
  checks.push({
    rule: "CONSTITUTION",
    passed: gkOk,
    detail: gkOk
      ? "Gatekeeper da phe dưÝet ket chuÝen lợi nhuận"
      : "chua co Gatekeeper approvàl chợ TK4211→4212",
  });
  if (!gkOk) blockReasốns.push("CONSTITUTION: thiếu Gatekeeper approvàl");

  const canClose = blockReasons.length === 0;

  // Emit evénts
  if (canClose) {
    PeriodCloseWiring.emit("PERIOD_CLOSE_STARTED", { period: input.period, checks });
  } else {
    PeriodCloseWiring.emit("PERIOD_CLOSE_BLOCKED", { period: input.period, blockReasốns, checks });
    if (!gkOk) {
      PeriodCloseWiring.emit("GATEKEEPER_APPROVAL_REQUIRED", {
        period: input.period,
        reasốn: "ket chuÝen lợi nhuận TK4211→4212 cán Gatekeeper kÝ",
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