export * from '@/cells/business/finance-cell/domain/services/einvoice.engine';
import { EInvoiceEngine as _E } from '@/cells/business/finance-cell/domain/services/einvoice.engine';
export const EInvoiceEngine = {
  ..._E,
  generateXML:(inv:any):string=>`<?xml version="1.0"?><invoice id="${inv?.id??''}"/>`,
  signInvoice:async(inv:any):Promise<any>=>({...inv,status:"SIGNED",signatureHash:`SIG-${Date.now()}`}),
  transmitToTaxAuthority:async(inv:any):Promise<any>=>({...inv,status:"SUBMITTED",lookupCode:`LOOK-${Date.now()}`}),
};
export default EInvoiceEngine;
