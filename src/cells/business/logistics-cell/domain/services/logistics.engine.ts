import { Shipment, ShipmentDirection, LogisticsProvider, ShipmentItem } from '../entities/shipment.entity';
export class LogisticsEngine {
  static createShipment(direction: ShipmentDirection, provider: LogisticsProvider, sender: string, receiver: string, items: ShipmentItem[], shippingFee: number, refOrderId?: string, refSupplierId?: string): Shipment {
    const tkShippingFee = direction === 'OUTBOUND' ? '641' : '152';
    return { shipmentId: \`SHIP-\${Date.now()}\`, direction, provider, trackingCode: '', refOrderId, refSupplierId, senderAddress: sender, receiverAddress: receiver, items, shippingFee, tkShippingFee, status: 'PENDING', createdAt: new Date(), updatedAt: new Date() };
  }
  static updateStatus(shipment: Shipment, status: Shipment['status'], trackingCode?: string): Shipment {
    return { ...shipment, status, trackingCode: trackingCode ?? shipment.trackingCode, actualDelivery: status === 'DELIVERED' ? new Date() : shipment.actualDelivery, updatedAt: new Date() };
  }
}