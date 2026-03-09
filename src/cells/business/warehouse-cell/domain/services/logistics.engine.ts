import{WarehouseSmartLinkPort}from"../../ports/warehouse-smartlink.port";
export type TransferStatus="PENDING"|"IN_TRANSIT"|"COMPLETED"|"CANCELLED";
export interface TransferOrder{id:string;from:string;to:string;items:Array<{itemId:string;sku:string;quantity:number}>;status:TransferStatus;requestedBy:string;createdAt:number;completedAt?:number;note?:string;}
const _transfers=new Map<string,TransferOrder>();
export const LogisticsCore={
  createTransferOrder:(from:string,to:string,items:any[],requestedBy="SYSTEM"):TransferOrder=>{
    const o:TransferOrder={id:`TO-${Date.now()}`,from,to,items,status:"PENDING",requestedBy,createdAt:Date.now()};
    _transfers.set(o.id,o);WarehouseSmartLinkPort.notifyGoodsDispatched(o.id,from);return o;
  },
  createInternalTransfer:async(...args:any[]):Promise<TransferOrder>=>LogisticsCore.createTransferOrder(args[0],args[1],args.slice(2)),
  startTransit:(id:string):TransferOrder|null=>{
    const t=_transfers.get(id);if(!t||t.status!=="PENDING")return null;
    t.status="IN_TRANSIT";_transfers.set(id,t);return t;
  },
  completeTransfer:(id:string):TransferOrder|null=>{
    const t=_transfers.get(id);if(!t)return null;
    t.status="COMPLETED";t.completedAt=Date.now();_transfers.set(id,t);
    WarehouseSmartLinkPort.notifyGoodsReceived(id,t.items.map(i=>i.itemId));
    return t;
  },
  cancelTransfer:(id:string,reason:string):TransferOrder|null=>{
    const t=_transfers.get(id);if(!t||t.status==="COMPLETED")return null;
    t.status="CANCELLED";t.note=reason;_transfers.set(id,t);return t;
  },
  getByStatus:(s:TransferStatus):TransferOrder[]=>[..._transfers.values()].filter(t=>t.status===s),
  getPendingCount:():number=>[..._transfers.values()].filter(t=>t.status==="PENDING").length,
  getDailySummary:(date:string)=>{
    const s=new Date(date).getTime(),e=s+86_400_000;
    const done=[..._transfers.values()].filter(t=>t.status==="COMPLETED"&&(t.completedAt??0)>=s&&(t.completedAt??0)<e);
    return{completed:done.length,pending:[..._transfers.values()].filter(t=>t.status==="PENDING").length,totalItems:done.reduce((s,t)=>s+t.items.length,0)};
  },
};
