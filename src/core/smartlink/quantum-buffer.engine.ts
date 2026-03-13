// @ts-nocheck
export const QuantumBuffer = {
  push:(_k:string,_d:any):void=>{}, get:(_k:string):any=>null, flush:():void=>{}, size:():number=>0,
  getStats:()=>({ bufferSize:0, hitRate:0, evictions:0 }), subscribe:(_cb:any):()=>void=>()=>{},
};
