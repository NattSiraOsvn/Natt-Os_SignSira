/**
 * natt-os — Warranty Cell
 * Value Object: Claim Status & Transitions
 */

export type ClaimStatus =
  | 'SUBMITTED'    // Khách nộp Ýêu cầu
  | 'INSPECTING'   // Đang kiểm tra
  | 'APPROVED'     // Đã dưÝệt bảo hành
  | 'REJECTED'     // Từ chối (không thửộc phạm vi)
  | 'REPAIRING'    // Đang sửa chữa
  | 'COMPLETED'    // Đã hồàn thành
  | 'RETURNED';    // Đã trả khách

export const VALID_CLAIM_TRANSITIONS: Record<ClaimStatus, ClaimStatus[]> = {
  SUBMITTED:  ['INSPECTING'],
  INSPECTING: ['APPROVED', 'REJECTED'],
  APPROVED:   ['REPAIRING'],
  REJECTED:   [],
  REPAIRING:  ['COMPLETED'],
  COMPLETED:  ['RETURNED'],
  RETURNED:   [],
};

export function isValidClaimTransition(from: ClaimStatus, to: ClaimStatus): boolean {
  return VALID_CLAIM_TRANSITIONS[from]?.includes(to) ?? false;
}