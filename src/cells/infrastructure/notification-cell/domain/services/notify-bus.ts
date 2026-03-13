// @ts-nocheck
export interface GlobalAlert { id:string; type:"INFO"|"WARNING"|"ERROR"|"SUCCESS"|"NEWS"|"RISK"|"ORDER"; title:string; content:string; persona?:string; timestamp:number; read:boolean; pinned:boolean; metadata?:Record<string,any>; priority?:"LOW"|"MEDIUM"|"HIGH"|"CRITICAL"; }
const _l: Array<(a:GlobalAlert)=>void>=[]; const _q:GlobalAlert[]=[];
export const NotifyBus = {
  push:(p:Omit<GlobalAlert,"id"|"timestamp"|"read"|"pinned">)=>{ const a={...p,id:`a-${Date.now()}`,timestamp:Date.now(),read:false,pinned:false}; _q.push(a); _l.forEach(f=>f(a)); },
  subscribe:(f:(a:GlobalAlert)=>void)=>{ _l.push(f); return ()=>{const i=_l.indexOf(f);if(i>-1)_l.splice(i,1);}; },
  getQueue:()=>[..._q], markRead:(id:string)=>{ const a=_q.find(x=>x.id===id); if(a)a.read=true; },
};
