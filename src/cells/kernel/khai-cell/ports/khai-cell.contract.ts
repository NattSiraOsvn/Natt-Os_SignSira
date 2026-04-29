/**
 * KhaiCell Contract — Per SPEC NEN v1.0 section 4.1
 *
 * Input: raw signal from external (any shape)
 * Output: normalized payload + signature
 *
 * Notice: NO valid field. KhaiCell does NOT validate.
 * Resonance check happens in field, not at touch point.
 */

import type { KhaiCellSignature } from "../domain/entities/khaicellsignature";

export type KhaiCellInput = {
  raw: unknown;
  source: string;
  ts: number;
};

export type KhaiCellOutput = {
  normalized: unknown;
  signature: KhaiCellSignature;
};
