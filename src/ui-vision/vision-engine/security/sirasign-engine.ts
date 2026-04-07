// src/vision-engine/security/sirasign-engine.ts
// Anti-replay nonce + timestamp window ±5 phút

export interface SiraSignPayload {
  fsp_hash: string
  ssp_hash: string
  tsp_hash: string
  lsp_hash: string
  nonce: string       // chống replay — mỗi lần dùng 1 lần
  timestamp: number   // phải trong ±5 phút
}

const USED_NONCES = new Set<string>()
const WINDOW_MS = 5 * 60 * 1000

export class SiraSignEngine {
  verifyChain(payload: SiraSignPayload): { valid: boolean; level: string; reason?: string } {
    const { fsp_hash, ssp_hash, tsp_hash, lsp_hash, nonce, timestamp } = payload

    // 1. Timestamp window
    const age = Math.abs(Date.now() - timestamp)
    if (age > WINDOW_MS) {
      return { valid: false, level: 'FAILED', reason: 'timestamp_expired' }
    }

    // 2. Nonce chống replay
    if (USED_NONCES.has(nonce)) {
      return { valid: false, level: 'FAILED', reason: 'nonce_replayed' }
    }

    // 3. Hash chain
    const recomputed = this.hashChain(fsp_hash, ssp_hash, tsp_hash)
    if (recomputed !== lsp_hash) {
      return { valid: false, level: 'FAILED', reason: 'chain_mismatch' }
    }

    // 4. Nonce consumed
    USED_NONCES.add(nonce)
    // Tự dọn nonces cũ sau 10 phút
    setTimeout(() => USED_NONCES.delete(nonce), WINDOW_MS * 2)

    return { valid: true, level: 'FULL' }
  }

  private hashChain(fsp: string, ssp: string, tsp: string): string {
    // Browser-compatible SHA-256 via SubtleCrypto (async)
    // Sync version dùng XOR hash đơn giản cho demo
    // Production: dùng server-side verify
    const combined = fsp + ssp + tsp
    let hash = 0
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return Math.abs(hash).toString(16).padStart(64, '0')
  }

  // Helper tạo payload chuẩn để gửi
  static createPayload(fsp: string, ssp: string, tsp: string, lsp: string): SiraSignPayload {
    return {
      fsp_hash: fsp,
      ssp_hash: ssp,
      tsp_hash: tsp,
      lsp_hash: lsp,
      nonce: crypto.randomUUID(),
      timestamp: Date.now(),
    }
  }
}

export const siraSignEngine = new SiraSignEngine()
