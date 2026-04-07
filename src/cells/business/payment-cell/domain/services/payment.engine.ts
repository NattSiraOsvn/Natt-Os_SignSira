import { EventBus } from '@/core/events/event-bus';
import{PaymentSmartLinkPort}from"../../ports/payment-smartlink.port";
export interface PaymentResponse{success:boolean;transactionId:string;amount:number;currency:string;method:string;timestamp:string;errorCode?:string;qrCodeUrl?:string;}
export interface PaymentRecord{id:string;orderId:string;amount:number;method:string;status:"PENDING"|"COMPLETED"|"FAILED"|"REFUNDED";transactionId?:string;createdAt:number;completedAt?:number;}
const _records=new Map<string,PaymentRecord>();
export const PaymentEngine={
  process:async(amount:number,method:string):Promise<PaymentResponse>=>{
    const r:PaymentResponse={success:true,transactionId:`TXN-${Date.now()}`,amount,currency:"VND",method,timestamp:new Date().toISOString()};
    PaymentSmartLinkPort.notifyPaymentProcessed(r.transactionId,amount);
    return r;
  },
  refund:async(txId:string,amount:number):Promise<PaymentResponse>=>(
    {success:true,transactionId:`REF-${txId}`,amount,currency:"VND",method:"REFUND",timestamp:new Date().toISOString()}
  ),
  createPayment:async(data:any):Promise<PaymentResponse>=>{
    const r:PaymentResponse={success:true,transactionId:`TXN-${Date.now()}`,amount:data?.amount??0,currency:"VND",method:data?.method??"VNPAY",timestamp:new Date().toISOString()};
    PaymentSmartLinkPort.notifyPaymentProcessed(r.transactionId,r.amount);
    return r;
  },
  getStatus:(txId:string)=>({transactionId:txId,status:"COMPLETED"}),
  recordPayment:(orderId:string,amount:number,method:string):PaymentRecord=>{
    const rec:PaymentRecord={id:`PAY-${Date.now()}`,orderId,amount,method,status:"PENDING",createdAt:Date.now()};
    _records.set(rec.id,rec); return rec;
  },
  completePayment:(paymentId:string,transactionId:string):PaymentRecord|null=>{
    const rec=_records.get(paymentId); if(!rec)return null;
    rec.status="COMPLETED";rec.transactionId=transactionId;rec.completedAt=Date.now();
    _records.set(paymentId,rec); return rec;
  },
  getByOrder:(orderId:string):PaymentRecord[]=>[..._records.values()].filter(r=>r.orderId===orderId),
  getDailySummary:(date:string)=>{
    const s=new Date(date).getTime(),e=s+86_400_000;
    const recs=[..._records.values()].filter(r=>r.createdAt>=s&&r.createdAt<e&&r.status==="COMPLETED");
    const byMethod:Record<string,number>={};
    recs.forEach(r=>{byMethod[r.method]=(byMethod[r.method]??0)+r.amount;});
    return{total:recs.reduce((s,r)=>s+r.amount,0),count:recs.length,byMethod};
  },
};

// cell.metric signal
EventBus.on('payment-cell.execute', () => {});
EventBus.emit('cell.metric', { cell: 'payment-cell', metric: 'engine.alive', value: 1, ts: Date.now() });
