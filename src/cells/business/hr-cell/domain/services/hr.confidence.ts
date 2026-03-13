// @ts-nocheck
// No SmartLink import (R06)
export function assessHrConfidence(p:{totalStaff:number;activeStaff:number}){const s=p.totalStaff>0?Math.round(p.activeStaff/p.totalStaff*100):0;return{cellId:"hr-cell" as const,overallScore:s,flags:s<80?["HR_COVERAGE_LOW"]:[],asOf:new Date()};}
