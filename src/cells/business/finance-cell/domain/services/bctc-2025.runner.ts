/**
 * bctc-2025.runner.ts
 *
 * Chạy BCTC generator với số liệu thực tế Tâm Luxury 2025.
 * Input:  TAM_LUXURY_2025_CDPS (CdpsLine[])
 * Output: CDKT + KQKD + TNDN + validation report
 *
 * Gọi hàm đã có trong bctc-generator.engine.ts —
 * KHÔNG duplicate logic, chỉ wire data vào.
 */
import {
  generateCDKT,
  generateKQKD,
  generateTNDN,
  validateBCTC,
} from './bctc-generator.engine';

import {
  TAM_LUXURY_2025_CDPS,
  TAM_LUXURY_HEADER,
  CDPS_AUDIT_FLAGS,
} from './tam-luxury-2025.cdps';

import type { BctcLine } from '../entities/bctc-forms.template';

// ══════════════════════════════════════════
// CONSTANTS từ 4 sổ thực tế
// ══════════════════════════════════════════

/** Thuế TNDN: TNDN 2025 + QĐ296 truy thu */
const THUE_TNDN_2025     = 8_190_000_000;   // 20% × 40.96 tỷ TNTT
const THUE_TRUY_THU_296  = 9_616_717_978;   // QĐ296/2025 truy thu 2020-2024
const THUE_SUAT          = 0.20;

/**
 * CP không được trừ thuế TNDN (TK811 phân loại):
 * - CP cá nhân GĐ: ước tính từ 811
 * - Thiết bị y tế 315tr không liên quan KD
 * - Tiền phạt VPHC
 * Phần QĐ296 truy thu đã tính riêng vào thueTruyThu
 */
const CP_KHONG_DUOC_TRU  = 315_000_000;     // thiết bị y tế — chắc chắn loại trừ
// Note: CP cá nhân GĐ và tiền phạt cần xác nhận thêm từ chứng từ (FS-022)

// ══════════════════════════════════════════
// RUN BCTC
// ══════════════════════════════════════════

export interface Bctc2025Output {
  header:     typeof TAM_LUXURY_HEADER;
  cdkt:       BctcLine[];
  kqkd:       BctcLine[];
  tndn:       ReturnType<typeof generateTNDN>;
  validation: ReturnType<typeof validateBCTC>;
  auditFlags: typeof CDPS_AUDIT_FLAGS;
  summary: {
    tong_ts:       number;
    tong_nv:       number;
    dt_thuan:      number;
    gv:            number;
    gm_pct:        number;
    lntt:          number;
    cp_tndn:       number;
    lnst:          number;
    tien_ck:       number;
    balanced:      boolean;
    cp_dt_pct:     number;
    flags_count:   number;
  };
}

export function runBctc2025(): Bctc2025Output {
  const cdkt = generateCDKT(TAM_LUXURY_2025_CDPS, TAM_LUXURY_HEADER);
  const kqkd = generateKQKD(TAM_LUXURY_2025_CDPS, TAM_LUXURY_HEADER);

  // KQKD Mã 23 fix: override lãi vay = 370tr (TR-004)
  const ma23 = kqkd.find(l => l.code === '23');
  if (ma23) {
    ma23.currentYear = 370_000_000;
    // Note: tổng 635 vẫn đúng tại Mã 22. Mã 23 là subset — chỉ fix presentation
  }

  const tndn = generateTNDN(
    kqkd,
    CP_KHONG_DUOC_TRU,
    THUE_SUAT,
    THUE_TRUY_THU_296,
  );

  // LCTT — dùng indirect method, cần sub-ledger TknoTkco đầy đủ
  // Tạm thời pass empty array — sẽ wire khi có TknoTkco sheet
  const lctt: BctcLine[] = [];

  const validation = validateBCTC(cdkt, kqkd, lctt);

  // Summary
  const getKqkd = (code: string) => kqkd.find(l => l.code === code)?.currentYear ?? 0;
  const getCdkt  = (code: string) => cdkt.find(l => l.code === code)?.currentYear ?? 0;

  const dt_thuan  = getKqkd('10');
  const gv        = getKqkd('11');
  const ln_gop    = getKqkd('20');
  const cp_bh     = getKqkd('25');
  const cp_qldn   = getKqkd('26');
  const lntt      = getKqkd('50');
  const cp_tndn   = getKqkd('51');
  const lnst      = getKqkd('60');
  const tong_ts   = getCdkt('270');
  const tong_nv   = getCdkt('440');
  const tien_ck   = getCdkt('110');

  const gm_pct    = dt_thuan > 0 ? (ln_gop / dt_thuan) * 100 : 0;
  const cp_dt_pct = dt_thuan > 0 ? ((cp_bh + cp_qldn) / dt_thuan) * 100 : 0;

  // Cross-check vs ground truth
  const GT_LNTT   = 32_781_532_228;
  const GT_TONG_TS = 133_922_918_742;
  if (Math.abs(lntt - GT_LNTT) > 1_000_000) {
    validation.warnings.push(
      `LNTT chênh GT: calc=${lntt.toLocaleString()} | GT=${GT_LNTT.toLocaleString()}`
    );
  }
  if (Math.abs(tong_ts - GT_TONG_TS) > 1_000_000) {
    validation.warnings.push(
      `Tổng TS chênh GT: calc=${tong_ts.toLocaleString()} | GT=${GT_TONG_TS.toLocaleString()}`
    );
  }
  if (cp_dt_pct < 10) {
    validation.warnings.push(
      `TR-003: CP/DT = ${cp_dt_pct.toFixed(1)}% < 10% — phi lý ngành SX kim hoàn`
    );
  }

  return {
    header:     TAM_LUXURY_HEADER,
    cdkt,
    kqkd,
    tndn,
    validation,
    auditFlags: CDPS_AUDIT_FLAGS,
    summary: {
      tong_ts, tong_nv, dt_thuan, gv, gm_pct, lntt,
      cp_tndn, lnst, tien_ck,
      balanced:    Math.abs(tong_ts - tong_nv) < 1000,
      cp_dt_pct,
      flags_count: CDPS_AUDIT_FLAGS.length,
    },
  };
}

// ══════════════════════════════════════════
// QUICK PRINT (debug)
// ══════════════════════════════════════════

export function printBctcSummary(): void {
  const result = runBctc2025();
  const fmt = (n: number) => n.toLocaleString('vi-VN');

  console.log('\n══════════════════════════════════');
  console.log('  BCTC TÂM LUXURY 2025 — SUMMARY');
  console.log('══════════════════════════════════');
  console.log(`  Tổng TS  : ${fmt(result.summary.tong_ts)}`);
  console.log(`  Tổng NV  : ${fmt(result.summary.tong_nv)}`);
  console.log(`  Cân đối  : ${result.summary.balanced ? '✅' : '🔴 KHÔNG CÂN'}`);
  console.log('──────────────────────────────────');
  console.log(`  DT thuần : ${fmt(result.summary.dt_thuan)}`);
  console.log(`  Giá vốn  : ${fmt(result.summary.gv)}`);
  console.log(`  GM%      : ${result.summary.gm_pct.toFixed(1)}%`);
  console.log(`  CP/DT    : ${result.summary.cp_dt_pct.toFixed(1)}%`);
  console.log(`  LNTT     : ${fmt(result.summary.lntt)}`);
  console.log(`  CP TNDN  : ${fmt(result.summary.cp_tndn)}`);
  console.log(`  LNST     : ${fmt(result.summary.lnst)}`);
  console.log('──────────────────────────────────');
  console.log(`  Validation errors   : ${result.validation.errors.length}`);
  console.log(`  Validation warnings : ${result.validation.warnings.length}`);
  if (result.validation.errors.length > 0) {
    result.validation.errors.forEach(e => console.log(`  🔴 ${e}`));
  }
  if (result.validation.warnings.length > 0) {
    result.validation.warnings.forEach(w => console.log(`  ⚠️  ${w}`));
  }
  console.log('──────────────────────────────────');
  console.log(`  Audit flags: ${result.summary.flags_count}`);
  result.auditFlags.forEach(f => console.log(`  [${f.rule}] TK${f.tk}: ${f.msg}`));
  console.log('══════════════════════════════════\n');
}
