// ============================================================================
// src/core/ingestion/udp.pipeline.ts
// UDP — Universal Data Processor
// Kiến trúc: Receive → Validate → Classify → Guard → Extract → Commit → Audit
//
// DIRECTIVE: Mỗi rule có thể mở rộng vô hạn. Không hard-code business logic.
// Mọi bước phải để lại audit trail. Không có audit = không tồn tại.
// ============================================================================

import { IngestStatus, FileMetadata, Domain, PersonaID } from '@/types';

// ============================================================================
// TYPES — UDP Internal (mở rộng được, không replace types.ts)
// ============================================================================

export type UDPInputType = 'FILE' | 'JSON' | 'TEXT' | 'XLSX' | 'PDF';

export type UDPDomain =
  | 'TAX'
  | 'HR'
  | 'CUSTOMS'
  | 'SALES'
  | 'FINANCE'
  | 'PRODUCTION'
  | 'INVENTORY'
  | 'LEGAL'
  | 'UNKNOWN';

export type QuarantineReason =
  | 'DUPLICATE'
  | 'FORMAT_INVALID'
  | 'DOMAIN_UNRESOLVED'
  | 'GUARD_REJECTED'
  | 'MISSING_REQUIRED_FIELDS'
  | 'INTEGRITY_FAILED';

export interface UDPPayload {
  id: string;
  inputType: UDPInputType;
  rawContent: unknown;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  hash: string;
  domain?: UDPDomain;
  submittedBy: string;
  submittedAt: number;
}

export interface UDPResult {
  payloadId: string;
  status: 'COMMITTED' | 'QUARANTINED' | 'PENDING_REVIEW';
  domain?: UDPDomain;
  extractedData?: Record<string, unknown>;
  quarantineReason?: QuarantineReason;
  auditTrail: UDPAuditEntry[];
  committedAt?: number;
}

export interface UDPAuditEntry {
  step: string;
  status: 'OK' | 'WARN' | 'FAIL';
  message: string;
  timestamp: number;
  actor?: string;
}

export interface DomainRouter {
  // Thêm rule mới bằng registerRouter — không sửa core
  resolve(payload: UDPPayload): UDPDomain;
}

export interface DomainExtractor {
  // Mỗi domain implement riêng — open for extension
  extract(payload: UDPPayload): Record<string, unknown>;
  validate(data: Record<string, unknown>): { valid: boolean; errors: string[] };
}

export interface GuardRule {
  // Rule có thể thêm vô hạn qua registerGuardRule
  name: string;
  check(payload: UDPPayload): { passed: boolean; reason?: QuarantineReason; message?: string };
}

// ============================================================================
// IDEMPOTENCY MANAGER
// ============================================================================

class IdempotencyManager {
  private registry = new Map<string, UDPPayload>();

  isDuplicate(hash: string): UDPPayload | null {
    for (const p of this.registry.values()) {
      if (p.hash === hash) return p;
    }
    return null;
  }

  register(payload: UDPPayload): void {
    this.registry.set(payload.id, payload);
  }

  getAll(): UDPPayload[] {
    return Array.from(this.registry.values());
  }
}

// ============================================================================
// DICTIONARY GUARD — Quarantine tri thức bẩn
// Mọi rule đều pluggable — không hard-code
// ============================================================================

class DictionaryGuard {
  private rules: GuardRule[] = [];

  registerRule(rule: GuardRule): void {
    this.rules.push(rule);
  }

  check(payload: UDPPayload): { passed: boolean; reason?: QuarantineReason; message?: string } {
    for (const rule of this.rules) {
      const result = rule.check(payload);
      if (!result.passed) return result;
    }
    return { passed: true };
  }
}

// ============================================================================
// DOMAIN CLASSIFIER
// ============================================================================

class DomainClassifier {
  private routers: Array<(payload: UDPPayload) => UDPDomain | null> = [];

  // Thêm router mới không cần sửa core
  registerRouter(fn: (payload: UDPPayload) => UDPDomain | null): void {
    this.routers.push(fn);
  }

  resolve(payload: UDPPayload): UDPDomain {
    for (const router of this.routers) {
      const domain = router(payload);
      if (domain) return domain;
    }
    return 'UNKNOWN';
  }
}

// ============================================================================
// EXTRACTOR REGISTRY
// ============================================================================

class ExtractorRegistry {
  private extractors = new Map<UDPDomain, DomainExtractor>();

  register(domain: UDPDomain, extractor: DomainExtractor): void {
    this.extractors.set(domain, extractor);
  }

  get(domain: UDPDomain): DomainExtractor | null {
    return this.extractors.get(domain) || null;
  }
}

// ============================================================================
// AUDIT LOGGER
// ============================================================================

class AuditLogger {
  private logs = new Map<string, UDPAuditEntry[]>();

  log(payloadId: string, entry: Omit<UDPAuditEntry, 'timestamp'>): void {
    const existing = this.logs.get(payloadId) || [];
    existing.push({ ...entry, timestamp: Date.now() });
    this.logs.set(payloadId, existing);
  }

  getTrail(payloadId: string): UDPAuditEntry[] {
    return this.logs.get(payloadId) || [];
  }
}

// ============================================================================
// UDP PIPELINE — Orchestrator chính
// ============================================================================

export class UDPPipeline {
  private static instance: UDPPipeline;

  private idempotency = new IdempotencyManager();
  private guard = new DictionaryGuard();
  private classifier = new DomainClassifier();
  private extractors = new ExtractorRegistry();
  private audit = new AuditLogger();

  static getInstance(): UDPPipeline {
    if (!UDPPipeline.instance) {
      UDPPipeline.instance = new UDPPipeline();
      UDPPipeline.instance.registerDefaultRules();
    }
    return UDPPipeline.instance;
  }

  // ─── Extension Points ─────────────────────────────────────────────────────

  registerGuardRule(rule: GuardRule): void {
    this.guard.registerRule(rule);
  }

  registerDomainRouter(fn: (payload: UDPPayload) => UDPDomain | null): void {
    this.classifier.registerRouter(fn);
  }

  registerExtractor(domain: UDPDomain, extractor: DomainExtractor): void {
    this.extractors.register(domain, extractor);
  }

  // ─── Default Rules ────────────────────────────────────────────────────────

  private registerDefaultRules(): void {
    // Rule: fileName-based domain routing
    this.registerDomainRouter((payload) => {
      const name = (payload.fileName || '').toLowerCase();
      if (name.includes('tax') || name.includes('thue') || name.includes('vat')) return 'TAX';
      if (name.includes('hr') || name.includes('nhansu') || name.includes('luong')) return 'HR';
      if (name.includes('customs') || name.includes('haiquan') || name.includes('nhap_khau')) return 'CUSTOMS';
      if (name.includes('sales') || name.includes('banhang') || name.includes('doanhthu')) return 'SALES';
      if (name.includes('finance') || name.includes('ketoan') || name.includes('taichinh')) return 'FINANCE';
      if (name.includes('production') || name.includes('sanxuat')) return 'PRODUCTION';
      return null;
    });

    // Guard: Không cho qua nếu hash rỗng
    this.registerGuardRule({
      name: 'HASH_REQUIRED',
      check: (payload) => ({
        passed: !!payload.hash && payload.hash.length > 0,
        reason: 'INTEGRITY_FAILED',
        message: 'Payload thiếu hash — không thể đảm bảo tính toàn vẹn'
      })
    });

    // Guard: Không cho qua nếu submittedBy rỗng
    this.registerGuardRule({
      name: 'ACTOR_REQUIRED',
      check: (payload) => ({
        passed: !!payload.submittedBy,
        reason: 'MISSING_REQUIRED_FIELDS',
        message: 'Không xác định được người nộp dữ liệu'
      })
    });
  }

  // ─── Pipeline Steps ───────────────────────────────────────────────────────

  /**
   * BƯỚC 1: Receive & Hash
   */
  async receive(
    rawContent: unknown,
    meta: { inputType: UDPInputType; fileName?: string; fileSize?: number; mimeType?: string; submittedBy: string }
  ): Promise<UDPPayload> {
    const hash = await this.generateHash(rawContent);
    const payload: UDPPayload = {
      id: `UDP-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      ...meta,
      rawContent,
      hash,
      submittedAt: Date.now()
    };
    this.audit.log(payload.id, { step: 'RECEIVE', status: 'OK', message: `Nhận payload ${payload.id}` });
    return payload;
  }

  /**
   * BƯỚC 2: Validate Idempotency
   */
  private validateIdempotency(payload: UDPPayload): { isDuplicate: boolean; existing?: UDPPayload } {
    const existing = this.idempotency.isDuplicate(payload.hash);
    if (existing) {
      this.audit.log(payload.id, {
        step: 'IDEMPOTENCY',
        status: 'WARN',
        message: `Trùng lặp với payload đã xử lý: ${existing.id}`
      });
      return { isDuplicate: true, existing };
    }
    this.audit.log(payload.id, { step: 'IDEMPOTENCY', status: 'OK', message: 'Hash mới — không trùng lặp' });
    return { isDuplicate: false };
  }

  /**
   * BƯỚC 3: Domain Classification
   */
  private classify(payload: UDPPayload): UDPDomain {
    const domain = this.classifier.resolve(payload);
    payload.domain = domain;
    this.audit.log(payload.id, {
      step: 'CLASSIFY',
      status: domain === 'UNKNOWN' ? 'WARN' : 'OK',
      message: `Domain: ${domain}`
    });
    return domain;
  }

  /**
   * BƯỚC 4: Dictionary Guard
   */
  private runGuard(payload: UDPPayload): { passed: boolean; reason?: QuarantineReason; message?: string } {
    const result = this.guard.check(payload);
    this.audit.log(payload.id, {
      step: 'GUARD',
      status: result.passed ? 'OK' : 'FAIL',
      message: result.message || (result.passed ? 'Guard passed' : `Quarantine: ${result.reason}`)
    });
    return result;
  }

  /**
   * BƯỚC 5: Extract
   */
  private extract(payload: UDPPayload, domain: UDPDomain): Record<string, unknown> | null {
    const extractor = this.extractors.get(domain);
    if (!extractor) {
      this.audit.log(payload.id, {
        step: 'EXTRACT',
        status: 'WARN',
        message: `Không có extractor cho domain: ${domain} — lưu raw`
      });
      return typeof payload.rawContent === 'object' ? payload.rawContent as Record<string, unknown> : { raw: payload.rawContent };
    }

    const data = extractor.extract(payload);
    const validation = extractor.validate(data);

    this.audit.log(payload.id, {
      step: 'EXTRACT',
      status: validation.valid ? 'OK' : 'WARN',
      message: validation.valid ? `Extracted ${Object.keys(data).length} fields` : `Validation warnings: ${validation.errors.join(', ')}`
    });

    return data;
  }

  // ─── Main Process ─────────────────────────────────────────────────────────

  /**
   * Chạy toàn bộ pipeline
   * Kết quả luôn có audit trail — không có exception im lặng
   */
  async process(payload: UDPPayload): Promise<UDPResult> {
    // Idempotency check
    const idempotencyCheck = this.validateIdempotency(payload);
    if (idempotencyCheck.isDuplicate) {
      return {
        payloadId: payload.id,
        status: 'QUARANTINED',
        quarantineReason: 'DUPLICATE',
        auditTrail: this.audit.getTrail(payload.id)
      };
    }

    // Register trước khi tiếp tục
    this.idempotency.register(payload);

    // Classify
    const domain = this.classify(payload);
    if (domain === 'UNKNOWN') {
      return {
        payloadId: payload.id,
        status: 'PENDING_REVIEW',
        domain,
        auditTrail: this.audit.getTrail(payload.id)
      };
    }

    // Guard
    const guardResult = this.runGuard(payload);
    if (!guardResult.passed) {
      return {
        payloadId: payload.id,
        status: 'QUARANTINED',
        domain,
        quarantineReason: guardResult.reason,
        auditTrail: this.audit.getTrail(payload.id)
      };
    }

    // Extract
    const extractedData = this.extract(payload, domain) || {};

    // Commit
    this.audit.log(payload.id, {
      step: 'COMMIT',
      status: 'OK',
      message: `Committed to domain: ${domain}`,
      actor: payload.submittedBy
    });

    return {
      payloadId: payload.id,
      status: 'COMMITTED',
      domain,
      extractedData,
      auditTrail: this.audit.getTrail(payload.id),
      committedAt: Date.now()
    };
  }

  // ─── Utils ────────────────────────────────────────────────────────────────

  private async generateHash(content: unknown): Promise<string> {
    const str = typeof content === 'string' ? content : JSON.stringify(content);
    if (typeof window !== 'undefined' && window.crypto?.subtle) {
      const buffer = new TextEncoder().encode(str);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', buffer);
      return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    }
    // Node fallback (for tests)
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }

  getHistory(): UDPPayload[] {
    return this.idempotency.getAll();
  }
}

export const UDP = UDPPipeline.getInstance();
