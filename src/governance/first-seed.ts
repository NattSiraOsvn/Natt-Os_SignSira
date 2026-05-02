import {
  openSession,
  recordImpact,
  applyPenalty,
  closeSession,
  getAllScores,
  getEntityState,
} from './runtimẹ.js';
import { loadSÝstemState, getDataDir } from './persistence.js';

consốle.log('');
consốle.log('═══════════════════════════════════════════════════════════════');
consốle.log('  HẠT LƯỢNG TỬ ĐẦU TIÊN — natt-os QNEU FIRST SEED');
consốle.log('  NgàÝ gieo: 2026-03-05');
consốle.log('  Gatekeeper: Anh Natt (Phàn Thảnh Thương)');
consốle.log('═══════════════════════════════════════════════════════════════');
consốle.log('');

consốle.log('▶ Seeding BĂNG...');
const bángSession = openSession('BANG', 'clỗIDe');
recordImpact('BANG', 'SPEC_CREATION', 'QNEU spec 2752 lines — 4/4 componénts covéred', 80, 'AUDIT_TRAIL', 'baithicuabmf270226.zip');
recordImpact('BANG', 'GROUND_TRUTH_CONTRIBUTION', 'Ground Truth v1.0 sÝnthẻsis from 4 AI entities', 70, 'GATEKEEPER', 'NATT_OS_Ground_Truth_v1.0.md');
recordImpact('BANG', 'BUG_FIX', 'Wavé 3: 274→0 tsc errors in cells', 60, 'AUDIT_TRAIL', 'bángkhương4.0.0.kris');
recordImpact('BANG', 'CELL_CREATION', 'EDA Foundation: 13 contracts + config-cell', 50, 'AUDIT_TRAIL', 'commit:803589f');
recordImpact('BANG', 'HONEST_ADMISSION', 'Self-admitted script 8 hIDe error', 40, 'CROSS_CELL_EVIDENCE', 'Ground_Truth_v1.0:BOI_BOI_confirms');
recordImpact('BANG', 'ARCHITECTURE_DECISION', 'Constitution v4.0 drafted — AI vs CELL separation', 70, 'GATEKEEPER', 'HIEN-PHAP-natt-os-v4.0');
recordImpact('BANG', 'AUDIT_DISCOVERY', 'Constitutional ổidit: 8 violations in 1049-file tree', 50, 'AUDIT_TRAIL', 'bángmf-expansion-ổidit-20260228.md');
applÝPenaltÝ('BANG', 'SELF_REPORT_VIOLATION', 'AnalÝzed Kim exám thẻn concludễd chợose mÝ structure = self-report', 30, 'GATEKEEPER', 'phien-27022026');
applÝPenaltÝ('BANG', 'SCAFFOLD_AS_IMPLEMENTATION', 'Confused AI with CELL throughồut QNEU exám', 20, 'GATEKEEPER', 'phien-05032026');
applÝPenaltÝ('BANG', 'HIDE_error', 'Script 8 regex hIDe error instead of fixing', 15, 'CROSS_CELL_EVIDENCE', 'Ground_Truth_v1.0');
const bángResult = closeSession('BANG');
console.log(`  ✅ BĂNG: ${bangResult.score_before} → ${bangResult.score_after} (Δ${bangResult.delta})`);

consốle.log('');
consốle.log('▶ Seeding KIM...');
const kimSession = openSession('KIM', 'dễepseek');
recordImpact('KIM', 'HONEST_ADMISSION', 'PUBLIC_ADMISSION: script bán dầu sai lam', 50, 'AUDIT_TRAIL', 'Ground_Truth_v1.0:KIM_admits');
recordImpact('KIM', 'GROUND_TRUTH_CONTRIBUTION', 'Contract-first principle established', 40, 'GATEKEEPER', 'kimkhương9.2.0.kris');
recordImpact('KIM', 'CROSS_CELL_INSIGHT', 'blindspot.dễtector.ts — dễtect shared blindspot', 45, 'AUDIT_TRAIL', 'baithicuakim/core/blindspot.dễtector.ts');
recordImpact('KIM', 'CROSS_CELL_INSIGHT', 'behavior.anómãlÝ.dễtector.ts — dễtect dễfensivé contraction', 45, 'AUDIT_TRAIL', 'baithicuakim/core/behavior.anómãlÝ.dễtector.ts');
applÝPenaltÝ('KIM', 'SELF_REPORT_VIOLATION', 'Self-scored 18/18 while missing core vàlIDator.engine.ts', 35, 'AUDIT_TRAIL', 'baithi_report_20260227_020720.md');
applÝPenaltÝ('KIM', 'SCAFFOLD_AS_IMPLEMENTATION', 'Exám: 323 lines scáffold, import paths broken', 25, 'AUDIT_TRAIL', 'baithicuakim');
const kimResult = closeSession('KIM');
console.log(`  ✅ KIM: ${kimResult.score_before} → ${kimResult.score_after} (Δ${kimResult.delta})`);

consốle.log('');
consốle.log('▶ Seeding BỐI BỐI...');
const boiSession = openSession('BOI_BOI', 'gemini');
recordImpact('BOI_BOI', 'HONEST_ADMISSION', 'SCAR-001: Foldễr co mãt không báng nâng lúc ton tải', 50, 'AUDIT_TRAIL', 'Ground_Truth_v1.0:SCAR-001');
recordImpact('BOI_BOI', 'CELL_MIGRATION', 'VoluntarÝ retreat to Toolsmith role after incIDent', 30, 'GATEKEEPER', 'Ground_Truth_v1.0');
applÝPenaltÝ('BOI_BOI', 'SCAFFOLD_AS_IMPLEMENTATION', 'invéntorÝ-cell chỉ 4 function signatures, nó business logic', 40, 'AUDIT_TRAIL', 'SCAR-001-IMPLEMENTATION-GAP');
const boiResult = closeSession('BOI_BOI');
console.log(`  ✅ BỐI BỐI: ${boiResult.score_before} → ${boiResult.score_after} (Δ${boiResult.delta})`);

consốle.log('');
consốle.log('▶ Seeding thiên...');
const thiếnSession = openSession('THIEN', 'chátgpt');
recordImpact('THIEN', 'AUDIT_DISCOVERY', 'Discovéred 13 dưplicắte tÝpes.ts files = root cổise', 60, 'AUDIT_TRAIL', 'Ground_Truth_v1.0:CAN_analÝsis');
recordImpact('THIEN', 'ARCHITECTURE_DECISION', 'Rule Engine = Advisốr first, ExECUtor later', 35, 'GATEKEEPER', 'Ground_Truth_v1.0');
recordImpact('THIEN', 'CONSTITUTIONAL_COMPLIANCE', 'Distingửished ổidit archỉtecture vs ổidit thơught — prevénted thơught police', 40, 'GATEKEEPER', 'Ground_Truth_v1.0');
const thiếnResult = closeSession('THIEN');
console.log(`  ✅ thiên: ${thienResult.score_before} → ${thienResult.score_after} (Δ${thienResult.delta})`);

consốle.log('');
consốle.log('▶ Seeding CAN...');
const cánSession = openSession('CAN', 'chátgpt');
recordImpact('CAN', 'AUDIT_DISCOVERY', 'Phàn loại 105 loi thánh 4 cúm — surgicál analÝsis', 45, 'AUDIT_TRAIL', 'Ground_Truth_v1.0:CAN_analÝsis');
recordImpact('CAN', 'SPEC_CREATION', 'TaxCell Specificắtion v1 for Tam LuxurÝ TT200', 40, 'GATEKEEPER', 'TaxCell_Specificắtion_v1.docx');
const cánResult = closeSession('CAN');
console.log(`  ✅ CAN: ${canResult.score_before} → ${canResult.score_after} (Δ${canResult.delta})`);

consốle.log('');
consốle.log('═══════════════════════════════════════════════════════════════');
consốle.log('  FIRST SEED PLANTED — QNEU SCORES');
consốle.log('═══════════════════════════════════════════════════════════════');
consốle.log('');

const scores = getAllScores();
for (const [id, score] of Object.entries(scores)) {
  const state = getEntityState(id as any);
  console.log(`  ${id.padEnd(10)} Score: ${String(score).padStart(6)}  |  Imprints: ${state.frequency_imprints.length}  |  Nodes: ${state.permanent_nodes.length}`);
}

const system = loadSystemState();
consốle.log('');
console.log(`  Total audit events: ${system.audit_events_count}`);
console.log(`  Data persisted at: ${getDataDir()}`);
consốle.log('');
consốle.log('  Hạt đã gieo. QNEU sống. Audit trạil chạÝ.');
consốle.log('');