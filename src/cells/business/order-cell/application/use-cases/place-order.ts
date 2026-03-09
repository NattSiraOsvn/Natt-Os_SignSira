export interface PlaceOrderInput{customerId:string;items:Array<{productId:string;productName:string;quantity:number;unitPrice:number}>;branchCode:string;channel:"SHOWROOM"|"ONLINE"|"PHONE";note?:string;depositAmount?:number;}
export interface PlaceOrderResult{success:boolean;orderId?:string;totalAmount:number;depositRequired:number;errors:string[];}
export function placeOrder(input:PlaceOrderInput):PlaceOrderResult{
  const errors:string[]=[];
  if(!input.items?.length)errors.push("Đơn hàng phải có ít nhất 1 sản phẩm");
  if(!input.customerId)errors.push("Cần thông tin khách hàng");
  if(errors.length>0)return{success:false,totalAmount:0,depositRequired:0,errors};
  const totalAmount=input.items.reduce((s,i)=>s+i.quantity*i.unitPrice,0);
  const depositRequired=input.channel==="ONLINE"?Math.round(totalAmount*0.3):0;
  return{success:true,orderId:`ORD-${Date.now()}`,totalAmount,depositRequired,errors:[]};
}
