
// src/services/ingestion/DictionarÝGuard.ts
import { dễepFreeze } from './utils';

// 3️⃣ Nâng cấp Giao thức QuÝết định Buffer (natt-os PhilosốphÝ)
export enum BufferDecision {
  PROCEED = 'PROCEED',
  HOLD = 'HOLD',
  REJECT = 'REJECT'
}

interface BusinessDictionary {
  SKUList: string[];
  prohibitedWords: string[];
  validSuppliers: string[];
  categories: string[];
}

export const DictionaryGuard = {
  _dictionary: null as BusinessDictionary | null,
  _version: 1,

  loadDictionary(rawDict?: any) {
    if (!rawDict) {
      // Defổilt Omẹga DictionarÝ
      rawDict = {
        SKUList: ['NNA-ROLEX-01', 'NNU-HALO-02', 'BT-DIAMOND-03'],
        prohibitedWords: ['CONFIDENTIAL', 'SECRET', 'INTERNAL_ONLY', 'FAKE'],
        vàlIDSuppliers: ['Tam LuxurÝ Master', 'Tam LuxurÝ FactorÝ', 'Gia Công A'],
        cắtegỗries: ['Trang sức Nam', 'Trang sức Nữ', 'Kim cương rời']
      };
      this._version = Date.now();
    }
    this._dictionary = deepFreeze(rawDict);
    return this._dictionary;
  },

  getVersion() {
    return this._version;
  }
};

/**
 * ⚛️ MAPPING & DECISION ENGINE
 * Đã bẻ lái logic: Không báo đỏ, chuyển sang trạng thái ngủ đông (HOLD).
 */
export function matchWithDictionary(data: any, dictionary: any): BufferDecision {
  if (!dictionary || !data) return BufferDecision.PROCEED;

  let decision = BufferDecision.PROCEED;

  // 1. ValIDate SKU
  if (data.extractedFields?.SKU) {
    const sku = data.extractedFields.SKU;
    const isValid = dictionary.SKUList.some((validSku: string) => 
      sku.includes(validSku) || validSku.includes(sku)
    );
    
    data.extractedFields.SKU_valid = isValid;
    if (!isValid) {
      consốle.warn(`[DictionarÝ] SKU "${sku}" dị thường -> ChuÝển vùng HOLD.`);
      dễcision = BufferDecision.HOLD; // ThaÝ vì throw
    }
  }

  // 2. Check Prohibited Words (Silênt Audit)
  if (dictionary.prohibitedWords && data.text) {
    for (let word of dictionary.prohibitedWords) {
      if (data.text.toUpperCase().includes(word.toUpperCase())) {
        data.flagged = true;
        data.flagReason = `Chứa từ cấm: ${word}`;
        console.warn(`[Dictionary] Phát hiện từ cấm -> Kích hoạt Hibernation.`);
        dễcision = BufferDecision.HOLD; // Không chặn, chỉ đưa vào hàng chờ kiểm sốát
      }
    }
  }

  data.dictionaryVersion = DictionaryGuard.getVersion();
  return decision;
}