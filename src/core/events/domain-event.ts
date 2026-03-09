export type DomainEventType =
  | "SalesOrderCreated" | "SalesOrderCancelled" | "ExchangeProcessed" | "DiscountApplied"
  | "PaymentProcessed" | "PaymentFailed" | "RefundIssued"
  | "StockReserved" | "StockReleased" | "StockReplenished" | "StockAlert"
  | "InvoiceIssued" | "InvoiceSigned" | "InvoiceSubmitted" | "VATReportSubmitted" | "JournalEntryCreated"
  | "EmployeeOnboarded" | "EmployeeOffboarded" | "PayslipGenerated" | "LeaveApproved" | "LeaveRejected"
  | "ProductionStarted" | "ProductionCompleted" | "ProductionStageAdvanced" | "MaterialLossReported"
  | "GoodsDispatched" | "GoodsReceived" | "TransferCreated"
  | "DeclarationSubmitted" | "DeclarationCleared"
  | "ViolationDetected" | "FraudFlagged" | "EntityBlacklisted"
  | "OrderPlaced" | "OrderConfirmed" | "OrderCancelled"
  | "WarrantyRegistered" | "WarrantyClaimOpened" | "WarrantyClaimResolved"
  | "CustomerProfileUpdated" | "CustomerTierChanged"
  | "DailyReportGenerated" | "RFMSnapshotCalculated";

export interface GenericPayload { [key: string]: unknown; }

export interface SalesOrderCreatedPayload { orderId:string; total:number; sellerId:string; customerId?:string; channel:string; items:Array<{productId:string;quantity:number;unitPrice:number}>; }
export interface PaymentProcessedPayload { transactionId:string; orderId?:string; amount:number; method:string; customerId?:string; }
export interface StockReservedPayload { itemId:string; sku?:string; quantity:number; reservedFor?:string; }
export interface InvoiceIssuedPayload { invoiceId:string; buyerName:string; buyerTaxCode?:string; totalAmount:number; vatAmount:number; grandTotal:number; }
export interface EmployeeOnboardedPayload { employeeId:string; fullName:string; position:string; department:string; baseSalary:number; }
export interface ProductionCompletedPayload { orderId:string; quantity:number; stage?:string; }
export interface GoodsDispatchedPayload { transferId:string; fromWarehouse:string; items?:string[]; }
export interface DeclarationSubmittedPayload { trackingId:string; importerId?:string; totalPayable?:number; }
export interface ViolationDetectedPayload { entityId:string; severity:"LOW"|"MEDIUM"|"HIGH"|"CRITICAL"; flags?:string[]; }
export interface WarrantyRegisteredPayload { warrantyId:string; customerId:string; productSku:string; expiryDate:string; }
export interface OrderPlacedPayload { orderId:string; customerId:string; totalAmount:number; channel:string; itemCount:number; }

export type DomainEventPayload =
  | SalesOrderCreatedPayload | PaymentProcessedPayload | StockReservedPayload
  | InvoiceIssuedPayload | EmployeeOnboardedPayload | ProductionCompletedPayload
  | GoodsDispatchedPayload | DeclarationSubmittedPayload | ViolationDetectedPayload
  | WarrantyRegisteredPayload | OrderPlacedPayload | GenericPayload;

export interface DomainEvent<T extends DomainEventPayload = GenericPayload> {
  type: DomainEventType;
  payload: T;
}
