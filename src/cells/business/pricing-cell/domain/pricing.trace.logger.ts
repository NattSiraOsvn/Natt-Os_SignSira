// @ts-nocheck
const _logs:any[]=[]; export const PricingTraceLogger={log(event:string,refId:string,actor:string,payload?:any){const e={traceId:"PRC-"+Date.now(),cellId:"pricing-cell" as const,event,refId,actor,payload,timestamp:new Date()};_logs.push(e);return e;},count:()=>_logs.length};
