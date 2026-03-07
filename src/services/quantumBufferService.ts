export const QuantumBuffer = { push:(_k:string,_d:any):void=>{}, get:(_k:string):any=>null, flush:():void=>{}, size:():number=>0, getStats:()=>({ bufferSize:0, hitRate:0, evictions:0 }) };
if (typeof QuantumBuffer === "object") {
  (QuantumBuffer as any).subscribe = (_cb: any): (() => void) => () => {};
}
