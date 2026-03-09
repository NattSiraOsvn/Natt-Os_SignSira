import { ComplianceSmartLinkPort } from "../../ports/compliance-smartlink.port";
export const FraudGuard = { check:(_:any)=>({ safe:true, riskScore:5, flags:[] }), blacklist:(id:string):void=>{ ComplianceSmartLinkPort.notifyViolationDetected(id, "HIGH"); }, getBlacklist:():string[]=>[],  analyzePattern:(_:any[])=>({ anomalies:[], score:0 }) };
