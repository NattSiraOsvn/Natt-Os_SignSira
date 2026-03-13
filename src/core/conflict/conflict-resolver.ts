// @ts-nocheck
export enum ConflictResolutionMethod { LAST_WRITE_WINS="LAST_WRITE_WINS", FIRST_WRITE_WINS="FIRST_WRITE_WINS", MERGE="MERGE", MANUAL="MANUAL" }
export interface Conflict<T=unknown> { id:string; localValue:T; remoteValue:T; localTimestamp:number; remoteTimestamp:number; resolved:boolean; resolution?:T; resolvedBy?:ConflictResolutionMethod; }
const _unresolved: Conflict[] = [];
export const ConflictEngine = {
  detect:<T>(local:T,remote:T):boolean=>JSON.stringify(local)!==JSON.stringify(remote),
  resolve:<T>(local:T,remote:T,method=ConflictResolutionMethod.LAST_WRITE_WINS,localTs=0,remoteTs=Date.now()):T=>{
    switch(method){
      case ConflictResolutionMethod.FIRST_WRITE_WINS: return localTs<=remoteTs?local:remote;
      case ConflictResolutionMethod.MERGE: return typeof local==="object"&&typeof remote==="object"?{...(local as object),...(remote as object)} as T:remote;
      case ConflictResolutionMethod.MANUAL: _unresolved.push({id:`CF-${Date.now()}`,localValue:local,remoteValue:remote,localTimestamp:localTs,remoteTimestamp:remoteTs,resolved:false}); return local;
      default: return remoteTs>=localTs?remote:local;
    }
  },
  getUnresolved:():Conflict[]=>[..._unresolved],
  manualResolve:<T>(conflictId:string,resolution:T):void=>{ const c=_unresolved.find(x=>x.id===conflictId); if(c){c.resolved=true;c.resolution=resolution;c.resolvedBy=ConflictResolutionMethod.MANUAL;} },
  clearResolved:():void=>{ const i=_unresolved.findIndex(x=>x.resolved); if(i>=0)_unresolved.splice(i,1); },
  resolveConflicts:async(items:any[],_opts?:any):Promise<{isAutoResolved:boolean;winner?:any;methodUsed?:string}>=>{ if(items.length<2)return{isAutoResolved:true,winner:items[0],methodUsed:"TRIVIAL"}; const winner=items.reduce((b:any,c:any)=>(c.confidence??0)>(b.confidence??0)?c:b,items[0]); return{isAutoResolved:true,winner,methodUsed:"CRP_CONFIDENCE"}; },
};
export { ConflictEngine as ConflictResolver };
export default ConflictEngine;
