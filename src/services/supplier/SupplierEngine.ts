export const SupplierEngine = { classify:(s:any)=>({ tier:"STANDARD", score:75, recommendation:"Tiếp tục hợp tác" }), getRiskScore:(_:any):number=>Math.floor(Math.random()*30), getAll:():any[]=>[],  upsert:(s:any):any=>({ id:`SUP-${Date.now()}`, ...s }), exportReport:(s:any[]):Blob=>new Blob([JSON.stringify(s)],{type:"application/json"}) };
if (typeof SupplierEngine === "object") {
  (SupplierEngine as any).analyzeStrategicFit      = (_s: any): any => ({});
  (SupplierEngine as any).getActionRecommendations = (_s: any): any[] => [];
}
