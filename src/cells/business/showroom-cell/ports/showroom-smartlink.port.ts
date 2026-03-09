import type { TouchRecord } from "@/cells/infrastructure/smartlink-cell/domain/services/smartlink.engine";

export interface ShowroomSignal {
  type: "PRODUCT_VIEWED" | "ITEM_RESERVED" | "APPOINTMENT_BOOKED" | "DEMO_COMPLETED";
  payload: Record<string, unknown>;
  timestamp: number;
}

const _touchHistory: TouchRecord[] = [];

export const ShowroomSmartLinkPort = {
  emit: (signal: ShowroomSignal): void => {
    const touch: TouchRecord = {
      fromCellId: "showroom-cell",
      toCellId: _routeSignal(signal.type),
      timestamp: signal.timestamp,
      signal: signal.type,
      allowed: true,
    };
    _touchHistory.push(touch);
    console.log(`[SHOWROOM SmartLink] ${signal.type} → ${touch.toCellId}`);
  },

  getHistory: (): TouchRecord[] => [..._touchHistory],

  notifyProductViewed: (productId: string, customerId: string): void =>
    ShowroomSmartLinkPort.emit({ type: "PRODUCT_VIEWED", payload: { productId: productId, customerId: customerId }, timestamp: Date.now() }),
  notifyItemReserved: (productId: string, customerId: string): void =>
    ShowroomSmartLinkPort.emit({ type: "ITEM_RESERVED", payload: { productId: productId, customerId: customerId }, timestamp: Date.now() }),
  notifyAppointmentBooked: (customerId: string, date: string): void =>
    ShowroomSmartLinkPort.emit({ type: "APPOINTMENT_BOOKED", payload: { customerId: customerId, date: date }, timestamp: Date.now() }),
  notifyDemoCompleted: (customerId: string, productId: string): void =>
    ShowroomSmartLinkPort.emit({ type: "DEMO_COMPLETED", payload: { customerId: customerId, productId: productId }, timestamp: Date.now() }),
};

function _routeSignal(type: ShowroomSignal["type"]): string {
  const routes: Record<string, string> = {
    "PRODUCT_VIEWED": "analytics-cell",
    "ITEM_RESERVED": "inventory-cell",
    "APPOINTMENT_BOOKED": "customer-cell",
    "DEMO_COMPLETED": "sales-cell",
  };
  return routes[type] ?? "audit-cell";
}
