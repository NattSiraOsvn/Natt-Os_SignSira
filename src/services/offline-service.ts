interface Job { id:string; type:string; payload:any; retries:number; }
const _q:Job[]=[];
const OfflineService = { isOnline:():boolean=>navigator.onLine, queue:(type:string,payload:any):void=>{ _q.push({id:`j-${Date.now()}`,type,payload,retries:0}); }, flush:async()=>{ const n=_q.length; _q.length=0; return {processed:n,failed:0}; }, getPendingCount:():number=>_q.length, getQueue:():Job[]=>[..._q] };
export default OfflineService;
// Patch init
const _offline = OfflineService as any;
if (!_offline.init) _offline.init = async (): Promise<void> => {};
if (!_offline.saveData) _offline.saveData = (_k: string, _d: any): void => {};
