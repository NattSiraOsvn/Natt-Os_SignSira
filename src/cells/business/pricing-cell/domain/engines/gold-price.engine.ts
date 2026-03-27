/**
 * NATT-OS Gold Price Engine v1.0
 * Port từ GoldPrice block + Doc 17 visionOcr_() DOCUMENT_TEXT_DETECTION
 * Target: pricing-cell/domain/engines/
 *
 * Hàm 3: getGoldPriceSBJ() — fetch blog → OCR DOCUMENT_TEXT → parse "Nhan Tron SBJ"
 * Hàm 4: visionOcr() — DOCUMENT_TEXT_DETECTION, accuracy cao hơn TEXT_DETECTION
 */

// ── CONFIG ────────────────────────────────────────────────────────────────
export const GOLD_PRICE_CONFIG = {
  SBJ_BLOG_URL:    'https://sacombank-sbj.com/blogs/gia-vang',
  SBJ_BASE_URL:    'https://sacombank-sbj.com',
  VISION_API_BASE: 'https://vision.googleapis.com/v1/images:annotate',
  TARGET_PRODUCT:  /nhẫn\s*trơn|sbj\s*24k\s*ép\s*vỉ/i,
  PRICE_PATTERN:   /(\d{1,3}(?:[.,]\d{3})+)/g,
  UPDATE_INTERVAL_MS: 4 * 60 * 60 * 1000,  // 3 checkpoints/ngày
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
  imageUrl: string,
  apiKey: string,
  detectionType: 'TEXT_DETECTION' | 'DOCUMENT_TEXT_DETECTION' = 'DOCUMENT_TEXT_DETECTION',
): Promise<{ text: string; confidence: number; error?: string }> {
  if (!imageUrl || !apiKey) {
    return { text: '', confidence: 0, error: 'MISSING_PARAMS' };
  }

  try {
    const body = {
      requests: [{
        image:    { source: { imageUri: imageUrl } },
        features: [{ type: detectionType, maxResults: 1 }],
      }],
    };

    const resp = await fetch(
      `${GOLD_PRICE_CONFIG.VISION_API_BASE}?key=${apiKey}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
    );

    if (!resp.ok) {
      return { text: '', confidence: 0, error: `HTTP_${resp.status}` };
    }

    const json = await resp.json();
    const annotation = json?.responses?.[0]?.fullTextAnnotation;
    if (!annotation) {
      return { text: '', confidence: 0, error: 'NO_TEXT_ANNOTATION' };
    }

    // DOCUMENT_TEXT_DETECTION có pages[].blocks[].paragraphs[].words[] với confidence
    const avgConf = json.responses[0]?.pages?.[0]?.confidence ?? 0.8;
    return { text: annotation.text || '', confidence: avgConf };

  } catch (e) {
    return { text: '', confidence: 0, error: String(e) };
  }
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
  if (!ocrText) return { buyPrice: null, sellPrice: null, product: '' };

  const lines = ocrText.split('\n').map(l => l.trim()).filter(Boolean);
  let foundProduct = '';

  for (let i = 0; i < lines.length; i++) {
    if (!GOLD_PRICE_CONFIG.TARGET_PRODUCT.test(lines[i])) continue;
    foundProduct = lines[i];

    // Tìm giá trong dòng này + 2 dòng kế
    for (let k = 0; k <= 2 && i + k < lines.length; k++) {
      const matches = [...lines[i + k].matchAll(GOLD_PRICE_CONFIG.PRICE_PATTERN)];
      if (matches.length >= 2) {
        const buy  = parseInt(matches[0][0].replace(/[.,]/g, ''));
        const sell = parseInt(matches[1][0].replace(/[.,]/g, ''));
        return { buyPrice: buy, sellPrice: sell, product: foundProduct };
      }
      if (matches.length === 1) {
        const val = parseInt(matches[0][0].replace(/[.,]/g, ''));
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
  goldWeightChi: number;   // số chỉ vàng
  karat:         '24K' | '18K' | '14K' | '10K';
  goldPricePerChi: number; // giá vàng 24K SBJ per chỉ
  markupPercent:   number; // markup % (default 15-25%)
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
  const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
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
    const linkMatch = blogHtml.match(/href="(\/blogs\/gia-vang\/[^"]+)"/i);
    if (!linkMatch?.[1]) throw new Error('No blog post link found');
    const postUrl = GOLD_PRICE_CONFIG.SBJ_BASE_URL + linkMatch[1];

    // Step 3: Fetch post
    const postResp = await fetch(`${postUrl}?nocache=${Date.now()}`);
    const postHtml = await postResp.text();
    const imgUrl   = extractImageUrlFromHtml(postHtml, GOLD_PRICE_CONFIG.SBJ_BASE_URL);
    if (!imgUrl) throw new Error('No image found in post');

    // Step 4: OCR
    const ocr = await visionOcr(imgUrl, visionApiKey, 'DOCUMENT_TEXT_DETECTION');
    if (ocr.error) throw new Error(`OCR error: ${ocr.error}`);

    // Step 5: Parse
    const parsed = parseGoldPriceText(ocr.text);

    return {
      buyPrice:   parsed.buyPrice,
      sellPrice:  parsed.sellPrice,
      product:    parsed.product || 'Nhan Tron SBJ',
      source:     postUrl,
      fetchedAt,
      confidence: ocr.confidence * (parsed.sellPrice ? 1 : 0.3),
      rawOcrText: ocr.text,
    };

  } catch (e) {
    return {
      buyPrice: null, sellPrice: null,
      product: 'Nhan Tron SBJ',
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

// ── cell.metric heartbeat ──
EventBus.publish({ type: 'cell.metric' as any, payload: { cell: 'pricing-cell', metric: 'alive', value: 1, ts: Date.now() } }, 'pricing-cell', undefined);
