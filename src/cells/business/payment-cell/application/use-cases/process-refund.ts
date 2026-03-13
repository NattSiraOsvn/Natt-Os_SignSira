// @ts-nocheck
import{PaymentEngine,PaymentResponse}from"../../domain/services/payment.engine";
export interface ProcessRefundInput{originalTransactionId:string;refundAmount:number;reason:string;approvedBy:string;}
export interface ProcessRefundResult{success:boolean;response?:PaymentResponse;error?:string;}
export async function processRefund(input:ProcessRefundInput):Promise<ProcessRefundResult>{
  if(input.refundAmount<=0)return{success:false,error:"Số tiền hoàn trả không hợp lệ"};
  if(!input.approvedBy)return{success:false,error:"Cần người duyệt"};
  const response=await PaymentEngine.refund(input.originalTransactionId,input.refundAmount);
  return{success:response.success,response};
}
