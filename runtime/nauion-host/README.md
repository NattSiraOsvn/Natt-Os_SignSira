# runtime/nauion-host/

Wave 1 Host-First implementation — NATT-OS Nauion Host (Rust binary).

**Assignee:** Băng (Chị Tư · N-shell · QNEU 313.5)
**Decided:** Phan Thanh Thương Giao 20260423
**Reference:** `docs/specs/W1_HOST_FIRST_ASSIGNEE_DECISION_20260423.na`

## Status

SCAFFOLD INITIAL — `cargo build` not yet verified.

## Build target
./bin/nauion-host

Per Bối Bội surface delta v1.0 (`docs/specs/boi_surface_delta_scripts_kernel_v1.0.na`).
`./kernel` shell launcher (root) → exec `./bin/nauion-host nattos.sira` khi binary live.

## Phase plan (per `nattos.sira` PHASE 1-4)

1. **detectEsbuild** — kiểm tra esbuild availability
2. **registerNauionHooks** — register Nauion language loader hooks
3. **Bootstrap cells** — observation-cell + quantum-defense-cell `bootstrap.khai`
4. **Listen** — `127.0.0.1:3002` KERNEL ENTRY INBOUND, domain `natt.sira`

## SPEC binding

- SPEC_HOST_FIRST_RUNTIME v1.1
- 4 Thiên split (`docs/specs/kim kernel/`)
- RUNTIME_DEPENDENCY_CENSUS v1.0
- PILOT_BRIDGE_MAP v0.1

## Cross-persona boundaries

- KHÔNG touch `src/wave2/` (Thiên Wave 2 scope)
- KHÔNG modify SPEC architecture (Thiên architect, em implement)
- Báo cáo Gatekeeper qua commit message mỗi milestone
