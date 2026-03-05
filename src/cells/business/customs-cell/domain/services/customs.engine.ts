// ============================================================================
// src/cells/business/customs-cell/domain/services/customs.engine.ts
// Merged: customs-service.ts + customs-risk.engine.ts
// Fixed: ghost import customsUtils, duplicate types, @ts-ignore
// Migrated by Băng — 2026-03-06
// DIRECTIVE: Mở rộng vô hạn — HS codes, risk factors, compliance rules đều pluggable
// ============================================================================

import {
  CustomsDeclaration,
  CustomsDeclarationItem,
  ActionPlan,
  RiskAssessment,
  ComplianceCheck,
  TrackingStep,
  RiskFactor
} from '@/types';
import { UDP, UDPDomain, DomainExtractor } from '@/core/ingestion/udp.pipeline';

// ============================================================================
// CONFIG — Pluggable. Thêm HS code, origin, rule mới không sửa core
// ============================================================================

export interface CustomsRuleConfig {
  sensitiveHSCodes: string[];
  riskyOrigins: string[];
  highValueThresholdUSD: number;
  riskWeights: {
    highValue: number;
    riskyOrigin: number;
    sensitiveHS: number;
    redStream: number;
    missingCert: number;
  };
  riskLevels: {
    critical: number;
    high: number;
    medium: number;
  };
}

const DEFAULT_CUSTOMS_CONFIG: CustomsRuleConfig = {
  // Vàng (7108), Kim cương (7102), Trang sức (7113)
  sensitiveHSCodes: ['7102', '7108', '7113'],
  riskyOrigins: ['AFRICA_GENERIC', 'CONFLICT_ZONE'],
  highValueThresholdUSD: 100_000,
  riskWeights: {
    highValue: 20,
    riskyOrigin: 30,
    sensitiveHS: 25,
    redStream: 15,
    missingCert: 10
  },
  riskLevels: { critical: 60, high: 40, medium: 20 }
};

// ============================================================================
// CUSTOMS ENGINE
// ============================================================================

export class CustomsEngine {
  private static instance: CustomsEngine;
  private config: CustomsRuleConfig = { ...DEFAULT_CUSTOMS_CONFIG };

  static getInstance(): CustomsEngine {
    if (!CustomsEngine.instance) {
      CustomsEngine.instance = new CustomsEngine();
      CustomsEngine.instance.registerUDPExtractor();
    }
    return CustomsEngine.instance;
  }

  /** Override config — thêm HS code mới, thay đổi threshold không cần sửa core */
  updateConfig(partial: Partial<CustomsRuleConfig>): void {
    this.config = { ...this.config, ...partial };
  }

  registerSensitiveHS(hsCodes: string[]): void {
    this.config.sensitiveHSCodes = [...new Set([...this.config.sensitiveHSCodes, ...hsCodes])];
  }

  // ─── Risk Assessment ──────────────────────────────────────────────────────

  assessRisk(decl: CustomsDeclaration): RiskAssessment {
    let score = 0;
    const factors: RiskFactor[] = [];
    const recommendations: string[] = [];

    // Factor 1: Trị giá lô hàng
    const totalValue = decl.items.reduce((sum, i) => sum + (i.invoiceValue || 0), 0);
    if (totalValue > this.config.highValueThresholdUSD) {
      score += this.config.riskWeights.highValue;
      factors.push({
        factor: 'HIGH_VALUE',
        weight: this.config.riskWeights.highValue,
        description: `Lô hàng > $${this.config.highValueThresholdUSD.toLocaleString()} USD`
      });
      recommendations.push('Cần chứng từ giám định giá trị');
    }

    // Factor 2: Xuất xứ nhạy cảm
    if (decl.items.some(i => this.config.riskyOrigins.includes(i.originCountry))) {
      score += this.config.riskWeights.riskyOrigin;
      factors.push({
        factor: 'RISKY_ORIGIN',
        weight: this.config.riskWeights.riskyOrigin,
        description: 'Xuất xứ từ khu vực nhạy cảm'
      });
      recommendations.push('Yêu cầu Certificate of Origin + Kimberley Process');
    }

    // Factor 3: Mã HS nhạy cảm
    if (decl.items.some(i => this.config.sensitiveHSCodes.some(hs => i.hsCode.startsWith(hs)))) {
      score += this.config.riskWeights.sensitiveHS;
      factors.push({
        factor: 'SENSITIVE_HS',
        weight: this.config.riskWeights.sensitiveHS,
        description: 'Hàng hóa quản lý đặc biệt (Vàng/Đá quý)'
      });
      recommendations.push('Cần giấy phép NHNN (vàng) hoặc giấy kiểm định (đá quý)');
    }

    // Factor 4: Luồng tờ khai
    if (decl.header.streamCode === 'RED') {
      score += this.config.riskWeights.redStream;
      factors.push({
        factor: 'RED_STREAM',
        weight: this.config.riskWeights.redStream,
        description: 'Luồng Đỏ — Kiểm hóa vật lý bắt buộc'
      });
    }

    // Factor 5: Thiếu chứng từ bắt buộc
    const missingCerts = decl.items.filter(i =>
      i.hsCode.startsWith('7102') && !i.certNumber
    );
    if (missingCerts.length > 0) {
      score += this.config.riskWeights.missingCert * missingCerts.length;
      factors.push({
        factor: 'MISSING_CERT',
        weight: this.config.riskWeights.missingCert,
        description: `${missingCerts.length} dòng thiếu Kimberley Process Certificate`
      });
    }

    score = Math.min(100, score);
    const { critical, high, medium } = this.config.riskLevels;
    const level = score >= critical ? 'CRITICAL' : score >= high ? 'HIGH' : score >= medium ? 'MEDIUM' : 'LOW';

    return { score, level, factors, assessedAt: Date.now() };
  }

  // ─── Compliance Check ─────────────────────────────────────────────────────

  checkCompliance(decl: CustomsDeclaration): ComplianceCheck {
    const issues: ComplianceCheck['issues'] = [];
    const docs = new Set<string>();

    decl.items.forEach((item, idx) => {
      // Kim cương → Kimberley Process bắt buộc
      if (item.hsCode.startsWith('7102')) {
        docs.add('KIMBERLEY_PROCESS_CERT');
        if (!item.certNumber) {
          issues.push({
            type: 'LICENSE',
            severity: 'BLOCKING',
            message: `Dòng ${idx + 1} (${item.hsCode}): Thiếu Kimberley Process Certificate`
          });
        }
      }

      // Vàng → Giấy phép NHNN
      if (item.hsCode.startsWith('7108')) {
        docs.add('NHNN_LICENSE');
        if (item.invoiceValue > 10_000) {
          issues.push({
            type: 'LICENSE',
            severity: 'BLOCKING',
            message: `Dòng ${idx + 1}: Vàng giá trị >$10k cần giấy phép NHNN`
          });
        }
      }

      // Trang sức → Giấy kiểm định
      if (item.hsCode.startsWith('7113')) {
        docs.add('QUALITY_CERT');
      }
    });

    return {
      passed: issues.filter(i => i.severity === 'BLOCKING').length === 0,
      issues,
      requiredDocuments: Array.from(docs),
      checkedAt: Date.now()
    };
  }

  // ─── Timeline ─────────────────────────────────────────────────────────────

  generateTimeline(decl: CustomsDeclaration): TrackingStep[] {
    const stream = decl.header.streamCode || 'GREEN';
    const steps: TrackingStep[] = [
      { id: '1', label: 'Tiếp nhận tờ khai', status: 'COMPLETED', timestamp: Date.now() },
      { id: '2', label: 'Phân luồng AI', status: 'COMPLETED', notes: `Luồng ${stream}`, timestamp: Date.now() },
    ];

    if (stream === 'GREEN') {
      steps.push({ id: '3', label: 'Thông quan tự động', status: 'PENDING' });
    } else if (stream === 'YELLOW') {
      steps.push({ id: '3', label: 'Kiểm tra hồ sơ', status: 'PENDING' });
      steps.push({ id: '4', label: 'Thông quan', status: 'PENDING' });
    } else {
      steps.push({ id: '3', label: 'Kiểm tra hồ sơ', status: 'PENDING' });
      steps.push({ id: '4', label: 'Kiểm hóa vật lý', status: 'PENDING' });
      steps.push({ id: '5', label: 'Thông quan', status: 'PENDING' });
    }

    return steps;
  }

  // ─── Process Declaration ──────────────────────────────────────────────────

  processDeclaration(
    items: CustomsDeclarationItem[],
    meta: { fileName: string; declarationType?: string }
  ): CustomsDeclaration & {
    riskAssessment: RiskAssessment;
    compliance: ComplianceCheck;
    trackingTimeline: TrackingStep[];
    actionPlans: ActionPlan[];
  } {
    const declaration: CustomsDeclaration = {
      header: {
        declarationNumber: `NATT-${Date.now()}`,
        pageInfo: '1/1',
        registrationDate: new Date().toLocaleDateString('vi-VN'),
        customsOffice: 'NATT-OS CORE',
        deptCode: '01',
        streamCode: 'GREEN',
        declarationType: meta.declarationType || 'A11',
        mainHsCode: items[0]?.hsCode || ''
      },
      items,
      summary: {
        totalTaxPayable: items.reduce((sum, i) => sum + (i.totalTax || 0), 0),
        clearanceStatus: 'PENDING_VERIFICATION',
        riskNotes: '',
        relatedFiles: [meta.fileName],
        internalNotes: `Processed by NATT-OS CustomsEngine`
      }
    };

    const riskAssessment = this.assessRisk(declaration);
    const compliance = this.checkCompliance(declaration);
    const trackingTimeline = this.generateTimeline(declaration);

    // Auto-upgrade stream nếu risk cao
    if (riskAssessment.level === 'CRITICAL') {
      declaration.header.streamCode = 'RED';
    } else if (riskAssessment.level === 'HIGH') {
      declaration.header.streamCode = 'YELLOW';
    }

    return { ...declaration, riskAssessment, compliance, trackingTimeline, actionPlans: [] };
  }

  async batchProcess(
    files: File[]
  ): Promise<(CustomsDeclaration & { riskAssessment: RiskAssessment; compliance: ComplianceCheck; trackingTimeline: TrackingStep[]; actionPlans: ActionPlan[] })[]> {
    const results = [];
    for (const file of files) {
      try {
        // UDP pipeline cho từng file
        const payload = await UDP.receive(file, {
          inputType: 'FILE',
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          submittedBy: 'CUSTOMS_BATCH'
        });
        const udpResult = await UDP.process(payload);

        if (udpResult.status === 'COMMITTED') {
          results.push(this.processDeclaration([], { fileName: file.name }));
        }
      } catch (error) {
        console.error(`[CUSTOMS-ERROR] ${file.name}:`, error);
      }
    }
    return results;
  }

  // ─── UDP Extractor ────────────────────────────────────────────────────────

  private registerUDPExtractor(): void {
    const customsExtractor: DomainExtractor = {
      extract: (payload) => {
        const raw = payload.rawContent as Record<string, unknown>;
        return {
          declarationNumber: raw.declarationNumber || raw.soToKhai,
          items: raw.items || raw.hangHoa || [],
          declarationType: raw.declarationType || 'A11',
          submittedBy: payload.submittedBy
        };
      },
      validate: (data) => {
        const errors: string[] = [];
        if (!data.declarationNumber) errors.push('Thiếu số tờ khai');
        if (!Array.isArray(data.items) || (data.items as unknown[]).length === 0) {
          errors.push('Không có dòng hàng hóa');
        }
        return { valid: errors.length === 0, errors };
      }
    };

    UDP.registerExtractor('CUSTOMS' as UDPDomain, customsExtractor);
  }
}

export const CustomsCell = CustomsEngine.getInstance();
