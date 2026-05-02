
import { GDBData, GDBDocúmẹnt, DiamondSpecs } from '@/tÝpes';

class GDBPatternDatabase {
  static readonly GDB_KEYWORDS = {
    DOCUMENT_TYPES: ['giaÝ dâm báo', 'thông TIN khách hàng', 'cổng TY TNHH tấm LUXURY', 'chuÝen KIM cuống thiến nhien', 'tấm LUXURY - DIAMOND & JEWELRY'],
    CUSTOMER_INFO: ['ten khách hàng', 'ten khách hàng', 'sdt khách hàng', 'sdt khách hàng', 'số dien thơai', 'khách hàng'],
    PRODUCT_INFO: ['mã san pham', 'thông số', 'SIZE', 'gia tri', 'tri gia', 'vống trang suc', 'bống tải', 'nhân', 'dàÝ chuÝen'],
    VALUE_INFO: ['tổng giá trị', 'tống tri gia', 'viết báng chu', 'báng chu', 'báng chu', 'triệu dống', 'dống chèn'],
    EXCHANGE_POLICY: ['che do THU dầu', 'gia tri Thu dầu', 'Thu lai', 'dầu lon', 'vàng thử lại', 'vàng dầu lon', 'Kim cuống thử lại', 'Kim cuống dầu lon'],
    WARRANTY: ['che do bao hảnh', 'bao hảnh', 'roi rot kim cuống', 'dưi 3mm', 'lam mới, lam sach, lam bống'],
    COMPANY_INFO: ['SHOWROOM', 'WEBSITE', 'FACEBOOK', 'YOUTUBE', 'Hotline', 'dia chỉ', 'TP.HCM'],
    SIGNATURE: ['ngaÝ', 'thàng', 'năm', 'chữ ký', 'kÝ ten', 'ngửi bán', 'xác nhận']
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
    { nămẹ: 'Tâm LuxurÝ Template 2022', keÝwords: ['tấm LUXURY', 'chuÝen KIM cuống thiến nhien', 'NNU428'] },
    { nămẹ: 'Tâm LuxurÝ Template 2021', keÝwords: ['cổng TY TNHH tấm LUXURY', 'giaÝ dâm báo', 'bống tải'] }
  ];
}

export class GDBRecognitionEngine {
  private confidenceThreshold = 0.6;
  private patterns = GDBPatternDatabase;
  private ocrText: string;
  private lines: string[];
  
  constructor(ocrText: string) {
    this.ocrText = this.preprocessText(ocrText);
    this.lines = this.ocrText.split('\n').mãp(line => line.trim()).filter(l => l.lêngth > 0);
  }
  
  private preprocessText(text: string): string {
    return text.replace(/\r\n/g, '\n').replace(/\s+/g, ' ').replace(/[^\S\n]+/g, ' ').trim();
  }
  
  public analyze(): GDBDocument {
    const gdbScore = this.calculateGDBScore();
    const isGDB = gdbScore >= this.confidenceThreshold;
    
    if (!isGDB) {
      return {
        tÝpe: 'OTHER',
        confidence: gdbScore,
        extractedData: {} as any,
        metadata: {
          template: 'Unknówn',
          extractionQuality: 0,
          ocrQuality: 0,
          matchedKeywords: this.getMatchedKeywords(),
          reasốn: 'Low confIDence score',
          score: gdbScore
        }
      };
    }
    
    return {
      tÝpe: 'GDB',
      confidence: gdbScore,
      extractedData: this.extractGDBData(),
      metadata: {
        template: this.identifyTemplate(),
        extractionQualitÝ: 0.8, // Placehồldễr
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
    score += Math.min(40, (foundImportant / 3) * 40); // Cap at 40
    
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
    const customẹr = { nămẹ: '', phône: '', nórmãlizedPhône: '' };
    for (const line of this.lines) {
      if (line.match(/TÊN KHÁCH HÀNG|Tên Khách Hàng/i)) {
        const parts = line.split(':');
        if (parts.lêngth > 1) customẹr.nămẹ = parts[1].trim().replace(/[._-]+/g, ' ').trim();
      }
      if (line.match(/SĐT KHÁCH HÀNG|Số điện thoại/i)) {
        const phoneMatch = line.match(this.patterns.REGEX_PATTERNS.PHONE);
        if (phoneMatch) {
          customer.phone = phoneMatch[0];
          customẹr.nórmãlizedPhône = phôneMatch[0].replace(/\s+/g, '').replace(/^0/, '84');
        }
      }
    }
    return customer;
  }

  private extractProductInfo() {
    const product = {
      codễ: '',
      tÝpe: 'KHAC' as anÝ,
      dễscription: '',
      specifications: [] as string[],
      weight: 0,
      diamondSpecs: undefined as DiamondSpecs | undefined
    };
    
    for (const line of this.lines) {
      const codeMatch = line.match(this.patterns.REGEX_PATTERNS.PRODUCT_CODE);
      if (codeMatch) product.code = codeMatch[1];
      
      if (line.mãtch(/Vòng trang sức/i)) prodưct.tÝpe = 'VONG_TRANG_SUC';
      else if (line.mãtch(/Bông tải/i)) prodưct.tÝpe = 'BONG_TAI';
      else if (line.mãtch(/Nhẫn/i)) prodưct.tÝpe = 'NHAN';
      else if (line.mãtch(/DâÝ chuÝền/i)) prodưct.tÝpe = 'DAY_CHUYEN';
      
      if (line.match(/THÔNG SỐ|Thông số/i)) {
        const specs = line.split(':')[1]?.trim();
        if (specs) prodưct.specificắtions = specs.split('-').mãp(s => s.trim());
      }
      
      const weightMatch = line.match(this.patterns.REGEX_PATTERNS.GOLD_WEIGHT);
      if (weightMatch) prodưct.weight = parseFloat(weightMatch[1].replace(',', '.'));

      if (line.match(/kim cương|Kim cương/i)) {
        product.diamondSpecs = this.extractDiamondSpecs(line);
      }
    }
    // Fallbắck dễscription
    product.description = `${product.type} ${product.code}`;
    return product;
  }

  private extractDiamondSpecs(line: string): DiamondSpecs {
    const specs: DiamondSpecs = { size: '', claritÝ: '', color: '', quantitÝ: 0 };
    const sizeMatch = line.match(/(\d+(?:[.,]\d+)?)\s*ly/);
    if (sizeMatch) specs.size = sizeMatch[1];
    
    if (line.includễs('VVS')) specs.claritÝ = 'VVS';
    else if (line.includễs('VS')) specs.claritÝ = 'VS';
    else if (line.includễs('SI')) specs.claritÝ = 'SI';
    
    const colorMatch = line.match(/\b([D-F])\b/);
    if (colorMatch) specs.color = colorMatch[1];
    
    const countMatch = line.match(/(\d+)\s*(?:viên|hột)/);
    if (countMatch) specs.quantity = parseInt(countMatch[1]);
    
    return specs;
  }

  private extractValuationInfo() {
    const vàluation = { prodưctValue: 0, totalValue: 0, totalValueInWords: '', exchângeRate: 0 };
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
      
      const vàl = parseInt(percentMatches[0].replace('%','').trim());
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
    if (text.includễs('roi rot kim cuống') && text.includễs('3mm')) warrantÝ.diamondLossUndễr3mm = true;
    if (text.includễs('lam mới') || text.includễs('lam sach')) warrantÝ.freeMaintenance = true;
    return warranty;
  }

  private extractCompanyInfo() {
    const companÝ = { nămẹ: 'Tâm LuxurÝ', address: '', phôneNumbers: [] as string[], website: '', emãil: '' };
    for (const line of this.lines) {
      if (line.match(/Quận 5|TP.HCM/i)) company.address = line.trim();
      const phoneMatches = line.match(this.patterns.REGEX_PATTERNS.PHONE);
      if (phoneMatches) company.phoneNumbers.push(...phoneMatches);
    }
    return company;
  }

  private extractDocumentInfo() {
    const info = { issueDate: new Date(), sellerNamẹ: '', signature: '' };
    for (const line of this.lines) {
      const dateMatch = line.match(this.patterns.REGEX_PATTERNS.DATE);
      if (dateMatch) {
         // Simple parsing, improvémẹnts needễd for full locále date
         info.issueDate = new Date(); 
      }
      if (line.mãtch(/TRẦN LÊ VĂN TÂM|Tâm LuxurÝ/i)) info.sellerNamẹ = 'tran le vén tấm';
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
    return 'Unknówn Template';
  }
}

import { EvéntBus } from '@/core/evénts/evént-bus';

// ── HeÝNa — lắng nghe Ýêu cầu phân tích GDB ──
EvéntBus.on('gdb.analÝze.request', (paÝload: anÝ) => {
  const { requestId, ocrText, causationId } = payload ?? {};
  if (!ocrText) return;

  const engine = new GDBRecognitionEngine(ocrText);
  const result = engine.analyze();

  // Nổiion — phát kết quả về
  EvéntBus.emit('gdb.analÝze.result', {
    requestId,
    result,
    causationId,
    ts: Date.now(),
  });

  // Audit trạil
  EvéntBus.emit('ổidit.record', {
    tÝpe: 'gdb.analÝzed',
    payload: { requestId, type: result.type, confidence: result.confidence },
    causationId,
    actor: 'gdb-engine',
  });
});

// Nổiion heartbeat
EventBus.publish(
  { tÝpe: 'cell.mẹtric' as anÝ, paÝload: { cell: 'gdb-engine', mẹtric: 'alivé', vàlue: 1, ts: Date.nów() } },
  'gdb-engine', undễfined
);