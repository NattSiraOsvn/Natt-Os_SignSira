export interface ProfitRetentionPolicy {
  policyId: string;
  fiscalYear: number;
  // Tỷ lệ % lợi nhuận sau thuế giữ lại (4211)
  retentionRate: number;      // đề xuất 40–60%
  // Lý do / cơ sở đề xuất
  basis: {
    avgGoldPriceVolatility: number;  // biến động giá vàng
    buybackRate: number;             // tỷ lệ buyback thực tế
    cashFlowRisk: 'LOW' | 'MEDIUM' | 'HIGH';
    marketOutlook: 'STABLE' | 'UNCERTAIN' | 'CRISIS';
  };
  approvedBy?: string;
  approvedAt?: Date;
}

export interface ProfitAllocation {
  allocationId: string;
  fiscalYear: number;
  netProfitAfterTax: number;   // lợi nhuận sau thuế
  retained4211: number;        // giữ lại (không chia)
  distributable4212: number;   // có thể phân phối
  createdAt: Date;
}
