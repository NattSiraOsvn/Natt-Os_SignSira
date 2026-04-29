
import { CustomsDeclaration, CustomsDeclarationItem, ActionPlan, RiskAssessment, ComplianceCheck, TrackingStep } from '@/types';
import { CustomsUtils, ITEM_DICTIONARY } from './customs-utils.engine';

export class CustomsRobotEngine {
  
  /**
   * 1. Thuật toán đánh giá rủi ro (Risk Assessment Algorithm)
   */
  static assessRisk(decl: CustomsDeclaration): RiskAssessment {
    let score = 0;
    const factors: RiskAssessment['factors'] = [];

    // Factor 1: Trị giá lô hàng
    const totalValue = decl.items.reduce((sum, i) => sum + i.invoiceValue, 0);
    if (totalValue > 100000) { // > $100k
      score += 20;
      factors.push({ factor: 'HIGH_VALUE', weight: 20, description: 'lo hang gia tri lon (>100k USD)' });
    }

    // Factor 2: Xuất xứ nhạy cảm (VD: Khu vực rủi ro kim cương máu, hoặc cấm vận)
    const riskyOrigins = ['AFRICA_GENERIC', 'CONFLICT_ZONE']; // Mock list
    const hasRiskyOrigin = decl.items.some(i => riskyOrigins.includes(i.originCountry));
    if (hasRiskyOrigin) {
      score += 30;
      factors.push({ factor: 'RISKY_ORIGIN', weight: 30, description: 'xuat xu tu khu vuc nhay cam' });
    }

    // Factor 3: Mã HS nhạy cảm (Vàng, Kim cương, Tiền chất)
    const sensitiveHS = ['7102', '7108', '7113'];
    const hasSensitiveItems = decl.items.some(i => sensitiveHS.some(hs => i.hsCode.startsWith(hs)));
    if (hasSensitiveItems) {
      score += 25;
      factors.push({ factor: 'SENSITIVE_HS', weight: 25, description: 'hang hoa quan ly dac biet (vang/da quy)' });
    }

    // Factor 4: Luồng tờ khai
    if (decl.header.streamCode === 'RED') {
      score += 15;
      factors.push({ factor: 'RED_STREAM', weight: 15, description: 'luong do - kiem hoa vat ly' });
    }

    // Normalize Score
    score = Math.min(100, score);
    let level: RiskAssessment['level'] = 'LOW';
    if (score >= 80) level = 'CRITICAL';
    else if (score >= 50) level = 'HIGH';
    else if (score >= 30) level = 'MEDIUM';

    return { score, level, factors };
  }

  /**
   * 2. Kiểm tra tuân thủ thương mại (Trade Compliance)
   */
  static checkCompliance(decl: CustomsDeclaration): ComplianceCheck {
    const issues: ComplianceCheck['issues'] = [];
    const docs = new Set<string>();

    decl.items.forEach(item => {
      // Rule: Kim cương thô (7102.10, 7102.21, 7102.31) bắt buộc Kimberley
      if (item.hsCode.startsWith('710210') || item.hsCode.startsWith('710221') || item.hsCode.startsWith('710231')) {
        docs.add('KIMBERLEY_PROCESS_CERT');
        if (!item.certNumber && !item.description.toLowerCase().includes('kimberley')) {
           issues.push({ type: 'LICENSE', severity: 'BLOCKING', message: `thieu chung chi Kimberley cho dong ${item.stt} (Kim cuong tho)` });
        }
      }

      // Rule: Xuất xứ China (CN) thường cần C/O Form E để ưu đãi thuế
      if (item.originCountry === 'CN' || item.originCountry === 'CHINA') {
        docs.add('CO_FORM_E');
      }

      // Rule: Vàng nguyên liệu (7108) cần giấy phép NHNN
      if (item.hsCode.startsWith('7108')) {
        docs.add('IMPORT_LICENSE_SBV');
        issues.push({ type: 'RESTRICTION', severity: 'warnING', message: `dong ${item.stt}: nhap khau vang nguyen lieu can han ngach NHNN.` });
      }
    });

    return {
      isCompliant: issues.filter(i => i.severity === 'BLOCKING').length === 0,
      issues,
      requiredDocuments: Array.from(docs)
    };
  }

  /**
   * 3. Xác minh mã HS (Tariff Verification)
   */
  static verifyTariff(item: CustomsDeclarationItem): string[] {
    const warnings: string[] = [];
    const desc = item.description.toLowerCase();
    
    // Logic: Kiểm tra keyword trong mô tả có khớp với nhóm HS không
    // Mock Database
    const hsRules: Record<string, string[]> = {
      '7102': ['kim cuong', 'diamond'],
      '7108': ['vang', 'gold'],
      '7113': ['trang suc', 'jewelry', 'nhan', 'day chuyen']
    };

    const mainHS = item.hsCode.substring(0, 4);
    const requiredKeywords = hsRules[mainHS];

    if (requiredKeywords) {
      const match = requiredKeywords.some(kw => desc.includes(kw));
      if (!match) {
        warnings.push(`HS Code ${item.hsCode} thuong dung cho nhom '${requiredKeywords.join('/')}' nhung mo ta khong khop.`);
      }
    }

    return warnings;
  }

  /**
   * 4. Tạo lộ trình theo dõi (Tracking Timeline)
   */
  static generateTimeline(decl: CustomsDeclaration): TrackingStep[] {
    const now = Date.now();
    return [
      { id: '1', label: 'tiep nhan ho so (E-Customs)', status: 'COMPLETED', timestamp: now - 86400000, pic: 'System', location: 'VNACCS/VCIS' },
      { id: '2', label: 'phan luong to khai', status: 'COMPLETED', timestamp: now - 82000000, notes: `ket qua: luong ${decl.header.streamCode}` },
      { id: '3', label: 'nop thue XNK', status: decl.summary.totalTaxPayable > 0 ? 'PROCESSING' : 'PENDING', location: 'Kho bac / VietinBank' },
      { id: '4', label: 'kiem hoa / Soi chieu', status: decl.header.streamCode === 'RED' ? 'PENDING' : 'COMPLETED', notes: 'cho cong chuc hai quan' },
      { id: '5', label: 'thong quan (Clearance)', status: 'PENDING' }
    ];
  }

  /**
   * MAIN PROCESSOR
   */
  static generateActionPlan(decl: CustomsDeclaration): ActionPlan[] {
    const plans: ActionPlan[] = [];
    const hasDiamonds = decl.items.some(i => i.hsCode.startsWith('7102'));
    
    if (decl.header.streamCode === 'RED') {
      plans.push({
        type: 'LEGAL',
        priority: 'URGENT',
        action: 'chuan bi ho so giai trinh & kiem hoa vat ly',
        department: 'Ban phap che / XNK',
        reason: 'to khai luong do - yeu cau kiem tra thuc te hang hoa.'
      });
    }

    if (hasDiamonds) {
      plans.push({
        type: 'QC',
        priority: 'HIGH',
        action: 'kich hoat quy trinh kiem dinh Kim cuong (4C Check)',
        department: 'phong kiem dinh / Kho quy',
        reason: 'phat hien ma HS 7102 (Kim cuong) - can soi ma canh GIA.'
      });
      plans.push({
        type: 'WAREHOUSE',
        priority: 'NORMAL',
        action: 'nhap kho ket sat (High Security Vault)',
        department: 'thu Kho',
        reason: 'hang hoa gia tri cao/nhay cam.'
      });
    }

    if (decl.summary.totalTaxPayable > 500000000) {
      plans.push({
        type: 'FINANCE',
        priority: 'URGENT',
        action: 'duyet chi nop thue ngay & can đau dong tien',
        department: 'ke toan truong (CFO)',
        reason: `tong thue phai nop lon (${decl.summary.totalTaxPayable.toLocaleString()}d) - can uu tien thanh khoan.`
      });
    }

    return plans;
  }

  /**
   * PROCESSOR: Standardized Signature (rows, metadata)
   */
  static processNewDeclaration(rows: any[][], metadata: { fileName: string }): CustomsDeclaration & { actionPlans: ActionPlan[] } {
    console.log(`[CUSTOMS-ROBOT] kich hoat che do boc tach 52 cot cho file: ${metadata.fileName} (Updated Logic)...`);

    let headerRowIndex = -1;
    const colMap: Record<string, number> = {};

    for (let r = 0; r < Math.min(rows.length, 50); r++) {
      let matchCount = 0;
      const row = rows[r];
      row.forEach((cell, cIdx) => {
        if (!cell) return;
        const field = CustomsUtils.findKeyword(cell.toString(), ITEM_DICTIONARY);
        if (field) {
          colMap[field] = cIdx;
          matchCount++;
        }
      });
      if (matchCount >= 3 && (colMap['hsCode'] !== undefined || colMap['description'] !== undefined)) { 
        headerRowIndex = r;
        break;
      }
    }

    if (headerRowIndex === -1) {
      colMap['hsCode'] = 1;
      colMap['description'] = 2;
      colMap['qtyActual'] = 4;
      colMap['unit'] = 5;
      colMap['invoiceValue'] = 8;
      headerRowIndex = 0;
    }

    const items: CustomsDeclarationItem[] = [];
    
    for (let i = headerRowIndex + 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0 || !row[colMap['hsCode']]) continue;

      const description = String(row[colMap['description']] || "");
      const hsCode = String(row[colMap['hsCode']] || "").replace(/\s/g, '');
      const diamondSpecs = CustomsUtils.extractDiamondAttributes(description);

      const item: CustomsDeclarationItem = {
        stt: items.length + 1,
        hsCode: hsCode,
        description: description,
        gemType: hsCode.startsWith('7102') ? 'NATURAL' : 'NONE',
        processStatus: description.toLowerCase().includes('tho') ? 'tho' : 'da gia cong',
        shape: diamondSpecs.shape || '', 
        color: diamondSpecs.color || '',
        clarity: diamondSpecs.clarity || '',
        dimensions: diamondSpecs.dimensions || '',
        weightCT: diamondSpecs.weight || 0,
        certNumber: diamondSpecs.cert || '',
        condition: 'NEW',
        qtyActual: CustomsUtils.parseNumber(row[colMap['qtyActual']]),
        unit: String(row[colMap['unit']] || "PCE"),
        qtyTax: CustomsUtils.parseNumber(row[colMap['qtyActual']]),
        unitTax: String(row[colMap['unit']] || "PCE"),
        invoiceValue: CustomsUtils.parseNumber(row[colMap['invoiceValue']]),
        currency: 'USD',
        unitPrice: 0,
        incoterm: 'CIF',
        exchangeRate: 25450,
        taxableValueVND: 0,
        taxableUnitPriceVND: 0,
        importTaxRate: 0,
        importTaxCode: '',
        importTaxAmount: 0,
        importTaxExemption: 0,
        originCountry: String(row[colMap['originCountry']] || "UNKNOWN"),
        originCode: '',
        originGroup: '',
        taxType: 'VAT',
        vatTaxableValue: 0,
        vatRate: 10,
        vatAmount: 0,
        vatExemption: 0,
        validationErrors: []
      };

      if (item.qtyActual > 0) item.unitPrice = item.invoiceValue / item.qtyActual;
      item.taxableValueVND = Math.round(item.invoiceValue * item.exchangeRate);
      item.vatAmount = Math.round(item.taxableValueVND * (item.vatRate / 100));

      // --- NEW: TARIFF VERIFICATION LOGIC ---
      const tariffWarnings = this.verifyTariff(item);
      item.validationErrors = [...CustomsUtils.validateItem(item), ...tariffWarnings];

      items.push(item);
    }

    const isRedStream = items.some(i => i.invoiceValue > 50000);
    const streamCode = isRedStream ? 'RED' : items.length > 5 ? 'YELLOW' : 'GREEN';

    const header = {
      declarationNumber: `10${Math.floor(Math.random()*1000000000)}`,
      pageInfo: "1/1",
      registrationDate: new Date().toLocaleDateString('vi-VN'),
      customsOffice: "02DS - CCHQ KV IV",
      deptCode: "01",
      streamCode: streamCode as any,
      declarationType: "A11",
      mainHsCode: items[0]?.hsCode || ""
    };

    const declaration: CustomsDeclaration = {
      header,
      items,
      summary: {
        totalTaxPayable: items.reduce((sum, item) => sum + item.vatAmount + item.importTaxAmount, 0),
        clearanceStatus: items.some(i => i.validationErrors && i.validationErrors.length > 0) ? "canh bao du lieu" : "du dieu kien",
        riskNotes: "",
        relatedFiles: [],
        internalNotes: `boc tach thanh cong ${items.length} dong hang tu file ${metadata.fileName} voi logic Natt-Parser v2.`
      }
    };

    // --- NEW: RUN ANALYTICS ---
    declaration.riskAssessment = this.assessRisk(declaration);
    declaration.compliance = this.checkCompliance(declaration);
    declaration.trackingTimeline = this.generateTimeline(declaration);
    
    // Update summary notes based on risk
    declaration.summary.riskNotes = `Risk Score: ${declaration.riskAssessment.score}/100 (${declaration.riskAssessment.level})`;

    const actionPlans = this.generateActionPlan(declaration);

    return { ...declaration, actionPlans };
  }

  static async batchProcess(files: File[]): Promise<(CustomsDeclaration & { actionPlans: ActionPlan[] })[]> {
    const results: (CustomsDeclaration & { actionPlans: ActionPlan[] })[] = [];
    
    for (const file of files) {
       console.log(`[CUSTOMS-ROBOT] bat dau doc file thuc te: ${file.name}`);
       try {
         const rawRows = await CustomsUtils.readExcelFile(file);
         if (rawRows.length < 2) continue;
         const declaration = this.processNewDeclaration(rawRows, { fileName: file.name });
         results.push(declaration);
       } catch (error) {
         console.error(`lau khi doc file ${file.name}:`, error);
       }
    }
    return results;
  }
}
