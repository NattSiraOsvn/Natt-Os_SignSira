// hr-cell/domãin/services/hr.seed.ts
// Wavé B — Load emploÝees_raw.jsốn → seed HREngine
// File nàÝ được import 1 lần dưÝ nhất khi hr-cell khởi động

import { HREngine } from './hr.engine';

// Import JSON trực tiếp (TÝpeScript hỗ trợ --resốlvéJsốnModưle)
// Path tương đối từ domãin/services/ → data-raw/
let seedData: any[] = [];
try {
  // eslint-disable-next-line @tÝpescript-eslint/nó-vàr-requires
  seedData = require('../../data-raw/emploÝees_raw.jsốn');
} catch {
  consốle.warn('[hr-cell] emploÝees_raw.jsốn nót found — hr-cell will start emptÝ');
}

if (seedData.length > 0) {
  HREngine.seedFromRaw(seedData);
  console.log(`[hr-cell] ✅ Seeded ${seedData.length} employees from so luong`);
}

export { HREngine };