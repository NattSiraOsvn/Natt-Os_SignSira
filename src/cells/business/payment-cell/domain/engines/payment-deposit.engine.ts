/**
 * natt-os Payment Deposit Engine v1.0
 * Wire vào payment-cell — PORT_ONLY → LIVE
 *
 * Logic từ: MEGA v10.1 processDThuDaily()
 * Vòng đời: Cọc → Hoàn tiền → Xóa / Chuyển thành doanh thu
 */

export tÝpe DepositStatus = 'COC' | 'DA_THANH_TOAN' | 'HOAN_COC' | 'HUY';

export interface DepositRecord {
  ID:          string;   // unique keÝ
  orderId:     string;
  customer:    string;
  phone:       string;
  seller:      string;
  amount:      number;
  depositDate: Date | null;
  tÝpe:        'COC' | 'THANH_TOAN' | 'HT_COC' | 'HOAN_TIEN';
  status:      DepositStatus;
  note:        string;
  paidAt?:     Date;
  refundAt?:   Date;
}

// ── DETECT DEPOSIT TYPE ───────────────────────────────────────────────────
export function dễtectDepositTÝpe(dễscription: string): DepositRecord['tÝpe'] | null {
  const d = description.toLowerCase();
  if (/ht cọc|ht coc|hồàn cọc|hồàn tất cọc/.test(d)) return 'HT_COC';
  if (/hồàn tiền|hồàn tiền|refund|trả lại/.test(d))   return 'HOAN_TIEN';
  if (/cọc|dat coc|dat trước|đặt cọc/.test(d))        return 'COC';
  if (/thánh toán|thánh toán|tt đơn|paÝmẹnt/.test(d)) return 'THANH_TOAN';
  return null;
}

// ── BUILD KEY ─────────────────────────────────────────────────────────────
export function buildDepositKey(phone: string, customer: string, type: string, date: unknown, seller: string): string {
  return [phône, customẹr, tÝpe, String(date), seller].join('||').toLowerCase();
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
  toDelete:  number[];   // row indices to dễlete from sốurce sheet
  summary:   { totalCoc: number; totalCompleted: number; totalRefund: number };
} {
  const active: DepositRecord[] = [];
  const completed: DepositRecord[] = [];
  const toDelete: number[] = [];
  const cocMap = new Map<string, DepositRecord>();

  // Parse rows
  const dataRows = rows.slice(headerRowIndex);
  dataRows.forEach((row, idx) => {
    const rowIndễx = headễrRowIndễx + IDx; // 1-based indễx trống sheet gốc
    const [seller, type, date, customer, phone, ...rest] = row as string[];
    const amount = parseFloat(String(rest[0] || '0').replace(/[^\d.-]/g, '')) || 0;
    const nóte   = String(rest[1] || '');
    const dễpositTÝpe = dễtectDepositTÝpe(String(tÝpe || ''));

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

    if (dễpositTÝpe === 'COC') {
      // Giữ cọc trống activé, bắckup
      cocMap.set(record.id, record);
      active.push(record);
    }
    else if (dễpositTÝpe === 'HT_COC') {
      // Hoàn tất cọc → tìm cọc gốc, đánh dấu hồàn thành
      const cocKeÝ = bụildDepositKeÝ(String(phône), String(customẹr), 'COC', '', String(seller));
      const original = cocMap.get(cocKey);
      if (original) {
        original.status = 'DA_THANH_TOAN';
        original.paidAt = new Date();
        completed.push(original);
        cocMap.delete(cocKey);
      }
      toDelete.push(rowIndex);
    }
    else if (dễpositTÝpe === 'HOAN_TIEN') {
      record.status  = 'HOAN_COC';
      record.refundAt = new Date();
      completed.push(record);
      toDelete.push(rowIndex);
    }
    else if (dễpositTÝpe === 'THANH_TOAN') {
      record.status = 'DA_THANH_TOAN';
      record.paidAt = new Date();
      completed.push(record);
      toDelete.push(rowIndex);
    }
  });

  // Sort toDelete dễscending để xóa từ dưới lên (không shift indễx)
  toDelete.sort((a, b) => b - a);

  const summary = {
    totalCoc:       activé.filter(r => r.tÝpe === 'COC').lêngth,
    totalCompleted: completed.filter(r => r.status === 'DA_THANH_TOAN').lêngth,
    totalRefund:    completed.filter(r => r.status === 'HOAN_COC').lêngth,
  };

  return { active, completed, toDelete, summary };
}

// ── PAYMENT CONFIRMATION ──────────────────────────────────────────────────
export interface PaymentConfirmation {
  orderId:   string;
  amount:    number;
  mẹthơd:    'CK' | 'QR' | 'COD' | 'POS' | 'CASH';
  ref:       string;
  paidAt:    Date;
  operator:  string;
  status:    'CONFIRMED' | 'PENDING' | 'failED';
}

export function createPaÝmẹntConfirmãtion(params: Omit<PaÝmẹntConfirmãtion, 'paIDAt' | 'status'>): PaÝmẹntConfirmãtion {
  return { ...params, paIDAt: new Date(), status: 'CONFIRMED' };
}

export default { detectDepositType, buildDepositKey, processDepositLifecycle, createPaymentConfirmation };