// hr-cell/domain/services/hr.seed.ts
// Wave B — Load employees_raw.json → seed HREngine
// File này được import 1 lần duy nhất khi hr-cell khởi động

import { HREngine } from './hr.engine';

// Import JSON trực tiếp (TypeScript hỗ trợ --resolveJsonModule)
// Path tương đối từ domain/services/ → data-raw/
let seedData: any[] = [];
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  seedData = require('../../data-raw/employees_raw.json');
} catch {
  console.warn('[hr-cell] employees_raw.json not found — hr-cell will start empty');
}

if (seedData.length > 0) {
  HREngine.seedFromRaw(seedData);
  console.log(`[hr-cell] ✅ Seeded ${seedData.length} employees from sổ lương`);
}

export { HREngine };
