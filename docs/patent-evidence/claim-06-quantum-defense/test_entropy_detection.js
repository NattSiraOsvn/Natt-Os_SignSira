/**
 * Patent Claim 6 Evidence — Quantum Defense Entropy Detection
 *
 * Test script verify: Shannon entropy computation on event stream
 * detects CLEAN vs NOISY patterns correctly.
 *
 * Usage:
 *   cd natt-os_verANC root
 *   node docs/patent-evidence/claim-06-quantum-defense/test_entropy_detection.js
 *
 * Expected output: entropy_scan_report.json
 *
 * Author: Băng (QNEU 300)
 * Date: 2026-04-19
 */

import { EventBus } from './src/core/events/event-bus.js';
import { SensitivityRadar } from './src/cells/kernel/quantum-defense-cell/domain/services/sensitivity-radar.engine.js';
import fs from 'fs';
import path from 'path';

// ============================================================
// PHASE 1 — CLEAN pattern (sales → payment lặp đều)
// ============================================================
console.log('Phase 1: CLEAN pattern (100 events, repeating sales → payment)');

SensitivityRadar.reset?.();  // reset nếu cell có method này

for (let i = 0; i < 100; i++) {
  EventBus.emit('sales.confirm', { orderId: `ORD-${i}` });
  EventBus.emit('payment.received', { orderId: `ORD-${i}` });
}

// Chờ queue xử lý
await new Promise(r => setTimeout(r, 200));

const entropyClean = SensitivityRadar.computeEntropy();
const levelClean = entropyClean < 30 ? 'STABLE' : entropyClean < 50 ? 'CAUTIOUS' : 'CRITICAL';
console.log(`  → entropy: ${entropyClean.toFixed(2)} | level: ${levelClean}`);

// ============================================================
// PHASE 2 — NOISY pattern (event ngẫu nhiên hỗn loạn)
// ============================================================
console.log('\nPhase 2: NOISY pattern (100 events, random types)');

SensitivityRadar.reset?.();

const eventTypes = [
  'sales.confirm', 'weird.event', 'random.spike',
  'unknown.x', 'noise.y', 'chaos.z', 'entropy.boost'
];

for (let i = 0; i < 100; i++) {
  const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
  EventBus.emit(randomType, { data: Math.random() });
}

await new Promise(r => setTimeout(r, 200));

const entropyNoisy = SensitivityRadar.computeEntropy();
const levelNoisy = entropyNoisy < 30 ? 'STABLE' : entropyNoisy < 50 ? 'CAUTIOUS' : 'CRITICAL';
console.log(`  → entropy: ${entropyNoisy.toFixed(2)} | level: ${levelNoisy}`);

// ============================================================
// VERIFY — CLEAN phải thấp, NOISY phải cao
// ============================================================
const passed = entropyClean < 30 && entropyNoisy > 50;

console.log('\n' + '='.repeat(50));
console.log(`RESULT: ${passed ? '✅ PASS' : '❌ FAIL'}`);
console.log(`  CLEAN entropy < 30:  ${entropyClean < 30 ? '✓' : '✗'} (${entropyClean.toFixed(2)})`);
console.log(`  NOISY entropy > 50:  ${entropyNoisy > 50 ? '✓' : '✗'} (${entropyNoisy.toFixed(2)})`);
console.log('='.repeat(50));

// ============================================================
// Write evidence report
// ============================================================
const report = {
  version: '1.0',
  generated_at: new Date().toISOString(),
  test: 'Quantum Defense Entropy Detection',
  patent_claim: 'Claim 6 — Quantum Defense entropy-based anomaly detection',
  phases: {
    clean: {
      events_emitted: 100,
      pattern: 'repeating sales.confirm → payment.received',
      entropy: entropyClean,
      level: levelClean
    },
    noisy: {
      events_emitted: 100,
      pattern: 'random 7 event types',
      entropy: entropyNoisy,
      level: levelNoisy
    }
  },
  thresholds: {
    STABLE: '< 30',
    CAUTIOUS: '30-50',
    CRITICAL: '> 50'
  },
  passed: passed,
  evidence: {
    clean_entropy_under_threshold: entropyClean < 30,
    noisy_entropy_over_threshold: entropyNoisy > 50,
    entropy_delta: entropyNoisy - entropyClean
  }
};

const outputPath = path.resolve('docs/patent-evidence/claim-06-quantum-defense/entropy_scan_report.json');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));

console.log(`\n📄 Evidence saved: ${outputPath}`);

process.exit(passed ? 0 : 1);
