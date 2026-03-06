export interface SecurityThreat { id:string; type:string; severity:"LOW"|"MEDIUM"|"HIGH"|"CRITICAL"; source:string; detected:number; resolved:boolean; description:string; }
export interface SecurityTHReat extends SecurityThreat {}
export interface SystemHealth { score:number; status:"HEALTHY"|"DEGRADED"|"CRITICAL"; threats:number; lastScan:number; uptime:number; }
const ThreatDetectionService = {
  scan:async():Promise<SecurityThreat[]>=>[],
  getHealth:():SystemHealth=>({ score:98, status:"HEALTHY", threats:0, lastScan:Date.now(), uptime:99.9 }),
  subscribe:(_:any)=>()=>{},
  resolve:(id:string)=>console.log(`Resolved: ${id}`),
};
export default ThreatDetectionService;
