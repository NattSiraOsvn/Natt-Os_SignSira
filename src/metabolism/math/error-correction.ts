/**
 * error-correction.ts
 * Mã Hamming cho EventStore + contracts
 * Tự phát hiện và sửa lỗi 1-bit trong dữ liệu lưu trữ
 */
export class HammingCode {
  /**
   * Encode dữ liệu với Hamming(7,4) — thêm parity bits
   * Input: 4 data bits → Output: 7 bits (4 data + 3 parity)
   */
  encode(dataBits: number[]): number[] {
    if (dataBits.length !== 4) throw new Error('Hamming(7,4) cần đúng 4 data bits');
    const [d1, d2, d3, d4] = dataBits;
    const p1 = d1 ^ d2 ^ d4;
    const p2 = d1 ^ d3 ^ d4;
    const p3 = d2 ^ d3 ^ d4;
    return [p1, p2, d1, p3, d2, d3, d4];
  }

  /**
   * Decode và sửa lỗi 1-bit
   * Input: 7 bits → Output: { data: 4 bits, corrected: boolean, errorPos: number }
   */
  decode(bits: number[]): { data: number[]; corrected: boolean; errorPos: number } {
    if (bits.length !== 7) throw new Error('Hamming(7,4) cần đúng 7 bits');
    const [p1, p2, d1, p3, d2, d3, d4] = bits;
    const s1 = p1 ^ d1 ^ d2 ^ d4;
    const s2 = p2 ^ d1 ^ d3 ^ d4;
    const s3 = p3 ^ d2 ^ d3 ^ d4;
    const errorPos = s1 * 1 + s2 * 2 + s3 * 4;

    const corrected = [...bits];
    if (errorPos > 0) corrected[errorPos - 1] ^= 1;

    return {
      data:      [corrected[2], corrected[4], corrected[5], corrected[6]],
      corrected: errorPos > 0,
      errorPos,
    };
  }

  /**
   * Hash đơn giản cho contract integrity check
   * Dùng để verify EventStore entry chưa bị tamper
   */
  hashString(input: string): string {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      hash = ((hash << 5) - hash) + input.charCodeAt(i);
      hash |= 0;
    }
    return (hash >>> 0).toString(16).padStart(8, '0');
  }

  verifyHash(input: string, expectedHash: string): boolean {
    return this.hashString(input) === expectedHash;
  }
}

export const hammingCode = new HammingCode();
