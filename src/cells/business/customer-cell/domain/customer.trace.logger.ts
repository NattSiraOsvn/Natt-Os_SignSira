// @ts-nocheck
const _logs:any[]=[]; export const CustomerTraceLogger={log(event:string,refId:string,actor:string,payload?:any){const e={traceId:"CUS-"+Date.now(),cellId:"customer-cell" as const,event,refId,actor,payload,timestamp:new Date()};_logs.push(e);return e;},count:()=>_logs.length};
