export const TaskRouter = { route:(task:any):string=>task.assignedTo??"UNASSIGNED", distribute:(tasks:any[]):Map<string,any[]>=>{ const m=new Map<string,any[]>(); tasks.forEach(t=>{ const k=t.assignedTo??"UNASSIGNED"; m.set(k,[...(m.get(k)??[]),t]); }); return m; }, getPriority:(t:any):number=>t.priority??5, getLoad:():Record<string,number>=>({}) };
if (typeof TaskRouter === "object") {
  (TaskRouter as any).subscribe    = (_cb: any): (() => void) => () => {};
  (TaskRouter as any).completeTask = (_id: string): void => {};
}
