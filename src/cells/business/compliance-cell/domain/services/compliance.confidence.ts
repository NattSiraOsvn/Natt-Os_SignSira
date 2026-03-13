// @ts-nocheck
// No SmartLink import (R06)
export function assessComplianceConfidence(p:{total:number;passed:number}){const s=p.total>0?Math.round(p.passed/p.total*100):0;return{cellId:"compliance-cell" as const,overallScore:s,flags:s<80?["COMPLIANCE_LOW"]:[],asOf:new Date()};}
