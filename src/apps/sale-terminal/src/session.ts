import{SaleTerminalConfig}from"./config";
import{createSalesOrder}from"../../../cells/business/sales-cell/application/use-cases/create-sales-order";
import{processPayment}from"../../../cells/business/payment-cell/application/use-cases/process-payment";
import{createInvoice}from"../../../cells/business/finance-cell/application/use-cases/create-invoice";
import{registerWarranty}from"../../../cells/business/warranty-cell/application/use-cases/register-warranty";
import{runFraudCheck}from"../../../cells/business/compliance-cell/application/use-cases/run-fraud-check";
export interface CartItem{productId:string;productName:string;sku:string;quantity:number;unitPrice:number;discount?:number;}
export interface SaleResult{success:boolean;orderId?:string;transactionId?:string;invoiceId?:string;warrantyId?:string;totalAmount:number;errors:string[];}
export class SaleTerminalSession{
  private config:SaleTerminalConfig;
  private cart:CartItem[]=[];
  private customerId?:string;
  constructor(config:SaleTerminalConfig){this.config=config;}
  async initialize():Promise<void>{this.cart=[];this.customerId=undefined;}
  addToCart(item:CartItem):void{const e=this.cart.find(c=>c.productId===item.productId);if(e)e.quantity+=item.quantity;else this.cart.push({...item});}
  removeFromCart(productId:string):void{this.cart=this.cart.filter(c=>c.productId!==productId);}
  setCustomer(customerId:string):void{this.customerId=customerId;}
  getTotal():number{return this.cart.reduce((s,i)=>{const sub=i.quantity*i.unitPrice;const disc=sub*(i.discount??0);return s+(sub-disc)*(1+this.config.vatRate);},0);}
  async checkout(paymentMethod:string):Promise<SaleResult>{
    if(!this.cart.length)return{success:false,totalAmount:0,errors:["Giỏ hàng trống"]};
    const totalAmount=Math.round(this.getTotal());
    const fraud=runFraudCheck({transactionId:`TERM-${Date.now()}`,customerId:this.customerId??"WALK_IN",amount:totalAmount,method:paymentMethod});
    if(fraud.recommendation==="BLOCK")return{success:false,totalAmount,errors:["Giao dịch bị chặn: "+fraud.flags.join(", ")]};
    const orderResult=await createSalesOrder({productId:this.cart[0].productId,productName:this.cart.map(c=>c.productName).join(", "),quantity:this.cart.reduce((s,c)=>s+c.quantity,0),unitPrice:totalAmount/Math.max(1,this.cart.reduce((s,c)=>s+c.quantity,0)),sellerId:this.config.sellerId,customerId:this.customerId,channel:"SHOWROOM"});
    if(!orderResult.success||!orderResult.transaction)return{success:false,totalAmount,errors:[orderResult.error??"Lỗi tạo đơn"]};
    const payResult=await processPayment({orderId:orderResult.transaction.id,amount:totalAmount,method:paymentMethod as any,customerId:this.customerId});
    if(!payResult.success)return{success:false,totalAmount,errors:[payResult.error??"Lỗi thanh toán"]};
    const invoiceResult=createInvoice({buyerName:this.customerId??"Khách lẻ",items:this.cart.map(c=>({itemCode:c.sku,description:c.productName,quantity:c.quantity,unitPrice:c.unitPrice,vatRate:this.config.vatRate})),createdBy:this.config.sellerId});
    let warrantyId:string|undefined;
    if(this.customerId){const wr=registerWarranty({orderId:orderResult.transaction.id,customerId:this.customerId,productSku:this.cart[0].sku,productName:this.cart[0].productName,purchaseDate:new Date().toISOString().split("T")[0],warrantyType:"STANDARD"});warrantyId=wr.warrantyId;}
    this.cart=[];
    return{success:true,orderId:orderResult.transaction.id,transactionId:payResult.response?.transactionId,invoiceId:invoiceResult.invoice?.id,warrantyId,totalAmount,errors:[]};
  }
  clearCart():void{this.cart=[];}
  getCart():CartItem[]{return[...this.cart];}
}
