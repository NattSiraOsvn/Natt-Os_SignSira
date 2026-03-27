// Điều 9 §5 — Confidence. KHÔNG import SmartLink/EventBus (R06)
export interface InventoryConfidenceScore {
  cellId: 'inventory-cell';
  overallScore: number;
  stockAccuracy: number;      // % khớp sổ sách vs thực tế
  monthEndClosed: boolean;
  flags: string[];
  asOf: Date;
}
export function assessInventoryConfidence(params: {
  totalSkus: number;
  reconciledSkus: number;
  monthEndClosed: boolean;
}): InventoryConfidenceScore {
  const { totalSkus, reconciledSkus, monthEndClosed } = params;
  const stockAccuracy = totalSkus > 0
    ? Math.round((reconciledSkus / totalSkus) * 100) : 0;
  const overallScore = Math.round(
    (stockAccuracy * 0.6) + (monthEndClosed ? 40 : 0)
  );
  const flags: string[] = [];
  if (!monthEndClosed) flags.push('MONTH_END_OPEN');
  if (stockAccuracy < 80) flags.push('STOCK_ACCURACY_LOW');
  if (totalSkus === 0) flags.push('NO_SKU_DATA');
  return {
    cellId: 'inventory-cell',
    overallScore,
    stockAccuracy,
    monthEndClosed,
    flags,
    asOf: new Date(),
  };
}
