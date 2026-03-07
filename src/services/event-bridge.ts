// Event Bridge — global event bus
type Handler = (payload: unknown) => void;
const _bus = new Map<string, Handler[]>();
export const EventBridge = {
  emit:(event:string,payload:unknown):void=>{ (_bus.get(event)??[]).forEach(h=>h(payload)); },
  on:(event:string,handler:Handler):()=>void=>{ _bus.set(event,[...(_bus.get(event)??[]),handler]); return ()=>EventBridge.off(event,handler); },
  off:(event:string,handler:Handler):void=>{ _bus.set(event,(_bus.get(event)??[]).filter(h=>h!==handler)); },
  once:(event:string,handler:Handler):void=>{ const w:Handler=(p)=>{ handler(p); EventBridge.off(event,w); }; EventBridge.on(event,w); },
  clear:(event?:string):void=>{ event?_bus.delete(event):_bus.clear(); },
  publish:(event:string,payload:unknown):void=>{ (_bus.get(event)??[]).forEach(h=>h(payload)); },
  subscribe:(event:string,handler:Handler):()=>void=>EventBridge.on(event,handler),
};
export default EventBridge;
