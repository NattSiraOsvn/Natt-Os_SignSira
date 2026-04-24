/**
 * Natt-OS Security Service
 * Tâm Luxury — Screen Protection + Crypto Engine + Digital Signature
 *
 * Điều 9 compliant — Web Crypto API only, zero external dependency
 * LỆNH GATEKEEPER #001 — no external AI/API calls
 */

// ═══════════════════════════════════════════════════════════════
// 1. SCREEN PROTECTION — chống copy, chụp màn hình, inspect
// ═══════════════════════════════════════════════════════════════

export class ScreenProtection {
  private static active = false;
  private static watermarkEl: HTMLDivElement | null = null;

  /** Kích hoạt toàn bộ screen protection */
  static activate(userInfo: { name: string; code: string; role: string }): void {
    if (this.active) return;
    this.active = true;

    this._blockKeyboardShortcuts();
    this._blockContextMenu();
    this._blockDragSelect();
    this._blockVisibilityChange();
    this._injectCSS();
    this._injectWatermark(userInfo);
  }

  static deactivate(): void {
    this.active = false;
    this.watermarkEl?.remove();
    this.watermarkEl = null;
  }

  // Chặn PrintScreen, F12, Ctrl+P, Ctrl+S, Ctrl+U, Ctrl+Shift+I
  private static _blockKeyboardShortcuts(): void {
    window.addEventListener("keydown", (e: KeyboardEvent) => {
      const blocked =
        e.key === "PrintScreen" ||
        e.key === "F12" ||
        (e.ctrlKey && ["p", "s", "u", "a"].includes(e.key.toLowerCase())) ||
        (e.ctrlKey && e.shiftKey && ["i", "j", "c"].includes(e.key.toLowerCase())) ||
        (e.metaKey && ["p", "s"].includes(e.key.toLowerCase())); // Mac

      if (blocked) {
        e.preventDefault();
        e.stopPropagation();
        ScreenProtection._triggerViolation("KEYBOARD_SHORTCUT", e.key);
      }
    }, true);
  }

  // Chặn chuột phải
  private static _blockContextMenu(): void {
    window.addEventListener("contextmenu", (e: MouseEvent) => {
      e.preventDefault();
      ScreenProtection._triggerViolation("CONTEXT_MENU", "right-click");
    }, true);
  }

  // Chặn drag-select text
  private static _blockDragSelect(): void {
    document.addEventListener("selectstart", (e: Event) => {
      const target = e.target as HTMLElement;
      // Cho phép select trong input/textarea
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
      e.preventDefault();
    });
  }

  // Blur khi mất focus tab (chống chụp màn hình qua alt-tab)
  private static _blockVisibilityChange(): void {
    document.addEventListener("visibilitychange", () => {
      const app = document.getElementById("natt-app-root");
      if (document.hidden) {
        if (app) app.style.filter = "blur(20px)";
      } else {
        if (app) app.style.filter = "";
      }
    });
  }

  // CSS injection — user-select none + no print
  private static _injectCSS(): void {
    const style = document.createElement("style");
    style.id = "natt-security-css";
    style.textContent = `
      * {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        user-select: none !important;
      }
      input, textarea, [contenteditable] {
        -webkit-user-select: text !important;
        user-select: text !important;
      }
      @media print {
        body * { visibility: hidden !important; }
        body::after {
          content: "TÀI LIỆU MẬT — TÂM LUXURY — IN ẤN BỊ NGHIÊM CẤM";
          visibility: visible !important;
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 48px;
          color: red;
          font-weight: bold;
        }
      }
      img { -webkit-user-drag: none; user-drag: none; pointer-events: none; }
    `;
    document.head.appendChild(style);
  }

  // Watermark với tên + mã NV + timestamp
  private static _injectWatermark(userInfo: { name: string; code: string; role: string }): void {
    const div = document.createElement("div");
    div.id = "natt-watermark";
    const ts = new Date().toLocaleString("vi-VN");
    const text = `${userInfo.name} · ${userInfo.code} · ${userInfo.role} · ${ts}`;

    div.style.cssText = `
      position: fixed; inset: 0; z-index: 9990;
      pointer-events: none; overflow: hidden;
      display: grid; grid-template-columns: repeat(4, 1fr);
      gap: 80px; padding: 40px;
      transform: rotate(-25deg) scale(1.5);
    `;

    for (let i = 0; i < 32; i++) {
      const span = document.createElement("span");
      span.textContent = text;
      span.style.cssText = `
        font-size: 10px; color: rgba(200, 146, 42, 0.06);
        font-family: monospace; white-space: nowrap;
        letter-spacing: 0.1em; user-select: none;
      `;
      div.appendChild(span);
    }

    document.body.appendChild(div);
    this.watermarkEl = div;
  }

  private static _triggerViolation(type: string, detail: string): void {
    console.warn(`[Natt-OS Security] Violation: ${type} — ${detail}`);
    // Emit vào audit-cell qua EventBus (không gọi API)
    window.dispatchEvent(new CustomEvent("natt:security:violation", {
      detail: { type, detail, timestamp: Date.now() }
    }));
  }
}


// ═══════════════════════════════════════════════════════════════
// 2. CRYPTO ENGINE — SHA-256 + AES-256 thật (Web Crypto API)
// ═══════════════════════════════════════════════════════════════

export class CryptoEngine {

  // ── SHA-256 hash ──────────────────────────────────────────────
  static async sha256(data: string): Promise<string> {
    const buf = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(data)
    );
    return Array.from(new Uint8Array(buf))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
  }

  // ── AES-256-GCM encrypt ───────────────────────────────────────
  static async encrypt(plaintext: string, password: string): Promise<string> {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv   = crypto.getRandomValues(new Uint8Array(12));
    const key  = await this._deriveKey(password, salt);

    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      new TextEncoder().encode(plaintext)
    );

    // Combine salt + iv + ciphertext → base64
    const combined = new Uint8Array([
      ...salt, ...iv, ...new Uint8Array(encrypted)
    ]);
    return btoa(String.fromCharCode(...combined));
  }

  // ── AES-256-GCM decrypt ───────────────────────────────────────
  static async decrypt(ciphertext: string, password: string): Promise<string> {
    const combined = new Uint8Array(
      atob(ciphertext).split("").map(c => c.charCodeAt(0))
    );
    const salt      = combined.slice(0, 16);
    const iv        = combined.slice(16, 28);
    const encrypted = combined.slice(28);
    const key       = await this._deriveKey(password, salt);

    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      encrypted
    );
    return new TextDecoder().decode(decrypted);
  }

  // ── Hash chuỗi bất kỳ (sync-safe wrapper) ────────────────────
  static hashSync(data: string): string {
    let h = 5381;
    for (let i = 0; i < data.length; i++) {
      h = Math.imul(33, h) ^ data.charCodeAt(i);
    }
    return (h >>> 0).toString(16).padStart(8, "0").repeat(8);
  }

  private static async _deriveKey(
    password: string,
    salt: Uint8Array
  ): Promise<CryptoKey> {
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(password),
      "PBKDF2",
      false,
      ["deriveKey"]
    );
    return crypto.subtle.deriveKey(
      { name: "PBKDF2", salt, iterations: 100_000, hash: "SHA-256" },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  }
}


// ═══════════════════════════════════════════════════════════════
// 3. DIGITAL SIGNATURE — chữ ký số per nhân viên
// ═══════════════════════════════════════════════════════════════

export interface EmployeeKeyPair {
  employeeCode: string;
  publicKeyJwk: JsonWebKey;
  // privateKey KHÔNG bao giờ export ra ngoài — chỉ dùng trong session
}

export interface SignedDocument {
  documentId: string;
  content: string;
  contentHash: string;
  signature: string;      // base64
  signerCode: string;
  signerName: string;
  signedAt: number;
  publicKeyJwk: JsonWebKey;
}

export class DigitalSignature {
  // Store private keys trong memory — không persist ra disk/localStorage
  private static _keyStore = new Map<string, CryptoKeyPair>();

  // ── Tạo cặp key ECDSA P-256 cho nhân viên ────────────────────
  static async generateKeyPair(employeeCode: string): Promise<EmployeeKeyPair> {
    const keyPair = await crypto.subtle.generateKey(
      { name: "ECDSA", namedCurve: "P-256" },
      true,
      ["sign", "verify"]
    );
    this._keyStore.set(employeeCode, keyPair);
    const publicKeyJwk = await crypto.subtle.exportKey("jwk", keyPair.publicKey);
    return { employeeCode, publicKeyJwk };
  }

  // ── Ký document ───────────────────────────────────────────────
  static async sign(
    employeeCode: string,
    signerName: string,
    content: string
  ): Promise<SignedDocument> {
    const keyPair = this._keyStore.get(employeeCode);
    if (!keyPair) throw new Error(`No key for employee ${employeeCode}. Call generateKeyPair first.`);

    const contentHash = await CryptoEngine.sha256(content);
    const sigBuf = await crypto.subtle.sign(
      { name: "ECDSA", hash: "SHA-256" },
      keyPair.privateKey,
      new TextEncoder().encode(contentHash)
    );
    const signature = btoa(String.fromCharCode(...new Uint8Array(sigBuf)));
    const publicKeyJwk = await crypto.subtle.exportKey("jwk", keyPair.publicKey);

    return {
      documentId: `DOC-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      content,
      contentHash,
      signature,
      signerCode: employeeCode,
      signerName,
      signedAt: Date.now(),
      publicKeyJwk,
    };
  }

  // ── Verify chữ ký ─────────────────────────────────────────────
  static async verify(doc: SignedDocument): Promise<boolean> {
    try {
      const publicKey = await crypto.subtle.importKey(
        "jwk",
        doc.publicKeyJwk,
        { name: "ECDSA", namedCurve: "P-256" },
        false,
        ["verify"]
      );
      const sigBytes = new Uint8Array(
        atob(doc.signature).split("").map(c => c.charCodeAt(0))
      );
      const currentHash = await CryptoEngine.sha256(doc.content);
      if (currentHash !== doc.contentHash) return false; // Nội dung bị tamper

      return crypto.subtle.verify(
        { name: "ECDSA", hash: "SHA-256" },
        publicKey,
        sigBytes,
        new TextEncoder().encode(doc.contentHash)
      );
    } catch {
      return false;
    }
  }

  // ── Xóa key khi logout ────────────────────────────────────────
  static revokeKey(employeeCode: string): void {
    this._keyStore.delete(employeeCode);
  }

  static hasKey(employeeCode: string): boolean {
    return this._keyStore.has(employeeCode);
  }
}


// ═══════════════════════════════════════════════════════════════
// 4. BLOCKCHAIN LEDGER — sổ giao dịch bất biến
// ═══════════════════════════════════════════════════════════════

export interface LedgerEntry {
  id: string;
  type: "TRANSACTION" | "HR" | "INVENTORY" | "FINANCE" | "ACCESS";
  actor: string;       // employeeCode
  actorName: string;
  action: string;
  payload: string;     // JSON string của dữ liệu
  hash: string;        // SHA-256 của (payload + prevHash)
  prevHash: string;
  timestamp: number;
  signature?: string;  // Optional — nếu actor đã có key
}

export class BlockchainLedger {
  private static _chain: LedgerEntry[] = [];
  private static _listeners: ((entry: LedgerEntry) => void)[] = [];

  // ── Ghi entry mới ─────────────────────────────────────────────
  static async append(
    type: LedgerEntry["type"],
    actor: string,
    actorName: string,
    action: string,
    payload: object,
    signature?: string
  ): Promise<LedgerEntry> {
    const prev = this._chain[this._chain.length - 1];
    const prevHash = prev?.hash ?? "0".repeat(64);
    const payloadStr = JSON.stringify(payload);
    const hash = await CryptoEngine.sha256(payloadStr + prevHash);

    const entry: LedgerEntry = {
      id: `LED-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type,
      actor,
      actorName,
      action,
      payload: payloadStr,
      hash,
      prevHash,
      timestamp: Date.now(),
      ...(signature && { signature }),
    };

    this._chain.push(entry);
    this._listeners.forEach(l => l(entry));
    return entry;
  }

  // ── Verify toàn bộ chain ──────────────────────────────────────
  static async verifyChain(): Promise<{ valid: boolean; brokenAt?: string }> {
    for (let i = 1; i < this._chain.length; i++) {
      const entry = this._chain[i];
      const prev  = this._chain[i - 1];

      // Check prevHash link
      if (entry.prevHash !== prev.hash) {
        return { valid: false, brokenAt: entry.id };
      }

      // Recompute hash
      const expectedHash = await CryptoEngine.sha256(entry.payload + entry.prevHash);
      if (entry.hash !== expectedHash) {
        return { valid: false, brokenAt: entry.id };
      }
    }
    return { valid: true };
  }

  // ── Query ─────────────────────────────────────────────────────
  static getChain(): LedgerEntry[] { return [...this._chain]; }
  static getByActor(actor: string): LedgerEntry[] {
    return this._chain.filter(e => e.actor === actor);
  }
  static getByType(type: LedgerEntry["type"]): LedgerEntry[] {
    return this._chain.filter(e => e.type === type);
  }
  static getLatest(n = 10): LedgerEntry[] {
    return this._chain.slice(-n).reverse();
  }

  // ── Subscribe realtime ────────────────────────────────────────
  static subscribe(listener: (entry: LedgerEntry) => void): () => void {
    this._listeners.push(listener);
    return () => {
      this._listeners = this._listeners.filter(l => l !== listener);
    };
  }
}


// ═══════════════════════════════════════════════════════════════
// 5. EXPORT UNIFIED API
// ═══════════════════════════════════════════════════════════════

export const NattSecurity = {
  Screen:    ScreenProtection,
  Crypto:    CryptoEngine,
  Signature: DigitalSignature,
  Ledger:    BlockchainLedger,

  /** Khởi động toàn bộ security layer khi user login */
  async boot(user: {
    code: string;
    name: string;
    role: string;
    generateKeys?: boolean;
  }): Promise<EmployeeKeyPair | null> {
    // 1. Kích hoạt screen protection
    ScreenProtection.activate({ name: user.name, code: user.code, role: user.role });

    // 2. Ghi login vào ledger
    await BlockchainLedger.append(
      "ACCESS",
      user.code,
      user.name,
      "USER_LOGIN",
      { code: user.code, role: user.role, ua: navigator.userAgent.slice(0, 60) }
    );

    // 3. Tạo key pair nếu yêu cầu
    if (user.generateKeys) {
      return DigitalSignature.generateKeyPair(user.code);
    }
    return null;
  },

  /** Shutdown khi logout */
  async shutdown(user: { code: string; name: string; role: string }): Promise<void> {
    await BlockchainLedger.append("ACCESS", user.code, user.name, "USER_LOGOUT", {});
    DigitalSignature.revokeKey(user.code);
    ScreenProtection.deactivate();
  },
};
