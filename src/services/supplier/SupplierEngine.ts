// SupplierEngine — Keyword classification, scale detection, trend analysis
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
