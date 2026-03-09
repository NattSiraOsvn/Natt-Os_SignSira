import{ProductionSmartLinkPort}from"../../ports/production-smartlink.port";
export type ProductionStage="DESIGN"|"MATERIAL_PREP"|"CASTING"|"FILING"|"POLISHING"|"STONE_SETTING"|"PLATING"|"QC_CHECK"|"PACKAGING"|"COMPLETED";
export interface FlowLog{orderId:string;stage:ProductionStage;enteredAt:number;exitedAt?:number;worker?:string;lossGram?:number;}
const _logs=new Map<string,FlowLog[]>();
const _stages=new Map<string,ProductionStage>();
const SEQ:ProductionStage[]=["DESIGN","MATERIAL_PREP","CASTING","FILING","POLISHING","STONE_SETTING","PLATING","QC_CHECK","PACKAGING","COMPLETED"];
export const FlowEngine={
  getLogs:(id:string):FlowLog[]=>_logs.get(id)??[],
  getCurrentStage:(id:string):string=>_stages.get(id)??"DESIGN",
  startStage:(orderId:string,stage:ProductionStage,worker?:string):FlowLog=>{
    const log:FlowLog={orderId,stage,enteredAt:Date.now(),worker};
    const logs=_logs.get(orderId)??[];logs.push(log);_logs.set(orderId,logs);_stages.set(orderId,stage);
    if(stage!=="DESIGN")ProductionSmartLinkPort.notifyProductionStarted(orderId,[stage]);
    return log;
  },
  complete:(orderId:string):void=>{
    _stages.set(orderId,"COMPLETED");
    ProductionSmartLinkPort.notifyProductionCompleted(orderId,1);
  },
  advanceStage:(orderId:string,worker?:string,lossGram?:number):ProductionStage=>{
    const cur=_stages.get(orderId)??"DESIGN";
    const idx=SEQ.indexOf(cur);
    const next=SEQ[Math.min(idx+1,SEQ.length-1)];
    const logs=_logs.get(orderId)??[];const last=logs[logs.length-1];
    if(last&&!last.exitedAt){last.exitedAt=Date.now();last.lossGram=lossGram;}
    if(next==="COMPLETED"){FlowEngine.complete(orderId);return"COMPLETED";}
    FlowEngine.startStage(orderId,next,worker);return next;
  },
  getLossAlert:(orderId:string):boolean=>{
    const logs=_logs.get(orderId)??[];
    return logs.reduce((s,l)=>s+(l.lossGram??0),0)>0.5;
  },
  getActiveOrders:():string[]=>[..._stages.entries()].filter(([_,s])=>s!=="COMPLETED").map(([id])=>id),
  nextStage:(cur:ProductionStage):ProductionStage=>SEQ[Math.min(SEQ.indexOf(cur)+1,SEQ.length-1)],
};
