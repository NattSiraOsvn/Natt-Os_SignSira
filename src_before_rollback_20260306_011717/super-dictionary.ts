
// ... (Giữ nguyên các enums trước đó)

export const SUPER_DICTIONARY = deepFreeze({
  meta: {
    name: "Tâm Luxury Enterprise Edition - Mega Ultimate",
    version: "2025.V10.1 CRP-Patch",
    scale_capacity: "Unlimited (Cloud-Native)",
    updated: new Date().toISOString()
  },
  conflict_resolution_rules: {
    SALES: { dataType: 'SALES_ORDER', threshold: 0.2, defaultMethod: 'priority_based', fallbackMethod: 'timestamp_based' },
    INVENTORY: { dataType: 'STOCK_LEVEL', threshold: 0.1, defaultMethod: 'priority_based', fallbackMethod: 'manual_review' },
    FINANCE: { dataType: 'ACCOUNTING_ENTRY', threshold: 0.05, defaultMethod: 'manual_review', fallbackMethod: 'priority_based' }
  },
  document_definitions: {
    HOA_DON: { label: "Hóa đơn điện tử / Chứng từ mua bán", keywords: ["HOA DON","INVOICE","BILL","VAT","GTGT","PHIEU THU","E-INVOICE","01GTKT"], actions: ["Bóc tách thuế GTGT","Mapping SKU Master","Xác thực chữ ký số"] },
    SAO_KE: { label: "Sao kê ngân hàng / Sổ phụ", keywords: ["SAO KE","STATEMENT","GIAO DICH","TRANSACTION","BANK","SO PHU"], actions: ["Phân loại dòng tiền WAC","Đối soát công nợ","Phát hiện rủi ro thuế"] },
    TO_KHAI: { label: "Tờ khai hải quan / XNK", keywords: ["TO KHAI","DECLARATION","CUSTOMS","HQ","NHAP KHAU","XUAT KHAU","A11","B11","THONG QUAN"], actions: ["Kiểm tra mã HS Code","Tính thuế nhập khẩu","Phân luồng kiểm hóa"] },
    VAN_DON: { label: "Vận đơn / Bill of Lading", keywords: ["BILL OF LADING","AIR WAYBILL","VAN DON","AWB","HBL","MBL"], actions: ["Tra cứu hành trình","Đối soát phí vận chuyển"] },
    PACKING_LIST: { label: "Phiếu đóng gói / Packing List", keywords: ["PACKING LIST","PHIEU DONG GOI","NET WEIGHT","GROSS WEIGHT","CBM"], actions: ["Kiểm tra quy cách","Đối chiếu trọng lượng"] },
    CO: { label: "Chứng nhận xuất xứ / C/O", keywords: ["CERTIFICATE OF ORIGIN","C/O","XUAT XU","FORM E","FORM D"], actions: ["Xác định ưu đãi thuế","Kiểm tra tính hợp lệ"] },
    PHIEU_KIEM_DINH: { label: "Phiếu Kiểm Định Đá Quý", keywords: ["GIA REPORT","GEMOLOGICAL","KIEM DINH","CERTIFICATE","CLARITY","COLOR GRADE"], actions: ["Map thông số 4C","Cập nhật giá trị tài sản","Lưu trữ Vault"] },
    LENH_SAN_XUAT: { label: "Lệnh Sản Xuất / Job Bag", keywords: ["LENH SAN XUAT","PRODUCTION ORDER","JOB BAG","CASTING","THO KIM HOAN"], actions: ["Tạo Job ID","Gán thợ","Tính định mức vàng"] },
    BAO_CAO_KHO: { label: "Báo Cáo Tồn Kho / Inventory", keywords: ["TON KHO","INVENTORY","STOCK REPORT","XUAT NHAP TON","KIEM KE"], actions: ["Đối soát số lượng","Cảnh báo Min/Max"] },
    HOP_DONG: { label: "Hợp đồng / Văn bản pháp lý", keywords: ["HOP DONG","CONTRACT","AGREEMENT","KY KET","MEMORANDUM"], actions: ["Rà soát điều khoản","Theo dõi thời hạn"] },
    QUY_TRINH: { label: "Quy trình vận hành / SOP", keywords: ["QUY TRINH","PROTOCOL","SOP","HUONG DAN","GUIDELINE"], actions: ["Xây dựng Daily Active Protocol","Thiết lập KPI"] }
  },
  business_units: {
    PRODUCTION: { sheets: ["SẢN XUẤT","CHẾ TÁC","XƯỞNG","DAILY_REPORT","PRODUCTION","JOB_BAG"] },
    SALES: { sheets: ["BÁN HÀNG","SALES","REVENUE","DOANH THU","POS"] },
    LOGISTICS: { sheets: ["XUẤT NHẬP KHẨU","CUSTOMS","KHO","INVENTORY","PACKING","SHIPPING"] }
  },
  priority_logic: ["document_definitions","certification_authority","sku_master","signatures","business_units","headers","fields"],
  module_mapping: {
    MODULE_2: ["WAREHOUSE","KHO","KPD","KNL","KTP","STOCK","ASSET"],
    MODULE_3: ["THỢ","NGUỘI","HỘT","NHÁM","XI","CHẾ TÁC","SẢN XUẤT"],
    MODULE_4: ["CHÊNH GRAM","TRỌNG LƯỢNG","LOSS","HAO HỤT"],
    MODULE_5: ["ĐẠT","KHÔNG ĐẠT","LỖI","QC","KCS"],
    MODULE_6: ["SỬA","BẢO HÀNH","FIX","REPAIR"],
    MODULE_7: ["PHÔI","BỤI","THU HỒI","PHÂN KIM","TI"],
    MODULE_8: ["GIÁ","CHI PHÍ","AMOUNT","COST","THÀNH TIỀN"],
    MODULE_9: ["TỔNG HỢP","KPI","REPORT","DASHBOARD"]
  },
  language_packs: {
    VI: { headers: { packlist: "PACKING LIST", invoice: "COMMERCIAL INVOICE", seller: "NGƯỜI BÁN (XUẤT KHẨU):", buyer: "NGƯỜI MUA (NHẬP KHẨU):", total: "TỔNG CỘNG:" } }
  },
  tax_authority: {
    invoice_forms: ["01GTKT0/001","02GTTT0/001"],
    series_format: "1C25TLL",
    xml_standard: "TCT-XML-v2.0",
    tax_rates: [0, 5, 8, 10],
    submission_gateways: ["VNPT-INV","MISA-MEINVOICE","VIETTEL-SINVOICE"]
  },
  certification_authority: {
    INTERNATIONAL: [
      { id: 'GIA', name: 'Viện Đá Quý Hoa Kỳ | GIA', pattern: "GIA\\s*(\\d{7,12})", color: '#3b82f6' },
      { id: 'IGI', name: 'Viện Kiểm Định Quốc Tế | IGI', pattern: "IGI\\s*(\\d{7,12})", color: '#ef4444' },
      { id: 'HRD', name: 'Hội Đồng Kim Cương | HRD', pattern: "HRD\\s*(\\d{7,12})", color: '#10b981' },
      { id: 'GRS', name: 'Lab Nghiên Cứu Thụy Sĩ | GRS', pattern: "GRS\\d{4}-\\d{6}", color: '#6366f1' }
    ],
    INTERNAL: { prefix: "TL-", structure: "TL-[LOẠI]-[NĂM][ID]", types: { D: "KIM CƯƠNG | DIAMOND", G: "VÀNG | GOLD", S: "XAPHIA | SAPPHIRE", E: "LỤC BẢO | EMERALD", R: "HỒNG NGỌC | RUBY" } }
  },
  sku_master: [
    { prefix: "NNA#", name: "Nhẫn Nam" }, { prefix: "NNU#", name: "Nhẫn Nữ" },
    { prefix: "BT#", name: "Bông Tai" }, { prefix: "VT#", name: "Vòng Tay" },
    { prefix: "NC#", name: "Nhẫn Cưới" }, { prefix: "LT#", name: "Lắc Tay" },
    { prefix: "MD#", name: "Mặt Dây" }
  ],
  signatures: {
    SALES: { keywords: ["DOANH THU","BÁN HÀNG","BILL","HÓA ĐƠN","POS"], patterns: { invoice: "INV-\\d+", receipt: "HD\\d+" }, actions: ["Tích hợp CRM","Tính hoa hồng"] },
    PRODUCTION: { keywords: ["SẢN XUẤT","THỢ","NGUỘI","XI MẠ","PHÔI"], patterns: { job: "JOB-\\d+", worker: "NV-\\d+" }, actions: ["Tính hao hụt","Cập nhật BTP"] }
  },
  headers: {
    SKU: ["MÃ SP","PRODUCT CODE","SKU","MÃ HÀNG","MODEL"],
    PRICE: ["GIÁ","HTC","AMOUNT","THÀNH TIỀN","GIÁ BÁN"],
    CUSTOMER: ["KHÁCH HÀNG","CUSTOMER","TÊN KHÁCH","NGƯỜI MUA"],
    PHONE: ["SĐT","PHONE","DI ĐỘNG","SỐ ĐIỆN THOẠI"],
    WORKER: ["THỢ","WORKER","NHÂN VIÊN THỰC HIỆN","KỸ THUẬT"]
  }
});

export const SUPER_DICTIONARY_CONTROL = {
  ai_permission: "READ_ONLY",
  sync_interval: 5000,
  max_retry: 3
};

function deepFreeze<T>(obj: T): T {
  const propNames = Object.getOwnPropertyNames(obj);
  for (const name of propNames) {
    const value = (obj as any)[name];
    if (value && typeof value === "object") deepFreeze(value);
  }
  return Object.freeze(obj);
}

export interface BusinessTerm {
  code: string;
  name: string;
  description: string;
  category: string;
  synonyms?: string[];
  relatedTerms?: string[];
  metadata?: any;
}

export class SuperDictionary {
  private static instance: SuperDictionary;
  private dictionary: Map<string, BusinessTerm> = new Map();
  readonly version: string = SUPER_DICTIONARY.meta.version;
  readonly lastSync: number = Date.now();

  private constructor() { this.initDictionary(); }

  static getInstance(): SuperDictionary {
    if (!SuperDictionary.instance) SuperDictionary.instance = new SuperDictionary();
    return SuperDictionary.instance;
  }

  private initDictionary(): void {
    Object.entries(SUPER_DICTIONARY.document_definitions).forEach(([key, val]) => {
      this.addTerm({ code: key, name: val.label, description: `Loại tài liệu ${key}`, category: 'DOCUMENT_TYPE', synonyms: val.keywords as string[], metadata: { actions: val.actions } });
    });
    SUPER_DICTIONARY.certification_authority.INTERNATIONAL.forEach(cert => {
      this.addTerm({ code: cert.id, name: cert.name, description: `Tổ chức kiểm định ${cert.id}`, category: 'CERTIFICATION', synonyms: [cert.id], metadata: { pattern: cert.pattern, color: cert.color } });
    });
  }

  addTerm(term: BusinessTerm): void { this.dictionary.set(term.code, term); }
  getTerm(code: string): BusinessTerm | undefined { return this.dictionary.get(code); }
  searchTerm(query: string): BusinessTerm[] {
    const q = query.toLowerCase();
    return Array.from(this.dictionary.values()).filter(t =>
      t.name.toLowerCase().includes(q) || t.code.toLowerCase().includes(q) ||
      t.synonyms?.some(s => s.toLowerCase().includes(q))
    );
  }
  exportDictionary(): BusinessTerm[] { return Array.from(this.dictionary.values()); }
  getVersion(): string { return this.version; }
}

export default SuperDictionary.getInstance();
