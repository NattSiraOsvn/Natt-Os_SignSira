export type EInvoiceStatus = "DRAFT" | "SIGNED" | "SUBMITTED" | "ACCEPTED" | "REJECTED" | "CANCELLED";

export interface EInvoiceItem {
  lineNo: number;
  itemCode: string;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  amount: number;
  vatRate: number;
  vatAmount: number;
}

export interface EInvoice {
  id: string;
  invoiceNumber: string;
  invoiceSeries: string;
  issueDate: string;
  status: EInvoiceStatus;
  sellerTaxCode: string;
  sellerName: string;
  buyerTaxCode?: string;
  buyerName: string;
  buyerAddress?: string;
  items: EInvoiceItem[];
  totalAmount: number;
  vatAmount: number;
  grandTotal: number;
  currency: string;
  signedAt?: number;
  submittedAt?: number;
  lookupCode?: string;
}

const _invoices: EInvoice[] = [];
let _sequence = 1;

export const EInvoiceEngine = {
  create: (data: Partial<EInvoice>): EInvoice => {
    const inv: EInvoice = {
      id: `INV-${Date.now()}`,
      invoiceNumber: String(_sequence++).padStart(7, "0"),
      invoiceSeries: "AA/25E",
      issueDate: new Date().toISOString().split("T")[0],
      status: "DRAFT",
      sellerTaxCode: "0314758xxx",
      sellerName: "Tâm Luxury",
      buyerName: "",
      items: [],
      totalAmount: 0,
      vatAmount: 0,
      grandTotal: 0,
      currency: "VND",
      ...data,
    };
    // Auto-calculate totals
    if (inv.items.length) {
      inv.totalAmount = inv.items.reduce((s, i) => s + i.amount, 0);
      inv.vatAmount = inv.items.reduce((s, i) => s + i.vatAmount, 0);
      inv.grandTotal = inv.totalAmount + inv.vatAmount;
    }
    _invoices.push(inv);
    return inv;
  },

  sign: async (id: string): Promise<EInvoice | null> => {
    const inv = _invoices.find(i => i.id === id);
    if (!inv || inv.status !== "DRAFT") return null;
    inv.status = "SIGNED";
    inv.signedAt = Date.now();
    return inv;
  },

  submit: async (id: string): Promise<EInvoice | null> => {
    const inv = _invoices.find(i => i.id === id);
    if (!inv || inv.status !== "SIGNED") return null;
    inv.status = "SUBMITTED";
    inv.submittedAt = Date.now();
    inv.lookupCode = `TAX-${Date.now()}`;
    return inv;
  },

  cancel: async (id: string): Promise<boolean> => {
    const inv = _invoices.find(i => i.id === id);
    if (!inv || inv.status === "CANCELLED") return false;
    inv.status = "CANCELLED";
    return true;
  },

  getById: (id: string): EInvoice | null => _invoices.find(i => i.id === id) ?? null,
  getByStatus: (status: EInvoiceStatus): EInvoice[] => _invoices.filter(i => i.status === status),
  getAll: (): EInvoice[] => [..._invoices],

  buildItem: (
    lineNo: number, itemCode: string, description: string,
    quantity: number, unitPrice: number, vatRate = 0.1, unit = "Cái"
  ): EInvoiceItem => {
    const amount = quantity * unitPrice;
    return { lineNo, itemCode, description, unit, quantity, unitPrice, discount: 0, amount, vatRate, vatAmount: amount * vatRate };
  },
};

(EInvoiceEngine as any).generateXML = (inv:any):string => `<?xml version="1.0"?><invoice id="${inv?.id??''}"/>`;
(EInvoiceEngine as any).signInvoice = async(inv:any):Promise<any> => ({...inv,status:"SIGNED",signatureHash:`SIG-${Date.now()}`});
(EInvoiceEngine as any).transmitToTaxAuthority = async(inv:any):Promise<any> => ({...inv,status:"SUBMITTED",lookupCode:`LOOK-${Date.now()}`});
export default EInvoiceEngine;
