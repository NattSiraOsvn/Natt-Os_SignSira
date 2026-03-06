export interface CustomsItem {
  hsCode: string;
  description: string;
  quantity: number;
  unit: string;
  unitValue: number;
  currency: string;
  originCountry: string;
  weight?: number;
}

export interface CustomsDeclaration {
  id: string;
  declarationNumber: string;
  importDate: string;
  items: CustomsItem[];
  totalValue: number;
  currency: string;
  status: "PENDING" | "SUBMITTED" | "APPROVED" | "REJECTED" | "QUERIED";
  portOfEntry?: string;
  importer?: string;
}

export interface CustomsClassification {
  hsCode: string;
  tariffRate: number;
  vatRate: number;
  dutyAmount: number;
  vatAmount: number;
  totalPayable: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  notes: string[];
}

export const CustomsEngine = {
  classify: (item: CustomsItem): CustomsClassification => {
    // Trang sức vàng: HS 7113 — thuế NK 20%, VAT 10%
    const isJewelry = item.hsCode.startsWith("7113") || item.hsCode.startsWith("7114");
    const tariffRate = isJewelry ? 0.20 : 0.10;
    const vatRate = 0.10;
    const baseValue = item.quantity * item.unitValue;
    const dutyAmount = baseValue * tariffRate;
    const vatAmount = (baseValue + dutyAmount) * vatRate;
    return {
      hsCode: item.hsCode, tariffRate, vatRate,
      dutyAmount, vatAmount,
      totalPayable: dutyAmount + vatAmount,
      riskLevel: baseValue > 500_000_000 ? "HIGH" : baseValue > 100_000_000 ? "MEDIUM" : "LOW",
      notes: isJewelry ? ["Áp dụng ND-24/2012 về kinh doanh vàng"] : [],
    };
  },

  buildDeclaration: (items: CustomsItem[]): Omit<CustomsDeclaration, "id" | "declarationNumber"> => ({
    importDate: new Date().toISOString().split("T")[0],
    items,
    totalValue: items.reduce((s, i) => s + i.quantity * i.unitValue, 0),
    currency: "USD",
    status: "PENDING",
  }),

  validateDeclaration: (decl: CustomsDeclaration): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    if (!decl.items.length) errors.push("Tờ khai phải có ít nhất 1 mặt hàng");
    decl.items.forEach((item, i) => {
      if (!item.hsCode) errors.push(`Mặt hàng ${i + 1}: thiếu mã HS`);
      if (item.quantity <= 0) errors.push(`Mặt hàng ${i + 1}: số lượng không hợp lệ`);
      if (item.unitValue <= 0) errors.push(`Mặt hàng ${i + 1}: đơn giá không hợp lệ`);
    });
    return { valid: errors.length === 0, errors };
  },

  calculateTotalDuty: (items: CustomsItem[]): number =>
    items.reduce((s, item) => s + CustomsEngine.classify(item).totalPayable, 0),
};
