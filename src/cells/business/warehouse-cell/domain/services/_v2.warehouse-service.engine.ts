// @ts-nocheck
// ═══════════════════════════════════════════════════════════
// INHERITED FROM V2 — 2026-03-11
// Source: versions/v2svc/services/warehouseService.ts
// Status: REFERENCE — adapt imports trước khi bật type-check
// ═══════════════════════════════════════════════════════════


import { InventoryItem, Warehouse, Movement, CertType, WarehouseLocation } from '../types';

export interface WarehouseQAAudit {
  healthScore: number;
  complianceIssues: {
    id: string;
    severity: 'CRITICAL' | 'WARNING' | 'INFO';
    category: 'INSURANCE' | 'SECURITY' | 'LOSS' | 'CERT' | 'STOCK';
    title: string;
    description: string;
    impactValue: number;
  }[];
  metrics: {
    insuranceCoverage: number;
    certAccuracy: number;
    inventoryTurnover: number;
    lossRate: number;
  };
}

export interface AllocationPlan {
  hcm: Record<string, number>;
  hanoi: Record<string, number>;
  transfers: {
    productId: string;
    productName: string;
    from: WarehouseLocation;
    to: WarehouseLocation;
    quantity: number;
    reason: string;
  }[];
}

export interface WarehouseIntelligence {
  hcm: RegionMetrics;
  hanoi: RegionMetrics;
  recommendations: string[];
}

interface RegionMetrics {
  capacity: number;
  utilization: number; // %
  turnover: number; // Vòng quay
  costPerSku: number;
  efficiency: number; // Điểm hiệu quả 0-100
}

export class WarehouseEngine {
  static warehouses: Warehouse[] = [
    { 
      id: 'W-HCM-01', name: 'KHO TỔNG HCM', code: 'HCM-MAIN', type: 'MASTER_HUB', manager: 'Trần Hoài Phúc', totalValue: 45000000000, itemCount: 12000, securityLevel: 'CAO',
      layout: [
        { id: 'B-1', x: 1, y: 1, z: 1, label: 'Két A1 - Tầng 1', occupied: true, type: 'SAFE' },
      ]
    },
    { id: 'W-HN-01', name: 'CHI NHÁNH HÀ NỘI', code: 'HN-BRANCH', type: 'DISTRIBUTION', manager: 'Bùi Cao Sơn', totalValue: 12500000000, itemCount: 4500, securityLevel: 'CAO' },
    { id: 'W-003', name: 'Kho Bán Thành Phẩm (WIP)', code: 'WIP-FACTORY', type: 'BÁN THÀNH PHẨM', manager: 'Nguyễn Văn Vẹn', totalValue: 15000000000, itemCount: 450, securityLevel: 'TRUNG BÌNH' },
  ];

  static items: InventoryItem[] = [
    { 
      id: 'IT-001', sku: 'GOLD-18K-01', name: 'Vàng thỏi 18K', type: 'VÀNG', warehouseId: 'W-HCM-01', quantity: 1250.45, unit: 'GRAM', cost: 4200000, purity: '75%', location: 'SAFE-A1', status: 'SẴN SÀNG', lastCountDate: '21/01/2025', minThreshold: 2000, insuranceStatus: 'CHƯA CÓ', internalCertId: 'TL-G-25001', qrUrl: 'https://api.qrserver.com/v1/create-qr-code/?data=GOLD-18K-01' 
    },
    { 
      id: 'IT-004', sku: 'NNU-HALO-01', name: 'Nhẫn Nữ Halo Diamond 18K', type: 'THÀNH PHẨM', warehouseId: 'W-HCM-01', quantity: 50, unit: 'PIECE', cost: 45000000, certType: CertType.INTERNAL, internalCertId: 'TL-F-25004', location: 'DISPLAY-04', status: 'SẴN SÀNG', lastCountDate: '21/01/2025', minThreshold: 10, insuranceStatus: 'CÒN HẠN'
    },
    { 
      id: 'IT-005', sku: 'NNA-ROLEX-01', name: 'Nhẫn Nam Rolex Custom', type: 'THÀNH PHẨM', warehouseId: 'W-HCM-01', quantity: 12, unit: 'PIECE', cost: 58000000, certType: CertType.INTERNAL, internalCertId: 'TL-F-25005', location: 'DISPLAY-05', status: 'SẴN SÀNG', lastCountDate: '21/01/2025', minThreshold: 5, insuranceStatus: 'CÒN HẠN'
    },
    { 
      id: 'IT-006', sku: 'NNU-HALO-01', name: 'Nhẫn Nữ Halo Diamond 18K', type: 'THÀNH PHẨM', warehouseId: 'W-HN-01', quantity: 5, unit: 'PIECE', cost: 45000000, certType: CertType.INTERNAL, internalCertId: 'TL-F-25006', location: 'HN-A1', status: 'SẴN SÀNG', lastCountDate: '21/01/2025', minThreshold: 15, insuranceStatus: 'CÒN HẠN'
    }
  ];

  static runQAAudit(): WarehouseQAAudit {
    const issues: WarehouseQAAudit['complianceIssues'] = [];
    const uninsuredItems = this.items.filter(i => (i.type === 'KIM CƯƠNG' || i.type === 'VÀNG') && i.insuranceStatus === 'CHƯA CÓ');
    if (uninsuredItems.length > 0) {
      issues.push({
        id: 'INS-001',
        severity: 'CRITICAL',
        category: 'INSURANCE',
        title: 'Tài sản rủi ro cao chưa bảo hiểm',
        description: `${uninsuredItems.length} mặt hàng giá trị cao đang lưu kho không có bảo hiểm.`,
        impactValue: uninsuredItems.reduce((acc, i) => acc + (i.cost * i.quantity), 0)
      });
    }
    const score = Math.max(0, 100 - (issues.length * 15));
    return {
      healthScore: score,
      complianceIssues: issues,
      metrics: {
        insuranceCoverage: 85,
        certAccuracy: 94,
        inventoryTurnover: 4.2,
        lossRate: 2.5
      }
    };
  }

  // --- DUAL WAREHOUSE SYSTEM LOGIC ---

  /**
   * Phân tích nhu cầu theo khu vực (Simulated AI)
   */
  static async optimizeInventoryAllocation(): Promise<AllocationPlan> {
    // Giả lập tính toán phức tạp
    await new Promise(r => setTimeout(r, 2000));

    const hcmStock = this.items.find(i => i.warehouseId === 'W-HCM-01' && i.sku === 'NNU-HALO-01')?.quantity || 0;
    const hnStock = this.items.find(i => i.warehouseId === 'W-HN-01' && i.sku === 'NNU-HALO-01')?.quantity || 0;

    // Logic: Hà Nội đang trend Halo Diamond (Nhu cầu +200%), Kho HCM dư thừa
    const transferQty = Math.floor(hcmStock * 0.4); // Chuyển 40% ra HN

    return {
      hcm: { 'NNU-HALO-01': hcmStock - transferQty },
      hanoi: { 'NNU-HALO-01': hnStock + transferQty },
      transfers: [
        {
          productId: 'IT-004',
          productName: 'Nhẫn Nữ Halo Diamond 18K',
          from: WarehouseLocation.HCM_HEADQUARTER,
          to: WarehouseLocation.HANOI_BRANCH,
          quantity: transferQty,
          reason: 'Hà Nội Stock Alert: Nhu cầu tăng 200% (Tet Season)'
        }
      ]
    };
  }

  static getWarehouseIntelligence(): WarehouseIntelligence {
    return {
      hcm: {
        capacity: 100000, // items
        utilization: 85.2,
        turnover: 12.5, // vòng/năm
        costPerSku: 12500, // VND
        efficiency: 92
      },
      hanoi: {
        capacity: 40000,
        utilization: 45.8, // Thấp -> Cần đẩy hàng
        turnover: 8.2,
        costPerSku: 18000, // Cao hơn do quy mô nhỏ
        efficiency: 78
      },
      recommendations: [
        "Chuyển 2000 sản phẩm Trending từ HCM -> HN để giảm tải kho HCM.",
        "Tăng định mức an toàn tại Hà Nội thêm 15% cho dòng Nhẫn Cưới.",
        "Rà soát hàng tồn kho lâu ngày (Aged Stock) tại HCM để thanh lý."
      ]
    };
  }
}
