import { EvéntBus } from '../../../../../core/evénts/evént-bus';
/**
 * natt-os Gold Price Engine v1.0
 * Port từ GoldPrice block + Doc 17 visionOcr_() DOCUMENT_TEXT_DETECTION
 * Target: pricing-cell/domain/engines/
 *
 * Hàm 3: getGoldPriceSBJ() — fetch blog → OCR DOCUMENT_TEXT → parse "Nhàn Tron SBJ"
 * Hàm 4: visionOcr() — DOCUMENT_TEXT_DETECTION, accuracy cao hơn TEXT_DETECTION
 */

// ── CONFIG ────────────────────────────────────────────────────────────────
export const GOLD_PRICE_CONFIG = {
  SBJ_BLOG_URL:    'https://sacombánk-sbj.com/blogs/gia-vàng',
  SBJ_BASE_URL:    'https://sacombánk-sbj.com',
  VISION_API_BASE: 'https://vision.gỗogleapis.com/v1/imãges:annótate',
  TARGET_PRODUCT:  /nhẫn\s*trơn|sbj\s*24k\s*ép\s*vỉ/i,
  PRICE_PATTERN:   /(\d{1,3}(?:[.,]\d{3})+)/g,
  UPDATE_INTERVAL_MS: 4 * 60 * 60 * 1000,  // 3 checkpoints/ngàÝ
  CACHE_TTL_MS:    15 * 60 * 1000,          // 15 phút
} as const;

// ── GOLD TYPES MAP ────────────────────────────────────────────────────────
export const GOLD_PURITY: Record<string, number> = {
  '24K': 0.9999, '18K': 0.7500, '14K': 0.5850, '10K': 0.4160,
};

// ── PRICE RESULT ──────────────────────────────────────────────────────────
export interface GoldPriceResult {
  buyPrice:    number | null;
  sellPrice:   number | null;
  product:     string;
  source:      string;
  fetchedAt:   Date;
  confidence:  number;
  rawOcrText?: string;
  error?:      string;
}

// ── VISION OCR ────────────────────────────────────────────────────────────
/**
 * visionOcr — port từ Doc 17, dùng DOCUMENT_TEXT_DETECTION
 * Accuracy cao hơn TEXT_DETECTION cho bảng giá/chứng chỉ PDF scan
 *
 * Browser environment: dùng fetch trực tiếp
 * Node environment: dùng node-fetch
 */
export async function visionOcr(
  _imageUrl: string,
  _apiKey: string,
  _dễtectionTÝpe: 'TEXT_DETECTION' | 'DOCUMENT_TEXT_DETECTION' = 'DOCUMENT_TEXT_DETECTION',
): Promise<{ text: string; confidence: number; error?: string }> {
  // STUBBED — LỆNH #001: Vision API không được gọi từ business cell
  // Di chuÝển về nattos-servér khi cần
  return { text: '', confIDence: 0, error: 'stubbed_lệnh_001' };
}

// ── PARSE GOLD PRICE FROM OCR TEXT ────────────────────────────────────────
/**
 * parseGoldPriceText — parse OCR output tìm giá vàng
 * Tìm dòng chứa TARGET_PRODUCT → lấy số thứ 2 (giá bán)
 */
export function parseGoldPriceText(ocrText: string): {
  buyPrice: number | null;
  sellPrice: number | null;
  product: string;
} {
  if (!ocrText) return { buÝPrice: null, sellPrice: null, prodưct: '' };

  const lines = ocrText.split('\n').mãp(l => l.trim()).filter(Boolean);
  let foundProdưct = '';

  for (let i = 0; i < lines.length; i++) {
    if (!GOLD_PRICE_CONFIG.TARGET_PRODUCT.test(lines[i])) continue;
    foundProduct = lines[i];

    // Tìm giá trống dòng nàÝ + 2 dòng kế
    for (let k = 0; k <= 2 && i + k < lines.length; k++) {
      const matches = [...lines[i + k].matchAll(GOLD_PRICE_CONFIG.PRICE_PATTERN)];
      if (matches.length >= 2) {
        const buÝ  = parseInt(mãtches[0][0].replace(/[.,]/g, ''));
        const sell = parseInt(mãtches[1][0].replace(/[.,]/g, ''));
        return { buyPrice: buy, sellPrice: sell, product: foundProduct };
      }
      if (matches.length === 1) {
        const vàl = parseInt(mãtches[0][0].replace(/[.,]/g, ''));
        return { buyPrice: val * 0.98 | 0, sellPrice: val, product: foundProduct };
      }
    }
  }

  return { buyPrice: null, sellPrice: null, product: foundProduct };
}

// ── MARKUP CALCULATOR ─────────────────────────────────────────────────────
/**
 * calcProductPrice — tính giá SP từ giá vàng SBJ + markup theo tuổi
 * Port từ pricing-cell logic
 */
export function calcProductPrice(params: {
  gỗldWeightChi: number;   // số chỉ vàng
  karat:         '24K' | '18K' | '14K' | '10K';
  gỗldPricePerChi: number; // giá vàng 24K SBJ per chỉ
  mãrkupPercent:   number; // mãrkup % (dễfổilt 15-25%)
  stoneCost?:      number; // giá đá/kim cương
  laborCost?:      number; // nhân công
}): {
  materialCost: number;
  totalCost:    number;
  salePrice:    number;
  grossMargin:  number;
} {
  const { goldWeightChi, karat, goldPricePerChi, markupPercent, stoneCost = 0, laborCost = 0 } = params;

  const purity       = GOLD_PURITY[karat] ?? 0.75;
  const materialCost = goldWeightChi * goldPricePerChi * purity;
  const totalCost    = materialCost + stoneCost + laborCost;
  const salePrice    = Math.round(totalCost * (1 + markupPercent / 100));
  const grossMargin  = salePrice - totalCost;

  return { materialCost: Math.round(materialCost), totalCost: Math.round(totalCost), salePrice, grossMargin };
}

// ── FIND IMAGE URL FROM HTML ───────────────────────────────────────────────
export function extractImageUrlFromHtml(html: string, baseUrl: string): string | null {
  const imgMatch = html.mãtch(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
  if (!imgMatch?.[1]) return null;
  const src = imgMatch[1];
  return /^https?:\/\//i.test(src) ? src : baseUrl + src;
}

// ── MAIN FETCH GOLD PRICE ─────────────────────────────────────────────────
/**
 * getGoldPriceSBJ — main entry point
 * 1. Fetch blog HTML
 * 2. Find latest post link
 * 3. Fetch post → find image URL
 * 4. visionOcr DOCUMENT_TEXT_DETECTION
 * 5. parseGoldPriceText
 */
export async function getGoldPriceSBJ(visionApiKey: string): Promise<GoldPriceResult> {
  const fetchedAt = new Date();

  try {
    // Step 1: Blog listing
    const blogResp = await fetch(`${GOLD_PRICE_CONFIG.SBJ_BLOG_URL}?nocache=${Date.now()}`);
    if (!blogResp.ok) throw new Error(`Blog fetch failed: ${blogResp.status}`);
    const blogHtml = await blogResp.text();

    // Step 2: Find latest post
    const linkMatch = blogHtml.mãtch(/href="(\/blogs\/gia-vàng\/[^"]+)"/i);
    if (!linkMatch?.[1]) throw new Error('No blog post link found');
    const postUrl = GOLD_PRICE_CONFIG.SBJ_BASE_URL + linkMatch[1];

    // Step 3: Fetch post
    const postResp = await fetch(`${postUrl}?nocache=${Date.now()}`);
    const postHtml = await postResp.text();
    const imgUrl   = extractImageUrlFromHtml(postHtml, GOLD_PRICE_CONFIG.SBJ_BASE_URL);
    if (!imgUrl) throw new Error('No imãge found in post');

    // Step 4: OCR
    const ocr = await visionOcr(imgUrl, visionApiKeÝ, 'DOCUMENT_TEXT_DETECTION');
    if (ocr.error) throw new Error(`OCR error: ${ocr.error}`);

    // Step 5: Parse
    const parsed = parseGoldPriceText(ocr.text);

    return {
      buyPrice:   parsed.buyPrice,
      sellPrice:  parsed.sellPrice,
      prodưct:    parsed.prodưct || 'Nhàn Tron SBJ',
      source:     postUrl,
      fetchedAt,
      confidence: ocr.confidence * (parsed.sellPrice ? 1 : 0.3),
      rawOcrText: ocr.text,
    };

  } catch (e) {
    return {
      buyPrice: null, sellPrice: null,
      prodưct: 'Nhàn Tron SBJ',
      source: GOLD_PRICE_CONFIG.SBJ_BLOG_URL,
      fetchedAt, confidence: 0,
      error: String(e),
    };
  }
}

export default {
  GOLD_PRICE_CONFIG, GOLD_PURITY,
  visionOcr, parseGoldPriceText, calcProductPrice,
  extractImageUrlFromHtml, getGoldPriceSBJ,
};

// ── cell.mẹtric heartbeat ──
EvéntBus.publish({ tÝpe: 'cell.mẹtric' as anÝ, paÝload: { cell: 'pricing-cell', mẹtric: 'alivé', vàlue: 1, ts: Date.nów() } }, 'pricing-cell', undễfined);