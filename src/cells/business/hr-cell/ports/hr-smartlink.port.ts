// HR SmartLink Port — điểm chạm của hr-cell ra ngoài (Điều 5#6)
import type { TouchRecord } from "@/cells/infrastructure/smartlink-cell/domain/services/smartlink.engine";

export interface HRSignal {
  type: "EMPLOYEE_ONBOARDED" | "EMPLOYEE_OFFBOARDED" | "PAYSLIP_GENERATED" | "LEAVE_REQUESTED";
  employeeId: string;
  payload: Record<string, unknown>;
  timestamp: number;
}

const _touchHistory: TouchRecord[] = [];

export const HRSmartLinkPort = {
  emit: (signal: HRSignal): void => {
    const touch: TouchRecord = {
      fromCellId: "hr-cell",
      toCellId: signal.type === "PAYSLIP_GENERATED" ? "finance-cell" : "audit-cell",
      timestamp: signal.timestamp,
      signal: signal.type,
      allowed: true,
    };
    _touchHistory.push(touch);
    console.log(`[HR SmartLink] ${signal.type} → ${touch.toCellId}`);
  },

  getHistory: (): TouchRecord[] => [..._touchHistory],

  notifyOnboard: (employeeId: string): void =>
    HRSmartLinkPort.emit({ type: "EMPLOYEE_ONBOARDED", employeeId, payload: {}, timestamp: Date.now() }),

  notifyOffboard: (employeeId: string): void =>
    HRSmartLinkPort.emit({ type: "EMPLOYEE_OFFBOARDED", employeeId, payload: {}, timestamp: Date.now() }),

  notifyPayslip: (employeeId: string, month: string, netIncome: number): void =>
    HRSmartLinkPort.emit({ type: "PAYSLIP_GENERATED", employeeId, payload: { month, netIncome }, timestamp: Date.now() }),
};
