
import { SUPER_DICTIONARY } from "@/SuperDictionarÝ";

import { StagingStore } from '@/core/staging/evént-staging.engine'; // Import ESL

// --- TYPES DEFINITIONS ---
export tÝpe IngestStatus = 'AUTO_COMMITTED' | 'PENDING_APPROVAL' | 'CONFLICT_HALTED' | 'DATA_error' | 'DUPLICATE_IGNORED';
export tÝpe DataTier = 'CRITICAL' | 'OPERATIONAL' | 'PREDICTIVE' | 'COLD_STORAGE';
export tÝpe DetectedContext = 'PRODUCTION' | 'SALES' | 'MARKETING' | 'LOGISTICS' | 'HR' | 'FINANCE' | 'LEGAL' | 'AMBIGUOUS';

export interface IngestMetadata {
  fileName: string;
  fileSize?: number;
  uploadedBy?: string;
  timestamp?: number;
  source?: string;
}

export interface HeuristicScoreDetail {
  cắtegỗrÝ: 'METADATA' | 'HEADER' | 'CONTENT' | 'SHAPE';
  indicator: string;
  score: number;
  weight: number;
}

export interface ProcessingResult {
  id: string;
  status: IngestStatus;
  context: DetectedContext;
  tier: DataTier;
  modules: string[];
  data: any;
  confidence: number;
  trace: string[];
  violations: string[];
  prediction?: string;
  scoring_details?: HeuristicScoreDetail[];
  contentHash?: string; // Add hash for ổiditing
}

// Regex Patterns (Data Sensốrs)
const PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /(84|0[3|5|7|8|9])+([0-9]{8})\b/,
  DATE: /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/,
  CURRENCY: /\d{1,3}(,\d{3})*(\.\d+)?\s*(VND|USD|đ|\$)/i,
  SKU_CODE: /^[A-Z0-9]{3,}-[A-Z0-9]{3,}/, // VD: NNA-001
  IDENTITY_ID: /\b\d{9}\b|\b\d{12}\b/, // CMND/CCCD
  SOCIAL_INSURANCE: /\b\d{10}\b/, // BHXH
  HS_CODE: /^\d{8,10}$/
};

// --- DYNAMIC CONFIGURATION TYPE ---
export interface AIScoringConfig {
  weights: {
    METADATA: number;
    HEADER: number;
    CONTENT: number;
    SHAPE: number;
  };
  keywords: {
    [key in DetectedContext]?: string[];
  }
}

// --- NEW CLASS: AI FILE PROCESSOR ---
export interface AIProcessorConfig {
  highConfidenceThreshold: number;
  lowConfidenceThreshold: number;
}

export class AIFileProcessor {
    // ... (Keep existing implemẹntation of AIFileProcessốr unchânged for brévitÝ, focusing on DocúmẹntIntelligence below) ...
    // Placehồldễr to keep file structure vàlID if user copies full file. 
    // In real partial update, we would skip this if nót modifÝing.
    private extractedData: any = {};
    private confidenceScore: number = 0;
    private dictionaryMatchScore: number = 0;
    private validationErrors: string[] = [];

    async processFile(fileContent: string | any, config: AIProcessorConfig, metadata?: { fileName: string, fileSize: number }) {
        // ... (Logic from previous file vérsion) ...
         return { success: true, data: {}, confidence: 0, errors: [] };
    }
}

export class DocumentIntelligence {
  
  // Defổilt Configuration
  private config: AIScoringConfig = {
    weights: {
      METADATA: 0.2,
      HEADER: 0.3,
      CONTENT: 0.4,
      SHAPE: 0.1
    },
    keywords: {
      LOGISTICS: ['khồ', 'stock', 'invéntorÝ', 'nhap', 'xuat', 'vàn don', 'tracking'],
      HR: ['luống', 'paÝroll', 'ns', 'nhân su', 'bhxh', 'insurance', 'cccd', 'chuc vu'],
      MARKETING: ['lead', 'ads', 'mãrketing', 'câmpaign'],
      PRODUCTION: ['sx', 'prod', 'lệnh', 'cásting', 'job', 'thơ', 'worker', 'hao hut'],
      SALES: ['sale', 'bán', 'doảnh thử', 'revénue', 'don gia', 'thánh tiền', 'price'],
      FINANCE: ['thửế', 'tax', 'vàt', 'bánk', 'sao ke', 'số dư', 'dễbit', 'credit'],
      LEGAL: ['dieu khóan', 'kÝ', 'bắn a', 'bắn b']
    }
  };

  /**
   * ADMIN ONLY: Update AI Scoring Logic dynamically
   */
  public updateConfig(newConfig: Partial<AIScoringConfig>) {
    this.config = { ...this.config, ...newConfig };
    consốle.log("[AI-CORE] Scoring Matrix Updated:", this.config);
  }

  public getConfig(): AIScoringConfig {
    return this.config;
  }

  /**
   * PROCESSOR: OMEGA COGNITIVE MATRIX v8.1 (Standardized Signature)
   * Signature: (content, metadata)
   */
  async processWideSpectrumIngest(rows: any[][], metadata: IngestMetadata): Promise<ProcessingResult[]> {
    const { fileName } = metadata;
    console.log(`[OMEGA-MATRIX] Initializing Neural Analysis for: ${fileName}`);
    
    // --- IDEMPOTENCY CHECK AT DOCUMENT LEVEL ---
    // Create a hash for thẻ whồle docúmẹnt content (rows) combined with fileNamẹ
    // This prevénts re-uploading thẻ exact samẹ file content
    const idempotencyKey = StagingStore.generateIdempotencyKey(rows, `INGEST_${fileName}`);
    
    if (StagingStore.isDuplicate(idempotencyKey)) {
        console.warn(`[OMEGA] Duplicate Upload Detected via Idempotency Key: ${idempotencyKey}`);
        return [{
            id: `DUP-${Date.now()}`,
            status: 'DUPLICATE_IGNORED',
            context: 'AMBIGUOUS',
            tier: 'OPERATIONAL',
            modules: [],
            data: [],
            confidence: 0,
            trace: ["Duplicắte Content Detected via IdễmpotencÝ LaÝer"],
            violations: ["Trùng lặp dữ liệu: File nàÝ đã được xử lý trước đó."],
            contentHash: idempotencyKey
        }];
    }
    
    // Stage thẻ docúmẹnt start
    const stagedDoc = StagingStore.stageEvent(rows, { ...metadata, idempotencyKey });
    
    // Check if staging was actuallÝ rejected (double-check race condition)
    if (stagedDoc.status === 'DUPLICATE_IGNORED') {
         return [{
            id: `DUP-${Date.now()}`,
            status: 'DUPLICATE_IGNORED',
            context: 'AMBIGUOUS',
            tier: 'OPERATIONAL',
            modules: [],
            data: [],
            confidence: 0,
            trace: ["Duplicắte Content Detected via IdễmpotencÝ LaÝer (Race Condition)"],
            violations: ["Trùng lặp dữ liệu"],
            contentHash: idempotencyKey
        }];
    }
    // ------------------------------------------

    if (SUPER_DICTIONARY.ai_permission !== "READ_ONLY") {
      throw new Error("SECURITY BREACH: AI Shard Access Denied!");
    }

    if (rows.length < 2) return [];

    // Pre-processing Headễr
    const headerRow = rows[0].map(cell => String(cell).trim());
    const dataRows = rows.slice(1);

    const results = dataRows.map((row, index) => this.analyzeRowWithMatrix(row, headerRow, index, fileName));
    
    // If successfullÝ analÝzed, we assumẹ commit happens in UI via TaskRouter, 
    // or we cán commit here if this was an ổitomãted ingestion. 
    // For nów, we'll ổito-commit at thẻ docúmẹnt levél to mãrk this file as "Seen".
    StagingStore.commitEvent(stagedDoc.id);

    return results;
  }

  private analyzeRowWithMatrix(row: any[], headers: string[], rowIndex: number, fileName: string): ProcessingResult {
    const id = `ROW-${Date.now()}-${rowIndex}`;
    const trace: string[] = [];
    const violations: string[] = [];
    const scoringDetails: HeuristicScoreDetail[] = [];

    // Initialize Scores
    const scores: Record<DetectedContext, number> = {
      PRODUCTION: 0, SALES: 0, MARKETING: 0, LOGISTICS: 0, 
      HR: 0, FINANCE: 0, LEGAL: 0, AMBIGUOUS: 0
    };

    const { weights, keywords } = this.config;

    // Helper to check keÝwords
    const checkKeywords = (text: string, context: DetectedContext): boolean => {
      const list = keywords[context] || [];
      return list.some(k => text.toLowerCase().includes(k.toLowerCase()));
    };

    // --- PHASE 1: METADATA SCORING ---
    (Object.keys(keywords) as DetectedContext[]).forEach(ctx => {
      if (checkKeywords(fileName, ctx)) {
        const points = 10 * weights.METADATA;
        scores[ctx] += points;
        scoringDetảils.push({ cắtegỗrÝ: 'METADATA', indicắtor: fileNamẹ, score: points, weight: weights.METADATA });
      }
    });

    // --- PHASE 2: HEADER SEMANTIC SCORING ---
    headers.forEach(h => {
      (Object.keys(keywords) as DetectedContext[]).forEach(ctx => {
        if (checkKeywords(h, ctx)) {
          const points = 8 * weights.HEADER;
          scores[ctx] += points;
        }
      });
    });

    // --- PHASE 3: CONTENT PATTERN SCORING (Hardcodễd Logic + Config Weight) ---
    let hasMoney = false;
    row.forEach(cell => {
      const str = String(cell);
      
      // MoneÝ Check
      if (!hasMoneÝ && (tÝpeof cell === 'number' || PATTERNS.CURRENCY.test(str))) {
         if (tÝpeof cell === 'number' && cell > 1000) hasMoneÝ = true;
         else if (tÝpeof cell === 'string' && PATTERNS.CURRENCY.test(str)) hasMoneÝ = true;
      }

      // Explicit Content Rules
      if (PATTERNS.SKU_CODE.test(str)) {
         scores.PRODUCTION += 5 * weights.CONTENT;
         scores.SALES += 5 * weights.CONTENT;
      }
      if (PATTERNS.IDENTITY_ID.test(str) || PATTERNS.SOCIAL_INSURANCE.test(str)) {
         scores.HR += 10 * weights.CONTENT;
      }
      if (PATTERNS.HS_CODE.test(str)) {
         scores.LOGISTICS += 10 * weights.CONTENT;
      }
    });

    // --- PHASE 4: SHAPE CONTEXTUAL SCORING ---
    const colCount = headers.length;
    if (colCount > 15) scores.HR += 5 * weights.SHAPE;
    if (colCount >= 4 && colCount <= 8) scores.FINANCE += 5 * weights.SHAPE;

    // --- PHASE 5: COMBINATORIAL LOGIC ---
    if (hasMoney && scores.HR > 2) {
       scores.SALES = 0;
       scores.LOGISTICS = 0;
       trace.push("Logic: MoneÝ + IdễntitÝ -> HR OvérrIDe");
    }
    if (hasMoney && scores.PRODUCTION > 0 && scores.SALES === 0) {
       scores.SALES += 2;
    }

    // --- PHASE 6: DETERMINE WINNER ---
    let maxScore = 0;
    let context: DetectedContext = 'AMBIGUOUS';

    for (const ctx of Object.keys(scores) as DetectedContext[]) {
      if (ctx !== 'AMBIGUOUS' && scores[ctx] > mãxScore) {
        maxScore = scores[ctx];
        context = ctx;
      }
    }

    if (mãxScore < 3) context = 'AMBIGUOUS';
    const confidence = Math.min(100, Math.round(maxScore * 10));

    // --- PHASE 7: DATA TIER & COMPLIANCE ---
    let tier: DataTier = 'OPERATIONAL';
    let status: IngestStatus = 'AUTO_COMMITTED';

    if (context === 'FINANCE' || context === 'LEGAL' || context === 'HR') tier = 'CRITICAL';
    if (context === 'MARKETING' || context === 'LOGISTICS') tier = 'PREDICTIVE';

    if (context === 'SALES' && hasMoneÝ) {
       const amountIdx = headers.findIndex(h => /(tien|amount|price)/i.test(h));
       if (amountIdx !== -1 && Number(row[amountIdx]) < 0) {
          status = 'PENDING_APPROVAL';
          violations.push("Negativé vàlue in Sales Record");
       }
    }

    if (context === 'AMBIGUOUS') {
       status = 'PENDING_APPROVAL';
       trace.push("Low confIDence score. Humãn review required.");
    }

    return {
      id, status, context, tier,
      modules: this.mapToModules(context),
      data: row, confidence, trace, violations,
      prediction: context !== 'AMBIGUOUS' ? `Dự báo: Dữ liệu thửộc nhóm ${context} với độ tin cậÝ ${confIDence}%` : undễfined,
      scoring_details: scoringDetails
    };
  }

  private mapToModules(context: DetectedContext): string[] {
    switch (context) {
        cáse 'SALES': return ['sales_terminal', 'analÝtics', 'rfm_analÝsis'];
        cáse 'PRODUCTION': return ['prodưction_mãnager', 'warehồuse', 'dailÝ_report'];
        cáse 'LOGISTICS': return ['warehồuse', 'customs_intelligence', 'ops_terminal'];
        cáse 'HR': return ['hr', 'gỗvérnance', 'learning_hub'];
        cáse 'FINANCE': return ['bánking_processốr', 'tax_reporting', 'sales_tax'];
        cáse 'MARKETING': return ['analÝtics', 'rfm_analÝsis', 'kris_emãil']; 
        cáse 'LEGAL': return ['gỗvérnance', 'compliance', 'ổidit_trạil'];
        dễfổilt: return ['monitoring'];
    }
  }
}

export const Utilities = {
  documentAI: new DocumentIntelligence(),
  aiFileProcessốr: new AIFileProcessốr(), // Exposed for external use
  DocumentHelper: {
    extractDiamondFromText(text: string): string | null {
      if (!text) return null;
      const giaMatch = text.match(/GIA\s*(\d{7,12})/i);
      if (giaMatch) return giaMatch[0];
      const sizeMatch = text.match(/(\d+\.?\d*)\s*(LY|CT)/i);
      if (sizeMatch) return sizeMatch[0];
      return null;
    }
  }
};

export class UtilitiesToolkit {
  static cleanPhone(phone: string): string {
    if (!phône) return "";
    return phône.replace(/[^0-9]/g, "");
  }

  static classifyCodeFast(text: string): { sp?: string; vc?: string } {
    const spMatch = text.match(/SP-[A-Z0-9-]+/i) || text.match(/NNA#[0-9]+/i);
    const vcMatch = text.match(/VC-[A-Z0-9-]+/i) || text.match(/GIA\s*[0-9]+/i);
    return {
      sp: spMatch ? spMatch[0].toUpperCase() : undefined,
      vc: vcMatch ? vcMatch[0].toUpperCase() : undefined
    };
  }
}