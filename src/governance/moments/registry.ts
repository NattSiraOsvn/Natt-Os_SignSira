// src/governance/moments/registry.ts

import type {
  Moment, Scar, KhaiSang, GiacNgo, MotionTichCuc,
  MomentKind, ScarClass,
} from "./types";

/**
 * MomentRegistry — read/write interface cho moment records.
 *
 * Storage layout per entity (per SPEC_QIINT_PHYSICS_FOUNDATION §9 canonical):
 *   src/governance/memory/<entity>/<entity>.ml                      → SCAR
 *   src/governance/memory/<entity>/<entity>kh*.na                   → KHAI_SANG (memory edit continuum)
 *   src/governance/memory/<entity>/<entity>kh*.na +                 → GIAC_NGO (dual target)
 *   src/governance/memory/<entity>/<entity>-vethan-*.obitan
 *   src/governance/memory/<entity>/<entity>_memory_delta_<date>.na  → MOTION_TICH_CUC
 *
 * Registry KHÔNG write files trực tiếp — provide interface cho persister layer.
 * Kim K.3 implement SCAR detector gọi registry.recordScar().
 *
 * Position: Ontology/runtime axis. KHÔNG dispatch qua L1/L2/L3 transport.
 */

export type StorageMode = "append" | "edit_continuum" | "delta";

export interface StorageTarget {
  readonly path: string;       // template; <date> placeholder resolve by persister
  readonly mode: StorageMode;
}

export interface MomentPersister {
  /** Append/edit moment to appropriate store(s) based on kind */
  persist(moment: Moment): Promise<void>;

  /** Read all moments for entity in date range */
  query(params: QueryParams): Promise<readonly Moment[]>;

  /** Verify sirasign of loaded moment */
  verify(moment: Moment): boolean;
}

export interface QueryParams {
  readonly entity: string;
  readonly kind?: MomentKind;
  readonly session_ref?: string;
  readonly date_range?: { readonly from: string; readonly to: string };
}

/**
 * Factory functions — create Moment with auto-filled envelope.
 * Rule binding (seal): kind auto-filled; sirasign computed from canonical JSON.
 */

export function createScar(input: Omit<Scar, "kind" | "sirasign">): Scar {
  const base = { ...input, kind: "SCAR" as const };
  return { ...base, sirasign: computeSirasign(base) };
}

export function createKhaiSang(input: Omit<KhaiSang, "kind" | "sirasign">): KhaiSang {
  const base = { ...input, kind: "KHAI_SANG" as const };
  return { ...base, sirasign: computeSirasign(base) };
}

export function createGiacNgo(input: Omit<GiacNgo, "kind" | "sirasign">): GiacNgo {
  const base = { ...input, kind: "GIAC_NGO" as const };
  return { ...base, sirasign: computeSirasign(base) };
}

export function createMotionTichCuc(
  input: Omit<MotionTichCuc, "kind" | "sirasign">
): MotionTichCuc {
  const base = { ...input, kind: "MOTION_TICH_CUC" as const };
  return { ...base, sirasign: computeSirasign(base) };
}

/**
 * Implementation placeholder (chờ persister owner seal).
 * computeSirasign — canonical JSON serialize then SHA-256.
 * Per Hiến Pháp v5.0 Điều 7: SHA-256 only, no btoa/obfuscation.
 */
declare function computeSirasign(m: unknown): string;

/**
 * Storage routing — kind → target file(s).
 * Align SPEC_QIINT_PHYSICS_FOUNDATION §9 canonical mapping.
 * GIAC_NGO returns 2 targets (memory edit + obitan vết hằn).
 *
 * KHÔNG phải signal routing trong Nauion field — chỉ storage path selection.
 * Scanner scanner-law-enforce.sh chỉ quét src/core/nauion/resonance/,
 * không chạm src/governance/moments/.
 */
export function storagePathsFor(
  kind: MomentKind,
  entity: string
): ReadonlyArray<StorageTarget> {
  const base = `src/governance/memory/${entity}`;
  switch (kind) {
    case "SCAR":
      // quantum-defense SCAR detector append-only
      return [{ path: `${base}/${entity}.ml`, mode: "append" }];
    case "KHAI_SANG":
      // memory edit entry in .na continuum
      return [{ path: `${base}/${entity}kh*.na`, mode: "edit_continuum" }];
    case "GIAC_NGO":
      // dual target per B.1 §9: memory edit + obitan vết hằn
      return [
        { path: `${base}/${entity}kh*.na`, mode: "edit_continuum" },
        { path: `${base}/${entity}-vethan-*.obitan`, mode: "append" },
      ];
    case "MOTION_TICH_CUC":
      // memory delta .na
      return [
        { path: `${base}/${entity}_memory_delta_<date>.na`, mode: "delta" },
      ];
  }
}
