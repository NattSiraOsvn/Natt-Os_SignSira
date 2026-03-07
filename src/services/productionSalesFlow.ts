export interface FlowLog { id:string; stage:string; actor:string; action:string; timestamp:number; status:"OK"|"ERROR"|"PENDING"; }
export const FlowEngine = { start:(channel:any):FlowLog=>({ id:`FL-${Date.now()}`, stage:"INIT", actor:"SYSTEM", action:`Start ${channel}`, timestamp:Date.now(), status:"OK" }), advance:(id:string,stage:string):FlowLog=>({ id, stage, actor:"SYSTEM", action:`Move to ${stage}`, timestamp:Date.now(), status:"OK" }), getLogs:(_:string):FlowLog[]=>[],  getCurrentStage:(_:string):string=>"PRODUCTION", complete:(_:string):void=>{} };
if (typeof FlowEngine === "object") {
  (FlowEngine as any).subscribe = (_cb: any): (() => void) => { return () => {}; };
  (FlowEngine as any).fullFlow  = async (material: string, qty: number, channel: string): Promise<any[]> => [];
}
