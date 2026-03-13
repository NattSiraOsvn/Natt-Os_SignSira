// @ts-nocheck
import{PaymentEngine,PaymentResponse}from"../../domain/services/payment.engine";
export type PaymentMethod="CASH"|"VNPAY"|"MOMO"|"ZALOPAY"|"BANK_TRANSFER"|"CARD";
export interface ProcessPaymentInput{orderId:string;amount:number;method:PaymentMethod;customerId?:string;}
export interface ProcessPaymentResult{success:boolean;response?:PaymentResponse;orderId:string;error?:string;}
export async function processPayment(input:ProcessPaymentInput):Promise<ProcessPaymentResult>{
  if(input.amount<=0)return{success:false,orderId:input.orderId,error:"Số tiền không hợp lệ"};
  if(input.amount>500_000_000&&input.method==="CASH")return{success:false,orderId:input.orderId,error:"Tiền mặt tối đa 500 triệu"};
  const response=await PaymentEngine.process(input.amount,input.method);
  return{success:response.success,response,orderId:input.orderId};
}
