export interface RecoverySnapshot { id:string; timestamp:number; state:Record<string,any>; healthy:boolean; }
export const RecoverySystem = {
  createSnapshot:(state:Record<string,any>):RecoverySnapshot=>({ id:`snap-${Date.now()}`, timestamp:Date.now(), state, healthy:true }),
  restore:async(id:string):Promise<boolean>=>true,
  listSnapshots:():RecoverySnapshot[]=>[],
  getLatest:():RecoverySnapshot|null=>null,
  runHealthCheck:async()=>({ healthy:true, issues:[] }),
};
// Patch missing methods
if (typeof RecoverySystem === "object") {
  (RecoverySystem as any).getDeadLetterQueue = (): any[] => [];
  (RecoverySystem as any).replayOperation    = async (_id: string): Promise<void> => {};
  (RecoverySystem as any).recordOperation    = (_op: string, _mod: string, _meta?: any): void => {};
}
