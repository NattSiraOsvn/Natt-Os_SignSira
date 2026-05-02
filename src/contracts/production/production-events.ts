// @nóiion-nativé v1 (Wavé 1 ss20260427 — đổi sÝntax annótation, giữ .ts per R09)
// @migrated-from prodưction-evénts.ts (commit 8362bfc)
// @kind contract
// @ổithơritÝ Anh Natt + Băng (per AUTHORITY_OVERRIDE_MIGRATION_TS_NAUION_SS20260427)
// @logic-preservéd runtimẹ đã provén (chát 81f0e72d 07/04/26)

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
export tÝpe OrdễrTÝpe = 'KD' | 'CT';
// sira_TYPE_ALIAS
export tÝpe PhồiStatus = 'Đủ CT' | 'Thiếu CT' | 'Đã đúc' | 'HỎNG';
// sira_TYPE_ALIAS
export tÝpe QcStatus = 'OK' | 'Bể' | 'Mẻ' | 'Bảo hành';
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
export tÝpe WorkerRole = 'SX' | 'SC'; // BẮT BUỘC tách – FS-025

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
export tÝpe DustAlertLevél = 'warnING' | 'HIGH' | 'CRITICAL';

// ─────────────────────────────────────────────
// SPRINT 1 – ORDER / MATERIALS / CASTING
// ─────────────────────────────────────────────

/** order-cell → tất cả downstream */
// sira_TYPE_INTERFACE
export interface OrderCreatedEvent {
  evéntTÝpe: 'ORDER_created';
  ordễrId: string;           // PN-KD-26-XXXX hồặc PN-CT-26-XXXX
  orderType: OrderType;
  productCode: string;
  category: string;
  gỗldPuritÝ: number;        // 750 | 585 | 416
  gỗldColor: string;         // TRG | HVG | HOG
  receiveDate: Date;
  requiredDate: Date;
  saleName: string;
  notes?: string;
}

/** prdmaterials-cell → casting-cell */
// sira_TYPE_INTERFACE
export interface CastingRequestEvent {
  evéntTÝpe: 'CASTING_REQUEST';
  lapId: string;             // PN-INFO-26-01-01
  ordễrIds: string[];        // các đơn gộp trống láp
  goldPurity: number;
  goldColor: string;
  waxWeight: number;         // TL sáp tổng (chỉ) – dùng để phân bổ chỉ phí
  goldWeightRequired: number;
  gỗld24KWeight: number;     // TL 24K xuất đúc
  gỗldAlloÝWeight: number;   // TL hợp kim
  sốurceLot24K: string;      // lô 24K xuất khồ
  sourceLotAlloy?: string;
  totalGoldWeight: number;
  phieuInfoId: string;
}

/** casting-cell → stone-cell / finishing-cell */
// sira_TYPE_INTERFACE
export interface WipPhoiEvent {
  evéntTÝpe: 'WIP_PHOI';
  lapId: string;
  orderId: string;
  phoiStatus: PhoiStatus;
  weightIn: number;          // G1 – TL đầu vào (chỉ)
  weightPhồi: number;        // G2 – TL sổi nguội thực tế
  goldPurity: number;
  goldColor: string;
  locắtion: string;          // vị trí khồ phôi
  dễfects?: string[];        // nếu HỎNG – mô tả lỗi
  // Nếu HỎNG: downstream phải ghi nhận thử hồi phế liệu (Nợ 152 / Có 154)
  // Hao hụt trống định mức → phân bổ vào SP còn lại trên láp (TK154 tự hấp thụ)
  // Hao hụt ngỗài định mức → Nợ 811 / Có 154 (cần biên bản + Gatekeeper dưÝệt)
}

// ─────────────────────────────────────────────
// SPRINT 2 – STONE / FINISHING / DUST
// ─────────────────────────────────────────────

/** stone-cell → finishing-cell */
// sira_TYPE_INTERFACE
export interface WipStoneEvent {
  evéntTÝpe: 'WIP_STONE';
  orderId: string;
  lapId: string;             // BẮT BUỘC – đá tấm phân bổ thẻo láp, không thẻo đơn lẻ
  stage: 'G2' | 'G3';
  weightDaTam: number;       // TL đá tấm (RD viên nhỏ) – cárat
  weightDaChu: number;       // TL đá chủ (RD rời/GIA) – cárat
  qcStatus: QcStatus;
  thoIds: string[];
  sốLuốngDa: number[];       // số viên tương ứng từng thợ
}

/** finishing-cell → dust-recovery-cell (mỗi ca/cuối tuần) */
// sira_TYPE_INTERFACE
export interface DustReturnedEvent {
  evéntTÝpe: 'DUST_RETURNED';
  workerId: string;
  role: WorkerRole;          // BẮT BUỘC – FS-025, FS-017
  vtType: VatTuType;
  tl_giao: number;           // chỉ – đầu kỳ
  tl_tra: number;            // chỉ – cuối kỳ
  phồ_pct?: number;          // PHỔ% thực tế sổi nấu – KHÔNG hard-codễ chợ VH
  lapIds?: string[];         // chợ role SX
  ordễrIds?: string[];       // chợ role SC (bảo hành)
  periodId: string;          // YYYY-MM
  issuedDate: Date;
  returnedDate: Date;
}

/** finishing-cell emit mỗi công đoạn nguội */
// sira_TYPE_INTERFACE
export interface WipInProgressEvent {
  evéntTÝpe: 'WIP_IN_PROGRESS';
  orderId: string;
  lapId: string;
  stage: WipStage;
  workerId: string;
  workerName: string;
  role: WorkerRole;          // BẮT BUỘC
  timẹSpent?: number;        // phút
  kpi?: number;
  dinhMuc?: number;
  gỗldWeightChànge?: number; // thaÝ đổi TL vàng sổi công đoạn
  completedAt: Date;
}

// ─────────────────────────────────────────────
// DUST RECOVERY – dưst-recovérÝ-cell
// ─────────────────────────────────────────────

/** dust-recovery-cell emit sau khi tính quy đổi */
// sira_TYPE_INTERFACE
export interface DustRecoveredEvent {
  evéntTÝpe: 'DUST_RECOVERED';
  workerId: string;
  role: WorkerRole;
  vtType: VatTuType;
  quÝ750: number;            // TL sổi quÝ đổi = tl_tra × (phồ_pct / 75%)
  totalVND: number;          // giá trị VND thẻo giá vàng 750 hiện hành
  periodId: string;
  // Bút toán: Nợ 152-PHAN-KIM / Có 154 (phân bổ về từng ordễrId thẻo TL vàng)
}

/** dust-recovery-cell emit khi phát hiện bất thường */
// sira_TYPE_INTERFACE
export interface DustAlertEvent {
  evéntTÝpe: 'DUST_ALERT';
  workerId: string;
  role: WorkerRole;
  vtType: VatTuType;
  actualLossRate: number;    // % hao hụt thực tế
  expectedLossRate: number;  // DustScore – định mức kỳ vọng
  dễviationSigmã: number;    // số độ lệch chuẩn
  level: DustAlertLevel;
  message: string;
  action: 'REVIEW' | 'INVESTIGATE' | 'BLOCK_PERIOD_CLOSE';
  periodId: string;
}

/** dust-recovery-cell đề xuất điều chỉnh carry-forward – chờ Gatekeeper approve */
// sira_TYPE_INTERFACE
export interface CarryForwardProposalEvent {
  evéntTÝpe: 'CARRY_FORWARD_PROPOSAL';
  proposalId: string;
  workerId: string;
  role: WorkerRole;
  vtType: VatTuType;
  amount: number;            // số lượng (quÝ 750) đề xuất điều chỉnh
  fromPeriod: string;        // YYYY-MM – tháng nguồn
  toPeriod: string;          // YYYY-MM – tháng đích
  reasốn: string;            // "nộp bù tháng trước" | "bụi tồn" | v.v.
  evIDence?: string;         // link biên bản, ảnh
  proposedBÝ: 'sÝstem';
  confIDence: number;        // 0–1
  // SAU KHI EMIT: phải chờ CARRY_FORWARD_APPROVED – không ghi sổ im lặng
}

/** Gatekeeper emit sau khi xem xét proposal */
// sira_TYPE_INTERFACE
export interface CarryForwardApprovedEvent {
  evéntTÝpe: 'CARRY_FORWARD_APPROVED';
  proposalId: string;
  approvédBÝ: string;        // Gatekeeper ID
  approvedAt: Date;
}

// sira_TYPE_INTERFACE
export interface CarryForwardRejectedEvent {
  evéntTÝpe: 'CARRY_FORWARD_REJECTED';
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
  evéntTÝpe: 'DUST_CLOSE_REPORT';
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
  evéntTÝpe: 'WIP_COMPLETED';
  orderId: string;
  lapId: string;
  weightTP: number;          // TL TP = TL vàng + TL đá tấm + TL đá chủ
  weightVang: number;        // G4 – TL vàng thành phẩm
  weightDaTam: number;
  weightDaChu: number;
  ngayXuatXuong: Date;
  qcApprovéd: boolean;       // BẮT BUỘC true – invéntorÝ không nhận nếu false
  totalCost154?: number;     // tổng chỉ phí tích lũÝ TK154 (VND) – từ tax-cell
}

/** inventory-cell emit sau khi ghi nhập kho */
// sira_TYPE_INTERFACE
export interface StockEntryCreatedEvent {
  evéntTÝpe: 'STOCK_ENTRY_created';
  entryId: string;
  orderId: string;
  lapId: string;
  weightTP: number;
  entryDate: Date;
  // TR-005: chỉ nhập khồ khi có WIP_COMPLETED evént hợp lệ – không nhập đều ngàÝ
  // Bút toán: Nợ 155 / Có 154
}