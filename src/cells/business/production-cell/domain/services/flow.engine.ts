import { ProductionSmartLinkPort } from '../../ports/production-smartlink.port';
export interface FlowLog { id:string; stage:string; actor:string; action:string; timestamp:number; status:"OK"|"ERROR"|"PENDING"; step?:number; detail?:string; }
export const FlowEngine = {
  start:(channel:any):FlowLog=>({ id:`FL-${Date.now()}`, stage:"INIT", actor:"SYSTEM", action:`Start ${String(channel)}`, timestamp:Date.now(), status:"OK", step:1, detail:"" }),
  advance:(id:string,stage:string):FlowLog=>({ id, stage, actor:"SYSTEM", action:`Move to ${stage}`, timestamp:Date.now(), status:"OK" }),
  getLogs:(_:string):FlowLog[]=>[], getCurrentStage:(_:string):string=>"PRODUCTION", complete:(orderId:string):void=>{ ProductionSmartLinkPort.notifyOrderCompleted(orderId); },
  subscribe:(_cb:any):()=>void=>()=>{}, fullFlow:async(_m:string,_q:number,_c:string):Promise<FlowLog[]>=>[], 
};
