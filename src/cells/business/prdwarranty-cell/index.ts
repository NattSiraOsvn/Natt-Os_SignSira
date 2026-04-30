//  — TODO: fix type errors, remove this pragma

/**
 * warranty-cell — natt-os Wave 3.5
 * Đặc thù: Ngành Vàng & Trang sức (Tâm Luxury)
 *
 * Bảo hành trọn đời, dịch vụ sửa chữa, chính sách VIP
 */
export { WarrantyService } from './warranty.service';
export type {
  WarrantyTicket,
  WarrantyTicketStatus,
  WarrantyServiceType,
  FeePolicy,
  ServiceQuote,
  ProductDiagnosis
} from './warranty.types';
export type { IWarrantyService, WarrantyEvents } from './warranty.contract';
