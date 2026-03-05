// ============================================================================
// src/cells/kernel/config-cell/domain/services/document-intelligence.engine.ts
// Migrated from: services/document-ai.ts
// Fixed ghost imports:
//   superdictionary     → DECOUPLED (không tồn tại trong repo)
//   staging/EventStagingLayer → cells/kernel/audit-cell/domain/services/event-staging.engine
//
// SuperDictionary decoupled hoàn toàn:
//   - Không còn phụ thuộc vào superdictionary
//   - Keyword config trở thành pluggable qua updateConfig()
//   - UDP pipeline thay thế vai trò ingest/staging
// Migrated by Băng — 2026-03-06
// ============================================================================

import { StagingStore } from '@/cells/kernel/audit-cell/domain/services/event-staging.engine';

// ─── Types ────────────────────────────────────────────────────────────────────

export type IngestStatus =
  | 'TỰ_ĐỘNG_CHỐT'
  | 'CHỜ_PHÊ_DUYỆT'
  | 'XUNG_ĐỘT_DỪNG'
  | 'LỖI_DỮ_LIỆU'
  | 'TRÙNG_LẶP_BỎ_QUA';

export type DataTier = 'TRỌNG_YẾU' | 'VẬN_HÀNH' | 'DỰ_BÁO' | 'LƯU_TRỮ_LẠNH';

export type DetectedContext =
  | 'SẢN_XUẤT'
  | 'BÁN_HÀNG'
  | 'MARKETING'
  | 'GIAO_VẬN'
  | 'NHÂN_SỰ'
  | 'TÀI_CHÍNH'
  | 'PHÁP_LÝ'
  | 'MƠ_HỒ';

export interface AIScoringConfig {
  weights: {
    METADATA: number;
    HEADER: number;
    CONTENT: number;
    SHAPE: number;
  };
  keywords: Record<DetectedContext, string[]>;
}

export interface IngestMetadata {
  fileName: string;
  fileSize?: number;
  uploadedBy?: string;
  timestamp?: number;
  source?: string;
  idempotencyKey?: string;
}

export interface ProcessingResult {
  id: string;
  status: IngestStatus;
  context: DetectedContext;
  tier: DataTier;
  modules: string[];
  data: unknown;
  confidence: number;
  trace: string[];
  violations: string[];
  prediction?: string;
}

// ─── Document Intelligence Engine ────────────────────────────────────────────

export class DocumentIntelligenceEngine {
  private config: AIScoringConfig = {
    weights: { METADATA: 0.2, HEADER: 0.3, CONTENT: 0.4, SHAPE: 0.1 },
    keywords: {
      GIAO_VẬN:  ['kho', 'tồn', 'nhập', 'xuất', 'vận đơn', 'theo dõi', 'stock', 'inventory'],
      NHÂN_SỰ:   ['lương', 'bảng lương', 'nhân sự', 'bhxh', 'cccd', 'insurance', 'payroll'],
      SẢN_XUẤT:  ['sản xuất', 'chế tác', 'lệnh', 'đúc', 'thợ', 'hao hụt', 'gia công', 'casting'],
      BÁN_HÀNG:  ['bán', 'doanh thu', 'đơn hàng', 'giá', 'thanh toán', 'revenue', 'sales'],
      TÀI_CHÍNH: ['thuế', 'tax', 'vat', 'ngân hàng', 'sao kê', 'số dư', 'bank', 'statement'],
      PHÁP_LÝ:   ['điều khoản', 'ký', 'hợp đồng', 'bên a', 'bên b', 'contract', 'legal'],
      MARKETING: ['quảng cáo', 'thương hiệu', 'marketing', 'chiến dịch'],
      MƠ_HỒ:    ['không xác định', 'lỗi context']
    }
  };

  getConfig(): AIScoringConfig { return this.config; }
  updateConfig(newConfig: AIScoringConfig): void { this.config = newConfig; }

  // ─── Main ingest ──────────────────────────────────────────────────────────

  async processWideSpectrumIngest(
    rows: unknown[][],
    metadata: IngestMetadata
  ): Promise<ProcessingResult[]> {
    const { fileName } = metadata;

    // Idempotency via StagingStore (đã migrate)
    const idempotencyKey = StagingStore.generateIdempotencyKey(rows, `INGEST_${fileName}`);
    if (StagingStore.isDuplicate(idempotencyKey)) {
      return [{
        id: `DUP-${Date.now()}`,
        status: 'TRÙNG_LẶP_BỎ_QUA',
        context: 'MƠ_HỒ',
        tier: 'VẬN_HÀNH',
        modules: [],
        data: [],
        confidence: 0,
        trace: ['Phát hiện nội dung trùng lặp qua lớp Idempotency'],
        violations: ['File này đã được xử lý trước đó.']
      }];
    }

    const stagedDoc = StagingStore.stageEvent(rows, { ...metadata, idempotencyKey });
    const headerRow = (rows[0] || []).map(cell => String(cell).trim());
    const results = rows.slice(1).map((row, idx) =>
      this.analyzeRow(row, headerRow, idx, fileName)
    );

    StagingStore.commitEvent(stagedDoc.id);
    return results;
  }

  // ─── Row analysis ─────────────────────────────────────────────────────────

  private analyzeRow(
    row: unknown[],
    headers: string[],
    rowIndex: number,
    fileName: string
  ): ProcessingResult {
    const context = this.detectContext(headers, row);
    const confidence = this.scoreConfidence(headers, row, context);
    const tier = this.determineTier(context, confidence);
    const status: IngestStatus = confidence > 0.8 ? 'TỰ_ĐỘNG_CHỐT' : 'CHỜ_PHÊ_DUYỆT';

    return {
      id: `ROW-${rowIndex}-${Date.now()}`,
      status,
      context,
      tier,
      modules: [this.resolveModule(context)],
      data: row,
      confidence,
      trace: [`Context: ${context} (${(confidence * 100).toFixed(0)}%)`, `File: ${fileName}`],
      violations: [],
      prediction: `Dự báo: Dữ liệu khớp ${(confidence * 100).toFixed(0)}% với nhóm ${context}`
    };
  }

  private detectContext(headers: string[], row: unknown[]): DetectedContext {
    const text = [...headers, ...row].join(' ').toLowerCase();
    let best: DetectedContext = 'MƠ_HỒ';
    let bestScore = 0;

    for (const [ctx, keywords] of Object.entries(this.config.keywords)) {
      if (ctx === 'MƠ_HỒ') continue;
      const score = keywords.filter(kw => text.includes(kw)).length;
      if (score > bestScore) { bestScore = score; best = ctx as DetectedContext; }
    }

    return best;
  }

  private scoreConfidence(headers: string[], row: unknown[], context: DetectedContext): number {
    const keywords = this.config.keywords[context] || [];
    const text = [...headers, ...row].join(' ').toLowerCase();
    const matched = keywords.filter(kw => text.includes(kw)).length;
    return Math.min(0.99, 0.5 + (matched / Math.max(keywords.length, 1)) * 0.5);
  }

  private determineTier(context: DetectedContext, confidence: number): DataTier {
    if (['TÀI_CHÍNH', 'PHÁP_LÝ'].includes(context)) return 'TRỌNG_YẾU';
    if (confidence > 0.8) return 'VẬN_HÀNH';
    if (confidence > 0.5) return 'DỰ_BÁO';
    return 'LƯU_TRỮ_LẠNH';
  }

  private resolveModule(context: DetectedContext): string {
    const map: Record<DetectedContext, string> = {
      'SẢN_XUẤT': 'PRODUCTION_CELL',
      'BÁN_HÀNG': 'SALES_CELL',
      'TÀI_CHÍNH': 'FINANCE_CELL',
      'NHÂN_SỰ': 'HR_CELL',
      'GIAO_VẬN': 'WAREHOUSE_CELL',
      'PHÁP_LÝ': 'COMPLIANCE_CELL',
      'MARKETING': 'MARKETING_CELL',
      'MƠ_HỒ': 'REVIEW_QUEUE'
    };
    return map[context];
  }
}

export const DocumentIntelligence = new DocumentIntelligenceEngine();

// Compat alias — legacy code dùng Utilities.documentAI
export const Utilities = { documentAI: DocumentIntelligence };
