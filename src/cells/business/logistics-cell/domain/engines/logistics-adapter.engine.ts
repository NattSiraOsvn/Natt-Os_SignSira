
import { LogisticsPartner, LogisticsSolution, TransferOrder, SalesOrder, WarehouseLocation } from '@/types';
import { ShardingService } from '@/cells/kernel/audit-cell/domain/engines/blockchain-shard.engine';

// ============================================================================
// 🔌 LOGISTICS ADAPTER INTERFACES
// Chuẩn hóa giao tiếp với các hãng vận chuyển (GHN, VTP, FedEx...)
// ============================================================================

interface APIQuoteRequest {
  fromDistrictId: number;
  toDistrictId: number;
  weightGram: number;
  insuranceValue: number; // VND
  serviceId?: number;
}

interface LogisticsAdapter {
  providerId: string;
  providerName: string;
  serviceType: 'EXPRESS' | 'STANDARD' | 'AIR' | 'TRUCK';
  
  // Hàm giả lập gọi API lấy báo giá Real-time
  getLiveQuote(req: APIQuoteRequest): Promise<LogisticsSolution>;
  
  // Hàm giả lập tạo đơn hàng (đẩy qua API)
  createOrder(orderData: any): Promise<string>; // Trả về Tracking Code
}

// ============================================================================
// 🚚 GHN ADAPTER (Giao Hàng Nhanh)
// Mô phỏng: https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee
// ============================================================================
class GHNAdapter implements LogisticsAdapter {
  providerId = 'GHN';
  providerName = 'Giao Hàng Nhanh';
  serviceType = 'EXPRESS' as const;

  async getLiveQuote(req: APIQuoteRequest): Promise<LogisticsSolution> {
    // Giả lập độ trễ mạng API (150ms - 400ms)
    await new Promise(r => setTimeout(r, 150 + Math.random() * 250));

    // Logic tính giá giả lập theo chuẩn GHN (Vùng miền + Cân nặng)
    const baseFee = 22000; // Nội vùng
    const weightFee = Math.max(0, Math.ceil((req.weightGram - 2000) / 500)) * 5000; // 5k mỗi 500g tiếp theo
    const insuranceFee = req.insuranceValue > 3000000 ? req.insuranceValue * 0.005 : 0; // 0.5% khai giá
    const totalFee = baseFee + weightFee + insuranceFee;

    // SLA Giao hàng
    const leadTimeHours = 24; 

    return {
      partnerId: this.providerId,
      partnerName: this.providerName,
      serviceType: this.serviceType,
      cost: {
        shippingFee: baseFee + weightFee,
        insuranceFee: insuranceFee,
        codFee: 0,
        fuelSurcharge: 0,
        total: totalFee
      },
      estimatedDelivery: Date.now() + (leadTimeHours * 3600000),
      reliability: 94, // GHN độ tin cậy cao
      totalCost: totalFee,
      score: 0,
      recommended: false
    };
  }

  async createOrder(order: any): Promise<string> {
    await new Promise(r => setTimeout(r, 800));
    return `GHN${Date.now().toString().slice(-8)}`; // Mock Tracking Code
  }
}

// ============================================================================
// 📮 VIETTEL POST ADAPTER
// Mô phỏng: https://partner.viettelpost.vn/v2/order/getPrice
// ============================================================================
class ViettelPostAdapter implements LogisticsAdapter {
  providerId = 'VTP';
  providerName = 'Viettel Post';
  serviceType = 'STANDARD' as const;

  async getLiveQuote(req: APIQuoteRequest): Promise<LogisticsSolution> {
    await new Promise(r => setTimeout(r, 200 + Math.random() * 300)); // VTP thường chậm hơn xíu

    // Logic tính giá VTP (Rẻ hơn nhưng chậm hơn)
    const baseFee = 16500;
    const weightFee = Math.max(0, Math.ceil((req.weightGram - 2000) / 500)) * 3500; // 3.5k mỗi 500g
    const insuranceFee = req.insuranceValue * 0.008; // 0.8% khai giá (cao hơn GHN)
    const totalFee = baseFee + weightFee + insuranceFee;

    const leadTimeHours = 48; // Chậm hơn

    return {
      partnerId: this.providerId,
      partnerName: this.providerName,
      serviceType: this.serviceType,
      cost: {
        shippingFee: baseFee + weightFee,
        insuranceFee: insuranceFee,
        codFee: 0,
        fuelSurcharge: 0,
        total: totalFee
      },
      estimatedDelivery: Date.now() + (leadTimeHours * 3600000),
      reliability: 96, // Mạng lưới rộng
      totalCost: totalFee,
      score: 0,
      recommended: false
    };
  }

  async createOrder(order: any): Promise<string> {
    return `VTP${Date.now().toString().slice(-9)}`;
  }
}

// ============================================================================
// ✈️ FEDEX ADAPTER (International)
// ============================================================================
class FedExAdapter implements LogisticsAdapter {
  providerId = 'FEDEX';
  providerName = 'FedEx International';
  serviceType = 'AIR' as const;

  async getLiveQuote(req: APIQuoteRequest): Promise<LogisticsSolution> {
    await new Promise(r => setTimeout(r, 600)); // API Quốc tế

    // Giá cước quốc tế (Tính bằng USD giả định rồi đổi ra VND)
    const baseFee = 850000; // ~35 USD
    const weightFee = Math.ceil(req.weightGram / 500) * 150000;
    const fuelSurcharge = (baseFee + weightFee) * 0.15; // 15% phụ phí xăng dầu
    const totalFee = baseFee + weightFee + fuelSurcharge;

    return {
      partnerId: this.providerId,
      partnerName: this.providerName,
      serviceType: this.serviceType,
      cost: {
        shippingFee: baseFee + weightFee,
        insuranceFee: 0,
        codFee: 0,
        fuelSurcharge: fuelSurcharge,
        total: totalFee
      },
      estimatedDelivery: Date.now() + (96 * 3600000), // 4 days
      reliability: 99,
      totalCost: totalFee,
      score: 0,
      recommended: false
    };
  }

  async createOrder(order: any): Promise<string> {
    return `FDX${Date.now().toString().slice(-10)}`;
  }
}

// ============================================================================
// 🧠 LOGISTICS ENGINE (CORE)
// ============================================================================
export class LogisticsEngine {
  private static instance: LogisticsEngine;
  
  // Danh sách các Adapter đã tích hợp
  private adapters: LogisticsAdapter[] = [
    new GHNAdapter(),
    new ViettelPostAdapter(),
    new FedExAdapter()
  ];

  public static getInstance() {
    if (!LogisticsEngine.instance) {
      LogisticsEngine.instance = new LogisticsEngine();
    }
    return LogisticsEngine.instance;
  }

  /**
   * AI Routing: Gọi đồng thời tất cả API để so sánh giá & thời gian
   */
  async selectOptimalLogistics(
    orderValue: number,
    weightGram: number,
    destination: string,
    isUrgent: boolean
  ): Promise<LogisticsSolution[]> {
    
    // 1. Phân tích địa chỉ (Giả lập District ID Mapping)
    const toDistrictId = destination.includes('Hà Nội') ? 1001 : 1002;
    const fromDistrictId = 2001; // HCM

    const request: APIQuoteRequest = {
      fromDistrictId,
      toDistrictId,
      weightGram,
      insuranceValue: orderValue
    };

    // 2. Parallel API Calls (Kéo API đồng thời)
    const promises = this.adapters.map(adapter => adapter.getLiveQuote(request));
    const solutions = await Promise.all(promises);

    // 3. AI Scoring & Ranking
    return solutions.map(sol => {
      // Chuẩn hóa điểm số
      const normCost = 1000000;
      const hours = (sol.estimatedDelivery - Date.now()) / 3600000;
      
      const scoreCost = Math.max(0, 100 - (sol.totalCost / normCost) * 50);
      const scoreTime = Math.max(0, 100 - (hours / 72) * 50); // 72h max
      
      // Trọng số động theo nhu cầu (Gấp vs Thường)
      const wTime = isUrgent ? 0.7 : 0.3;
      const wCost = isUrgent ? 0.2 : 0.6;
      const wRel = 0.1;

      const finalScore = (scoreTime * wTime) + (scoreCost * wCost) + (sol.reliability * wRel);
      
      return { ...sol, score: finalScore };
    }).sort((a, b) => b.score - a.score)
      .map((s, i) => ({ ...s, recommended: i === 0 }));
  }

  /**
   * Quản lý vận chuyển nội bộ (Internal Transfer)
   */
  async createInternalTransfer(
    productId: string,
    productName: string,
    quantity: number,
    from: string,
    to: string
  ): Promise<TransferOrder> {
    
    const docHash = ShardingService.generateShardHash({ productId, from, to, ts: Date.now() });

    return {
      id: `TRF-${Date.now()}`,
      transferId: `INT-${Math.random().toString(36).substring(7).toUpperCase()}`,
      productId,
      productName,
      quantity,
      fromWarehouse: from,
      toWarehouse: to,
      transferDate: Date.now(),
      expectedDelivery: Date.now() + (48 * 3600000), // 48h default internal
      status: 'PENDING',
      transportMethod: 'XE_CHUYEN_DUNG_OMEGA',
      documents: [docHash]
    };
  }
}

export const LogisticsCore = LogisticsEngine.getInstance();
