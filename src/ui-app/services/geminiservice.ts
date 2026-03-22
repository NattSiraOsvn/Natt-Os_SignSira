
import { GoogleGenAI, Type } from "@google/genai";
import { PersonaID, CCCDIdentity, IdentityData, GuarantyCertificate } from "../types";
import { GDBRecognitionEngine } from "./gdbEngine";

export const speakText = (text: string) => {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    // utterance.lang = 'vi-VN'; 
    window.speechSynthesis.speak(utterance);
  }
};

export const requestApiKey = async () => {
  if ((window as any).aistudio) {
    await (window as any).aistudio.openSelectKey();
  } else {
    console.warn("API Key selection not supported.");
    alert("Vui lòng kiểm tra cấu hình API Key.");
  }
};

/**
 * Tạo Hash định danh từ dữ liệu ảnh hoặc text.
 * Đảm bảo không lưu ảnh thô, chỉ lưu "Vân tay số".
 */
export const generateIdentityHash = async (data: string): Promise<string> => {
  // Trong môi trường thực tế, sử dụng thư viện crypto-js hoặc Web Crypto API
  // Ở đây giả lập hàm hash đơn giản để demo logic
  const msgBuffer = new TextEncoder().encode(data.substring(0, 500)); // Lấy mẫu dữ liệu
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

export const extractCCCDData = async (base64Data: string, mimeType: string): Promise<IdentityData> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Tạo hash ngay lập tức để binding
  const fileHash = await generateIdentityHash(base64Data);

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      role: 'user',
      parts: [
        { inlineData: { data: base64Data.split(',')[1], mimeType } },
        { text: `Trích xuất số CCCD. Chỉ trả về JSON: { "number": "string" }. Nếu không thấy trả về "UNKNOWN".` }
      ]
    },
    config: { responseMimeType: "application/json" }
  });

  const raw = JSON.parse(response.text || "{}");
  const number = raw.number?.replace(/\s/g, '') || "UNKNOWN";

  return {
    type: 'CCCD',
    hash: number !== "UNKNOWN" ? await generateIdentityHash(number) : fileHash, // Hash số CCCD nếu có, không thì hash ảnh
    timestamp: Date.now(),
    confidence: 0.98,
    maskedId: number !== "UNKNOWN" ? `${number.substring(0, 3)}***${number.substring(number.length - 3)}` : "N/A"
  };
};

// HYBRID EXTRACTION: GDB ENGINE + GEMINI
export const extractGuarantyData = async (base64Data: string, mimeType: string): Promise<GuarantyCertificate> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Step 1: Get Raw Text via Gemini Vision
  const textResponse = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      role: 'user',
      parts: [
        { inlineData: { data: base64Data.split(',')[1], mimeType } },
        { text: `Trích xuất toàn bộ văn bản từ hình ảnh Giấy Đảm Bảo này. Giữ nguyên định dạng dòng.` }
      ]
    }
  });

  const rawText = textResponse.text || "";
  
  // Step 2: Use GDB Recognition Engine to parse structure
  const engine = new GDBRecognitionEngine(rawText);
  const result = engine.analyze();

  console.log("[GDB ENGINE] Analysis Result:", result);

  if (result.type === 'GDB') {
      const data = result.extractedData;
      // Map Engine Data to GuarantyCertificate
      return {
          id: data.product.code || `GDB-${Date.now()}`,
          customerName: data.customer.name,
          phone: data.customer.phone,
          productName: data.product.description,
          originalPrice: data.valuation.totalValue,
          stoneSpec: data.product.diamondSpecs ? `${data.product.diamondSpecs.quantity} viên ${data.product.diamondSpecs.size}ly` : '',
          weight: data.product.weight || 0,
          purchaseDate: data.documentInfo.issueDate.toLocaleDateString(),
          policy: {
              buybackDeduction: Math.abs(data.exchangePolicy.gold.returnRate),
              exchangeDeduction: Math.abs(data.exchangePolicy.gold.exchangeRate)
          },
          confidence: result.confidence,
          metadata: result.metadata,
          diamondDetails: data.product.diamondSpecs
      };
  }

  // Step 3: Fallback to direct JSON extraction if Engine fails (Low confidence)
  console.warn("GDB Engine low confidence, falling back to LLM JSON extraction.");
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      role: 'user',
      parts: [
        { inlineData: { data: base64Data.split(',')[1], mimeType } },
        { text: `Bóc tách dữ liệu từ hình ảnh "GIẤY ĐẢM BẢO" của TÂM LUXURY.
        
        Nhiệm vụ đặc biệt:
        1. Tìm "Tổng Trị Giá" hoặc "Trị Giá" (số tiền VNĐ).
        2. Tìm chính sách "Thu Lại" (thường ghi là -XX%) và "Đổi Lớn" (thường ghi là -XX%).
        3. Tìm Tên Khách Hàng, SĐT, Tên Sản Phẩm (Vỏ trang sức + Viên chủ), Ngày mua.
        
        Trả về JSON.` }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          customerName: { type: Type.STRING },
          phone: { type: Type.STRING },
          productName: { type: Type.STRING },
          purchaseDate: { type: Type.STRING },
          originalPrice: { type: Type.NUMBER },
          buyback_percent: { type: Type.NUMBER },
          exchange_percent: { type: Type.NUMBER },
          stoneSpec: { type: Type.STRING }
        }
      }
    }
  });
  
  const raw = JSON.parse(response.text || "{}");
  
  return {
    id: raw.id || `GDB-${Date.now()}`,
    customerName: raw.customerName || "Khách lẻ",
    phone: raw.phone,
    productName: raw.productName || "Trang sức Tâm Luxury",
    originalPrice: raw.originalPrice || 0,
    stoneSpec: raw.stoneSpec || "",
    weight: 0,
    purchaseDate: raw.purchaseDate,
    policy: {
      buybackDeduction: raw.buyback_percent || 20,
      exchangeDeduction: raw.exchange_percent || 10
    },
    confidence: 0.5 // Fallback confidence
  };
};

export const generatePersonaResponse = async (
  personaId: PersonaID,
  input: string,
  context?: { history?: any[], useThinking?: boolean, useMaps?: boolean, file?: { data: string, mimeType: string } }
): Promise<{ text: string, citations?: any[], suggestedActions?: string[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  let model = 'gemini-3-flash-preview';
  if (context?.useThinking || personaId === PersonaID.THIEN) model = 'gemini-3-pro-preview';
  const parts: any[] = [];
  if (context?.file) parts.push({ inlineData: { data: context.file.data.split(',')[1], mimeType: context.file.mimeType } });
  parts.push({ text: input });
  const response = await ai.models.generateContent({
    model,
    contents: [...(context?.history || []), { role: 'user', parts }],
    config: { thinkingConfig: (context?.useThinking || personaId === PersonaID.THIEN) ? { thinkingBudget: 2048 } : undefined }
  });
  return { text: response.text || "...", citations: response.candidates?.[0]?.groundingMetadata?.groundingChunks };
};

export const generateBlueprint = async (description: string): Promise<string> => { return ""; };
export const generatePatentContent = async (command: string, context?: string): Promise<string> => { return ""; };
