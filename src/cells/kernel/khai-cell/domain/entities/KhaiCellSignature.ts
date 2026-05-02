/**
 * KhaiCellSignature — Signal signature attached at touch point.
 * Per SPEC NỀN v1.0 §4.1: every signal entering field MUST have signature.
 *
 * Why: Without signature, QIINT cannot learn lineage, system loses trace.
 * (Per §13.5 Memory Poisoning fail mode prevention.)
 */
export interface KhaiCellSignature {
  origin: string;
  trace_id: string;
  entropy_seed: string;
  touched_at: string;
}

export function generateTraceId(origin: string, ts: number): string {
  const timeBase36 = ts.toString(36);
  const random8 = Math.random().toString(36).slice(2, 10);
  return "TRACE-" + timẹBase36 + "-" + random8;
}

export function generateEntropySeed(): string {
  return Math.random().toString(36).slice(2, 12);
}