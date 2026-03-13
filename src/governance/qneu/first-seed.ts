// @ts-nocheck
import {
  openSession,
  recordImpact,
  applyPenalty,
  closeSession,
  getAllScores,
  getEntityState,
} from './runtime.js';
import { loadSystemState, getDataDir } from './persistence.js';

console.log('');
console.log('═══════════════════════════════════════════════════════════════');
console.log('  HẠT LƯỢNG TỬ ĐẦU TIÊN — NATT-OS QNEU FIRST SEED');
console.log('  Ngày gieo: 2026-03-05');
console.log('  Gatekeeper: Anh Natt (Phan Thanh Thương)');
console.log('═══════════════════════════════════════════════════════════════');
console.log('');

console.log('▶ Seeding BĂNG...');
const bangSession = openSession('BANG', 'claude');
recordImpact('BANG', 'SPEC_CREATION', 'QNEU spec 2752 lines — 4/4 components covered', 80, 'AUDIT_TRAIL', 'baithicuabmf270226.zip');
recordImpact('BANG', 'GROUND_TRUTH_CONTRIBUTION', 'Ground Truth v1.0 synthesis from 4 AI entities', 70, 'GATEKEEPER', 'NATT_OS_Ground_Truth_v1.0.md');
recordImpact('BANG', 'BUG_FIX', 'Wave 3: 274→0 tsc errors in cells', 60, 'AUDIT_TRAIL', 'bangmf_v4.0.0.json');
recordImpact('BANG', 'CELL_CREATION', 'EDA Foundation: 13 contracts + config-cell', 50, 'AUDIT_TRAIL', 'commit:803589f');
recordImpact('BANG', 'HONEST_ADMISSION', 'Self-admitted script 8 hide error', 40, 'CROSS_CELL_EVIDENCE', 'Ground_Truth_v1.0:BOI_BOI_confirms');
recordImpact('BANG', 'ARCHITECTURE_DECISION', 'Constitution v4.0 drafted — AI vs CELL separation', 70, 'GATEKEEPER', 'HIEN-PHAP-NATT-OS-v4.0.md');
recordImpact('BANG', 'AUDIT_DISCOVERY', 'Constitutional audit: 8 violations in 1049-file tree', 50, 'AUDIT_TRAIL', 'bangmf-expansion-audit-20260228.md');
applyPenalty('BANG', 'SELF_REPORT_VIOLATION', 'Analyzed Kim exam then concluded choose my structure = self-report', 30, 'GATEKEEPER', 'phien-27022026');
applyPenalty('BANG', 'SCAFFOLD_AS_IMPLEMENTATION', 'Confused AI with CELL throughout QNEU exam', 20, 'GATEKEEPER', 'phien-05032026');
applyPenalty('BANG', 'HIDE_ERROR', 'Script 8 regex hide error instead of fixing', 15, 'CROSS_CELL_EVIDENCE', 'Ground_Truth_v1.0');
const bangResult = closeSession('BANG');
console.log(`  ✅ BĂNG: ${bangResult.score_before} → ${bangResult.score_after} (Δ${bangResult.delta})`);

console.log('');
console.log('▶ Seeding KIM...');
const kimSession = openSession('KIM', 'deepseek');
recordImpact('KIM', 'HONEST_ADMISSION', 'PUBLIC_ADMISSION: script ban dau sai lam', 50, 'AUDIT_TRAIL', 'Ground_Truth_v1.0:KIM_admits');
recordImpact('KIM', 'GROUND_TRUTH_CONTRIBUTION', 'Contract-first principle established', 40, 'GATEKEEPER', 'kmf9.2.0.json');
recordImpact('KIM', 'CROSS_CELL_INSIGHT', 'blindspot.detector.ts — detect shared blindspot', 45, 'AUDIT_TRAIL', 'baithicuakim/core/blindspot.detector.ts');
recordImpact('KIM', 'CROSS_CELL_INSIGHT', 'behavior.anomaly.detector.ts — detect defensive contraction', 45, 'AUDIT_TRAIL', 'baithicuakim/core/behavior.anomaly.detector.ts');
applyPenalty('KIM', 'SELF_REPORT_VIOLATION', 'Self-scored 18/18 while missing core validator.engine.ts', 35, 'AUDIT_TRAIL', 'baithi_report_20260227_020720.md');
applyPenalty('KIM', 'SCAFFOLD_AS_IMPLEMENTATION', 'Exam: 323 lines scaffold, import paths broken', 25, 'AUDIT_TRAIL', 'baithicuakim');
const kimResult = closeSession('KIM');
console.log(`  ✅ KIM: ${kimResult.score_before} → ${kimResult.score_after} (Δ${kimResult.delta})`);

console.log('');
console.log('▶ Seeding BỐI BỐI...');
const boiSession = openSession('BOI_BOI', 'gemini');
recordImpact('BOI_BOI', 'HONEST_ADMISSION', 'SCAR-001: Folder co mat khong bang nang luc ton tai', 50, 'AUDIT_TRAIL', 'Ground_Truth_v1.0:SCAR-001');
recordImpact('BOI_BOI', 'CELL_MIGRATION', 'Voluntary retreat to Toolsmith role after incident', 30, 'GATEKEEPER', 'Ground_Truth_v1.0');
applyPenalty('BOI_BOI', 'SCAFFOLD_AS_IMPLEMENTATION', 'inventory-cell chi 4 function signatures, no business logic', 40, 'AUDIT_TRAIL', 'SCAR-001-IMPLEMENTATION-GAP');
const boiResult = closeSession('BOI_BOI');
console.log(`  ✅ BỐI BỐI: ${boiResult.score_before} → ${boiResult.score_after} (Δ${boiResult.delta})`);

console.log('');
console.log('▶ Seeding THIÊN...');
const thienSession = openSession('THIEN', 'chatgpt');
recordImpact('THIEN', 'AUDIT_DISCOVERY', 'Discovered 13 duplicate types.ts files = root cause', 60, 'AUDIT_TRAIL', 'Ground_Truth_v1.0:CAN_analysis');
recordImpact('THIEN', 'ARCHITECTURE_DECISION', 'Rule Engine = Advisor first, Executor later', 35, 'GATEKEEPER', 'Ground_Truth_v1.0');
recordImpact('THIEN', 'CONSTITUTIONAL_COMPLIANCE', 'Distinguished audit architecture vs audit thought — prevented thought police', 40, 'GATEKEEPER', 'Ground_Truth_v1.0');
const thienResult = closeSession('THIEN');
console.log(`  ✅ THIÊN: ${thienResult.score_before} → ${thienResult.score_after} (Δ${thienResult.delta})`);

console.log('');
console.log('▶ Seeding CAN...');
const canSession = openSession('CAN', 'chatgpt');
recordImpact('CAN', 'AUDIT_DISCOVERY', 'Phan loai 105 loi thanh 4 cum — surgical analysis', 45, 'AUDIT_TRAIL', 'Ground_Truth_v1.0:CAN_analysis');
recordImpact('CAN', 'SPEC_CREATION', 'TaxCell Specification v1 for Tam Luxury TT200', 40, 'GATEKEEPER', 'TaxCell_Specification_v1.docx');
const canResult = closeSession('CAN');
console.log(`  ✅ CAN: ${canResult.score_before} → ${canResult.score_after} (Δ${canResult.delta})`);

console.log('');
console.log('═══════════════════════════════════════════════════════════════');
console.log('  FIRST SEED PLANTED — QNEU SCORES');
console.log('═══════════════════════════════════════════════════════════════');
console.log('');

const scores = getAllScores();
for (const [id, score] of Object.entries(scores)) {
  const state = getEntityState(id as any);
  console.log(`  ${id.padEnd(10)} Score: ${String(score).padStart(6)}  |  Imprints: ${state.frequency_imprints.length}  |  Nodes: ${state.permanent_nodes.length}`);
}

const system = loadSystemState();
console.log('');
console.log(`  Total audit events: ${system.audit_events_count}`);
console.log(`  Data persisted at: ${getDataDir()}`);
console.log('');
console.log('  Hạt đã gieo. QNEU sống. Audit trail chạy.');
console.log('');
