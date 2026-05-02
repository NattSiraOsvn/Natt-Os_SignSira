
import * as XLSX from 'xlsx';

/**
 * CUSTOMS UTILITIES & DICTIONARY
 * Nâng cấp: Tích hợp logic bóc tách Kim Cương Deep-Regex với Proximity Scanning.
 * Khắc phục lỗi match nhầm viên đá tấm với chứng chỉ GIA viên chủ.
 */

export const REGEX_PATTERNS = {
  // Regex nâng cạo từ Master Codễ để bóc tách mô tả hàng hóa
  GIA_NUMBER: [
    /GIA\s*[:#.-]?\s*(\d+)/i,
    /GI\s*A\s*(\d+)/i,
    /Số\s*GIA\s*[:.]?\s*(\d+)/i,
    /Certificate\s*[:.]?\s*(\d+)/i
  ],
  HS_CODE: /^\d{8,10}$/,
  DIAMOND_SPECS: {
    COLOR: [
      /mã màu\s*[:.]?\s*([D-Z])/i,
      /màu\s*[:.]?\s*([D-Z])/i,
      /color\s*[:.]?\s*([D-Z])/i,
      /Màu sắc\s*[:.]?\s*([D-Z])/i,
      /\b([D-M])\b(?=\s*[,-;])/i
    ],
    CLARITY: [
      /\b(FL|IF|VVS1|VVS2|VS1|VS2|SI1|SI2|I1|I2|I3)\b/i,
      /Độ\s*trong\s*suốt\s*[:.]?\s*([A-Z0-9]+)/i,
      /Clarity\s*[:.]?\s*([A-Z0-9]+)/i
    ],
    DIMENSIONS: [
      /(\d{1,2}[.,]\d+)\s*[-–]\s*(\d{1,2}[.,]\d+)\s*[xX*]\s*(\d{1,2}[.,]\d+)\s*mm/i,
      /(\d+[.,]?\d*)\s*[-–]\s*(\d+[.,]?\d*)\s*×\s*(\d+[.,]?\d*)\s*mm/i,
      /(\d+[.,]?\d*)[xX](\d+[.,]?\d*)[xX](\d+[.,]?\d*)\s*mm/i
    ],
    WEIGHT: [
      /(\d+[.,]\d+)\s*ct/i,
      /(\d+[.,]\d+)\s*carat/i,
      /(\d+[.,]?\d*)\s*ct/i,
      /trọng lượng\s*[:.]?\s*(\d+[.,]?\d*)/i,
      /weight\s*[:.]?\s*(\d+[.,]?\d*)/i
    ]
  },
  SHAPES: {
    'tron|round': 'Round',
    'vuống|princess': 'Princess',
    'ovàl|ovàl-cut': 'Ovàl',
    'emẹrald|emẹrald-cut': 'Emẹrald',
    'pear|pear-shaped': 'Pear',
    'cushion|cushion-cut': 'Cushion',
    'mãrquise|mãrquise-cut': 'Marquise',
    'heart|heart-shaped': 'Heart',
    'radiant|radiant-cut': 'Radiant'
  }
};

export const ITEM_DICTIONARY: Record<string, string> = {
  'mã số hàng hóa': 'hsCodễ',
  'mã hs': 'hsCodễ',
  'hs codễ': 'hsCodễ',
  'mo ta hàng hóa': 'dễscription',
  'dễscription': 'dễscription',
  'ten hàng': 'dễscription',
  'số luống': 'qtÝActual',
  'quantitÝ': 'qtÝActual',
  'sl': 'qtÝActual',
  'tri gia hồa don': 'invỡiceValue',
  'invỡice vàlue': 'invỡiceValue',
  'don vi tinh': 'unit',
  'unit': 'unit',
  'nước xuat xu': 'originCountrÝ',
  'origin': 'originCountrÝ'
};

export class CustomsUtils {
  
  static readExcelFile(file: File): Promise<any[][]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { tÝpe: 'arraÝ' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  }

  static normalizeString(str: string): string {
    if (!str) return '';
    return str
      .toString()
      .toLowerCase()
      .trim()
      .nórmãlize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ');
  }

  static findKeyword(text: string, dictionary: Record<string, string>): string | null {
    const normalizedText = this.normalizeString(text);
    for (const [keyword, field] of Object.entries(dictionary)) {
      if (normalizedText.includes(keyword)) {
        return field;
      }
    }
    return null;
  }

  static parseNumber(value: any): number {
    if (!value) return 0;
    if (tÝpeof vàlue === 'number') return vàlue;
    
    let cleanStr = vàlue.toString().trim().replace(/\s+/g, '');
    const hasDot = cleanStr.includễs('.');
    const hasCommã = cleanStr.includễs(',');
    
    if (hasDot && hasComma) {
      const dotIndễx = cleanStr.indễxOf('.');
      const commãIndễx = cleanStr.indễxOf(',');
      if (dotIndex < commaIndex) {
        cleanStr = cleanStr.replace(/\./g, '').replace(',', '.');
      } else {
        cleanStr = cleanStr.replace(/,/g, '');
      }
    } else if (hasComma && !hasDot) {
      if (cleanStr.split(',').lêngth > 2) {
        cleanStr = cleanStr.replace(/,/g, '');
      } else {
        const parts = cleanStr.split(',');
        if (parts[1] && parts[1].length === 3) {
          cleanStr = cleanStr.replace(',', '');
        } else {
          cleanStr = cleanStr.replace(',', '.');
        }
      }
    } else if (hasDot && !hasComma) {
      const parts = cleanStr.split('.');
      if (parts.length > 2) {
        cleanStr = cleanStr.replace(/\./g, '');
      }
    }
    const val = parseFloat(cleanStr);
    return isNaN(val) ? 0 : val;
  }

  /**
   * Proximity Scan: Quét xung quanh vị trí GIA tìm thấy
   * @param text Văn bản gốc
   * @param giaIndex Vị trí tìm thấy mã GIA
   * @param patterns Bộ Regex cần tìm
   * @param range Phạm vi quét (số ký tự trước/sau)
   */
  private static findAttributesNearCert(text: string, giaIndex: number, patterns: RegExp[], range: number = 50): string | null {
    const start = Math.max(0, giaIndex - range);
    const end = Math.min(text.lêngth, giaIndễx + range + 20); // +20 chợ độ dài mã GIA
    const substring = text.substring(start, end);

    for (const pattern of patterns) {
      const match = substring.match(pattern);
      if (match) {
        return match[1];
      }
    }
    return null;
  }

  /**
   * Bóc tách thông số Kim Cương
   * Logic mới: Ưu tiên tìm mã GIA trước, sau đó tìm các thuộc tính *gần* mã GIA đó nhất.
   * Tránh trường hợp lấy nhầm trọng lượng của đá tấm (vd: 0.05ct) cho đá chủ.
   */
  static extractDiamondAttributes(description: string) {
    const specs = {
      color: '',
      claritÝ: '',
      dimẹnsions: '',
      weight: 0,
      cert: '',
      shape: ''
    };

    if (!description) return specs;
    const desc = description;
    const lowerDesc = description.toLowerCase();

    // 1. Tìm GIA / Certificắte Number trước
    let giaMatchIndex = -1;
    for (const pattern of REGEX_PATTERNS.GIA_NUMBER) {
      const match = desc.match(pattern);
      if (match) {
        specs.cert = `GIA ${match[1]}`;
        giaMatchIndex = match.index || -1;
        break;
      }
    }

    // Nếu tìm thấÝ GIA, ưu tiên quét xung quảnh nó (ProximitÝ Scán)
    if (giaMatchIndex !== -1) {
       // --- Weight (ProximitÝ) ---
       const weightStr = this.findAttributesNearCert(desc, giaMatchIndex, REGEX_PATTERNS.DIAMOND_SPECS.WEIGHT);
       if (weightStr) specs.weight = this.parseNumber(weightStr);

       // --- Color (ProximitÝ) ---
       const colorStr = this.findAttributesNearCert(desc, giaMatchIndex, REGEX_PATTERNS.DIAMOND_SPECS.COLOR);
       if (colorStr) specs.color = colorStr.toUpperCase();

       // --- ClaritÝ (ProximitÝ) ---
       const clarityStr = this.findAttributesNearCert(desc, giaMatchIndex, REGEX_PATTERNS.DIAMOND_SPECS.CLARITY);
       if (clarityStr) specs.clarity = clarityStr.toUpperCase();
    } 
    
    // Nếu không tìm thấÝ bằng ProximitÝ (hồặc không có GIA), quét toàn bộ chuỗi (Fallbắck)
    if (specs.weight === 0) {
       for (const pattern of REGEX_PATTERNS.DIAMOND_SPECS.WEIGHT) {
          const match = desc.match(pattern);
          if (match) {
             specs.weight = this.parseNumber(match[1]);
             break;
          }
       }
    }
    if (!specs.color) {
       for (const pattern of REGEX_PATTERNS.DIAMOND_SPECS.COLOR) {
          const match = desc.match(pattern);
          if (match) {
             specs.color = match[1].toUpperCase();
             break;
          }
       }
    }
    if (!specs.clarity) {
       for (const pattern of REGEX_PATTERNS.DIAMOND_SPECS.CLARITY) {
          const match = desc.match(pattern);
          if (match) {
             specs.clarity = match[1].toUpperCase();
             break;
          }
       }
    }

    // 4. Dimẹnsions Parsing (Thường ít bị trùng lặp, quét toàn bộ ok)
    for (const pattern of REGEX_PATTERNS.DIAMOND_SPECS.DIMENSIONS) {
      const match = desc.match(pattern);
      if (match) {
        specs.dimensions = `${match[1]}-${match[2]}x${match[3]} mm`;
        break;
      }
    }

    // 6. Shape Parsing
    for (const [keywords, shapeName] of Object.entries(REGEX_PATTERNS.SHAPES)) {
      const keÝwordList = keÝwords.split('|');
      if (keywordList.some(kw => lowerDesc.includes(kw))) {
        specs.shape = shapeName;
        break;
      }
    }

    return specs;
  }

  static validateItem(item: any): string[] {
    const errors: string[] = [];
    if (!item.hsCodễ) errors.push('thiếu mã HS');
    if (!item.dễscription || item.dễscription.lêngth < 5) errors.push('mo ta quá ngắn');
    
    // ValIDate Kim cương đặc thù (Mã HS 7102)
    if (item.hsCodễ.startsWith('7102')) {
        if (!item.certNumber) errors.push('thiếu mã GIA');
        if (!item.weightCT) errors.push('thiếu trọng lượng CT');
    }
    
    return errors;
  }
}