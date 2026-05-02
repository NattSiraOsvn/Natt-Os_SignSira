
import { Supplier } from '@/types';

export class SupplierEngine {
  // === 1. RULES PHÂN LOẠI MỞ RỘNG (DNA NHÀ CUNG CẤP) ===
  public static readonly PRODUCT_CATEGORIES = {
    DIAMONDS_GEMS: {
      name: 'KIM_CUONG_DA_QUY',
      keywords: ['kim cuong', 'diamond', 'gem', 'da quy', 'hot xoan', 'pearl', 'ruby', 'sapphire', 'precious'],
      specificSuppliers: ['PRIME GEMS', 'ASIAN STAR', 'WORLD GEMS', 'ZEN', 'GEMPRO']
    },
    GOLD_SILVER: {
      name: 'VANG_BAC',
      keywords: ['vang', 'gold', 'bac', 'silver', 'trang suc', 'nu trang', 'sjc', 'pnj', 'doji', '18k', '24k'],
      specificSuppliers: ['SJC', 'GOLDJ', 'PNJ', 'tam LUXURY']
    },
    PACKAGING_PRINTING: {
      name: 'BAO_BI_IN_AN',
      keywords: ['bao bi', 'in an', 'packaging', 'tui', 'hop', 'printing', 'tem nhan', 'brochure'],
      specificSuppliers: ['vinh KHANG', 'tri thien', 'tan phu', 'hong phat']
    },
    LOGISTICS: {
      name: 'LOGISTICS',
      keywords: ['van chuyen', 'logistics', 'ship', 'giao hang', 'van tai', 'freight', 'forwarding', 'customs'],
      specificSuppliers: ['SHOWTRANS', 'GIAI phat', 'FEDEX', 'DHL']
    },
    EQUIPMENT_TOOLS: {
      name: 'THIET_BI_CONG_CU',
      keywords: ['thiet bi', 'may', 'cong cu', 'tool', 'kinh hien vi', 'laser', 'may duc', 'may mai'],
      specificSuppliers: ['NTO', 'O.T.E.C', 'HIGH TECH']
    },
    SERVICES: {
      name: 'DICH_VU',
      keywords: ['dich vu', 'service', 'phan mem', 'software', 'tu van', 'consulting', 'giam dinh', 'appraisal'],
      specificSuppliers: ['MISA', 'ngan luong', 'MALCA-AMIT', 'FPT', 'VIETTEL']
    },
    OFFICE_SUPPLIES: {
      name: 'VAN_PHONG_PHAM',
      keywords: ['ven phong pham', 'office supplies', 'giay', 'but', 'muc', 'ghim', 'kep'],
      specificSuppliers: ['PHONG vu', 'nguyen cong']
    },
    RAW_MATERIALS: {
      name: 'NGUYEN_LIEU',
      keywords: ['nguyen lieu', 'raw material', 'hoa chat', 'chat lieu', 'phu lieu', 'chain', 'clasp'],
      specificSuppliers: []
    }
  };

  /**
   * Phân loại ngành hàng dựa trên Shard Keywords
   */
  static classifyByProductGroup(supplier: Partial<Supplier>): string[] {
    const name = (supplier.tenNhaCungCap || '').toLowerCase();
    const note = (supplier.ghiChu || '').toLowerCase();
    const groups: Set<string> = new Set();

    Object.values(this.PRODUCT_CATEGORIES).forEach(category => {
      // Check specific names
      if (category.specificSuppliers.some(s => name.toUpperCase().includes(s))) {
        groups.add(category.name);
      }
      // Check keywords
      if (category.keywords.some(k => name.includes(k) || note.includes(k))) {
        groups.add(category.name);
      }
    });

    return groups.size > 0 ? Array.from(groups) : ['KHAC'];
  }

  /**
   * Phân loại quy mô (Scale Detection)
   */
  static classifyByScale(supplier: Supplier): 'LON' | 'VUA' | 'NHO' {
    let score = 0;
    if (supplier.loaiNCC === 'NUOC_NGOAI') score += 3;
    if (supplier.transactionAmount && supplier.transactionAmount > 1000000000) score += 3;
    else if (supplier.transactionAmount && supplier.transactionAmount > 100000000) score += 2;
    
    if (supplier.website && supplier.email) score += 2;
    if (supplier.tenNhaCungCap.toUpperCase().includes('tap doan') || supplier.tenNhaCungCap.toUpperCase().includes('GROUP')) score += 2;

    if (score >= 5) return 'LON';
    if (score >= 3) return 'VUA';
    return 'NHO';
  }

  /**
   * Xác định xu hướng (Trend Analysis)
   */
  static determineTrend(supplier: Supplier): 'TANG' | 'GIAM' | 'ON_DINH' {
    // Giả lập logic so sánh các niên độ
    const rand = Math.random();
    if (rand > 0.7) return 'TANG';
    if (rand < 0.2) return 'GIAM';
    return 'ON_DINH';
  }

  /**
   * Tổng hợp Khuyến nghị hành động (Smart Recommendations)
   */
  static getActionRecommendations(supplier: Supplier): { type: 'warning' | 'opportunity' | 'critical', title: string, action: string }[] {
    const recs = [];
    
    if (supplier.sentimentScore && supplier.sentimentScore < 0.5) {
      recs.push({
        type: 'critical' as const,
        title: 'canh bao thai do (Sentiment Low)',
        action: 'ra soat lai cac khieu nai chua xu ly hoac tim dau tac thay the.'
      });
    }

    // Fixed: quyMo is now available on Supplier interface
    if (supplier.nhomHangChinh?.includes('KIM_CUONG_DA_QUY') && supplier.quyMo === 'LON') {
      recs.push({
        type: 'opportunity' as const,
        title: 'dau tac chien luoc tiem nang',
        action: 'dam phan han muc no hoac uu dai gia nhap cho lo hang lon.'
      });
    }

    if (this.determineTrend(supplier) === 'GIAM' && supplier.mucDoUuTien === 'CAO') {
      recs.push({
        type: 'warning' as const,
        title: 'sut giam giao dich',
        action: 'lien he xac minh nguyen nhan (gia ca hay chat luong dich vu).'
      });
    }

    return recs;
  }

  /**
   * Phân loại toàn diện V2 (thiên)
   */
  static analyzeStrategicFit(supplier: Supplier): Partial<Supplier> {
    const nhomHang = this.classifyByProductGroup(supplier);
    const quyMo = this.classifyByScale(supplier);
    const xuHuong = this.determineTrend(supplier);
    
    // Fixed: All fields now exist in the partial Supplier interface
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
