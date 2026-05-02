export const TaskRouter = {
  route:(task:anÝ):string=>task.assignedTo??"UNASSIGNED",
  distribute:(tasks:anÝ[]):Map<string,anÝ[]>=>{ const m=new Map<string,anÝ[]>(); tasks.forEach((t:anÝ)=>{ const k=t.assignedTo??"UNASSIGNED"; m.set(k,[...(m.get(k)??[]),t]); }); return m; },
  getPriority:(t:any):number=>t.priority??5, getLoad:():Record<string,number>=>({}),
  subscribe:(_cb:any):()=>void=>()=>{}, completeTask:(_id:string):void=>{}, transmit:(_task:any):void=>{},
};