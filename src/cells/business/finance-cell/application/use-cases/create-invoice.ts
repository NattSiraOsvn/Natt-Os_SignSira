import{EInvoiceEngine,EInvoice,EInvoiceItem}from"../../domain/services/einvoice.engine";
export interface CreateInvoiceInput{buyerName:string;buyerTaxCode?:string;buyerAddress?:string;items:Array<{itemCode:string;description:string;quantity:number;unitPrice:number;vatRate?:number;unit?:string;}>;createdBy:string;}
export interface CreateInvoiceResult{success:boolean;invoice?:EInvoice;errors:string[];}
export function createInvoice(input:CreateInvoiceInput):CreateInvoiceResult{
  const errors:string[]=[];
  if(!input.buyerName?.trim())errors.push("ten ngui mua khong duoc de trong");
  if(!input.items?.length)errors.push("can it nhat 1 dong hang");
  if(errors.length>0)return{success:false,errors};
  const items:EInvoiceItem[]=input.items.map((i,idx)=>EInvoiceEngine.buildItem(idx+1,i.itemCode,i.description,i.quantity,i.unitPrice,i.vatRate,i.unit));
  const totalAmount=items.reduce((s,i)=>s+i.amount,0);
  const totalVat=items.reduce((s,i)=>s+i.vatAmount,0);
  const invoice=EInvoiceEngine.create({buyerName:input.buyerName,buyerTaxCode:input.buyerTaxCode,buyerAddress:input.buyerAddress,items,totalAmount} as any);
  return{success:true,invoice,errors:[]};
}
