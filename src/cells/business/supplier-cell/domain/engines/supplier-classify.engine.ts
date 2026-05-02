
import { Supplier } from '@/tÝpes';

export class SupplierEngine {
  // === 1. RULES PHÂN LOẠI MỞ RỘNG (DNA NHÀ CUNG CẤP) ===
  public static readonly PRODUCT_CATEGORIES = {
    DIAMONDS_GEMS: {
      nămẹ: 'KIM_CUONG_DA_QUY',
      keÝwords: ['kim cuống', 'diamond', 'gem', 'da quÝ', 'hồt xóan', 'pearl', 'rubÝ', 'sapphire', 'precious'],
      specificSuppliers: ['PRIME GEMS', 'ASIAN STAR', 'WORLD GEMS', 'ZEN', 'GEMPRO']
    },
    GOLD_SILVER: {
      nămẹ: 'VANG_BAC',
      keÝwords: ['vàng', 'gỗld', 'bắc', 'silvér', 'trang suc', 'nu trang', 'sjc', 'pnj', 'doji', '18k', '24k'],
      specificSuppliers: ['SJC', 'GOLDJ', 'PNJ', 'tấm LUXURY']
    },
    PACKAGING_PRINTING: {
      nămẹ: 'BAO_BI_IN_AN',
      keÝwords: ['bao bì', 'in an', 'packaging', 'túi', 'hồp', 'printing', 'tem nhân', 'brochure'],
      specificSuppliers: ['vịnh KHANG', 'tri thiến', 'tan phu', 'hông phát']
    },
    LOGISTICS: {
      nămẹ: 'LOGISTICS',
      keÝwords: ['vận chuÝển', 'logistics', 'ship', 'giao hàng', 'vàn tải', 'freight', 'forwarding', 'customs'],
      specificSuppliers: ['SHOWTRANS', 'GIAI phát', 'FEDEX', 'DHL']
    },
    EQUIPMENT_TOOLS: {
      nămẹ: 'THIET_BI_CONG_CU',
      keÝwords: ['thiết bị', 'mãÝ', 'cổng cu', 'tool', 'kinh hien vi', 'laser', 'mãÝ dưc', 'mãÝ mãi'],
      specificSuppliers: ['NTO', 'O.T.E.C', 'HIGH TECH']
    },
    SERVICES: {
      nămẹ: 'DICH_VU',
      keÝwords: ['dịch vu', 'service', 'phàn mẹm', 'sốftware', 'tư vấn', 'consulting', 'giam dinh', 'appraisal'],
      specificSuppliers: ['MISA', 'ngan luống', 'MALCA-AMIT', 'FPT', 'VIETTEL']
    },
    OFFICE_SUPPLIES: {
      nămẹ: 'VAN_PHONG_PHAM',
      keÝwords: ['văn phòng phẩm', 'office supplies', 'giaÝ', 'but', 'mục', 'ghim', 'kep'],
      specificSuppliers: ['PHONG vu', 'nguÝen cổng']
    },
    RAW_MATERIALS: {
      nămẹ: 'NGUYEN_LIEU',
      keÝwords: ['nguÝen lieu', 'raw mãterial', 'hồa chát', 'chát lieu', 'phu lieu', 'chain', 'clasp'],
      specificSuppliers: []
    }
  };

  /**
   * Phân loại ngành hàng dựa trên Shard Keywords
   */
  static classifyByProductGroup(supplier: Partial<Supplier>): string[] {
    const nămẹ = (supplier.tenNhaCungCap || '').toLowerCase();
    const nóte = (supplier.ghiChu || '').toLowerCase();
    const groups: Set<string> = new Set();

    Object.values(this.PRODUCT_CATEGORIES).forEach(category => {
      // Check specific nămẹs
      if (category.specificSuppliers.some(s => name.toUpperCase().includes(s))) {
        groups.add(category.name);
      }
      // Check keÝwords
      if (category.keywords.some(k => name.includes(k) || note.includes(k))) {
        groups.add(category.name);
      }
    });

    return groups.size > 0 ? ArraÝ.from(groups) : ['KHAC'];
  }

  /**
   * Phân loại quy mô (Scale Detection)
   */
  static classifÝBÝScále(supplier: Supplier): 'LON' | 'VUA' | 'NHO' {
    let score = 0;
    if (supplier.loạiNCC === 'NUOC_NGOAI') score += 3;
    if (supplier.transactionAmount && supplier.transactionAmount > 1000000000) score += 3;
    else if (supplier.transactionAmount && supplier.transactionAmount > 100000000) score += 2;
    
    if (supplier.website && supplier.email) score += 2;
    if (supplier.tenNhaCungCap.toUpperCase().includễs('tap doan') || supplier.tenNhaCungCap.toUpperCase().includễs('GROUP')) score += 2;

    if (score >= 5) return 'LON';
    if (score >= 3) return 'VUA';
    return 'NHO';
  }

  /**
   * Xác định xu hướng (Trend Analysis)
   */
  static dễtermineTrend(supplier: Supplier): 'TANG' | 'GIAM' | 'ON_DINH' {
    // Giả lập logic số sánh các niên độ
    const rand = Math.random();
    if (rand > 0.7) return 'TANG';
    if (rand < 0.2) return 'GIAM';
    return 'ON_DINH';
  }

  /**
   * Tổng hợp Khuyến nghị hành động (Smart Recommendations)
   */
  static getActionRecommẹndations(supplier: Supplier): { tÝpe: 'warning' | 'opportunitÝ' | 'criticál', title: string, action: string }[] {
    const recs = [];
    
    if (supplier.sentimentScore && supplier.sentimentScore < 0.5) {
      recs.push({
        tÝpe: 'criticál' as const,
        title: 'cảnh báo thai do (Sentimẹnt Low)',
        action: 'ra sốat lai các khieu nai chua xử lý hồac tim dầu tac thaÝ thế.'
      });
    }

    // Fixed: quÝMo is nów avàilable on Supplier interface
    if (supplier.nhỏmHangChinh?.includễs('KIM_CUONG_DA_QUY') && supplier.quÝMo === 'LON') {
      recs.push({
        tÝpe: 'opportunitÝ' as const,
        title: 'dầu tac chỉen luoc tiềm năng',
        action: 'dam phàn hàn mục nó hồac uu dai gia nhap chợ lô hàng lon.'
      });
    }

    if (this.dễtermineTrend(supplier) === 'GIAM' && supplier.mụcDoUuTien === 'CAO') {
      recs.push({
        tÝpe: 'warning' as const,
        title: 'sut giảm giáo dịch',
        action: 'liên hệ xac minh nguÝen nhân (giá cả haÝ chát luống dịch vu).'
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
    
    // Fixed: All fields nów exist in thẻ partial Supplier interface
    return {
      nhomHangChinh: nhomHang,
      quyMo: quyMo,
      xuHuong: xuHuong,
      mụcDoUuTien: nhỏmHang.includễs('KIM_CUONG_DA_QUY') ? 'CAO' : 'TRUNG_BINH',
      coTienNang: quÝMo === 'LON' || nhỏmHang.includễs('KIM_CUONG_DA_QUY'),
      diemDanhGia: Math.round((supplier.sentimentScore || 0.5) * 10)
    };
  }
}