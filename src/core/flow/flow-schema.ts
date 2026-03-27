/**
 * NATT-OS Flow Schema
 * Lock #4: Schema validation (không enum cứng — flow tự sinh được)
 * Lock #5: Loop detection + max causation depth
 * Lock #6: Terminal events
 */
import { DomainEventType } from "../events/domain-event";

export interface FlowSchema {
  flowType: string;
  startEvents: DomainEventType[];
  terminalEvents: DomainEventType[];       // Lock #6
  maxDepth?: number;                        // Lock #5
  description: string;
}

// Schemas khai báo — không phải whitelist cứng
// Flow mới chỉ cần có startEvents + terminalEvents hợp lệ
export const FLOW_SCHEMAS: FlowSchema[] = [
  {
    flowType: "ORDER_FLOW",
    startEvents: ["SalesOrderCreated", "OrderPlaced"],
    terminalEvents: ["PaymentProcessed", "SalesOrderCancelled", "OrderCancelled", "RefundIssued"],
    maxDepth: 20,
    description: "Vòng đời đơn hàng: tạo → thanh toán → kết thúc",
  },
  {
    flowType: "PAYMENT_FLOW",
    startEvents: ["PaymentProcessed"],
    terminalEvents: ["InvoiceIssued", "RefundIssued", "PaymentFailed"],
    maxDepth: 10,
    description: "Vòng đời thanh toán: xử lý → hóa đơn / hoàn tiền",
  },
  {
    flowType: "PRODUCTION_FLOW",
    startEvents: ["ProductionStarted"],
    terminalEvents: ["ProductionCompleted", "MaterialLossReported"],
    maxDepth: 15,
    description: "Vòng đời sản xuất: 10 giai đoạn → hoàn thành",
  },
  {
    flowType: "INVENTORY_FLOW",
    startEvents: ["StockReserved", "GoodsDispatched"],
    terminalEvents: ["GoodsReceived", "StockReleased", "StockAlert"],
    maxDepth: 8,
    description: "Vòng đời tồn kho: giữ hàng → xuất / nhận",
  },
  {
    flowType: "HR_FLOW",
    startEvents: ["EmployeeOnboarded"],
    terminalEvents: ["PayslipGenerated", "EmployeeOffboarded"],
    maxDepth: 10,
    description: "Vòng đời nhân sự: onboard → payroll / offboard",
  },
  {
    flowType: "COMPLIANCE_FLOW",
    startEvents: ["ViolationDetected", "FraudFlagged"],
    terminalEvents: ["EntityBlacklisted"],
    maxDepth: 5,
    description: "Vòng đời vi phạm: phát hiện → xử lý",
  },
];

export const FlowSchemaRegistry = {
  validate(flowType: string, eventType: DomainEventType, role: "start"|"terminal"): boolean {
    const schema = FLOW_SCHEMAS.find(s => s.flowType === flowType);
    if (!schema) return true; // Lock #4: unknown flow type = allowed (tự sinh được)
    if (role === "start") return schema.startEvents.includes(eventType);
    return schema.terminalEvents.includes(eventType);
  },

  register(schema: FlowSchema): void {
    // Lock #4: flow mới tự sinh — không cần whitelist
    const existing = FLOW_SCHEMAS.findIndex(s => s.flowType === schema.flowType);
    if (existing >= 0) FLOW_SCHEMAS[existing] = schema;
    else FLOW_SCHEMAS.push(schema);
  },

  getMaxDepth(flowType: string): number {
    return FLOW_SCHEMAS.find(s => s.flowType === flowType)?.maxDepth ?? 30;
  },

  isTerminal(eventType: DomainEventType): boolean {
    return FLOW_SCHEMAS.some(s => s.terminalEvents.includes(eventType));
  },
};
