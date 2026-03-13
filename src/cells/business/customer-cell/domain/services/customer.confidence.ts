// @ts-nocheck
// No SmartLink import (R06)
export function assessCustomerConfidence(p:{total:number;active:number}){const s=p.total>0?Math.round(p.active/p.total*100):0;return{cellId:"customer-cell" as const,overallScore:s,flags:s<50?["LOW_ACTIVE_CUSTOMERS"]:[],asOf:new Date()};}
