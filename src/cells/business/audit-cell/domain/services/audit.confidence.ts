// No SmartLink import (R06)
export function assessAuditConfidence(p:{totalEvents:number;passedEvents:number}){const s=p.totalEvents>0?Math.round(p.passedEvents/p.totalEvents*100):0;return{cellId:"audit-cell" as const,overallScore:s,flags:s<90?["AUDIT_COVERAGE_LOW"]:[],asOf:new Date()};}
