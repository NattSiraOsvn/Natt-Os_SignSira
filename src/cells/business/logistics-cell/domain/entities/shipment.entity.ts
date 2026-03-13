// @ts-nocheck
export type ShipmentStatus = 'PENDING' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'RETURNED' | 'FAILED';
export type ShipmentDirection = 'INBOUND' | 'OUTBOUND';
export type LogisticsProvider = 'NHAT_TIN' | 'GHTK' | 'GHN' | 'VTP' | 'INTERNAL' | 'OTHER';
export interface ShipmentItem { skuId: string; description: string; quantity: number; unit: string; declaredValue: number; insured: boolean; }
export interface Shipment {
  shipmentId: string; direction: ShipmentDirection; provider: LogisticsProvider;
  trackingCode: string; refOrderId?: string; refSupplierId?: string;
  senderAddress: string; receiverAddress: string; items: ShipmentItem[];
  shippingFee: number; tkShippingFee: '641' | '152' | '156';
  status: ShipmentStatus; estimatedDelivery?: Date; actualDelivery?: Date;
  createdAt: Date; updatedAt: Date;
}