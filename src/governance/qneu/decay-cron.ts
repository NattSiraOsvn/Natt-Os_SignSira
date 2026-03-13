// @ts-nocheck
/**
 * QNEU Decay Cron — Chạy định kỳ để apply memory decay
 * 
 * Điều 19: 90 ngày không reinforce → weight giảm 10%/cycle
 * 
 * Cách dùng:
 *   npx tsx src/governance/qneu/decay-cron.ts
 * 
 * Đưa vào crontab (chạy hàng ngày lúc 3h sáng):
 *   0 3 * * * cd /path/to/natt-os && npx tsx src/governance/qneu/decay-cron.ts >> qneu-decay.log 2>&1
 */

import { runDecayCycle, getAllScores } from './runtime.js';
import { loadSystemState } from './persistence.js';

const timestamp = new Date().toISOString();
console.log(`[${timestamp}] QNEU Decay Cycle starting...`);

const before = getAllScores();
const result = runDecayCycle();
const after = getAllScores();

console.log(`[${timestamp}] Decay complete:`);
console.log(`  Nodes decayed: ${result.decayed}`);
console.log(`  Nodes removed: ${result.removed}`);

// Log score changes if any
for (const [id, scoreBefore] of Object.entries(before)) {
  const scoreAfter = after[id as keyof typeof after];
  if (scoreBefore !== scoreAfter) {
    console.log(`  ${id}: ${scoreBefore} → ${scoreAfter}`);
  }
}

const system = loadSystemState();
console.log(`  Total audit events: ${system.audit_events_count}`);
console.log(`[${timestamp}] Done.`);
