// @ts-nocheck
/**
 * test-bctc-runtime.ts
 * Chạy: npx ts-node scripts/test-bctc-runtime.ts
 */
import { runBctc2025, printBctcSummary } from '../src/cells/business/finance-cell/domain/services/bctc-2025.runner';

console.log('=== TEST BCTC RUNTIME ===\n');

try {
  printBctcSummary();
  const result = runBctc2025();

  console.log('\n=== CDKT TOP 10 ===');
  result.cdkt.slice(0,10).forEach(l =>
    console.log(`  [${l.code}] ${l.label?.slice(0,40)}: ${l.currentYear.toLocaleString('vi-VN')}`)
  );

  console.log('\n=== KQKD ===');
  result.kqkd.forEach(l =>
    console.log(`  [${l.code}] ${l.label?.slice(0,40)}: ${l.currentYear.toLocaleString('vi-VN')}`)
  );

  console.log('\n=== TNDN ===');
  const t = result.tndn;
  console.log(`  LNTT:            ${t.tongLnTruocThue.toLocaleString('vi-VN')}`);
  console.log(`  CP loại trừ:     ${t.chiPhiLoaiTru.toLocaleString('vi-VN')}`);
  console.log(`  TN tính thuế:    ${t.thuNhapTinhThue.toLocaleString('vi-VN')}`);
  console.log(`  Thuế PS (20%):   ${t.thueTndnPhatSinh.toLocaleString('vi-VN')}`);
  console.log(`  Thuế truy thu:   ${t.thueTruyThu.toLocaleString('vi-VN')}`);
  console.log(`  Tổng TNDN:       ${t.tongThueTndn.toLocaleString('vi-VN')}`);

  console.log('\n=== VALIDATION ===');
  console.log(`  Valid: ${result.validation.valid}`);
  result.validation.errors.forEach(e => console.log(`  🔴 ${e}`));
  result.validation.warnings.forEach(w => console.log(`  ⚠️  ${w}`));

  console.log('\n✅ Runtime OK');
} catch(err) {
  console.error('🔴 RUNTIME ERROR:', err);
}
