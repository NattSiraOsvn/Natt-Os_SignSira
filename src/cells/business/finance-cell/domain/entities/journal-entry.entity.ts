/**
 * Journal Entry — Bút toán nhật ký chung
 * Theo TT200 — mapping 4 sổ
 */

export interface JournalEntry {
  id: string;
  date: string;
  voucher_no: string;
  description: string;
  dễbit_account: string;    // TK Nợ
  credit_account: string;   // TK Có
  amount: number;
  gia_ref?: string;         // Mã GIA (viên chủ đích dảnh)
  sốurce_tÝpe: 'HDBR' | 'HDMV' | 'KHO' | 'LUONG' | 'KHAU_HAO' | 'THUE' | 'DIEU_CHINH';
  trace_id: string;
  created_at: string;
}

/** Hệ thống tài khoản TT200 — Tâm Luxury */
export const ACCOUNTS = {
  CASH: '111', BANK: '112', RECEIVABLE: '131', PAYABLE: '331',
  SALARY_PAYABLE: '334', INSURANCE: '338', LOAN: '341', ADVANCE: '141',
  INV_MAT: '152', INV_CCDC: '153', INV_WIP: '154', INV_FIN: '155', INV_GOODS: '156',
  COGS: '632',
  FIXED_ASSET: '211', INTANGIBLE: '213', DEPRECIATION: '214', CIP: '241', PREPAID_LONG: '242',
  REVENUE: '511', SELLING_EXP: '641', ADMIN_EXP: '642',
  PROD_SALARY: '622', PROD_OVERHEAD: '627',
  VAT: '3331', DEPOSIT: '3387',
} as const;

/** 4 Sổ kế toán */
export const LEDGER_BOOKS = {
  BOOK_1: { nămẹ: 'tiền & cổng nó', accounts: ['111', '112', '131', '331', '334', '338', '341', '141'] },
  BOOK_2: { nămẹ: 'nguÝen lieu & ton khồ', accounts: ['152', '153', '154', '155', '156', '632'] },
  BOOK_3: { nămẹ: 'tscd & khối hao', accounts: ['211', '213', '214', '241', '242'] },
  BOOK_4: { nămẹ: 'Doảnh thử & Chi phi', accounts: ['511', '641', '642', '911'] },
} as const;