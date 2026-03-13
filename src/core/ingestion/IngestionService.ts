// @ts-nocheck
export const Ingestion = {
  ingest:async(file:any)=>({ status:"QUEUED", id:`ING-${Date.now()}`, metadata:{ filename:file?.name??"", size:file?.size??0, type:file?.type??"" } }),
  getStatus:(_:string):string=>"PROCESSING", getQueue:():any[]=>[], retry:(_:string):void=>{},
  getHistory:():any[]=>Ingestion.getQueue(),
  validateAndRegister:async(file:any):Promise<any>=>Ingestion.ingest(file),
  updateStatus:(_id:string,_status:any,_meta?:any):void=>{},
};
