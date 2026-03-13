// @ts-nocheck
// No SmartLink import (R06)
export function assessPricingConfidence(p:{totalSkus:number;pricedSkus:number}){const s=p.totalSkus>0?Math.round(p.pricedSkus/p.totalSkus*100):0;return{cellId:"pricing-cell" as const,overallScore:s,flags:s<80?["PRICING_COVERAGE_LOW"]:[],asOf:new Date()};}
