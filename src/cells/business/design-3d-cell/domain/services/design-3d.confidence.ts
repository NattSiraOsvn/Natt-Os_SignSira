// @ts-nocheck
// Điều 9 §5 — Confidence. No SmartLink import (R06)
export interface Design3dConfidenceScore { cellId: "design-3d-cell"; overallScore: number; skuCoverage: number; flags: string[]; asOf: Date; }
export function assessDesign3dConfidence(params: { totalSkus: number; skusWithModel: number; }): Design3dConfidenceScore { const { totalSkus, skusWithModel } = params; const skuCoverage = totalSkus > 0 ? Math.round((skusWithModel / totalSkus) * 100) : 0; const flags: string[] = []; if (skuCoverage < 80) flags.push("SKU_COVERAGE_LOW"); if (totalSkus === 0) flags.push("NO_SKU_DATA"); return { cellId: "design-3d-cell", overallScore: skuCoverage, skuCoverage, flags, asOf: new Date() }; }
