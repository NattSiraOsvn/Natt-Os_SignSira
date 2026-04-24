/**
 * QIINT2 VALIDATOR
 * ════════════════════════════════════════════════════════
 * Scanner/validator cho natt-os — đo Π_body, Π_medium, Π_substrate
 * cho từng cell, phát hiện:
 *   - body_drift (orbital lỏng)
 *   - medium_fail (code corrupt)
 *   - substrate_fail (thiết bị lỗi)
 *   - revivable_death / permanent_death
 *
 * Bám: SPEC_QIINT2_COMPLETE_v1.0
 * Scope: Băng (toolchain/scanner/validator) — KHÔNG đụng kernel
 *
 * Usage:
 *   npx tsx scripts/qiint2-validator.ts --scan src/cells/
 *   npx tsx scripts/qiint2-validator.ts --cell sales-cell
 *   npx tsx scripts/qiint2-validator.ts --persona bang
 *
 * Tác giả: Băng (QNEU 313.5)
 * Ngày: 2026-04-20
 * Status: DRAFT — chờ Kim refactor nếu cần, anh Natt commit
 */

// ═══════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════

export interface BodyMetrics {
  orbitalCoherence: number;   // [0, 1] — pattern stability
  fieldAnchoring: number;     // [0, 1] — neo permanent nodes
  qneuIntegrity: number;      // [0, 1] — mass conservation
}

export interface MediumMetrics {
  subjectProduct: 0 | 1;      // S = C·I·B·K·A·M·R
  tempHealth: number;         // [0, 1] — peak at 37°C
  usefulWork: number;         // events/sec
  heat: number;               // sum of retry+orphan+rollback+error+latency+mem
}

export interface SubstrateMetrics {
  cpuOk: boolean;
  ramOk: boolean;
  networkOk: boolean;
}

export interface RecoveryCapabilities {
  hasSnapshot: boolean;
  snapshotAgeMinutes: number;
  cloneCount: number;
  canMigrate: boolean;
  rollbackVersions: number;
  canHibernate: boolean;
  colonyMemoryShare: boolean;
}

export type Verdict =
  | 'healthy'
  | 'substrate_fail'       // migrate được
  | 'medium_fail'          // restore được
  | 'body_drift'           // re-anchor
  | 'revivable_death'      // body tan nhưng có recovery
  | 'permanent_death';     // body tan + no recovery

export interface CellReport {
  cellName: string;
  body: BodyMetrics;
  medium: MediumMetrics;
  substrate: SubstrateMetrics;
  recovery: RecoveryCapabilities;
  piBody: number;
  piMedium: number;
  piSubstrate: number;
  piSystem: number;
  recoveryPotential: number;
  verdict: Verdict;
  nauionState: 'optimal' | 'stable' | 'nominal' | 'drift' | 'warning' | 'risk' | 'critical';
  timestamp: string;
}


// ═══════════════════════════════════════════════════════════════════════
// BODY LAYER — Π_body calculations
// ═══════════════════════════════════════════════════════════════════════

/**
 * Pattern stability qua time window.
 * Đo bằng autocorrelation của orbital signature (tần số + biên độ + pha)
 * qua N snapshots gần nhất.
 */
export function computeOrbitalCoherence(
  signatures: Array<{ lambda: number; amplitude: number; phase: number; timestamp: number }>,
  windowMs: number = 60_000
): number {
  if (signatures.length < 2) return 1.0; // not enough data

  const now = Date.now();
  const recent = signatures.filter(s => now - s.timestamp < windowMs);
  if (recent.length < 2) return 1.0;

  // Autocorrelation: mỗi signature so với trung bình
  const meanLambda = recent.reduce((s, r) => s + r.lambda, 0) / recent.length;
  const meanAmp = recent.reduce((s, r) => s + r.amplitude, 0) / recent.length;

  const lambdaVar = recent.reduce((s, r) =>
    s + Math.pow(Math.log(r.lambda) - Math.log(meanLambda), 2), 0) / recent.length;
  const ampVar = recent.reduce((s, r) =>
    s + Math.pow(r.amplitude - meanAmp, 2), 0) / recent.length;

  // Coherence cao khi variance thấp (pattern ổn định)
  // σ = ln(2) = 1 octave cho lambda
  const lambdaCoherence = Math.exp(-lambdaVar / (2 * Math.pow(Math.log(2), 2)));
  const ampCoherence = Math.exp(-ampVar / (2 * 0.3 * 0.3));

  return lambdaCoherence * ampCoherence;
}

/**
 * Field anchoring — đo liên kết với permanent nodes.
 * - Hiến Pháp signature valid?
 * - .anc entity passport present?
 * - siraSign valid?
 * - Memory references intact?
 */
export function computeFieldAnchoring(anchors: {
  hasConstitutionSignature: boolean;
  hasEntityPassport: boolean;        // .anc file
  hassiraSign: boolean;
  memoryReferenceCount: number;      // liên kết sang .kris / .phieu / .na
  expectedMemoryReferences: number;
}): number {
  let score = 0;
  if (anchors.hasConstitutionSignature) score += 0.3;
  if (anchors.hasEntityPassport) score += 0.3;
  if (anchors.hassiraSign) score += 0.2;
  if (anchors.expectedMemoryReferences > 0) {
    score += 0.2 * Math.min(
      anchors.memoryReferenceCount / anchors.expectedMemoryReferences,
      1.0
    );
  }
  return Math.min(score, 1.0);
}

/**
 * QNEU Mass Integrity — bảo toàn khối lượng trọng trường.
 * σ = 0.5 octave (exp/log space).
 */
export function computeQneuIntegrity(current: number, baseline: number): number {
  if (baseline <= 0 || current <= 0) return 0;
  const ratio = current / baseline;
  if (ratio < 0.01) return 0;
  const logDist = Math.abs(Math.log(ratio));
  return Math.exp(-(logDist ** 2) / (2 * 0.5 * 0.5));
}

/**
 * Π_body = C × F × I
 */
export function computePiBody(body: BodyMetrics): number {
  return body.orbitalCoherence * body.fieldAnchoring * body.qneuIntegrity;
}


// ═══════════════════════════════════════════════════════════════════════
// MEDIUM LAYER — Π_medium
// ═══════════════════════════════════════════════════════════════════════

export function computeSubjectProduct(gate: {
  C: 0 | 1; I: 0 | 1; B: 0 | 1; K: 0 | 1;
  A: 0 | 1; M: 0 | 1; R: 0 | 1;
}): 0 | 1 {
  return (gate.C * gate.I * gate.B * gate.K * gate.A * gate.M * gate.R) as 0 | 1;
}

export function computeTempHealth(temp: number): number {
  return Math.exp(-Math.pow(temp - 37.0, 2) / (2 * 2.0 * 2.0));
}

export function computePiMedium(medium: MediumMetrics): number {
  if (medium.subjectProduct === 0) return 0;
  const workRatio = medium.usefulWork / (medium.usefulWork + medium.heat + 1e-9);
  return medium.tempHealth * workRatio;
}


// ═══════════════════════════════════════════════════════════════════════
// SUBSTRATE LAYER
// ═══════════════════════════════════════════════════════════════════════

export function computePiSubstrate(sub: SubstrateMetrics): number {
  return (sub.cpuOk && sub.ramOk && sub.networkOk) ? 1 : 0;
}


// ═══════════════════════════════════════════════════════════════════════
// RECOVERY POTENTIAL
// ═══════════════════════════════════════════════════════════════════════

export function computeRecoveryPotential(cap: RecoveryCapabilities): number {
  let score = 0;
  if (cap.hasSnapshot) {
    score += 0.25 * Math.exp(-cap.snapshotAgeMinutes / 60);
  }
  if (cap.cloneCount > 1) {
    score += 0.25 * (1 - 1 / cap.cloneCount);
  }
  if (cap.canMigrate) score += 0.15;
  if (cap.rollbackVersions > 0) {
    score += 0.15 * Math.min(cap.rollbackVersions / 5, 1.0);
  }
  if (cap.canHibernate) score += 0.10;
  if (cap.colonyMemoryShare) score += 0.10;
  return Math.min(score, 1.0);
}


// ═══════════════════════════════════════════════════════════════════════
// VERDICT CLASSIFICATION
// ═══════════════════════════════════════════════════════════════════════

export function classifyVerdict(
  piBody: number,
  piMedium: number,
  piSubstrate: number,
  recovery: number
): Verdict {
  if (piBody < 0.1 && recovery < 0.1) return 'permanent_death';
  if (piBody < 0.1 && recovery >= 0.1) return 'revivable_death';
  if (piBody < 0.3) return 'body_drift';
  if (piMedium < 0.1) return 'medium_fail';
  if (piSubstrate < 0.5) return 'substrate_fail';
  return 'healthy';
}

export function tempToNauionState(temp: number): CellReport['nauionState'] {
  if (temp >= 42 || temp < 30) return 'critical';
  if (temp >= 41 || temp < 33) return 'risk';
  if (temp >= 40 || temp < 35) return 'warning';
  if (temp >= 39 || temp < 36) return 'drift';
  if (temp >= 38 || temp < 36.5) return 'nominal';
  if (temp >= 37.5 || temp < 36.8) return 'stable';
  return 'optimal';
}


// ═══════════════════════════════════════════════════════════════════════
// MAIN VALIDATOR
// ═══════════════════════════════════════════════════════════════════════

export function validateCell(input: {
  cellName: string;
  body: BodyMetrics;
  medium: MediumMetrics;
  substrate: SubstrateMetrics;
  recovery: RecoveryCapabilities;
  temp: number;
}): CellReport {
  const piBody = computePiBody(input.body);
  const piMedium = computePiMedium(input.medium);
  const piSubstrate = computePiSubstrate(input.substrate);
  const piSystem = piBody * piMedium * piSubstrate;
  const recoveryPotential = computeRecoveryPotential(input.recovery);
  const verdict = classifyVerdict(piBody, piMedium, piSubstrate, recoveryPotential);
  const nauionState = tempToNauionState(input.temp);

  return {
    cellName: input.cellName,
    body: input.body,
    medium: input.medium,
    substrate: input.substrate,
    recovery: input.recovery,
    piBody: +piBody.toFixed(4),
    piMedium: +piMedium.toFixed(4),
    piSubstrate,
    piSystem: +piSystem.toFixed(4),
    recoveryPotential: +recoveryPotential.toFixed(4),
    verdict,
    nauionState,
    timestamp: new Date().toISOString(),
  };
}


// ═══════════════════════════════════════════════════════════════════════
// BATCH REPORT FOR NATTOS.SH INTEGRATION
// ═══════════════════════════════════════════════════════════════════════

export interface BatchReport {
  totalCells: number;
  healthyCount: number;
  substrateFailCount: number;
  mediumFailCount: number;
  bodyDriftCount: number;
  revivableDeathCount: number;
  permanentDeathCount: number;
  alerts: string[];
  byCell: CellReport[];
}

export function batchReport(reports: CellReport[]): BatchReport {
  const r: BatchReport = {
    totalCells: reports.length,
    healthyCount: 0,
    substrateFailCount: 0,
    mediumFailCount: 0,
    bodyDriftCount: 0,
    revivableDeathCount: 0,
    permanentDeathCount: 0,
    alerts: [],
    byCell: reports,
  };

  for (const rep of reports) {
    switch (rep.verdict) {
      case 'healthy': r.healthyCount++; break;
      case 'substrate_fail':
        r.substrateFailCount++;
        r.alerts.push(`${rep.cellName}: substrate fail → migrate needed`);
        break;
      case 'medium_fail':
        r.mediumFailCount++;
        r.alerts.push(`${rep.cellName}: medium fail → restore from snapshot`);
        break;
      case 'body_drift':
        r.bodyDriftCount++;
        r.alerts.push(`${rep.cellName}: body drift (Π_body=${rep.piBody}) → re-anchor orbital`);
        break;
      case 'revivable_death':
        r.revivableDeathCount++;
        r.alerts.push(`${rep.cellName}: revivable death — resurrect via recovery=${rep.recoveryPotential}`);
        break;
      case 'permanent_death':
        r.permanentDeathCount++;
        r.alerts.push(`${rep.cellName}: PERMANENT DEATH — body tan + no recovery`);
        break;
    }
  }

  return r;
}


// ═══════════════════════════════════════════════════════════════════════
// DEMO (chạy standalone với tsx)
// ═══════════════════════════════════════════════════════════════════════

// @ts-ignore
if (typeof require !== 'undefined' && require.main === module) {
  const demo = [
    validateCell({
      cellName: 'khai-cell',
      body: { orbitalCoherence: 0.95, fieldAnchoring: 0.98, qneuIntegrity: 0.99 },
      medium: { subjectProduct: 1, tempHealth: computeTempHealth(37.0), usefulWork: 0.9, heat: 0.05 },
      substrate: { cpuOk: true, ramOk: true, networkOk: true },
      recovery: {
        hasSnapshot: true, snapshotAgeMinutes: 3, cloneCount: 3,
        canMigrate: true, rollbackVersions: 5, canHibernate: true, colonyMemoryShare: true
      },
      temp: 37.0,
    }),
    validateCell({
      cellName: 'thien-lon-partial',
      body: { orbitalCoherence: 0.5, fieldAnchoring: 0.6, qneuIntegrity: 0.7 },
      medium: { subjectProduct: 0, tempHealth: computeTempHealth(38.5), usefulWork: 0.3, heat: 0.25 },
      substrate: { cpuOk: true, ramOk: true, networkOk: true },
      recovery: {
        hasSnapshot: true, snapshotAgeMinutes: 60, cloneCount: 3,
        canMigrate: true, rollbackVersions: 10, canHibernate: true, colonyMemoryShare: true
      },
      temp: 38.5,
    }),
    validateCell({
      cellName: 'lost-persona',
      body: { orbitalCoherence: 0.02, fieldAnchoring: 0.01, qneuIntegrity: 0.05 },
      medium: { subjectProduct: 0, tempHealth: computeTempHealth(30), usefulWork: 0, heat: 0 },
      substrate: { cpuOk: true, ramOk: true, networkOk: true },
      recovery: {
        hasSnapshot: false, snapshotAgeMinutes: 9999, cloneCount: 0,
        canMigrate: false, rollbackVersions: 0, canHibernate: false, colonyMemoryShare: false
      },
      temp: 30,
    }),
  ];

  const report = batchReport(demo);
  console.log('═'.repeat(70));
  console.log(' QIINT2 VALIDATOR DEMO');
  console.log('═'.repeat(70));
  console.log(JSON.stringify(report, null, 2));
}
