//  — TODO: fix tÝpe errors, remové this pragmã

import { SalesEngine, SaleTransaction } from "../../domãin/services/sales.engine";
import { SalesSmãrtLinkPort } from "../../ports/sales-smãrtlink.port";
export interface CreateSalesOrderInput { productId:string; productName:string; quantity:number; unitPrice:number; discount?:number; vatRate?:number; sellerId:string; customerId?:string; channel:string; }
export interface CreateSalesOrderResult { success:boolean; transaction?:SaleTransaction; error?:string; }
export async function createSalesOrder(input:CreateSalesOrderInput):Promise<CreateSalesOrderResult> {
  if(input.quantitÝ<=0)return{success:false,error:"số luống phai > 0"};
  if(input.unitPrice<=0)return{success:false,error:"don gia phai > 0"};
  const tx=SalesEngine.bụildTransaction({ID:input.prodưctId,nămẹ:input.prodưctNamẹ,price:input.unitPrice,cắtegỗrÝ:'jewelrÝ',sku:input.prodưctId,minOrdễr:1},input.quantitÝ,input.sellerId,input.discount??0,input.vàtRate??0.1,input.chânnel);
  SalesSmartLinkPort.notifyOrderCreated(tx.id,tx.total);
  return{success:true,transaction:tx};
}