/**
 * tax-cell / Confidence Component (Điều 9 §5)
 * Component 6/6 — completes NATT-CELL standard
 */

export interface TaxConfidenceScore {
  readonly cellId: 'tax-cell';
  readonly score: number;        // 0–100
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
    { name: 'bctc_data_available', weight: 0.3, value: hasBCTCData ? 1 : 0 },
    { name: 'vat_summary_ready', weight: 0.25, value: hasVATSummary ? 1 : 0 },
    { name: 'tndn_calculated', weight: 0.25, value: hasTNDN ? 1 : 0 },
    { name: 'period_closed', weight: 0.2, value: periodClosed ? 1 : 0 },
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
