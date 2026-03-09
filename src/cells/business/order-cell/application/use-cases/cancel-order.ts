export interface CancelOrderInput{orderId:string;reason:string;cancelledBy:string;refundDeposit?:boolean;}
export interface CancelOrderResult{success:boolean;refundAmount:number;error?:string;}
export function cancelOrder(input:CancelOrderInput,orderStatus:string,depositPaid:number):CancelOrderResult{
  if(!["PENDING","CONFIRMED"].includes(orderStatus))return{success:false,refundAmount:0,error:`Không thể hủy ở trạng thái ${orderStatus}`};
  if(!input.reason?.trim())return{success:false,refundAmount:0,error:"Cần lý do hủy"};
  return{success:true,refundAmount:input.refundDeposit?depositPaid:0};
}
