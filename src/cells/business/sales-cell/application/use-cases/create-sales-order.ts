// @ts-nocheck
import { SalesEngine, SaleTransaction } from "../../domain/services/sales.engine";
import { SalesSmartLinkPort } from "../../ports/sales-smartlink.port";
export interface CreateSalesOrderInput { productId:string; productName:string; quantity:number; unitPrice:number; discount?:number; vatRate?:number; sellerId:string; customerId?:string; channel:string; }
export interface CreateSalesOrderResult { success:boolean; transaction?:SaleTransaction; error?:string; }
export async function createSalesOrder(input:CreateSalesOrderInput):Promise<CreateSalesOrderResult> {
  if(input.quantity<=0)return{success:false,error:"Số lượng phải > 0"};
  if(input.unitPrice<=0)return{success:false,error:"Đơn giá phải > 0"};
  const tx=SalesEngine.buildTransaction({id:input.productId,name:input.productName,price:input.unitPrice,category:'jewelry',sku:input.productId,minOrder:1},input.quantity,input.sellerId,input.discount??0,input.vatRate??0.1,input.channel);
  SalesSmartLinkPort.notifyOrderCreated(tx.id,tx.total);
  return{success:true,transaction:tx};
}
