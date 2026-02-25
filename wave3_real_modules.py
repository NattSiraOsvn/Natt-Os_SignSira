#!/usr/bin/env python3
"""
NATT-OS Wave 3: Real Module Integration Patch
Replaces 5 shims with real archive implementations.

Modules:
  1. GDBRecognitionEngine (269L) → src/services/gdbEngine.ts [NEW]
  2. ContextScoringEngine (154L) → src/services/scoring/ContextScoringEngine.ts [REPLACE]
  3. ConflictResolver (133L) → src/services/conflict/conflict-resolver.ts [REPLACE]
  4. SupplierEngine (151L) → src/services/supplier/SupplierEngine.ts [NEW]
  5. DictionaryApprovalService (117L) → src/services/dictionary-approval-service.ts [REPLACE]

Run from goldmaster root: python3 wave3_real_modules.py
"""
import os

ROOT = os.path.dirname(os.path.abspath(__file__))

def write(path, content):
    full = os.path.join(ROOT, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, 'w', encoding='utf-8') as f:
        f.write(content)
    lines = content.count('\n')
    print(f'  ✓ {path} ({lines}L)')

def read(path):
    with open(os.path.join(ROOT, path), 'r', encoding='utf-8') as f:
        return f.read()

def append_if_missing(path, marker, content):
    c = read(path)
    if marker not in c:
        write(path, c + content)
        return True
    print(f'  (skip {marker} — already in {path})')
    return False

# ═══════════════════════════════════════════════════════
# STEP 0: Add missing types to types.ts
# ═══════════════════════════════════════════════════════
print('\n[0/6] Adding missing types to types.ts...')

MISSING_TYPES = '''

// ═══════════════════════════════════════════════
// Wave 3 Real Modules: Type definitions from archive
// ═══════════════════════════════════════════════

export interface DataPoint {
  id: string;
  source: string;
  payload: any;
  confidence: number;
  timestamp: number;
  calculatedConfidence?: number;
  scoreDetails?: any;
}

export interface ScoreResult {
  finalScore: number;
  details: {
    source: number;
    temporal: number;
    completeness: number;
    validation: number;
    crossRef: number;
  };
  confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  recommendation: string;
}

export interface DiamondSpecs {
  size: string;
  clarity: string;
  color: string;
  quantity: number;
}

export interface GDBData {
  customer: { name: string; phone: string; normalizedPhone: string };
  product: {
    code: string;
    type: string;
    description: string;
    specifications: string[];
    weight: number;
    diamondSpecs?: DiamondSpecs;
  };
  valuation: { productValue: number; totalValue: number; totalValueInWords: string; exchangeRate: number };
  exchangePolicy: { gold: { returnRate: number; exchangeRate: number }; diamond: { returnRate: number; exchangeRate: number } };
  warranty: { diamondLossUnder3mm: boolean; freeMaintenance: boolean; conditions: string[] };
  company: { name: string; address: string; phoneNumbers: string[]; website: string; email: string };
  documentInfo: { issueDate: Date; sellerName: string; signature: string };
}

export interface GDBDocument {
  type: 'GDB' | 'OTHER';
  confidence: number;
  extractedData: GDBData;
  metadata: {
    template: string;
    extractionQuality: number;
    ocrQuality: number;
    matchedKeywords: string[];
    reason?: string;
    score?: number;
  };
}

export interface Supplier {
  id: string;
  maNhaCungCap: string;
  tenNhaCungCap: string;
  diaChi: string;
  maSoThue: string;
  maNhomNCC?: string;
  dienThoai?: string;
  website?: string;
  email?: string;
  quocGia?: string;
  tinhTP?: string;
  soTaiKhoan?: string;
  tenNganHang?: string;
  ghiChu?: string;
  transactionAmount?: number;
  loaiNCC?: 'NUOC_NGOAI' | 'TO_CHUC' | 'CA_NHAN';
  nhomHangChinh?: string[];
  khuVuc?: 'BAC' | 'TRUNG' | 'NAM' | 'QUOC_TE';
  phuongThucThanhToan?: 'TIEN_MAT' | 'CHUYEN_KHOAN' | 'QUOC_TE';
  dichVuDacThu?: string[];
  mucDoUuTien?: 'CAO' | 'TRUNG_BINH' | 'THAP';
  trangThaiHopTac?: string;
  mucDoTinCay?: string;
  ngayBatDauHopTac?: string;
  sentimentScore?: number;
  coTienNang?: boolean;
  diemDanhGia?: number;
  quyMo?: 'LON' | 'VUA' | 'NHO';
  xuHuong?: 'TANG' | 'GIAM' | 'ON_DINH';
}

export interface InputPersona {
  OFFICE: number;
  DATA_ENTRY: number;
  PHARMACY: number;
  EXPERT: number;
  MASTER: number;
}

export interface CalibrationData {
  userId: string;
  persona: keyof InputPersona;
  avgCPM: number;
  peakCPM: number;
  errorRate: number;
  burstCapacity: number;
  lastCalibrated: number;
  confidence: number;
}

export interface InputMetrics {
  currentCPM: number;
  keystrokes: number;
  clicks: number;
  intensity: number;
}
'''

append_if_missing('src/types.ts', 'Wave 3 Real Modules', MISSING_TYPES)

# ═══════════════════════════════════════════════════════
# STEP 0b: Create NotifyBus shim (dependency for ConflictResolver + DictApproval)
# ═══════════════════════════════════════════════════════
print('\n[0b] Creating NotifyBus shim...')

NOTIFY_BUS = '''// NotifyBus — notification service shim for module integration
export interface NotifyMessage {
  type: 'RISK' | 'SUCCESS' | 'WARNING' | 'INFO';
  title: string;
  content: string;
  persona?: string;
}

class NotificationService {
  private static instance: NotificationService;
  private queue: NotifyMessage[] = [];

  static getInstance(): NotificationService {
    if (!NotificationService.instance) NotificationService.instance = new NotificationService();
    return NotificationService.instance;
  }

  push(msg: NotifyMessage): void {
    this.queue.push({ ...msg, persona: msg.persona || 'SYSTEM' });
    console.log(`[NOTIFY:${msg.type}] ${msg.title}: ${msg.content}`);
  }

  getQueue(): NotifyMessage[] { return [...this.queue]; }
  clear(): void { this.queue = []; }
}

export const NotifyBus = NotificationService.getInstance();
export default NotificationService;
'''

write('src/services/notificationservice.ts', NOTIFY_BUS)

# ═══════════════════════════════════════════════════════
# MODULE 1: GDBRecognitionEngine (269L) — NEW FILE
# ═══════════════════════════════════════════════════════
print('\n[1/5] GDBRecognitionEngine → src/services/gdbEngine.ts')

GDB_ENGINE = r'''// GDBRecognitionEngine — Document Recognition Engine chuyên biệt ngành trang sức
// Real implementation from archive (269L)
import { GDBData, GDBDocument, DiamondSpecs } from '../types';

class GDBPatternDatabase {
  static readonly GDB_KEYWORDS = {
    DOCUMENT_TYPES: ['GIẤY ĐẢM BẢO', 'THÔNG TIN KHÁCH HÀNG', 'CÔNG TY TNHH TÂM LUXURY', 'CHUYÊN KIM CƯƠNG THIÊN NHIÊN', 'TÂM LUXURY - DIAMOND & JEWELRY'],
    CUSTOMER_INFO: ['TÊN KHÁCH HÀNG', 'Tên Khách Hàng', 'SĐT KHÁCH HÀNG', 'SĐT Khách Hàng', 'Số điện thoại', 'KHÁCH HÀNG'],
    PRODUCT_INFO: ['MÃ SẢN PHẨM', 'THÔNG SỐ', 'SIZE', 'GIÁ TRỊ', 'Trị Giá', 'Vòng trang sức', 'Bông tai', 'Nhẫn', 'Dây chuyền'],
    VALUE_INFO: ['TỔNG GIÁ TRỊ', 'Tổng Trị Giá', 'Viết Bằng Chữ', 'Bằng chữ', 'BẢNG CHỮ', 'triệu đồng', 'đồng chẵn'],
    EXCHANGE_POLICY: ['CHẾ ĐỘ THU ĐỐI', 'Giá Trị Thu Đối', 'Thu lại', 'Đổi lớn', 'Vàng thu lại', 'Vàng đổi lớn', 'Kim cương thu lại', 'Kim cương đổi lớn'],
    WARRANTY: ['CHẾ ĐỘ BẢO HÀNH', 'Bảo hành', 'rơi rớt kim cương', 'dưới 3mm', 'làm mới, làm sạch, làm bóng'],
    COMPANY_INFO: ['SHOWROOM', 'WEBSITE', 'FACEBOOK', 'YOUTUBE', 'Hotline', 'Địa chỉ', 'TP.HCM'],
    SIGNATURE: ['Ngày', 'Tháng', 'Năm', 'CHỮ KÝ', 'Ký tên', 'Người Bán', 'Xác nhận']
  };

  static readonly REGEX_PATTERNS = {
    PHONE: /(\+?84|0)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-9]|9[0-9])[0-9]{7}/g,
    MONEY: /(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)\s*(?:VNĐ|đồng|vnd)/gi,
    PERCENTAGE: /[-+]?\d+\s*%/g,
    DATE: /(Ngày\s+\d{1,2}\s+Tháng\s+\d{1,2}\s+Năm\s+\d{4})|(\d{1,2}\/\d{1,2}\/\d{4})/gi,
    PRODUCT_CODE: /(?:MÃ SẢN PHẨM|Mã sản phẩm)[:\s]*([A-Z0-9]+)/i,
    GOLD_WEIGHT: /(\d+(?:[.,]\d+)?)\s*(?:chỉ|gram|g|gam)/i
  };

  static readonly KNOWN_TEMPLATES = [
    { name: 'Tâm Luxury Template 2022', keywords: ['TÂM LUXURY', 'CHUYÊN KIM CƯƠNG THIÊN NHIÊN', 'NNU428'] },
    { name: 'Tâm Luxury Template 2021', keywords: ['CÔNG TY TNHH TÂM LUXURY', 'GIẤY ĐẢM BÁO', 'Bông tai'] }
  ];
}

export class GDBRecognitionEngine {
  private confidenceThreshold = 0.6;
  private patterns = GDBPatternDatabase;
  private ocrText: string;
  private lines: string[];

  constructor(ocrText: string) {
    this.ocrText = this.preprocessText(ocrText);
    this.lines = this.ocrText.split('\n').map(line => line.trim()).filter(l => l.length > 0);
  }

  private preprocessText(text: string): string {
    return text.replace(/\r\n/g, '\n').replace(/\s+/g, ' ').replace(/[^\S\n]+/g, ' ').trim();
  }

  public analyze(): GDBDocument {
    const gdbScore = this.calculateGDBScore();
    const isGDB = gdbScore >= this.confidenceThreshold;

    if (!isGDB) {
      return {
        type: 'OTHER',
        confidence: gdbScore,
        extractedData: {} as any,
        metadata: {
          template: 'Unknown',
          extractionQuality: 0,
          ocrQuality: 0,
          matchedKeywords: this.getMatchedKeywords(),
          reason: 'Low confidence score',
          score: gdbScore
        }
      };
    }

    return {
      type: 'GDB',
      confidence: gdbScore,
      extractedData: this.extractGDBData(),
      metadata: {
        template: this.identifyTemplate(),
        extractionQuality: 0.8,
        ocrQuality: this.lines.length > 5 ? 0.9 : 0.4,
        matchedKeywords: this.getMatchedKeywords()
      }
    };
  }

  private calculateGDBScore(): number {
    let score = 0;
    const importantKeywords = [
      ...this.patterns.GDB_KEYWORDS.DOCUMENT_TYPES,
      ...this.patterns.GDB_KEYWORDS.CUSTOMER_INFO,
      ...this.patterns.GDB_KEYWORDS.VALUE_INFO
    ];
    const foundImportant = importantKeywords.filter(keyword => this.ocrText.includes(keyword)).length;
    score += Math.min(40, (foundImportant / 3) * 40);

    const hasCustomerInfo = this.patterns.GDB_KEYWORDS.CUSTOMER_INFO.some(kw => this.ocrText.includes(kw));
    const hasProductInfo = this.patterns.GDB_KEYWORDS.PRODUCT_INFO.some(kw => this.ocrText.includes(kw));
    const hasValueInfo = this.patterns.GDB_KEYWORDS.VALUE_INFO.some(kw => this.ocrText.includes(kw));

    if (hasCustomerInfo && hasProductInfo && hasValueInfo) score += 30;
    else if (hasCustomerInfo && (hasProductInfo || hasValueInfo)) score += 20;

    if (this.patterns.GDB_KEYWORDS.EXCHANGE_POLICY.some(kw => this.ocrText.includes(kw))) score += 10;
    if (this.patterns.GDB_KEYWORDS.WARRANTY.some(kw => this.ocrText.includes(kw))) score += 10;
    if (this.patterns.GDB_KEYWORDS.SIGNATURE.some(kw => this.ocrText.includes(kw))) score += 10;

    return Math.min(100, score) / 100;
  }

  private extractGDBData(): GDBData {
    return {
      customer: this.extractCustomerInfo(),
      product: this.extractProductInfo(),
      valuation: this.extractValuationInfo(),
      exchangePolicy: this.extractExchangePolicy(),
      warranty: this.extractWarrantyInfo(),
      company: this.extractCompanyInfo(),
      documentInfo: this.extractDocumentInfo()
    };
  }

  private extractCustomerInfo() {
    const customer = { name: '', phone: '', normalizedPhone: '' };
    for (const line of this.lines) {
      if (line.match(/TÊN KHÁCH HÀNG|Tên Khách Hàng/i)) {
        const parts = line.split(':');
        if (parts.length > 1) customer.name = parts[1].trim().replace(/[._-]+/g, ' ').trim();
      }
      if (line.match(/SĐT KHÁCH HÀNG|Số điện thoại/i)) {
        const phoneMatch = line.match(this.patterns.REGEX_PATTERNS.PHONE);
        if (phoneMatch) {
          customer.phone = phoneMatch[0];
          customer.normalizedPhone = phoneMatch[0].replace(/\s+/g, '').replace(/^0/, '84');
        }
      }
    }
    return customer;
  }

  private extractProductInfo() {
    const product = {
      code: '', type: 'KHAC' as any, description: '',
      specifications: [] as string[], weight: 0,
      diamondSpecs: undefined as DiamondSpecs | undefined
    };
    for (const line of this.lines) {
      const codeMatch = line.match(this.patterns.REGEX_PATTERNS.PRODUCT_CODE);
      if (codeMatch) product.code = codeMatch[1];
      if (line.match(/Vòng trang sức/i)) product.type = 'VONG_TRANG_SUC';
      else if (line.match(/Bông tai/i)) product.type = 'BONG_TAI';
      else if (line.match(/Nhẫn/i)) product.type = 'NHAN';
      else if (line.match(/Dây chuyền/i)) product.type = 'DAY_CHUYEN';
      if (line.match(/THÔNG SỐ|Thông số/i)) {
        const specs = line.split(':')[1]?.trim();
        if (specs) product.specifications = specs.split('-').map(s => s.trim());
      }
      const weightMatch = line.match(this.patterns.REGEX_PATTERNS.GOLD_WEIGHT);
      if (weightMatch) product.weight = parseFloat(weightMatch[1].replace(',', '.'));
      if (line.match(/kim cương|Kim cương/i)) product.diamondSpecs = this.extractDiamondSpecs(line);
    }
    product.description = `${product.type} ${product.code}`;
    return product;
  }

  private extractDiamondSpecs(line: string): DiamondSpecs {
    const specs: DiamondSpecs = { size: '', clarity: '', color: '', quantity: 0 };
    const sizeMatch = line.match(/(\d+(?:[.,]\d+)?)\s*ly/);
    if (sizeMatch) specs.size = sizeMatch[1];
    if (line.includes('VVS')) specs.clarity = 'VVS';
    else if (line.includes('VS')) specs.clarity = 'VS';
    else if (line.includes('SI')) specs.clarity = 'SI';
    const colorMatch = line.match(/\b([D-F])\b/);
    if (colorMatch) specs.color = colorMatch[1];
    const countMatch = line.match(/(\d+)\s*(?:viên|hột)/);
    if (countMatch) specs.quantity = parseInt(countMatch[1]);
    return specs;
  }

  private extractValuationInfo() {
    const valuation = { productValue: 0, totalValue: 0, totalValueInWords: '', exchangeRate: 0 };
    for (const line of this.lines) {
      if (line.match(/TỔNG GIÁ TRỊ|Tổng Trị Giá/i)) {
        const matches = line.match(this.patterns.REGEX_PATTERNS.MONEY);
        if (matches) valuation.totalValue = this.parseMoney(matches[0]);
      }
      if (line.match(/Bằng chữ|Viết Bằng Chữ/i)) {
        const parts = line.split(':');
        if (parts.length > 1) valuation.totalValueInWords = parts[1].trim();
      }
    }
    return valuation;
  }

  private extractExchangePolicy() {
    const policy = { gold: { returnRate: 0, exchangeRate: 0 }, diamond: { returnRate: 0, exchangeRate: 0 } };
    for (const line of this.lines) {
      const percentMatches = line.match(this.patterns.REGEX_PATTERNS.PERCENTAGE);
      if (!percentMatches) continue;
      const val = parseInt(percentMatches[0].replace('%','').trim());
      if (line.match(/Vàng|vàng/i) && line.match(/Thu lại/i)) policy.gold.returnRate = val;
      if (line.match(/Vàng|vàng/i) && line.match(/Đổi lớn/i)) policy.gold.exchangeRate = val;
      if (line.match(/Kim cương|kim cương/i) && line.match(/Thu lại/i)) policy.diamond.returnRate = val;
      if (line.match(/Kim cương|kim cương/i) && line.match(/Đổi lớn/i)) policy.diamond.exchangeRate = val;
    }
    return policy;
  }

  private extractWarrantyInfo() {
    const warranty = { diamondLossUnder3mm: false, freeMaintenance: false, conditions: [] as string[] };
    const text = this.ocrText.toLowerCase();
    if (text.includes('rơi rớt kim cương') && text.includes('3mm')) warranty.diamondLossUnder3mm = true;
    if (text.includes('làm mới') || text.includes('làm sạch')) warranty.freeMaintenance = true;
    return warranty;
  }

  private extractCompanyInfo() {
    const company = { name: 'Tâm Luxury', address: '', phoneNumbers: [] as string[], website: '', email: '' };
    for (const line of this.lines) {
      if (line.match(/Quận 5|TP.HCM/i)) company.address = line.trim();
      const phoneMatches = line.match(this.patterns.REGEX_PATTERNS.PHONE);
      if (phoneMatches) company.phoneNumbers.push(...phoneMatches);
    }
    return company;
  }

  private extractDocumentInfo() {
    const info = { issueDate: new Date(), sellerName: '', signature: '' };
    for (const line of this.lines) {
      const dateMatch = line.match(this.patterns.REGEX_PATTERNS.DATE);
      if (dateMatch) info.issueDate = new Date();
      if (line.match(/TRẦN LÊ VĂN TÂM|Tâm Luxury/i)) info.sellerName = 'Trần Lê Văn Tâm';
    }
    return info;
  }

  private parseMoney(str: string): number {
    return parseFloat(str.replace(/[^\d]/g, ''));
  }

  private getMatchedKeywords(): string[] {
    const matched: string[] = [];
    const allKeywords = Object.values(this.patterns.GDB_KEYWORDS).flat();
    for (const keyword of allKeywords) {
      if (this.ocrText.includes(keyword)) matched.push(keyword);
    }
    return matched;
  }

  private identifyTemplate(): string {
    for (const template of this.patterns.KNOWN_TEMPLATES) {
      if (template.keywords.every(keyword => this.ocrText.includes(keyword))) return template.name;
    }
    return 'Unknown Template';
  }
}
'''

write('src/services/gdbEngine.ts', GDB_ENGINE)

# ═══════════════════════════════════════════════════════
# MODULE 2: ContextScoringEngine (154L) — REPLACE SHIM
# ═══════════════════════════════════════════════════════
print('\n[2/5] ContextScoringEngine → src/services/scoring/ContextScoringEngine.ts')

CONTEXT_SCORING = '''// ContextScoringEngine — Weighted multi-dimension scoring engine
// Real implementation from archive (154L)
import { BusinessContext, ScoreResult, DataPoint } from '../../types';

export class ContextScoringEngine {
  private static instance: ContextScoringEngine;

  private readonly SCORE_WEIGHTS = {
    sourceReliability: 0.35,
    temporalRecency: 0.20,
    dataCompleteness: 0.20,
    businessValidation: 0.15,
    crossReference: 0.10
  };

  public static getInstance(): ContextScoringEngine {
    if (!ContextScoringEngine.instance) {
      ContextScoringEngine.instance = new ContextScoringEngine();
    }
    return ContextScoringEngine.instance;
  }

  async scoreDataContext(dataPoint: DataPoint, context: BusinessContext): Promise<ScoreResult> {
    const data = dataPoint.payload;

    const [sourceScore, temporalScore, completenessScore, validationScore, crossRefScore] = await Promise.all([
      this.calculateSourceScore(dataPoint.source),
      this.calculateTemporalScore(dataPoint.timestamp, context.dataType || 'DEFAULT'),
      this.calculateCompletenessScore(data, context.industry || 'GENERAL'),
      this.validateBusinessRules(data, context),
      this.checkCrossReferences(dataPoint)
    ]);

    let finalScore =
      (sourceScore * this.SCORE_WEIGHTS.sourceReliability) +
      (temporalScore * this.SCORE_WEIGHTS.temporalRecency) +
      (completenessScore * this.SCORE_WEIGHTS.dataCompleteness) +
      (validationScore * this.SCORE_WEIGHTS.businessValidation) +
      (crossRefScore * this.SCORE_WEIGHTS.crossReference);

    if (context.industry === 'JEWELRY') {
      if (completenessScore < 0.8) finalScore *= 0.8;
    }
    if (context.industry === 'FINANCE') {
      if (validationScore < 1.0) finalScore *= 0.5;
    }

    return {
      finalScore: parseFloat(finalScore.toFixed(4)),
      details: {
        source: sourceScore,
        temporal: temporalScore,
        completeness: completenessScore,
        validation: validationScore,
        crossRef: crossRefScore
      },
      confidenceLevel: finalScore >= 0.85 ? 'HIGH' : finalScore >= 0.6 ? 'MEDIUM' : 'LOW',
      recommendation: this.generateRecommendation(finalScore)
    };
  }

  // Compatibility alias
  static score(context: any): number {
    if (!context) return 0;
    let score = 50;
    if (context.priority) score += context.priority * 10;
    if (context.timestamp) score += 5;
    return Math.min(100, Math.max(0, score));
  }

  private calculateSourceScore(source: string): number {
    const map: Record<string, number> = {
      'MASTER_MANUAL': 1.0,
      'DIRECT_API': 0.95,
      'OMEGA_OCR': 0.85,
      'LEGACY_SYNC': 0.60,
      'UNKNOWN': 0.30
    };
    return map[source] || 0.5;
  }

  private calculateTemporalScore(timestamp: number, dataType: string): number {
    const ageInHours = (Date.now() - timestamp) / (1000 * 60 * 60);
    if (['GOLD_PRICE', 'STOCK_LEVEL', 'EXCHANGE_RATE'].includes(dataType)) {
      return Math.exp(-ageInHours / 24);
    }
    if (['EMPLOYEE_PROFILE', 'PRODUCT_CATALOG'].includes(dataType)) {
      return Math.exp(-ageInHours / 87600);
    }
    return Math.exp(-ageInHours / 168);
  }

  private calculateCompletenessScore(data: any, industry: string): number {
    if (!data || typeof data !== 'object') return 0;
    const keys = Object.keys(data);
    const filledKeys = keys.filter(k => data[k] !== null && data[k] !== undefined && data[k] !== '');
    let score = filledKeys.length / keys.length;
    if (industry === 'JEWELRY') {
      const criticals = ['weight', 'gold_type', 'stone_spec'];
      const hasCriticals = criticals.every(k => keys.includes(k) ? (data[k] ? true : false) : true);
      if (!hasCriticals) score *= 0.5;
    }
    return score;
  }

  private validateBusinessRules(data: any, context: BusinessContext): number {
    if (data.amount !== undefined && typeof data.amount === 'number' && data.amount < 0) return 0;
    if (data.price !== undefined && typeof data.price === 'number' && data.price < 0) return 0;
    if (data.taxRate !== undefined && data.taxRate > 100) return 0.2;
    if (context.industry === 'LOGISTICS' && data.quantity !== undefined && data.quantity < 0) return 0;
    return 1.0;
  }

  private async checkCrossReferences(dataPoint: DataPoint): Promise<number> {
    if (dataPoint.payload.invoiceId) {
      return Math.random() > 0.1 ? 1.0 : 0.5;
    }
    return 0.8;
  }

  private generateRecommendation(score: number): string {
    if (score >= 0.95) return "AUTO_MERGE: Dữ liệu hoàn hảo.";
    if (score >= 0.85) return "AUTO_ACCEPT: Dữ liệu đáng tin cậy.";
    if (score >= 0.60) return "MANUAL_REVIEW: Cần kiểm tra lại (Cảnh báo vàng).";
    return "REJECT: Dữ liệu rủi ro cao hoặc lỗi nghiêm trọng.";
  }
}

export const ContextScoring = ContextScoringEngine.getInstance();
'''

write('src/services/scoring/ContextScoringEngine.ts', CONTEXT_SCORING)

# ═══════════════════════════════════════════════════════
# MODULE 3: ConflictResolver (133L) — REPLACE CURRENT
# Import fixes: blockchainService→blockchainservice, SuperDictionary→superdictionary
# ═══════════════════════════════════════════════════════
print('\n[3/5] ConflictResolver → src/services/conflict/conflict-resolver.ts')

CONFLICT_RESOLVER = '''// ConflictResolver — Pre-Quantum decision engine with context-aware scoring
// Real implementation from archive (133L) — imports fixed for goldmaster
import {
  DataPoint, ResolutionContext, ResolvedData,
  ConflictResolutionMethod, ConflictResolutionRule, BusinessContext
} from '../../types';
import { ShardingService } from '../blockchainservice';
import { NotifyBus } from '../notificationservice';
import { ContextScoring } from '../scoring/ContextScoringEngine';

export class ConflictResolver {
  private static instance: ConflictResolver;

  public static getInstance(): ConflictResolver {
    if (!ConflictResolver.instance) {
      ConflictResolver.instance = new ConflictResolver();
    }
    return ConflictResolver.instance;
  }

  public async resolveConflicts(
    dataPoints: DataPoint[],
    context: ResolutionContext
  ): Promise<ResolvedData> {

    if (dataPoints.length === 0) throw new Error("No data points to resolve");
    if (dataPoints.length === 1) {
      return {
        resolvedValue: dataPoints[0].payload,
        method: 'PRIORITY_BASED',
        confidence: dataPoints[0].confidence || 0,
        source: dataPoints[0].source || 'SINGLE',
        resolvedAt: Date.now(),
        winner: dataPoints[0],
        losers: [],
        methodUsed: ConflictResolutionMethod.PRIORITY_BASED,
        resolutionHash: await ShardingService.generateShardHash(dataPoints[0]),
        isAutoResolved: true
      };
    }

    const businessContext: BusinessContext = {
      module: 'CONFLICT_RESOLVER',
      operation: 'RESOLVE',
      actor: 'SYSTEM',
      timestamp: Date.now(),
      industry: this.mapDomainToIndustry(context.businessType || 'GENERAL'),
      region: 'VN',
      priority: 'NORMAL',
      dataType: context.businessType || 'GENERAL'
    };

    const scoredPoints = await Promise.all(dataPoints.map(async (p) => {
      const scoreResult = await ContextScoring.scoreDataContext(p, businessContext);
      return {
        ...p,
        calculatedConfidence: scoreResult.finalScore,
        scoreDetails: scoreResult.details
      };
    }));

    scoredPoints.sort((a, b) => (b.calculatedConfidence || 0) - (a.calculatedConfidence || 0));
    const winner = scoredPoints[0];
    const confidenceGap = (winner.calculatedConfidence || 0) - (scoredPoints[1]?.calculatedConfidence || 0);

    const rule = this.loadConflictRule(context.businessType || 'GENERAL');
    let methodUsed = rule.defaultMethod || rule.method;

    if (confidenceGap >= (rule.threshold || 0.3)) {
      methodUsed = ConflictResolutionMethod.PRIORITY_BASED;
    } else if (rule.fallbackMethod === ConflictResolutionMethod.TIMESTAMP_BASED) {
      scoredPoints.sort((a, b) => b.timestamp - a.timestamp);
      methodUsed = ConflictResolutionMethod.TIMESTAMP_BASED;
    } else {
      methodUsed = ConflictResolutionMethod.MANUAL_REVIEW;
      NotifyBus.push({
        type: 'RISK',
        title: 'Xung đột dữ liệu cần xem xét',
        content: \`Xung đột tại \${context.businessType || 'UNKNOWN'}. Gap: \${(confidenceGap * 100).toFixed(1)}%. Winner Score: \${winner.calculatedConfidence}\`,
        persona: 'KRIS'
      });
    }

    return {
      resolvedValue: scoredPoints[0].payload,
      method: String(methodUsed),
      confidence: scoredPoints[0].calculatedConfidence || 0,
      source: scoredPoints[0].source || 'SCORED',
      resolvedAt: Date.now(),
      winner: scoredPoints[0],
      losers: scoredPoints.slice(1),
      methodUsed: String(methodUsed),
      resolutionHash: await ShardingService.generateShardHash({ winner: scoredPoints[0].id, context }),
      isAutoResolved: methodUsed !== ConflictResolutionMethod.MANUAL_REVIEW
    };
  }

  private mapDomainToIndustry(domain: string): string {
    const map: Record<string, string> = {
      'JEWELRY': 'JEWELRY', 'GOLD': 'JEWELRY', 'DIAMOND': 'JEWELRY',
      'FINANCE': 'FINANCE', 'TAX': 'FINANCE', 'ACCOUNTING': 'FINANCE',
      'LOGISTICS': 'LOGISTICS', 'WAREHOUSE': 'LOGISTICS',
    };
    return map[domain] || 'GENERAL';
  }

  private loadConflictRule(dataType: string): ConflictResolutionRule {
    return {
      id: \`RULE-\${dataType}\`,
      name: \`\${dataType} Resolution Rule\`,
      priority: 1,
      condition: 'default',
      method: ConflictResolutionMethod.PRIORITY_BASED,
      dataType: dataType,
      threshold: 0.3,
      defaultMethod: ConflictResolutionMethod.PRIORITY_BASED,
      fallbackMethod: ConflictResolutionMethod.MANUAL_REVIEW
    };
  }
}

export const ConflictEngine = ConflictResolver.getInstance();
'''

write('src/services/conflict/conflict-resolver.ts', CONFLICT_RESOLVER)

# ═══════════════════════════════════════════════════════
# MODULE 4: SupplierEngine (151L) — NEW FILE
# ═══════════════════════════════════════════════════════
print('\n[4/5] SupplierEngine → src/services/supplier/SupplierEngine.ts')

SUPPLIER_ENGINE = '''// SupplierEngine — Keyword classification, scale detection, trend analysis
// Real implementation from archive (151L)
import { Supplier } from '../../types';

export class SupplierEngine {
  public static readonly PRODUCT_CATEGORIES = {
    DIAMONDS_GEMS: {
      name: 'KIM_CUONG_DA_QUY',
      keywords: ['kim cương', 'diamond', 'gem', 'đá quý', 'hột xoàn', 'pearl', 'ruby', 'sapphire', 'precious'],
      specificSuppliers: ['PRIME GEMS', 'ASIAN STAR', 'WORLD GEMS', 'ZEN', 'GEMPRO']
    },
    GOLD_SILVER: {
      name: 'VANG_BAC',
      keywords: ['vàng', 'gold', 'bạc', 'silver', 'trang sức', 'nữ trang', 'sjc', 'pnj', 'doji', '18k', '24k'],
      specificSuppliers: ['SJC', 'GOLDJ', 'PNJ', 'TÂM LUXURY']
    },
    PACKAGING_PRINTING: {
      name: 'BAO_BI_IN_AN',
      keywords: ['bao bì', 'in ấn', 'packaging', 'túi', 'hộp', 'printing', 'tem nhãn', 'brochure'],
      specificSuppliers: ['VĨNH KHANG', 'TRÍ THIỆN', 'TÂN PHÚ', 'HỒNG PHÁT']
    },
    LOGISTICS: {
      name: 'LOGISTICS',
      keywords: ['vận chuyển', 'logistics', 'ship', 'giao hàng', 'vận tải', 'freight', 'forwarding', 'customs'],
      specificSuppliers: ['SHOWTRANS', 'GIAI PHÁT', 'FEDEX', 'DHL']
    },
    EQUIPMENT_TOOLS: {
      name: 'THIET_BI_CONG_CU',
      keywords: ['thiết bị', 'máy', 'công cụ', 'tool', 'kính hiển vi', 'laser', 'máy đúc', 'máy mài'],
      specificSuppliers: ['NTO', 'O.T.E.C', 'HIGH TECH']
    },
    SERVICES: {
      name: 'DICH_VU',
      keywords: ['dịch vụ', 'service', 'phần mềm', 'software', 'tư vấn', 'consulting', 'giám định', 'appraisal'],
      specificSuppliers: ['MISA', 'NGÂN LƯỢNG', 'MALCA-AMIT', 'FPT', 'VIETTEL']
    },
    OFFICE_SUPPLIES: {
      name: 'VAN_PHONG_PHAM',
      keywords: ['văn phòng phẩm', 'office supplies', 'giấy', 'bút', 'mực', 'ghim', 'kẹp'],
      specificSuppliers: ['PHONG VŨ', 'NGUYỄN CÔNG']
    },
    RAW_MATERIALS: {
      name: 'NGUYEN_LIEU',
      keywords: ['nguyên liệu', 'raw material', 'hóa chất', 'chất liệu', 'phụ liệu', 'chain', 'clasp'],
      specificSuppliers: []
    }
  };

  static classifyByProductGroup(supplier: Partial<Supplier>): string[] {
    const name = (supplier.tenNhaCungCap || '').toLowerCase();
    const note = (supplier.ghiChu || '').toLowerCase();
    const groups: Set<string> = new Set();

    Object.values(this.PRODUCT_CATEGORIES).forEach(category => {
      if (category.specificSuppliers.some(s => name.toUpperCase().includes(s))) {
        groups.add(category.name);
      }
      if (category.keywords.some(k => name.includes(k) || note.includes(k))) {
        groups.add(category.name);
      }
    });

    return groups.size > 0 ? Array.from(groups) : ['KHAC'];
  }

  static classifyByScale(supplier: Supplier): 'LON' | 'VUA' | 'NHO' {
    let score = 0;
    if (supplier.loaiNCC === 'NUOC_NGOAI') score += 3;
    if (supplier.transactionAmount && supplier.transactionAmount > 1000000000) score += 3;
    else if (supplier.transactionAmount && supplier.transactionAmount > 100000000) score += 2;
    if (supplier.website && supplier.email) score += 2;
    if (supplier.tenNhaCungCap.toUpperCase().includes('TẬP ĐOÀN') || supplier.tenNhaCungCap.toUpperCase().includes('GROUP')) score += 2;
    if (score >= 5) return 'LON';
    if (score >= 3) return 'VUA';
    return 'NHO';
  }

  static determineTrend(supplier: Supplier): 'TANG' | 'GIAM' | 'ON_DINH' {
    const rand = Math.random();
    if (rand > 0.7) return 'TANG';
    if (rand < 0.2) return 'GIAM';
    return 'ON_DINH';
  }

  static getActionRecommendations(supplier: Supplier): { type: 'warning' | 'opportunity' | 'critical', title: string, action: string }[] {
    const recs: { type: 'warning' | 'opportunity' | 'critical', title: string, action: string }[] = [];

    if (supplier.sentimentScore && supplier.sentimentScore < 0.5) {
      recs.push({
        type: 'critical',
        title: 'Cảnh báo thái độ (Sentiment Low)',
        action: 'Rà soát lại các khiếu nại chưa xử lý hoặc tìm đối tác thay thế.'
      });
    }

    if (supplier.nhomHangChinh?.includes('KIM_CUONG_DA_QUY') && supplier.quyMo === 'LON') {
      recs.push({
        type: 'opportunity',
        title: 'Đối tác chiến lược tiềm năng',
        action: 'Đàm phán hạn mức nợ hoặc ưu đãi giá nhập cho lô hàng lớn.'
      });
    }

    if (this.determineTrend(supplier) === 'GIAM' && supplier.mucDoUuTien === 'CAO') {
      recs.push({
        type: 'warning',
        title: 'Sụt giảm giao dịch',
        action: 'Liên hệ xác minh nguyên nhân (Giá cả hay chất lượng dịch vụ).'
      });
    }

    return recs;
  }

  static analyzeStrategicFit(supplier: Supplier): Partial<Supplier> {
    const nhomHang = this.classifyByProductGroup(supplier);
    const quyMo = this.classifyByScale(supplier);
    const xuHuong = this.determineTrend(supplier);

    return {
      nhomHangChinh: nhomHang,
      quyMo: quyMo,
      xuHuong: xuHuong,
      mucDoUuTien: nhomHang.includes('KIM_CUONG_DA_QUY') ? 'CAO' : 'TRUNG_BINH',
      coTienNang: quyMo === 'LON' || nhomHang.includes('KIM_CUONG_DA_QUY'),
      diemDanhGia: Math.round((supplier.sentimentScore || 0.5) * 10)
    };
  }
}
'''

write('src/services/supplier/SupplierEngine.ts', SUPPLIER_ENGINE)

# ═══════════════════════════════════════════════════════
# MODULE 5: DictionaryApprovalService (117L) — REPLACE
# Import fixes: uuid→inline, SuperDictionary→superdictionary, notificationService→notificationservice
# ═══════════════════════════════════════════════════════
print('\n[5/5] DictionaryApprovalService → src/services/dictionary-approval-service.ts')

DICT_APPROVAL = '''// DictionaryApprovalService — Governance workflow for dictionary changes
// Real implementation from archive (117L) — imports fixed, uuid replaced
import { NotifyBus } from './notificationservice';

export interface ChangeProposal {
  id: string;
  type: 'ADD_FIELD' | 'MODIFY_FIELD' | 'REMOVE_FIELD' | 'ADD_RULE';
  target: string;
  newValue: any;
  oldValue?: any;
  reason: string;
  submitter: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  impactAnalysis: {
    affectedRecords: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  };
  timestamp: number;
}

function generateId(): string {
  return `DICT-CHG-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}

class DictionaryApprovalService {
  private static instance: DictionaryApprovalService;
  private pendingChanges: ChangeProposal[] = [];

  static getInstance() {
    if (!DictionaryApprovalService.instance) DictionaryApprovalService.instance = new DictionaryApprovalService();
    return DictionaryApprovalService.instance;
  }

  async proposeChange(
    type: ChangeProposal['type'],
    target: string,
    newValue: any,
    reason: string,
    submitter: string
  ): Promise<ChangeProposal> {
    const impact = await this.analyzeImpact(type, target);

    const proposal: ChangeProposal = {
      id: generateId(),
      type, target, newValue, reason, submitter,
      status: 'PENDING',
      impactAnalysis: impact,
      timestamp: Date.now()
    };

    this.pendingChanges.push(proposal);

    NotifyBus.push({
      type: 'RISK',
      title: 'Yêu cầu thay đổi Từ điển',
      content: \`User \${submitter} muốn \${type} trường \${target}. Mức độ ảnh hưởng: \${impact.riskLevel}\`,
      persona: 'KRIS'
    });

    return proposal;
  }

  private async analyzeImpact(type: string, target: string) {
    const recordCount = Math.floor(Math.random() * 5000);
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';

    if (type === 'REMOVE_FIELD') riskLevel = 'HIGH';
    if (type === 'MODIFY_FIELD' && recordCount > 1000) riskLevel = 'MEDIUM';

    return { affectedRecords: recordCount, riskLevel };
  }

  async reviewChange(id: string, decision: 'APPROVE' | 'REJECT', reviewer: string) {
    const proposal = this.pendingChanges.find(p => p.id === id);
    if (!proposal) throw new Error("Proposal not found");

    if (decision === 'REJECT') {
      proposal.status = 'REJECTED';
      return;
    }

    proposal.status = 'APPROVED';
    await this.applyChange(proposal);

    NotifyBus.push({
      type: 'SUCCESS',
      title: 'Dictionary Updated',
      content: \`Thay đổi \${proposal.id} đã được áp dụng vào hệ thống lõi.\`,
      persona: 'THIEN'
    });
  }

  private async applyChange(p: ChangeProposal) {
    console.log(\`[Dictionary] Applying change \${p.type} on \${p.target} to \${JSON.stringify(p.newValue)}\`);
  }

  public getPendingProposals() { return this.pendingChanges.filter(p => p.status === 'PENDING'); }
  public getHistory() { return this.pendingChanges.filter(p => p.status !== 'PENDING'); }
}

export const DictApproval = DictionaryApprovalService.getInstance();
'''

write('src/services/dictionary-approval-service.ts', DICT_APPROVAL)

# ═══════════════════════════════════════════════════════
# DONE
# ═══════════════════════════════════════════════════════
print('\n' + '='*60)
print('✅ 5 REAL MODULES INTEGRATED')
print('  1. GDBRecognitionEngine  (269L) → src/services/gdbEngine.ts')
print('  2. ContextScoringEngine  (154L) → src/services/scoring/ContextScoringEngine.ts')
print('  3. ConflictResolver      (133L) → src/services/conflict/conflict-resolver.ts')
print('  4. SupplierEngine        (151L) → src/services/supplier/SupplierEngine.ts')
print('  5. DictApprovalService   (117L) → src/services/dictionary-approval-service.ts')
print('  + NotifyBus shim + 9 type definitions')
print('')
print('Run:')
print('  npx tsc --noEmit')
print('  npm run build')
print('='*60)
