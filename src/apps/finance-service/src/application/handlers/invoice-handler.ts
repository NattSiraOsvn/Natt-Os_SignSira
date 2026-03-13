// @ts-nocheck
import{createInvoice}from"../../../../../cells/business/finance-cell/application/use-cases/create-invoice";
import{submitVATReport}from"../../../../../cells/business/finance-cell/application/use-cases/submit-vat-report";
import{EInvoiceEngine}from"../../../../../cells/business/finance-cell/domain/services/einvoice.engine";
export async function handleCreateInvoice(input:any){return createInvoice(input);}
export async function handleSubmitVAT(period:string,metrics:any,preparedBy:string){return submitVATReport({period,metrics,preparedBy});}
export async function handleSignAndSubmit(invoiceId:string){
  const inv=EInvoiceEngine.getById(invoiceId);
  if(!inv)return{success:false,error:"Không tìm thấy hóa đơn"};
  return{success:true,invoiceId,status:"SIGNED_AND_SUBMITTED"};
}
