/**
 * KhaiCellService — Touch point implementation.
 * Per SPEC NEN v1.0 section 4.1: receive then normalize then sign then emit.
 *
 * RULES (SPEC NEN section 11 Field Integrity):
 * - LAW-1: Never decide outcome (only field decides)
 * - LAW-2: Never if/else route by signal type
 * - LAW-4: Never hardcode true/false
 *
 * What KhaiCell DOES:
 *   1. Receive raw signal (any shape)
 *   2. Normalize to canonical payload (format only, no validation)
 *   3. Attach signature (origin + trace_id + entropy_seed + touched_at)
 *   4. Emit into field
 *
 * What KhaiCell DOES NOT do:
 *   - Validate content
 *   - Reject signal
 *   - Route to specific cell
 *   - Check resonance
 *   - Subscribe to events
 */

import {
  generateTraceId,
  generateEntropySeed,
  type KhaiCellSignature,
} from "../entities/KhaiCellSignature";

import type {
  KhaiCellInput,
  KhaiCellOutput,
  KhaiCellEmitter,
} from "../../ports";

export class KhaiCellService {
  constructor(private readonly emitter: KhaiCellEmitter) {}

  touch(input: KhaiCellInput): KhaiCellOutput {
    const normalized = this.normalize(input.raw);
    const signature = this.sign(input.source, input.ts);
    const output: KhaiCellOutput = { normalized, signature };
    this.emitter.emit(output);
    return output;
  }

  private normalize(raw: unknown): unknown {
    return raw;
  }

  private sign(source: string, ts: number): KhaiCellSignature {
    return {
      origin: source,
      trace_id: generateTraceId(source, ts),
      entropy_seed: generateEntropySeed(),
      touched_at: new Date(ts).toISOString(),
    };
  }
}
