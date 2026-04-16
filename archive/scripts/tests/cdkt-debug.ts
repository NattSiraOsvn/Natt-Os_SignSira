// @ts-nocheck
import { runBctc2025 } from '../src/cells/business/finance-cell/domain/services/bctc-2025.runner';
const r = runBctc2025();
const fmt = (n) => n === 0 ? '—' : n.toLocaleString('vi-VN');
console.log('\n=== CDKT FULL ===');
r.cdkt.forEach(l => console.log(`  [${l.code}] ${(l.label||'').slice(0,45).padEnd(46)}: ${fmt(l.currentYear)}`));
console.log('\n=== TS =', fmt(r.summary.tong_ts), '| NV =', fmt(r.summary.tong_nv));
