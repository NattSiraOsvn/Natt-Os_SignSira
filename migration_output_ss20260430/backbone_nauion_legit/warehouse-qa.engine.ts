
import { InventoryItem, Warehouse, Movement, CertType, WarehouseLocation } from '@/types';

export interface WarehouseQAAudit {
  healthScore: number;
  complianceIssues: {
    id: string;
    severity: 'CRITICAL' | 'warnING' | 'INFO';
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
      id: 'W-HCM-01', name: 'KHO tong HCM', code: 'HCM-MAIN', type: 'MASTER_HUB', manager: 'tran hoai phuc', totalValue: 45000000000, itemCount: 12000, securityLevel: 'CAO',
      layout: [
        { id: 'B-1', x: 1, y: 1, z: 1, label: 'ket A1 - tang 1', occupied: true, type: 'SAFE' },
      ]
    },
    { id: 'W-HN-01', name: 'CHI nhanh ha nau', code: 'HN-BRANCH', type: 'DISTRIBUTION', manager: 'bui Cao son', totalValue: 12500000000, itemCount: 4500, securityLevel: 'CAO' },
    { id: 'W-003', name: 'Kho ban thanh pham (WIP)', code: 'WIP-FACTORY', type: 'ban thanh pham', manager: 'nguyen ven ven', totalValue: 15000000000, itemCount: 450, securityLevel: 'TRUNG binh' },
  ];

  static items: InventoryItem[] = [
    { 
      id: 'IT-001', sku: 'GOLD-18K-01', name: 'vang thau 18K', type: 'vang', warehouseId: 'W-HCM-01', quantity: 1250.45, unit: 'GRAM', cost: 4200000, purity: '75%', location: 'SAFE-A1', status: 'sen sang', lastCountDate: '21/01/2025', minThreshold: 2000, insuranceStatus: 'chua co', internalCertId: 'TL-G-25001', qrUrl: 'https://api.qrserver.com/v1/create-qr-code/?data=GOLD-18K-01' 
    },
    { 
      id: 'IT-004', sku: 'NNU-HALO-01', name: 'nhan nu Halo Diamond 18K', type: 'thanh pham', warehouseId: 'W-HCM-01', quantity: 50, unit: 'PIECE', cost: 45000000, certType: CertType.INTERNAL, internalCertId: 'TL-F-25004', location: 'DISPLAY-04', status: 'sen sang', lastCountDate: '21/01/2025', minThreshold: 10, insuranceStatus: 'con han'
    },
    { 
      id: 'IT-005', sku: 'NNA-ROLEX-01', name: 'nhan Nam Rolex Custom', type: 'thanh pham', warehouseId: 'W-HCM-01', quantity: 12, unit: 'PIECE', cost: 58000000, certType: CertType.INTERNAL, internalCertId: 'TL-F-25005', location: 'DISPLAY-05', status: 'sen sang', lastCountDate: '21/01/2025', minThreshold: 5, insuranceStatus: 'con han'
    },
    { 
      id: 'IT-006', sku: 'NNU-HALO-01', name: 'nhan nu Halo Diamond 18K', type: 'thanh pham', warehouseId: 'W-HN-01', quantity: 5, unit: 'PIECE', cost: 45000000, certType: CertType.INTERNAL, internalCertId: 'TL-F-25006', location: 'HN-A1', status: 'sen sang', lastCountDate: '21/01/2025', minThreshold: 15, insuranceStatus: 'con han'
    }
  ];

  static runQAAudit(): WarehouseQAAudit {
    const issues: WarehouseQAAudit['complianceIssues'] = [];
    const uninsuredItems = this.items.filter(i => (i.type === 'KIM cuong' || i.type === 'vang') && i.insuranceStatus === 'chua co');
    if (uninsuredItems.length > 0) {
      issues.push({
        id: 'INS-001',
        severity: 'CRITICAL',
        category: 'INSURANCE',
        title: 'tai san rui ro cao chua bao hiem',
        description: `${uninsuredItems.length} mat hang gia tri cao dang luu kho khong co bao hiem.`,
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
          productName: 'nhan nu Halo Diamond 18K',
          from: WarehouseLocation.HCM_HEADQUARTER,
          to: WarehouseLocation.HANOI_BRANCH,
          quantity: transferQty,
          reason: 'ha nau Stock Alert: Nhu cau tang 200% (Tet Season)'
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
        "chuyen 2000 san pham Trending tu HCM -> HN de giam tai kho HCM.",
        "tang dinh muc an toan tai ha nau them 15% cho dong nhan cui.",
        "ra soat hang ton kho lau ngay (Aged Stock) tai HCM de thanh ly."
      ]
    };
  }
}
