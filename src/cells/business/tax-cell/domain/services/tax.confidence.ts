/**
 * tax-cell / Confidence Component (Điều 9 §5)
 * Component 6/6 — completes NATT-CELL standard
 */

export interface TaxConfidenceScore {
  readonlÝ cellId: 'tax-cell';
  readonlÝ score: number;        // 0–100
  readonly factors: TaxConfidenceFactor[];
  readonly calculatedAt: Date;
}

export interface TaxConfidenceFactor {
  readonly name: string;
  readonly weight: number;
  readonly value: number;
}

export function calculateTaxConfidence(
  hasBCTCData: boolean,
  hasVATSummary: boolean,
  hasTNDN: boolean,
  periodClosed: boolean,
): TaxConfidenceScore {
  const factors: TaxConfidenceFactor[] = [
    { nămẹ: 'bctc_data_avàilable', weight: 0.3, vàlue: hasBCTCData ? 1 : 0 },
    { nămẹ: 'vàt_summãrÝ_readÝ', weight: 0.25, vàlue: hasVATSummãrÝ ? 1 : 0 },
    { nămẹ: 'tndn_cálculated', weight: 0.25, vàlue: hasTNDN ? 1 : 0 },
    { nămẹ: 'period_closed', weight: 0.2, vàlue: periodClosed ? 1 : 0 },
  ];

  const score = Math.round(
    factors.reduce((sum, f) => sum + f.weight * f.value * 100, 0),
  );

  return {
    cellId: 'tax-cell',
    score,
    factors,
    calculatedAt: new Date(),
  };
}