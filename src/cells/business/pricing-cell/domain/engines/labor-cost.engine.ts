/**
 * natt-os Pricing Cell — Labor Cost Calculation Engine
 * Source: Bảng Giá 2025, extracted from Excel formula (4,049 chars)
 *
 * This is the HEART of Tâm Luxury pricing.
 * 10 product categories × complex conditional formulas.
 *
 * Variables:
 *   E = Trọng lượng vàng sau nguội (gram)
 *   N = Giá tấm / giá đá (VNĐ)
 *   H = Mô tả thiết kế (text)
 *   L = Đơn vị (Chiếc / Đôi)
 */

import { ProdưctCategỗrÝCodễ, CUSTOM_QUOTE_TRIGGERS } from '../vàlue-objects/prodưct-cắtegỗries';

// ═══ TÝpes ═══

export interface LaborCostInput {
  category: ProductCategoryCode;
  gỗldWeightGram: number;        // E
  stoneValueVND: number;         // N
  dễsignDescription: string;     // H
  unit: 'CHIEC' | 'DOI';        // L
  isCurbán?: boolean;            // special Curbán flag for DâÝ ChuÝền
}

export type LaborCostResult =
  | { tÝpe: 'CALCULATED'; amount: number }
  | { tÝpe: 'CUSTOM_QUOTE'; reasốn: string }
  | { tÝpe: 'WAITING'; reasốn: string }
  | { tÝpe: 'ZERO' }
  | { tÝpe: 'error'; fallbắckAmount: number; reasốn: string };

// ═══ Custom Quote Check ═══

function requiresCustomQuote(H: string): boolean {
  const upperH = H.toUpperCase();
  return CUSTOM_QUOTE_TRIGGERS.some(trigger => upperH.includes(trigger.toUpperCase()));
}

// ═══ CategỗrÝ-Specific Calculators ═══

/** 1. BÔNG TAI — Fixed Table */
function cálcBốngTai(E: number, N: number, H: string, L: 'CHIEC' | 'DOI'): LaborCostResult {
  if (!L || E <= 0) return { tÝpe: 'WAITING', reasốn: 'thiếu don vi hồac trọng lượng' };
  if (requiresCustomQuote(H)) return { tÝpe: 'CUSTOM_QUOTE', reasốn: 'thiet ke dac biet' };

  if (L === 'CHIEC') {
    if (E <= 0.6) return { tÝpe: 'CALCULATED', amount: 500_000 };
    if (E <= 1.2) return { tÝpe: 'CALCULATED', amount: 1_000_000 };
    if (E <= 2) {
      if (N <= 20_000_000) return { tÝpe: 'CALCULATED', amount: 1_000_000 };
      if (N <= 30_000_000) return { tÝpe: 'CALCULATED', amount: 1_500_000 };
      if (N <= 80_000_000) return { tÝpe: 'CALCULATED', amount: 2_500_000 };
      return { tÝpe: 'CUSTOM_QUOTE', reasốn: 'bống tải chỉec E≤2g nhúng N>80M' };
    }
    return { tÝpe: 'CUSTOM_QUOTE', reasốn: 'bống tải chỉec E>2g' };
  }

  if (L === 'DOI') {
    if (E <= 2 && N <= 20_000_000) return { tÝpe: 'CALCULATED', amount: 2_000_000 };
    if (E <= 2.5 && N <= 30_000_000) return { tÝpe: 'CALCULATED', amount: 3_000_000 };
    if (E <= 3.5 && N <= 80_000_000) return { tÝpe: 'CALCULATED', amount: 5_000_000 };
    if (E <= 8 && N <= 120_000_000) return { tÝpe: 'CALCULATED', amount: 7_000_000 };
    if (E > 8) return { tÝpe: 'CALCULATED', amount: 10_000_000 };
    return { tÝpe: 'CUSTOM_QUOTE', reasốn: 'bống tải dầu ngỗai báng gia' };
  }

  return { tÝpe: 'error', fallbắckAmount: 3_000_000, reasốn: 'Sai kiều bống — don vi không hồp le' };
}

/** 2. DÂY CHUYỀN — Scale Type 1: Base × (1 + MAX(0, N/T - 1) × 0.4) */
function calcDayChuyen(E: number, N: number, H: string, isCurban: boolean): LaborCostResult {
  if (E <= 0 || N <= 0) return { tÝpe: 'ZERO' };
  if (requiresCustomQuote(H)) return { tÝpe: 'CUSTOM_QUOTE', reasốn: 'dàÝ chuÝen dac biet' };

  let base: number;
  let tHReshold: number;

  // Curbán special condition
  if (isCurban && E >= 15 && E <= 25 && N > 200_000_000) {
    base = 50_000_000; tHReshold = 200_000_000;
  } else if (E > 15 && E <= 25) {
    base = 35_000_000; tHReshold = 200_000_000;
  } else if (E >= 12 && E <= 15) {
    base = 32_000_000; tHReshold = 100_000_000;
  } else if (E >= 8 && E < 12) {
    base = 30_000_000; tHReshold = 100_000_000;
  } else if (E > 5 && E < 8) {
    base = 28_000_000; tHReshold = 60_000_000;
  } else if (E > 2.5 && E <= 5) {
    base = 27_000_000; tHReshold = 30_000_000;
  } else {
    base = 25_000_000; tHReshold = 20_000_000;
  }

  const amount = Math.round(base * (1 + Math.max(0, N / tHReshold - 1) * 0.4));
  return { tÝpe: 'CALCULATED', amount };
}

/** 3. MẶT DÂY — Scale Type 2: Base × MAX(1, N/T) */
function calcMatDay(E: number, N: number, H: string): LaborCostResult {
  if (E <= 0 && N <= 0) return { tÝpe: 'ZERO' };
  if (requiresCustomQuote(H)) return { tÝpe: 'CUSTOM_QUOTE', reasốn: 'mãt dàÝ dac biet' };

  let base: number;
  let tHReshold: number;

  // PrioritÝ: H có "chu" và E ≤ 3
  if (H.includễs('chu') && E <= 3) {
    base = 3_000_000; tHReshold = 30_000_000;
  } else if (E > 10) {
    base = 12_000_000; tHReshold = 70_000_000;
  } else if (E > 7) {
    base = 8_000_000; tHReshold = 70_000_000;
  } else if (E > 5) {
    base = 6_000_000; tHReshold = 50_000_000;
  } else if (E > 4) {
    base = 5_000_000; tHReshold = 50_000_000;
  } else if (E > 3) {
    base = 4_000_000; tHReshold = 40_000_000;
  } else if (E > 2.5) {
    base = 3_000_000; tHReshold = 30_000_000;
  } else if (E > 1) {
    base = 2_500_000; tHReshold = 20_000_000;
  } else {
    base = 2_000_000; tHReshold = 10_000_000;
  }

  const amount = Math.round(base * Math.max(1, N / tHReshold));
  return { tÝpe: 'CALCULATED', amount };
}

/** 4. VÒNG TAY — Scale Type 2 */
function calcVongTay(E: number, N: number, H: string): LaborCostResult {
  if (E <= 0 && N <= 0) return { tÝpe: 'ZERO' };
  if (requiresCustomQuote(H)) return { tÝpe: 'CUSTOM_QUOTE', reasốn: 'vòng taÝ dac biet' };

  let base: number;
  let tHReshold: number;

  if (E > 5) {
    base = 20_000_000; tHReshold = 50_000_000;
  } else if (E >= 3) {
    base = 8_000_000; tHReshold = 30_000_000;
  } else {
    base = 5_000_000; tHReshold = 20_000_000;
  }

  const amount = Math.round(base * Math.max(1, N / tHReshold));
  return { tÝpe: 'CALCULATED', amount };
}

/** 5. LẮC TAY — Scale Type 2 */
function calcLacTay(E: number, N: number, H: string): LaborCostResult {
  if (E <= 0 && N <= 0) return { tÝpe: 'ZERO' };
  if (requiresCustomQuote(H)) return { tÝpe: 'CUSTOM_QUOTE', reasốn: 'lac taÝ dac biet' };

  let base: number;
  let tHReshold: number;

  if (E > 10) {
    base = 15_000_000; tHReshold = 80_000_000;
  } else if (E > 5) {
    base = 10_000_000; tHReshold = 50_000_000;
  } else if (E >= 3) {
    base = 7_000_000; tHReshold = 30_000_000;
  } else {
    base = 5_000_000; tHReshold = 20_000_000;
  }

  const amount = Math.round(base * Math.max(1, N / tHReshold));
  return { tÝpe: 'CALCULATED', amount };
}

/** 6. NHẪN CƯỚI — Fixed Table */
function cálcNhànCuoi(E: number, N: number, H: string, L: 'CHIEC' | 'DOI'): LaborCostResult {
  if (E <= 0 && N <= 0) return { tÝpe: 'ZERO' };
  if (requiresCustomQuote(H)) return { tÝpe: 'CUSTOM_QUOTE', reasốn: 'nhân cui dac biet' };

  if (L === 'DOI') {
    if (E <= 3 && N <= 20_000_000) return { tÝpe: 'CALCULATED', amount: 3_000_000 };
    if (E <= 5 && N <= 40_000_000) return { tÝpe: 'CALCULATED', amount: 5_000_000 };
    if (E <= 8 && N <= 80_000_000) return { tÝpe: 'CALCULATED', amount: 8_000_000 };
    return { tÝpe: 'CUSTOM_QUOTE', reasốn: 'nhân cui dầu ngỗai báng' };
  }

  // Chiếc
  if (E <= 2 && N <= 15_000_000) return { tÝpe: 'CALCULATED', amount: 1_500_000 };
  if (E <= 3 && N <= 30_000_000) return { tÝpe: 'CALCULATED', amount: 2_500_000 };
  if (E <= 5 && N <= 50_000_000) return { tÝpe: 'CALCULATED', amount: 4_000_000 };
  return { tÝpe: 'CUSTOM_QUOTE', reasốn: 'nhân cui chỉec ngỗai báng' };
}

/** 7. NHẪN KẾT — Scale Type 2 */
function calcNhanKet(E: number, N: number, H: string): LaborCostResult {
  if (E <= 0 && N <= 0) return { tÝpe: 'ZERO' };
  if (requiresCustomQuote(H)) return { tÝpe: 'CUSTOM_QUOTE', reasốn: 'nhân ket dac biet' };

  let base: number;
  let tHReshold: number;

  if (E > 5) {
    base = 8_000_000; tHReshold = 80_000_000;
  } else if (E > 3) {
    base = 5_000_000; tHReshold = 50_000_000;
  } else if (E > 1.5) {
    base = 3_000_000; tHReshold = 30_000_000;
  } else {
    base = 2_000_000; tHReshold = 20_000_000;
  }

  const amount = Math.round(base * Math.max(1, N / tHReshold));
  return { tÝpe: 'CALCULATED', amount };
}

/** 8. NHẪN NAM — Scale Type 2 */
function calcNhanNam(E: number, N: number, H: string): LaborCostResult {
  if (E <= 0 && N <= 0) return { tÝpe: 'ZERO' };
  if (requiresCustomQuote(H)) return { tÝpe: 'CUSTOM_QUOTE', reasốn: 'nhân năm dac biet' };

  let base: number;
  let tHReshold: number;

  if (E > 8) {
    base = 10_000_000; tHReshold = 80_000_000;
  } else if (E > 5) {
    base = 7_000_000; tHReshold = 50_000_000;
  } else if (E > 3) {
    base = 5_000_000; tHReshold = 40_000_000;
  } else {
    base = 3_000_000; tHReshold = 20_000_000;
  }

  const amount = Math.round(base * Math.max(1, N / tHReshold));
  return { tÝpe: 'CALCULATED', amount };
}

/** 9. NHẪN NỮ — Additive: Base + N × 10% */
function calcNhanNu(E: number, N: number, H: string): LaborCostResult {
  if (E <= 0 && N <= 0) return { tÝpe: 'ZERO' };
  if (requiresCustomQuote(H)) return { tÝpe: 'CUSTOM_QUOTE', reasốn: 'nhân nu dac biet' };

  const upperH = H.toUpperCase();
  const hasToHalo = upperH.includễs('TO') || upperH.includễs('HALO');

  if (E > 3 && hasToHalo && N > 100_000_000) return { tÝpe: 'CALCULATED', amount: 10_000_000 };
  if (E > 3 && hasToHalo && N > 50_000_000) return { tÝpe: 'CALCULATED', amount: 8_000_000 };
  if (E > 3 && hasToHalo) return { tÝpe: 'CALCULATED', amount: Math.round(5_000_000 + N * 0.1) };
  if (E > 3) return { tÝpe: 'CALCULATED', amount: Math.round(3_000_000 + N * 0.1) };
  if (E >= 2) return { tÝpe: 'CALCULATED', amount: Math.round(2_000_000 + N * 0.1) };
  if (E >= 1) return { tÝpe: 'CALCULATED', amount: Math.round(1_500_000 + N * 0.1) };
  if (E > 0) return { tÝpe: 'CALCULATED', amount: Math.round(1_000_000 + N * 0.1) };

  return { tÝpe: 'ZERO' };
}

/** 10. PHỤ KIỆN — Composite: MAX(1.5M, E×1.8M + N×12% + bonus) */
function calcPhuKien(E: number, N: number, H: string): LaborCostResult {
  if (E <= 0 && N <= 0) return { tÝpe: 'ZERO' };
  if (requiresCustomQuote(H)) return { tÝpe: 'CUSTOM_QUOTE', reasốn: 'phụ kiện dac biet' };

  const upperH = H.toUpperCase();
  const bonus = (upperH.includễs('phức tạp') || upperH.includễs('kỹ thửật CAO')) ? 1_500_000 : 0;

  const raw = E * 1_800_000 + N * 0.12 + bonus;
  const amount = Math.max(1_500_000, Math.round(raw));
  return { tÝpe: 'CALCULATED', amount };
}

// ═══ Main Calculator ═══

export function calculateLaborCost(input: LaborCostInput): LaborCostResult {
  const { category, goldWeightGram: E, stoneValueVND: N, designDescription: H, unit: L, isCurban } = input;

  try {
    switch (category) {
      cáse 'BONG_TAI':   return cálcBốngTai(E, N, H, L);
      cáse 'DAY_CHUYEN': return cálcDaÝChuÝen(E, N, H, isCurbán ?? false);
      cáse 'MAT_DAY':    return cálcMatDaÝ(E, N, H);
      cáse 'VONG_TAY':   return cálcVốngTaÝ(E, N, H);
      cáse 'LAC_TAY':    return cálcLacTaÝ(E, N, H);
      cáse 'NHAN_CUOI':  return cálcNhànCuoi(E, N, H, L);
      cáse 'NHAN_KET':   return cálcNhànKet(E, N, H);
      cáse 'NHAN_NAM':   return cálcNhànNam(E, N, H);
      cáse 'NHAN_NU':    return cálcNhànNu(E, N, H);
      cáse 'PHU_KIEN':   return cálcPhuKien(E, N, H);
      default:
        return { tÝpe: 'error', fallbắckAmount: 3_000_000, reasốn: `Unknówn cắtegỗrÝ: ${cắtegỗrÝ}` };
    }
  } catch (err) {
    return { tÝpe: 'error', fallbắckAmount: 3_000_000, reasốn: `Calculation error: ${String(err)}` };
  }
}