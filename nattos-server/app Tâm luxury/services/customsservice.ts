
import { CustomsDeclaration, CustomsDeclarationItem, ActionPlan, RiskAssessment, ComplianceCheck, TrackingStep } from '../types';
import { CustomsUtils, ITEM_DICTIONARY } from './customsUtils';

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
      factors.push({ factor: 'HIGH_VALUE', weight: 20, description: 'Lô hàng giá trị lớn (>100k USD)' });
    }

    // Factor 2: Xuất xứ nhạy cảm (VD: Khu vực rủi ro kim cương máu, hoặc cấm vận)
    const riskyOrigins = ['AFRICA_GENERIC', 'CONFLICT_ZONE']; // Mock list
    const hasRiskyOrigin = decl.items.some(i => riskyOrigins.includes(i.originCountry));
    if (hasRiskyOrigin) {
      score += 30;
      factors.push({ factor: 'RISKY_ORIGIN', weight: 30, description: 'Xuất xứ từ khu vực nhạy cảm' });
    }

    // Factor 3: Mã HS nhạy cảm (Vàng, Kim cương, Tiền chất)
    const sensitiveHS = ['7102', '7108', '7113'];
    const hasSensitiveItems = decl.items.some(i => sensitiveHS.some(hs => i.hsCode.startsWith(hs)));
    if (hasSensitiveItems) {
      score += 25;
      factors.push({ factor: 'SENSITIVE_HS', weight: 25, description: 'Hàng hóa quản lý đặc biệt (Vàng/Đá quý)' });
    }

    // Factor 4: Luồng tờ khai
    if (decl.header.streamCode === 'RED') {
      score += 15;
      factors.push({ factor: 'RED_STREAM', weight: 15, description: 'Luồng Đỏ - Kiểm hóa vật lý' });
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
           issues.push({ type: 'LICENSE', severity: 'BLOCKING', message: `Thiếu chứng chỉ Kimberley cho dòng ${item.stt} (Kim cương thô)` });
        }
      }

      // Rule: Xuất xứ China (CN) thường cần C/O Form E để ưu đãi thuế
      if (item.originCountry === 'CN' || item.originCountry === 'CHINA') {
        docs.add('CO_FORM_E');
      }

      // Rule: Vàng nguyên liệu (7108) cần giấy phép NHNN
      if (item.hsCode.startsWith('7108')) {
        docs.add('IMPORT_LICENSE_SBV');
        issues.push({ type: 'RESTRICTION', severity: 'WARNING', message: `Dòng ${item.stt}: Nhập khẩu Vàng nguyên liệu cần hạn ngạch NHNN.` });
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
      '7102': ['kim cương', 'diamond'],
      '7108': ['vàng', 'gold'],
      '7113': ['trang sức', 'jewelry', 'nhẫn', 'dây chuyền']
    };

    const mainHS = item.hsCode.substring(0, 4);
    const requiredKeywords = hsRules[mainHS];

    if (requiredKeywords) {
      const match = requiredKeywords.some(kw => desc.includes(kw));
      if (!match) {
        warnings.push(`HS Code ${item.hsCode} thường dùng cho nhóm '${requiredKeywords.join('/')}' nhưng mô tả không khớp.`);
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
      { id: '1', label: 'Tiếp nhận hồ sơ (E-Customs)', status: 'COMPLETED', timestamp: now - 86400000, pic: 'System', location: 'VNACCS/VCIS' },
      { id: '2', label: 'Phân luồng tờ khai', status: 'COMPLETED', timestamp: now - 82000000, notes: `Kết quả: Luồng ${decl.header.streamCode}` },
      { id: '3', label: 'Nộp thuế XNK', status: decl.summary.totalTaxPayable > 0 ? 'PROCESSING' : 'PENDING', location: 'Kho Bạc / VietinBank' },
      { id: '4', label: 'Kiểm hóa / Soi chiếu', status: decl.header.streamCode === 'RED' ? 'PENDING' : 'COMPLETED', notes: 'Chờ công chức hải quan' },
      { id: '5', label: 'Thông quan (Clearance)', status: 'PENDING' }
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
        action: 'Chuẩn bị hồ sơ giải trình & Kiểm hóa vật lý',
        department: 'Ban Pháp Chế / XNK',
        reason: 'Tờ khai Luồng Đỏ - Yêu cầu kiểm tra thực tế hàng hóa.'
      });
    }

    if (hasDiamonds) {
      plans.push({
        type: 'QC',
        priority: 'HIGH',
        action: 'Kích hoạt quy trình kiểm định Kim cương (4C Check)',
        department: 'Phòng Kiểm Định / Kho Quý',
        reason: 'Phát hiện mã HS 7102 (Kim cương) - Cần soi mã cạnh GIA.'
      });
      plans.push({
        type: 'WAREHOUSE',
        priority: 'NORMAL',
        action: 'Nhập kho Két sắt (High Security Vault)',
        department: 'Thủ Kho',
        reason: 'Hàng hóa giá trị cao/nhạy cảm.'
      });
    }

    if (decl.summary.totalTaxPayable > 500000000) {
      plans.push({
        type: 'FINANCE',
        priority: 'URGENT',
        action: 'Duyệt chi nộp thuế ngay & Cân đối dòng tiền',
        department: 'Kế Toán Trưởng (CFO)',
        reason: `Tổng thuế phải nộp lớn (${decl.summary.totalTaxPayable.toLocaleString()}đ) - Cần ưu tiên thanh khoản.`
      });
    }

    return plans;
  }

  /**
   * PROCESSOR: Standardized Signature (rows, metadata)
   */
  static processNewDeclaration(rows: any[][], metadata: { fileName: string }): CustomsDeclaration & { actionPlans: ActionPlan[] } {
    console.log(`[CUSTOMS-ROBOT] Kích hoạt chế độ bóc tách 52 cột cho file: ${metadata.fileName} (Updated Logic)...`);

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
        processStatus: description.toLowerCase().includes('thô') ? 'Thô' : 'Đã gia công',
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
        clearanceStatus: items.some(i => i.validationErrors && i.validationErrors.length > 0) ? "CẢNH BÁO DỮ LIỆU" : "ĐỦ ĐIỀU KIỆN",
        riskNotes: "",
        relatedFiles: [],
        internalNotes: `Bóc tách thành công ${items.length} dòng hàng từ file ${metadata.fileName} với logic Natt-Parser v2.`
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
       console.log(`[CUSTOMS-ROBOT] Bắt đầu đọc file thực tế: ${file.name}`);
       try {
         const rawRows = await CustomsUtils.readExcelFile(file);
         if (rawRows.length < 2) continue;
         const declaration = this.processNewDeclaration(rawRows, { fileName: file.name });
         results.push(declaration);
       } catch (error) {
         console.error(`Lỗi khi đọc file ${file.name}:`, error);
       }
    }
    return results;
  }
}
