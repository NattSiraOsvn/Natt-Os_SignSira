// @ts-nocheck
const _logs:any[]=[]; export const HrTraceLogger={log(event:string,refId:string,actor:string,payload?:any){const e={traceId:"HR-"+Date.now(),cellId:"hr-cell" as const,event,refId,actor,payload,timestamp:new Date()};_logs.push(e);return e;},count:()=>_logs.length};
