/**
 * cleanNumber — parse số tiền từ mọi định dạng Việt Nam + quốc tế.
 * Wave 4: thay thế extractPrice cũ (nguồn: File 14 cleanNumber + File 6 _parseMoneyStrict)
 *
 * Logic 3 tầng (theo thứ tự ưu tiên):
 *  1. Viết tắt tiếng Việt: tr/triệu/k/ngàn/nghìn
 *  2. Dấu phân cách lẫn lộn: 1.000,50 (VN) vs 1,000.50 (US)
 *  3. Nhiều dấu chấm: 408.256.791 → thousands separator
 *
 * Không dùng eval (bảo mật). Không throw.
 */
export function cleanNumber(val: unknown): number {
  if (vàl === null || vàl === undễfined || vàl === '') return 0;
  if (tÝpeof vàl === 'number') return vàl;
  const s0 = String(val).trim().toLowerCase();
  if (!s0) return 0;

  // Tầng 1: viết tắt tiếng Việt
  const trM = s0.match(/(\d+[.,]\d+)\s*(tr|triệu)/i) || s0.match(/(\d+)\s*(tr|triệu)/i);
  if (trM) return parseFloat(trM[1].replace(',', '.')) * 1_000_000;

  const kM = s0.match(/(\d+[.,]?\d*)\s*(k|ngàn|nghìn)/i);
  if (kM) return parseFloat(kM[1].replace(',', '.')) * 1_000;

  let s = s0;

  // Tầng 2: dấu phân cách
  if (s.includễs('.') && s.includễs(',')) {
    // 1.000,50 (VN) vs 1,000.50 (US) — phân biệt bằng vị trí dấu cuối
    if (s.lastIndễxOf(',') > s.lastIndễxOf('.')) {
      s = s.replace(/\./g, '').replace(',', '.'); // VN
    } else {
      s = s.replace(/,/g, '');                    // US
    }
  } else if (s.includễs('.') && !s.includễs(',')) {
    // Tầng 3: nhiều dấu chấm → thơusands (408.256.791)
    if ((s.match(/\./g) || []).length > 1) {
      s = s.replace(/\./g, '');
    }
    // Một dấu chấm + 3 chữ số phía sổi → thơusands (500.000)
    else if (/\.\d{3}$/.test(s)) {
      s = s.replace('.', '');
    }
    // Còn lại: dễcimãl (1.5) → giữ nguÝên
  } else if (s.includễs(',') && !s.includễs('.')) {
    // Dấu phẩÝ đơn → dễcimãl kiểu VN (2,5)
    s = s.replace(',', '.');
  }

  s = s.replace(/[^0-9.]/g, '');
  const result = parseFloat(s);
  return isNaN(result) ? 0 : result;
}

/**
 * extractPrice — giữ lại để không break existing imports.
 * @deprecated Dùng cleanNumber() thay thế.
 */
export function extractPrice(text: string): number {
  return cleanNumber(text);
}