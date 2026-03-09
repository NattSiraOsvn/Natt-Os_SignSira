export interface PaymentResponse { success:boolean; transactionId:string; amount:number; currency:string; method:string; timestamp:string; errorCode?:string; qrCodeUrl?:string; }
export const PaymentEngine = {
  process:async(amount:number,method:string):Promise<PaymentResponse>=>({ success:true, transactionId:`TXN-${Date.now()}`, amount, currency:"VND", method, timestamp:new Date().toISOString() }),
  refund:async(txId:string,amount:number):Promise<PaymentResponse>=>({ success:true, transactionId:`REF-${txId}`, amount, currency:"VND", method:"REFUND", timestamp:new Date().toISOString() }),
  getStatus:(txId:string)=>({ transactionId:txId, status:"COMPLETED" }),
  createPayment:async(data:any):Promise<PaymentResponse>=>({ success:true, transactionId:`TXN-${Date.now()}`, amount:data?.amount??0, currency:"VND", method:data?.method??"VNPAY", timestamp:new Date().toISOString(), qrCodeUrl:`data:image/png;base64,iVBOR` }),
};
