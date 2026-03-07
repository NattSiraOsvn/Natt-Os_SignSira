export const Ingestion = { ingest:async(file:File)=>({ status:"QUEUED", id:`ING-${Date.now()}`, metadata:{ filename:file.name, size:file.size, type:file.type } }), getStatus:(_:string):string=>"PROCESSING", getQueue:():any[]=>[],  retry:(_:string):void=>{} };
if (typeof Ingestion === "object") {
  (Ingestion as any).getHistory           = (): any[] => Ingestion.getQueue();
  (Ingestion as any).validateAndRegister  = async (file: File): Promise<any> => Ingestion.ingest(file);
  (Ingestion as any).updateStatus         = (_id: string, _status: any, _meta?: any): void => {};
}
