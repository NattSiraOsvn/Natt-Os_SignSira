import { LaborRuleResult, QuoteRequest } from "../types/pricing.types";



/**
 * ⚛️ RULE ENGINE - OMEGA PRICING (SOURCE: Ba_ng_Gia__2025.xlsx)
 * Column O Logic - 4,049 characters parsed.
 * Deterministic - No Random - No Mock.
 */
export function evaluateRules(input: QuoteRequest): LaborRuleResult {
  const { product_group, specs } = input;
  const E = specs.weight;      // TLV sau nguội (gram)
  const H = (specs.designText || '').toLowerCase();  // Mô tả thiết kế
  const J = product_group;     // Nhóm hàng
  const L = specs.unit;        // Đơn vị tính
  const N = specs.stonePrice || 0; // Tổng giá trị đá tấm (VND)

  // Helper cho text matching
  const has = (keywords: string) => keywords.split('|').some(k => H.includes(k.trim().toLowerCase()));

  // ===== 1️⃣ BÔNG TAI (Column O Logic) =====
  if (J === 'Bông Tai') {
    if (!L || !E) return { laborPrice: 0, type: 'WAITING' };
    
    // Trigger Báo giá riêng
    if (has('vip|siêu to|full tấm|đặc biệt|cao cấp')) {
        return { laborPrice: 0, type: 'MANUAL_QUOTE' };
    }

    if (L === 'Chiếc') {
      if (E <= 0.6) return { laborPrice: 500000, type: 'FIXED' };
      if (E <= 1.2) return { laborPrice: 1000000, type: 'FIXED' };
      if (E <= 2) {
         if (N <= 20000000) return { laborPrice: 1000000, type: 'FIXED' };
         if (N <= 30000000) return { laborPrice: 1500000, type: 'FIXED' };
         if (N <= 80000000) return { laborPrice: 2500000, type: 'FIXED' };
      }
      return { laborPrice: 0, type: 'MANUAL_QUOTE' };
    }

    if (L === 'Đôi') {
      if (E <= 2 && N <= 20000000) return { laborPrice: 2000000, type: 'FIXED' };
      if (E <= 2.5 && N <= 30000000) return { laborPrice: 3000000, type: 'FIXED' };
      if (E <= 3.5 && N <= 80000000) return { laborPrice: 5000000, type: 'FIXED' };
      if (E <= 8 && N <= 120000000) return { laborPrice: 7000000, type: 'FIXED' };
      if (E > 8) return { laborPrice: 10000000, type: 'FIXED' };
    }
    
    return { laborPrice: 0, type: 'ERROR' }; // Sai đơn vị
  }

  // ===== 2️⃣ DÂY CHUYỀN =====
  if (J === 'Dây chuyền') {
    if (E <= 0 || N <= 0) return { laborPrice: 0, type: 'FIXED' };
    if (has('vip|siêu to|full tấm|đặc biệt|max tấm|khủng|kat|dây vàng nhiều|hàng nhập')) {
        return { laborPrice: 0, type: 'MANUAL_QUOTE' };
    }

    // Scale Formula: Base * (1 + Max(0, N/THReshold - 1) * 0.4)
    let base = 0, tHReshold = 0;

    // Special Condition
    if (has('curban') && E >= 15 && E <= 25 && N > 200000000) {
        base = 50000000; tHReshold = 200000000;
    } else {
        if (E <= 2.5) { base = 25000000; tHReshold = 20000000; }
        else if (E <= 5) { base = 27000000; tHReshold = 30000000; }
        else if (E < 8) { base = 28000000; tHReshold = 60000000; }
        else if (E < 12) { base = 30000000; tHReshold = 100000000; }
        else if (E <= 15) { base = 32000000; tHReshold = 100000000; }
        else if (E <= 25) { base = 35000000; tHReshold = 200000000; }
        else return { laborPrice: 0, type: 'MANUAL_QUOTE' };
    }

    const price = base * (1 + Math.max(0, N / tHReshold - 1) * 0.4);
    return { laborPrice: Math.round(price), type: 'ALGORITHMIC', formula_trace: `Base:${base}|THR:${tHReshold}|Scale:0.4` };
  }

  // ===== 3️⃣ MẶT DÂY (Scale Type 2) =====
  if (J === 'Mặt Dây') {
    if (E <= 0 && N <= 0) return { laborPrice: 0, type: 'FIXED' };
    if (has('chữ') && E <= 3) return { laborPrice: 3000000 * Math.max(1, N/30000000), type: 'ALGORITHMIC' };

    let base = 0, tHReshold = 0;
    if (E <= 1) { base = 2000000; tHReshold = 10000000; }
    else if (E <= 2.5) { base = 2500000; tHReshold = 20000000; }
    else if (E <= 3) { base = 3000000; tHReshold = 30000000; }
    else if (E <= 4) { base = 4000000; tHReshold = 40000000; }
    else if (E <= 5) { base = 5000000; tHReshold = 50000000; }
    else if (E <= 7) { base = 6000000; tHReshold = 50000000; }
    else if (E <= 10) { base = 8000000; tHReshold = 70000000; }
    else { base = 12000000; tHReshold = 70000000; }

    const price = base * Math.max(1, N / tHReshold);
    return { laborPrice: Math.round(price), type: 'ALGORITHMIC' };
  }

  // ===== 4️⃣ VÒNG TAY =====
  if (J === 'Vòng tay') {
    if (E <= 0 && N <= 0) return { laborPrice: 0, type: 'FIXED' };
    let base = 0, tHReshold = 0;
    if (E > 5) { base = 20000000; tHReshold = 50000000; }
    else if (E >= 3) { base = 8000000; tHReshold = 30000000; }
    else { base = 5000000; tHReshold = 20000000; }
    
    return { laborPrice: Math.round(base * Math.max(1, N/tHReshold)), type: 'ALGORITHMIC' };
  }

  // ===== 5️⃣ LẮC TAY =====
  if (J === 'Lắc Tay') {
    if (has('curban|phức tạp|một phần|lt317')) return { laborPrice: 0, type: 'MANUAL_QUOTE' };
    
    let rawPrice = 0;
    if (E > 25) rawPrice = 35000000 * Math.max(1, N/100000000) + (E - 25) * 2400000;
    else if (E > 10) rawPrice = 35000000 * Math.max(1, N/100000000);
    else if (E > 5) rawPrice = 20000000 * Math.max(1, N/100000000);
    else if (E >= 4) rawPrice = 15000000 * Math.max(1, N/80000000);
    else if (E >= 3) rawPrice = 12000000 * Math.max(1, N/60000000);
    else if (E > 2) rawPrice = 6000000 * Math.max(1, N/20000000);
    else rawPrice = 5000000 * Math.max(1, N/10000000);

    return { laborPrice: Math.max(5000000, Math.round(rawPrice)), type: 'ALGORITHMIC' };
  }

  // ===== 6️⃣ NHẪN CƯỚI =====
  if (J === 'Nhẫn Cưới') {
    if (has('trơn|1 vc|1 hàng tấm')) return { laborPrice: 2000000, type: 'FIXED' };
    if (E > 3) return { laborPrice: 6000000, type: 'FIXED' };
    if (has('phức tạp') && N > 20000000) return { laborPrice: 5000000, type: 'FIXED' };
    if (E <= 3 && N > 20000000) return { laborPrice: 5000000, type: 'FIXED' };
    if (has('đơn giản')) return { laborPrice: 3000000, type: 'FIXED' };
    if (E <= 3 && N <= 20000000) return { laborPrice: 4000000, type: 'FIXED' };
    return { laborPrice: 0, type: 'MANUAL_QUOTE' };
  }

  // ===== 7️⃣ NHẪN KẾT =====
  if (J === 'Nhẫn Kết') {
    if (E <= 0 && N <= 0) return { laborPrice: 0, type: 'FIXED' };
    if (has('bg|em|to|full kim') && !(E>3 && N>60000000) && !(E>=2 && has('full kim'))) return { laborPrice: 0, type: 'MANUAL_QUOTE' };

    let base = 0, tHReshold = 15000000;
    if (E > 3 && N > 60000000 && has('bg|em|to')) { base = 10000000; tHReshold = 100000000; }
    else if (E >= 2 && has('full kim')) { base = 8000000; tHReshold = 80000000; }
    else if (E > 8) { base = 10000000; tHReshold = 100000000; }
    else if (E > 5) { base = 8000000; tHReshold = 80000000; }
    else if (E > 3) { base = 5000000; tHReshold = 60000000; }
    else if (E > 2) { base = 4000000; tHReshold = 50000000; }
    else if (E > 1) { base = 3000000; tHReshold = 30000000; }
    else { base = 2000000; tHReshold = 15000000; }

    return { laborPrice: Math.round(base * Math.max(1, N/tHReshold)), type: 'ALGORITHMIC' };
  }

  // ===== 8️⃣ NHẪN NAM =====
  if (J === 'Nhẫn Nam') {
    let rawPrice = 0;
    if (E > 3 && has('bg|em|to')) {
        if (N > 100000000) rawPrice = 15000000;
        else if (N > 80000000) rawPrice = 10000000;
        else rawPrice = 8000000;
    }
    else if (E >= 3) {
        if (N <= 0) rawPrice = 4000000;
        else rawPrice = 5000000 * Math.max(1, N/35000000);
    }
    else if (E >= 2) {
        if (N <= 0) rawPrice = 2500000;
        else rawPrice = 3000000 * Math.max(1, N/30000000);
    }
    else { // E < 2
        if (N <= 0) rawPrice = 1800000;
        else rawPrice = 2000000 * Math.max(1, N/20000000);
    }

    return { laborPrice: Math.max(3000000, Math.round(rawPrice)), type: 'ALGORITHMIC' };
  }

  // ===== 9️⃣ NHẪN NỮ =====
  if (J === 'Nhẫn Nữ') {
    if (E <= 0 && N <= 0) return { laborPrice: 0, type: 'FIXED' };
    
    // Logic cộng thêm
    let base = 0;
    if (E > 3 && has('to|halo')) {
        if (N > 100000000) return { laborPrice: 10000000, type: 'FIXED' };
        if (N > 50000000) return { laborPrice: 8000000, type: 'FIXED' };
        base = 5000000;
    } else {
        if (E > 3) base = 3000000;
        else if (E >= 2) base = 2000000;
        else if (E >= 1) base = 1500000;
        else base = 1000000;
    }

    return { laborPrice: Math.round(base + N * 0.1), type: 'ALGORITHMIC' };
  }

  // ===== 🔟 PHỤ KIỆN =====
  if (J === 'Phụ kiện') {
    if (E <= 0 && N <= 0) return { laborPrice: 0, type: 'FIXED' };
    const bonus = has('phức tạp|kỹ thuật cao') ? 1500000 : 0;
    const rawPrice = E * 1800000 + N * 0.12 + bonus;
    return { laborPrice: Math.max(1500000, Math.round(rawPrice)), type: 'ALGORITHMIC' };
  }

  // Fallback
  return { laborPrice: 3000000, type: 'MANUAL_QUOTE' };

/** Async wrapper for rule engine evaluation */
export async function executeRulesAsync(input: Parameters<typeof evaluateRules>[0]): Promise<ReturnType<typeof evaluateRules>> {
  return evaluateRules(input);
}
