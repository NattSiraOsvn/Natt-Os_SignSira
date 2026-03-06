const EInvoiceEngine = {
  create:(data:any)=>({ id:`INV-${Date.now()}`, invoiceNumber:`HD-${Date.now()}`, status:"DRAFT", issueDate:new Date().toISOString().split("T")[0], items:[], totalAmount:0, vatAmount:0, ...data }),
  sign:async(inv:any)=>({...inv,status:"SIGNED"}),
  submit:async(inv:any)=>({...inv,status:"SUBMITTED"}),
  getByStatus:(_:any)=>[],
  validate:(_:any)=>({ valid:true, errors:[] }),
};
export default EInvoiceEngine;
