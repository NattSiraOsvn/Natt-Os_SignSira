import { EventBus } from "./event-bus";
import { EventStore } from "./event-store";
import { DomainEventType } from "./domain-event";

export interface RoutingRule { eventType:DomainEventType; subscribers:string[]; description:string; }

export const ROUTING_TABLE: RoutingRule[] = [
  { eventType:"SalesOrderCreated",    subscribers:["inventory-cell","finance-cell","analytics-cell"],        description:"Đơn hàng mới → tồn kho, hóa đơn, analytics" },
  { eventType:"PaymentProcessed",     subscribers:["finance-cell","analytics-cell","notification-cell"],     description:"Thanh toán → ghi sổ, dashboard, thông báo" },
  { eventType:"StockReserved",        subscribers:["order-cell","warehouse-cell"],                           description:"Hàng giữ → xác nhận đơn, xuất kho" },
  { eventType:"StockAlert",           subscribers:["warehouse-cell","analytics-cell","notification-cell"],   description:"Tồn kho thấp → cảnh báo, reorder" },
  { eventType:"InvoiceIssued",        subscribers:["finance-cell","analytics-cell"],                         description:"Hóa đơn → kế toán, doanh thu" },
  { eventType:"EmployeeOnboarded",    subscribers:["rbac-cell","notification-cell"],                         description:"Nhân viên mới → cấp quyền, thông báo" },
  { eventType:"PayslipGenerated",     subscribers:["finance-cell","notification-cell"],                      description:"Phiếu lương → chi lương, thông báo" },
  { eventType:"ProductionCompleted",  subscribers:["inventory-cell","warehouse-cell","analytics-cell"],      description:"Sản xuất xong → nhập kho, analytics" },
  { eventType:"GoodsDispatched",      subscribers:["inventory-cell","analytics-cell"],                       description:"Xuất kho → trừ tồn, logistics" },
  { eventType:"DeclarationSubmitted", subscribers:["finance-cell","analytics-cell"],                         description:"Tờ khai → dự phòng thuế" },
  { eventType:"ViolationDetected",    subscribers:["security-cell","notification-cell","analytics-cell"],    description:"Vi phạm → alert, Gatekeeper" },
  { eventType:"FraudFlagged",         subscribers:["security-cell","compliance-cell","notification-cell"],   description:"Fraud → block, review" },
  { eventType:"OrderPlaced",          subscribers:["inventory-cell","sales-cell","analytics-cell"],          description:"Đặt hàng → tồn kho, confirm" },
  { eventType:"WarrantyRegistered",   subscribers:["customer-cell","notification-cell"],                     description:"Bảo hành → profile KH, thông báo" },
  { eventType:"MaterialLossReported", subscribers:["analytics-cell","finance-cell","notification-cell"],     description:"Hao hụt → chi phí, cảnh báo" },
  { eventType:"RefundIssued",         subscribers:["finance-cell","inventory-cell","analytics-cell"],        description:"Hoàn tiền → ghi sổ, nhập lại hàng" },
];

export const EventRouter = {
  initialize(): void {
    for(const rule of ROUTING_TABLE){
      EventBus.subscribe(rule.eventType, (envelope)=>{
        if(typeof process!=="undefined"&&process.env?.NODE_ENV!=="test"){
          console.debug(`[EventRouter] ${envelope.event_type} ← ${envelope.origin_cell} → [${rule.subscribers.join(", ")}]`);
        }
      }, "event-router");
    }
    console.log(`[EventRouter] Initialized — ${ROUTING_TABLE.length} routing rules`);
  },
  getRoutingTable(): RoutingRule[] { return ROUTING_TABLE; },
  getSubscribersFor(eventType:DomainEventType): string[] { return ROUTING_TABLE.find(r=>r.eventType===eventType)?.subscribers??[]; },
  addRule(rule:RoutingRule): void { ROUTING_TABLE.push(rule); },
  getStats() {
    return { totalRules:ROUTING_TABLE.length, totalSubscribers:new Set(ROUTING_TABLE.flatMap(r=>r.subscribers)).size, eventTypes:ROUTING_TABLE.map(r=>r.eventType), storeSize:EventStore.size(), busPublished:EventBus.getPublishCount(), busSubscriptions:EventBus.getSubscriptionCount() };
  },
};
