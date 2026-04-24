/**
 * Natt-OS Payment Deposit Engine v1.0
 * Wire vào payment-cell — PORT_ONLY → LIVE
 *
 * Logic từ: MEGA v10.1 processDThuDaily()
 * Vòng đời: Cọc → Hoàn tiền → Xóa / Chuyển thành doanh thu
 */

export type DepositStatus = 'COC' | 'DA_THANH_TOAN' | 'HOAN_COC' | 'HUY';

export interface DepositRecord {
  id:          string;   // unique key
  orderId:     string;
  customer:    string;
  phone:       string;
  seller:      string;
  amount:      number;
  depositDate: Date | null;
  type:        'COC' | 'THANH_TOAN' | 'HT_COC' | 'HOAN_TIEN';
  status:      DepositStatus;
  note:        string;
  paidAt?:     Date;
  refundAt?:   Date;
}

// ── DETECT DEPOSIT TYPE ───────────────────────────────────────────────────
export function detectDepositType(description: string): DepositRecord['type'] | null {
  const d = description.toLowerCase();
  if (/ht cọc|ht coc|hoàn cọc|hoàn tất cọc/.test(d)) return 'HT_COC';
  if (/hoàn tiền|hoan tien|refund|trả lại/.test(d))   return 'HOAN_TIEN';
  if (/cọc|dat coc|dat truoc|đặt cọc/.test(d))        return 'COC';
  if (/thanh toán|thanh toan|tt đơn|payment/.test(d)) return 'THANH_TOAN';
  return null;
}

// ── BUILD KEY ─────────────────────────────────────────────────────────────
export function buildDepositKey(phone: string, customer: string, type: string, date: unknown, seller: string): string {
  return [phone, customer, type, String(date), seller].join('||').toLowerCase();
}

// ── PROCESS DEPOSIT LIFECYCLE ─────────────────────────────────────────────
/**
 * Xử lý vòng đời cọc từ raw rows
 * Input:  rows từ sheet DThu (có header row)
 * Output: { active: cọc chưa hoàn, completed: đã hoàn/thanh toán, toDelete: xóa khỏi sheet }
 */
export function processDepositLifecycle(rows: unknown[][], headerRowIndex = 1): {
  active:    DepositRecord[];
  completed: DepositRecord[];
  toDelete:  number[];   // row indices to delete from source sheet
  summary:   { totalCoc: number; totalCompleted: number; totalRefund: number };
} {
  const active: DepositRecord[] = [];
  const completed: DepositRecord[] = [];
  const toDelete: number[] = [];
  const cocMap = new Map<string, DepositRecord>();

  // Parse rows
  const dataRows = rows.slice(headerRowIndex);
  dataRows.forEach((row, idx) => {
    const rowIndex = headerRowIndex + idx; // 1-based index trong sheet gốc
    const [seller, type, date, customer, phone, ...rest] = row as string[];
    const amount = parseFloat(String(rest[0] || '0').replace(/[^\d.-]/g, '')) || 0;
    const note   = String(rest[1] || '');
    const depositType = detectDepositType(String(type || ''));

    if (!depositType) return;

    const record: DepositRecord = {
      id:          buildDepositKey(String(phone), String(customer), String(type), date, String(seller)),
      orderId:     note,
      customer:    String(customer),
      phone:       String(phone),
      seller:      String(seller),
      amount,
      depositDate: date ? new Date(String(date)) : null,
      type:        depositType,
      status:      'COC',
      note,
    };

    if (depositType === 'COC') {
      // Giữ cọc trong active, backup
      cocMap.set(record.id, record);
      active.push(record);
    }
    else if (depositType === 'HT_COC') {
      // Hoàn tất cọc → tìm cọc gốc, đánh dấu hoàn thành
      const cocKey = buildDepositKey(String(phone), String(customer), 'COC', '', String(seller));
      const original = cocMap.get(cocKey);
      if (original) {
        original.status = 'DA_THANH_TOAN';
        original.paidAt = new Date();
        completed.push(original);
        cocMap.delete(cocKey);
      }
      toDelete.push(rowIndex);
    }
    else if (depositType === 'HOAN_TIEN') {
      record.status  = 'HOAN_COC';
      record.refundAt = new Date();
      completed.push(record);
      toDelete.push(rowIndex);
    }
    else if (depositType === 'THANH_TOAN') {
      record.status = 'DA_THANH_TOAN';
      record.paidAt = new Date();
      completed.push(record);
      toDelete.push(rowIndex);
    }
  });

  // Sort toDelete descending để xóa từ dưới lên (không shift index)
  toDelete.sort((a, b) => b - a);

  const summary = {
    totalCoc:       active.filter(r => r.type === 'COC').length,
    totalCompleted: completed.filter(r => r.status === 'DA_THANH_TOAN').length,
    totalRefund:    completed.filter(r => r.status === 'HOAN_COC').length,
  };

  return { active, completed, toDelete, summary };
}

// ── PAYMENT CONFIRMATION ──────────────────────────────────────────────────
export interface PaymentConfirmation {
  orderId:   string;
  amount:    number;
  method:    'CK' | 'QR' | 'COD' | 'POS' | 'CASH';
  ref:       string;
  paidAt:    Date;
  operator:  string;
  status:    'CONFIRMED' | 'PENDING' | 'FAILED';
}

export function createPaymentConfirmation(params: Omit<PaymentConfirmation, 'paidAt' | 'status'>): PaymentConfirmation {
  return { ...params, paidAt: new Date(), status: 'CONFIRMED' };
}

export default { detectDepositType, buildDepositKey, processDepositLifecycle, createPaymentConfirmation };
