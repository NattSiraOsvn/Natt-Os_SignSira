/**
 * Natt-OS Diamond Normalize Engine v1.0
 * Port từ Doc 6 — diamondNormalizeV2() + tinhHoaHong()
 * Target: inventory-cell/domain/engines/
 *
 * Hàm 1: diamondNormalizeV2() — parse raw text → structured diamond record
 * Hàm 2: tinhHoaHong() — commission rate vo + vien, adjust theo doi hang
 */

// ── DIAMOND SPECS ─────────────────────────────────────────────────────────
export const COLOR_GRADES   = ['D','E','F','G','H','I','J','K','L','M'] as const;
export const CLARITY_GRADES = ['IF','VVS1','VVS2','VS1','VS2','SI1','SI2'] as const;
export const CUT_GRADES     = ['Excellent','Very Good','Good','Fair','Poor'] as const;
export const LAB_TYPES      = ['GIA','SJC','PNJ','IGI','HRD','None'] as const;
export const SHAPE_TYPES    = ['Round','Princess','Oval','Cushion','Pear','Marquise','Emerald','Radiant','Heart','Asscher'] as const;

export type ColorGrade   = typeof COLOR_GRADES[number];
export type ClarityGrade = typeof CLARITY_GRADES[number];
export type LabType      = typeof LAB_TYPES[number];

/** Rapaport price tier theo carat + color */
export const RAPAPORT_TIER: Record<string, number> = {
  '0.30_D': 1, '0.30_E': 1, '0.30_F': 1, '0.30_G': 2, '0.30_H': 2,
  '0.50_D': 2, '0.50_E': 2, '0.50_F': 2, '0.50_G': 3, '0.50_H': 3,
  '1.00_D': 4, '1.00_E': 4, '1.00_F': 3, '1.00_G': 3, '1.00_H': 3,
  '2.00_D': 5, '2.00_E': 5, '2.00_F': 4, '2.00_G': 4, '2.00_H': 4,
};

// ── DIAMOND RECORD ────────────────────────────────────────────────────────
export interface DiamondRecord {
  rawText:     string;
  sizeLy:      number | null;  // mm
  carat:       number | null;  // tự tính nếu thiếu
  color:       ColorGrade | null;
  clarity:     ClarityGrade | null;
  cut:         string | null;
  polish:      string | null;
  symmetry:    string | null;
  lab:         LabType;
  certNumber:  string | null;
  shape:       string;
  rapaportTier:number | null;
  skuAuto:     string;
  isDuplicate: boolean;
  confidence:  number;  // 0-1
  errors:      string[];
}

// ── CARAT FORMULA ─────────────────────────────────────────────────────────
/** Tính carat từ size mm (round brilliant: d/6.5)^3 approximate */
function sizeToCarat(sizeMm: number): number {
  if (!sizeMm || sizeMm <= 0) return 0;
  const ratio = sizeMm / 6.5;
  return Math.round(ratio * ratio * ratio * 100) / 100;
}

/** Build Rapaport key */
function rapaportKey(carat: number, color: string): string {
  const tiers = [0.30, 0.50, 1.00, 2.00];
  const closest = tiers.reduce((a, b) => Math.abs(b - carat) < Math.abs(a - carat) ? b : a);
  return `${closest.toFixed(2)}_${color}`;
}

// ── MAIN NORMALIZE ────────────────────────────────────────────────────────
/**
 * diamondNormalizeV2 — port từ Doc 6
 * Parse từ raw text như: "1.02ct D IF GIA 1234567890 Excellent/Excellent/Excellent"
 * hoặc từ object có sẵn partial fields
 */
export function diamondNormalizeV2(
  input: string | Record<string, unknown>,
  existingCerts: Set<string> = new Set(),
): DiamondRecord {
  const errors: string[] = [];
  let raw = typeof input === 'string' ? input : JSON.stringify(input);

  // Normalize text
  const text = raw.toUpperCase().replace(/\s+/g, ' ').trim();

  // ── SIZE / CARAT ──────────────────────────────────────────────────────
  let sizeLy: number | null  = null;
  let carat:  number | null  = null;

  const caratMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:CT|CARAT)/i);
  if (caratMatch) carat = parseFloat(caratMatch[1]);

  const sizeMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:MM|LY)/i);
  if (sizeMatch) {
    sizeLy = parseFloat(sizeMatch[1]);
    if (!carat) carat = sizeToCarat(sizeLy);
  }

  if (!carat && !sizeLy) errors.push('MISSING_SIZE_CARAT');

  // ── COLOR ─────────────────────────────────────────────────────────────
  let color: ColorGrade | null = null;
  for (const c of COLOR_GRADES) {
    if (new RegExp(`\\b${c}\\b`).test(text)) { color = c; break; }
  }
  if (!color) errors.push('MISSING_COLOR');

  // ── CLARITY ───────────────────────────────────────────────────────────
  let clarity: ClarityGrade | null = null;
  for (const cl of [...CLARITY_GRADES].reverse()) { // IF first (longest match)
    if (text.includes(cl)) { clarity = cl; break; }
  }
  if (!clarity) errors.push('MISSING_CLARITY');

  // ── CUT / POLISH / SYMMETRY ───────────────────────────────────────────
  const cutMap: Record<string, string> = {
    'EX': 'Excellent', 'EXCELLENT': 'Excellent',
    'VG': 'Very Good', 'VERY GOOD': 'Very Good',
    'GD': 'Good', 'GOOD': 'Good',
    'FR': 'Fair', 'FAIR': 'Fair',
  };
  const gradeTokens = text.match(/(?:EX|EXCELLENT|VG|VERY GOOD|GD|GOOD|FR|FAIR)/g) || [];
  const cut      = cutMap[gradeTokens[0]] || null;
  const polish   = cutMap[gradeTokens[1]] || cut;
  const symmetry = cutMap[gradeTokens[2]] || cut;

  // ── LAB ───────────────────────────────────────────────────────────────
  let lab: LabType = 'None';
  for (const l of LAB_TYPES) {
    if (text.includes(l)) { lab = l; break; }
  }

  // ── CERT NUMBER ───────────────────────────────────────────────────────
  const certMatch = text.match(/\b(\d{8,12})\b/);
  const certNumber = certMatch ? certMatch[1] : null;

  // ── SHAPE ─────────────────────────────────────────────────────────────
  let shape = 'Round';
  for (const s of SHAPE_TYPES) {
    if (text.includes(s.toUpperCase())) { shape = s; break; }
  }

  // ── RAPAPORT TIER ─────────────────────────────────────────────────────
  let rapaportTier: number | null = null;
  if (carat && color) {
    rapaportTier = RAPAPORT_TIER[rapaportKey(carat, color)] ?? null;
  }

  // ── SKU AUTO BUILD ────────────────────────────────────────────────────
  // Format: LAB-SHAPE-CARAT-COLOR-CLARITY-CERT
  const skuParts = [
    lab !== 'None' ? lab : 'XX',
    shape.substring(0, 3).toUpperCase(),
    carat ? carat.toFixed(2).replace('.', '') : '000',
    color || 'X',
    clarity || 'X',
    certNumber ? certNumber.slice(-4) : '0000',
  ];
  const skuAuto = skuParts.join('-');

  // ── DUPLICATE CHECK ───────────────────────────────────────────────────
  const isDuplicate = certNumber ? existingCerts.has(certNumber) : false;
  if (isDuplicate) errors.push(`DUPLICATE_CERT:${certNumber}`);

  // ── CONFIDENCE ────────────────────────────────────────────────────────
  let confidence = 1.0;
  if (!carat)      confidence -= 0.25;
  if (!color)      confidence -= 0.20;
  if (!clarity)    confidence -= 0.20;
  if (!certNumber) confidence -= 0.15;
  if (!cut)        confidence -= 0.10;
  confidence = Math.max(0, confidence);

  return {
    rawText: raw, sizeLy, carat, color, clarity,
    cut, polish, symmetry, lab, certNumber, shape,
    rapaportTier, skuAuto, isDuplicate,
    confidence: Math.round(confidence * 100) / 100,
    errors,
  };
}

// ── TACH MA VIEN ──────────────────────────────────────────────────────────
/**
 * Tách mã viên VC\d+ khỏi mã SP — port từ Doc 8
 * VD: "NNA001 VC657" → { maSP: "NNA001", maVien: "VC657" }
 */
export function tachMaVien(raw: string): { maSP: string; maVien: string | null } {
  if (!raw) return { maSP: '', maVien: null };
  const vcMatch = raw.match(/\b(VC\d+)\b/i);
  if (!vcMatch) return { maSP: raw.trim(), maVien: null };
  const maVien = vcMatch[1].toUpperCase();
  const maSP   = raw.replace(vcMatch[0], '').replace(/\s+/g, ' ').trim();
  return { maSP, maVien };
}

// ── COMMISSION ENGINE ─────────────────────────────────────────────────────
/**
 * tinhHoaHong — port từ Doc 6 tinhHoaHongVaKiemTraSeller()
 * rate vỏ + viên, điều chỉnh theo đổi hàng
 *
 * gSP = giá SP gốc (sau thuế)
 * gBan = giá bán thực tế
 * gDoiHang = giá SP khách đổi vào (nếu có)
 * rateVo = commission rate vỏ (default 1%)
 * rateVien = commission rate viên chủ (default 0.5%)
 */
export function tinhHoaHong(params: {
  gSP:       number;
  gBan:      number;
  gDoiHang?: number;
  rateVo?:   number;  // default 0.01
  rateVien?: number;  // default 0.005
}): {
  commissionVo:   number;
  commissionVien: number;
  total:          number;
  adjustRatio:    number;
  note:           string;
} {
  const {
    gSP,
    gBan,
    gDoiHang   = 0,
    rateVo     = 0.01,
    rateVien   = 0.005,
  } = params;

  if (!gSP || gSP <= 0) return { commissionVo: 0, commissionVien: 0, total: 0, adjustRatio: 1, note: 'gSP=0' };

  // Điều chỉnh theo đổi hàng: nếu KH đổi hàng, chỉ tính commission trên phần diff
  const diff = gBan - gDoiHang;
  const adjustRatio = gDoiHang > 0 ? Math.max(0, diff / gSP) : 1;

  const base          = gSP * adjustRatio;
  const commissionVo  = Math.round(base * rateVo);
  const commissionVien = Math.round(base * rateVien);

  return {
    commissionVo,
    commissionVien,
    total: commissionVo + commissionVien,
    adjustRatio: Math.round(adjustRatio * 100) / 100,
    note: gDoiHang > 0 ? `Doi hang ${gDoiHang.toLocaleString()}d, ratio=${adjustRatio.toFixed(2)}` : 'Ban thang',
  };
}

export default {
  COLOR_GRADES, CLARITY_GRADES, CUT_GRADES, LAB_TYPES, RAPAPORT_TIER,
  diamondNormalizeV2, tachMaVien, tinhHoaHong,
};
