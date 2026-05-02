
import { BankTransaction, ValueGroup } from '@/types';

interface ClassificationResult {
  category: string;
  detail: string;
  valueGroup: ValueGroup;
  taxRate: number;
  extractedCode: string;
  color: string;
}

export class BankingEngine {
  private static COLORS = {
    THU: "#D9EAD3",
    CHI_COGS: "#F4CCCC",
    CHI_OPERATING: "#EA9999",
    THUE: "#FFF2CC",
    THUE_PENALTY: "#F1C232",
    DEFAULT: "#FFFFFF"
  };

  private static CATEGORIES: Record<string, string> = {
    DT_CK: "Doanh Thu chuyen khoan",
    DT_POS: "💳 Doanh Thu the (POS)",
    COGS_GOLD_PURCHASE: "💎 MUA vang - gia von",
    COGS_DIAMOND_PURCHASE: "💎 MUA KIM cuong - gia von",
    COGS_DIAMOND_INSPECTION: "💎 phi kiem dinh (GIA/HRD)",
    COGS_CUSTOMS: "🏛️ phi hai QUAN & thu tuc",
    TAX_VAT_IMPORT: "🏛️ thue GTGT hang nhap khau",
    TAX_PENALTY_FINE: "⚠️ tien phat hanh chinh",
    TAX_PENALTY_ADJUST: "⚠️ thue an dinh/TRUY THU",
    BANK_FEE_TRANSACTION: "🏦 phi chuyen khoan",
    HR_SALARY: "👨‍💼 tien luong nhan vien",
    INTERNAL_CASH: "🔄 nop tien mat",
    OTHER: "❓ chua phan loai"
  };

  static normalize(str: string): string {
    if (!str) return "";
    return str.toLowerCase().trim()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d");
  }

  /**
   * ROBOT LOGIC: Clean Money (Chuyển "1,500,000" -> 1500000)
   */
  static cleanMoney(val: any): number {
    if (!val) return 0;
    const str = String(val).replace(/,/g, "").trim(); 
    const num = parseFloat(str);
    return isNaN(num) ? 0 : num;
  }

  static extractCodes(text: string): string {
    if (!text) return "";
    const taxPattern = /(HCM\d{6}-\d{7}|\d{12,})/g;
    const billPattern = /(CT|HD|SO|TK|MST)[\s\-_/]*[0-9]+[A-Z0-9]*/gi;
    
    const taxMatch = text.match(taxPattern);
    if (taxMatch) return taxMatch[0].replace(/\s+/g, "");
    
    const billMatch = text.match(billPattern);
    if (billMatch) return billMatch[0].toUpperCase();
    
    return text.substring(0, 20).trim();
  }

  static classify(debit: number, credit: number, codeStr: string, desc: string): ClassificationResult {
    const code = codeStr.toUpperCase();
    const descLower = this.normalize(desc);
    const nature = credit > 0 ? "THU" : "CHI";
    
    let category = "OTHER";
    let detail = "Kris: dang cho boc tach nghiep vu...";
    let valueGroup: ValueGroup = nature === "THU" ? "THU" : "chi_van_hanh";
    let taxRate = 0;

    // 🔴 1. ƯU TIÊN MÃ GIAO DỊCH (HẢI QUAN / THUẾ) - THEO ROBOT VIETIN
    if (code.includes("10686394446") || code.includes("3350356467860001")) {
      category = "COGS_CUSTOMS";
      detail = "phi hai QUAN & thu tuc XNK";
      taxRate = 8; // Mặc định phí nhập khẩu chịu VAT
    } else if (code.includes("252010209A")) {
      category = "TAX_PENALTY_ADJUST";
      detail = "TRUY THU thue THEO qd";
    }

    // 🟡 2. ƯU TIÊN MÔ TẢ (THU SẢN PHẨM = COGS)
    if (descLower.includes("thu san pham")) {
      category = descLower.includes("vang") ? "COGS_GOLD_PURCHASE" : "COGS_DIAMOND_PURCHASE";
      detail = "THU MUA lai san pham (gia von)";
      valueGroup = "chi_gia_von";
    } else if (descLower.includes("pos") || descLower.includes("the")) {
      category = "DT_POS";
      detail = "Doanh thu quet the Merchant";
      valueGroup = "THU";
      taxRate = 10;
    } else if (descLower.includes("luong") || descLower.includes("salary")) {
      category = "HR_SALARY";
      detail = "Chi luong Shard nhan su";
      valueGroup = "chi_van_hanh";
    }

    if (category.startsWith("TAX")) valueGroup = "thue";
    if (category.startsWith("COGS")) valueGroup = "chi_gia_von";

    return {
      category: this.CATEGORIES[category] || this.CATEGORIES.OTHER,
      detail,
      valueGroup,
      taxRate,
      extractedCode: this.extractCodes(desc + " " + code),
      color: this.COLORS[valueGroup as keyof typeof this.COLORS] || this.COLORS.DEFAULT
    };
  }

  /**
   * ROBOT MAPPING 12 CỘT (VIETINBANK EFAST) -> MAPPING SANG CẤU TRÚC MỚI
   * Updated Signature: (rows, metadata)
   */
  static processRobotData(rows: any[][], metadata: { fileName: string }): BankTransaction[] {
    console.log(`[BANKING-ENGINE] Processing ${metadata.fileName} with 12-column mapping rule.`);
    
    // Robot Map Structure: 
    // [STT, Ngày hạch toán, Mô tả, Nợ, Có, Số dư, Số GD, TK Đối ứng, Tên Đối ứng, MTID, Mã định danh, Ngày phát sinh]
    return rows.map(row => {
      const debit = this.cleanMoney(row[3]);
      const credit = this.cleanMoney(row[4]);
      const amount = credit > 0 ? credit : debit;
      const intelligence = this.classify(debit, credit, String(row[6] || ""), String(row[2] || ""));
      const isCustoms = intelligence.category === "phi hai QUAN & thu tuc XNK";
      
      return {
        id: String(row[6]), // Using 'so GD' as ID
        date: String(row[1]),
        refNo: String(row[10] || `REF-${Math.floor(Math.random()*10000)}`), // Số tham chiếu
        bankName: "VietinBank", // Mặc định hoặc bóc tách từ tên đối ứng
        accountNumber: "112233445566",
        type: intelligence.category || "OTHER",
        description: String(row[2]),
        amount: amount,
        taxRate: intelligence.taxRate || 0,
        exchangeRate: isCustoms ? 25450 : 1, // Tỷ giá giả lập cho giao dịch ngoại tệ/HQ
        status: 'SYNCED',
        processDate: String(row[11]),
        attachment: isCustoms ? "tokhai_hq.pdf" : undefined,
        
        // Legacy fields for backward compatibility if needed
        debit,
        credit,
        balance: this.cleanMoney(row[5]),
        code: String(row[6]),
        tkDoiUng: String(row[7]),
        tenDoiUng: String(row[8]),
        mtid: String(row[9]),
        maDinhDanh: String(row[10]),
        account: "VIETINBANK-MAIN",
        valueGroup: intelligence.valueGroup,
        detail: intelligence.detail,
        color: intelligence.color
      };
    });
  }
}
