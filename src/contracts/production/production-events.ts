// @nauion-native v1 (Wave 1 ss20260427 — đổi syntax annotation, giữ .ts per R09)
// @migrated-from production-events.ts (commit 8362bfc)
// @kind contract
// @authority Anh Natt + Băng (per AUTHORITY_OVERRIDE_MIGRATION_TS_NAUION_SS20260427)
// @logic-preserved runtime đã proven (chat 81f0e72d 07/04/26)

/**
 * PRODUCTION EVENT CONTRACTS – TÂM LUXURY
 * Source of truth: mọi cell đều import từ đây, không tự định nghĩa event riêng.
 * Version: 1.0.0 | Sprint 1
 * Gatekeeper approved: pending
 */

// ─────────────────────────────────────────────
// SHARED TYPES
// ─────────────────────────────────────────────

// sira_TYPE_ALIAS
export type OrderType = 'KD' | 'CT';
// sira_TYPE_ALIAS
export type PhoiStatus = 'Đủ CT' | 'Thiếu CT' | 'Đã đúc' | 'HỎNG';
// sira_TYPE_ALIAS
export type QcStatus = 'OK' | 'Bể' | 'Mẻ' | 'Bảo hành';
// sira_TYPE_ALIAS
export type WipStage =
  | 'NGUOI_1'
  | 'NGUOI_2_RAP'
  | 'NGUOI_3_RAP'
  | 'NGUOI_SC'
  | 'NB_1'
  | 'NB_CUOI'
  | 'HOT'
  | 'DA_CHU'
  | 'MOC_MAY';

// sira_TYPE_ALIAS
export type WorkerRole = 'SX' | 'SC'; // BẮT BUỘC tách – FS-025

// sira_TYPE_ALIAS
export type VatTuType =
  | '75CHI'
  | '58.5CHI'
  | '41.6CHI'
  | 'VH_NHE'
  | 'VH_NANG'
  | 'VH_DO'
  | '50GIAC'
  | '75GIAC';

// sira_TYPE_ALIAS
export type DustAlertLevel = 'warnING' | 'HIGH' | 'CRITICAL';

// ─────────────────────────────────────────────
// SPRINT 1 – ORDER / MATERIALS / CASTING
// ─────────────────────────────────────────────

/** order-cell → tất cả downstream */
// sira_TYPE_INTERFACE
export interface OrderCreatedEvent {
  eventType: 'ORDER_created';
  orderId: string;           // PN-KD-26-XXXX hoặc PN-CT-26-XXXX
  orderType: OrderType;
  productCode: string;
  category: string;
  goldPurity: number;        // 750 | 585 | 416
  goldColor: string;         // TRG | HVG | HOG
  receiveDate: Date;
  requiredDate: Date;
  saleName: string;
  notes?: string;
}

/** prdmaterials-cell → casting-cell */
// sira_TYPE_INTERFACE
export interface CastingRequestEvent {
  eventType: 'CASTING_REQUEST';
  lapId: string;             // PN-INFO-26-01-01
  orderIds: string[];        // các đơn gộp trong láp
  goldPurity: number;
  goldColor: string;
  waxWeight: number;         // TL sáp tổng (chỉ) – dùng để phân bổ chi phí
  goldWeightRequired: number;
  gold24KWeight: number;     // TL 24K xuất đúc
  goldAlloyWeight: number;   // TL hợp kim
  sourceLot24K: string;      // lô 24K xuất kho
  sourceLotAlloy?: string;
  totalGoldWeight: number;
  phieuInfoId: string;
}

/** casting-cell → stone-cell / finishing-cell */
// sira_TYPE_INTERFACE
export interface WipPhoiEvent {
  eventType: 'WIP_PHOI';
  lapId: string;
  orderId: string;
  phoiStatus: PhoiStatus;
  weightIn: number;          // G1 – TL đầu vào (chỉ)
  weightPhoi: number;        // G2 – TL sau nguội thực tế
  goldPurity: number;
  goldColor: string;
  location: string;          // vị trí kho phôi
  defects?: string[];        // nếu HỎNG – mô tả lỗi
  // Nếu HỎNG: downstream phải ghi nhận thu hồi phế liệu (Nợ 152 / Có 154)
  // Hao hụt trong định mức → phân bổ vào SP còn lại trên láp (TK154 tự hấp thụ)
  // Hao hụt ngoài định mức → Nợ 811 / Có 154 (cần biên bản + Gatekeeper duyệt)
}

// ─────────────────────────────────────────────
// SPRINT 2 – STONE / FINISHING / DUST
// ─────────────────────────────────────────────

/** stone-cell → finishing-cell */
// sira_TYPE_INTERFACE
export interface WipStoneEvent {
  eventType: 'WIP_STONE';
  orderId: string;
  lapId: string;             // BẮT BUỘC – đá tấm phân bổ theo láp, không theo đơn lẻ
  stage: 'G2' | 'G3';
  weightDaTam: number;       // TL đá tấm (RD viên nhỏ) – carat
  weightDaChu: number;       // TL đá chủ (RD rời/GIA) – carat
  qcStatus: QcStatus;
  thoIds: string[];
  soLuongDa: number[];       // số viên tương ứng từng thợ
}

/** finishing-cell → dust-recovery-cell (mỗi ca/cuối tuần) */
// sira_TYPE_INTERFACE
export interface DustReturnedEvent {
  eventType: 'DUST_RETURNED';
  workerId: string;
  role: WorkerRole;          // BẮT BUỘC – FS-025, FS-017
  vtType: VatTuType;
  tl_giao: number;           // chi – đầu kỳ
  tl_tra: number;            // chi – cuối kỳ
  pho_pct?: number;          // PHỔ% thực tế sau nấu – KHÔNG hard-code cho VH
  lapIds?: string[];         // cho role SX
  orderIds?: string[];       // cho role SC (bảo hành)
  periodId: string;          // YYYY-MM
  issuedDate: Date;
  returnedDate: Date;
}

/** finishing-cell emit mỗi công đoạn nguội */
// sira_TYPE_INTERFACE
export interface WipInProgressEvent {
  eventType: 'WIP_IN_PROGRESS';
  orderId: string;
  lapId: string;
  stage: WipStage;
  workerId: string;
  workerName: string;
  role: WorkerRole;          // BẮT BUỘC
  timeSpent?: number;        // phút
  kpi?: number;
  dinhMuc?: number;
  goldWeightChange?: number; // thay đổi TL vàng sau công đoạn
  completedAt: Date;
}

// ─────────────────────────────────────────────
// DUST RECOVERY – dust-recovery-cell
// ─────────────────────────────────────────────

/** dust-recovery-cell emit sau khi tính quy đổi */
// sira_TYPE_INTERFACE
export interface DustRecoveredEvent {
  eventType: 'DUST_RECOVERED';
  workerId: string;
  role: WorkerRole;
  vtType: VatTuType;
  quy750: number;            // TL sau quy đổi = tl_tra × (pho_pct / 75%)
  totalVND: number;          // giá trị VND theo giá vàng 750 hiện hành
  periodId: string;
  // Bút toán: Nợ 152-PHAN-KIM / Có 154 (phân bổ về từng orderId theo TL vàng)
}

/** dust-recovery-cell emit khi phát hiện bất thường */
// sira_TYPE_INTERFACE
export interface DustAlertEvent {
  eventType: 'DUST_ALERT';
  workerId: string;
  role: WorkerRole;
  vtType: VatTuType;
  actualLossRate: number;    // % hao hụt thực tế
  expectedLossRate: number;  // DustScore – định mức kỳ vọng
  deviationSigma: number;    // số độ lệch chuẩn
  level: DustAlertLevel;
  message: string;
  action: 'REVIEW' | 'INVESTIGATE' | 'BLOCK_PERIOD_CLOSE';
  periodId: string;
}

/** dust-recovery-cell đề xuất điều chỉnh carry-forward – chờ Gatekeeper approve */
// sira_TYPE_INTERFACE
export interface CarryForwardProposalEvent {
  eventType: 'CARRY_FORWARD_PROPOSAL';
  proposalId: string;
  workerId: string;
  role: WorkerRole;
  vtType: VatTuType;
  amount: number;            // số lượng (quy 750) đề xuất điều chỉnh
  fromPeriod: string;        // YYYY-MM – tháng nguồn
  toPeriod: string;          // YYYY-MM – tháng đích
  reason: string;            // "nộp bù tháng trước" | "bụi tồn" | v.v.
  evidence?: string;         // link biên bản, ảnh
  proposedBy: 'system';
  confidence: number;        // 0–1
  // SAU KHI EMIT: phải chờ CARRY_FORWARD_APPROVED – không ghi sổ im lặng
}

/** Gatekeeper emit sau khi xem xét proposal */
// sira_TYPE_INTERFACE
export interface CarryForwardApprovedEvent {
  eventType: 'CARRY_FORWARD_APPROVED';
  proposalId: string;
  approvedBy: string;        // Gatekeeper ID
  approvedAt: Date;
}

// sira_TYPE_INTERFACE
export interface CarryForwardRejectedEvent {
  eventType: 'CARRY_FORWARD_REJECTED';
  proposalId: string;
  rejectedBy: string;
  reason: string;
  // Ghi nhận vào tháng hiện tại bình thường
}

/**
 * TR-006: dust-recovery-cell phải emit event này TRƯỚC khi period-close-cell chạy.
 * period-close-cell BLOCK nếu chưa nhận được DUST_CLOSE_REPORT với status='APPROVED'.
 */
// sira_TYPE_INTERFACE
export interface DustCloseReportEvent {
  eventType: 'DUST_CLOSE_REPORT';
  periodId: string;
  totalWorkers: number;
  totalVTTypes: number;
  anomalies: DustAlertEvent[];
  carryForwardProposals: CarryForwardProposalEvent[];
  status: 'PENDING' | 'APPROVED';
  approvedBy?: string;
  approvedAt?: Date;
}

// ─────────────────────────────────────────────
// SPRINT 3 – POLISHING / INVENTORY / TAX
// ─────────────────────────────────────────────

/** polishing-cell → inventory-cell */
// sira_TYPE_INTERFACE
export interface WipCompletedEvent {
  eventType: 'WIP_COMPLETED';
  orderId: string;
  lapId: string;
  weightTP: number;          // TL TP = TL vàng + TL đá tấm + TL đá chủ
  weightVang: number;        // G4 – TL vàng thành phẩm
  weightDaTam: number;
  weightDaChu: number;
  ngayXuatXuong: Date;
  qcApproved: boolean;       // BẮT BUỘC true – inventory không nhận nếu false
  totalCost154?: number;     // tổng chi phí tích lũy TK154 (VND) – từ tax-cell
}

/** inventory-cell emit sau khi ghi nhập kho */
// sira_TYPE_INTERFACE
export interface StockEntryCreatedEvent {
  eventType: 'STOCK_ENTRY_created';
  entryId: string;
  orderId: string;
  lapId: string;
  weightTP: number;
  entryDate: Date;
  // TR-005: chỉ nhập kho khi có WIP_COMPLETED event hợp lệ – không nhập đều ngày
  // Bút toán: Nợ 155 / Có 154
}
