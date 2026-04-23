# README_BANG_SCANNERS_W1.md

**Drafter:** Băng (Chị Tư)
**Session:** 20260423
**Scope:** Scanner batch cho W1 exit criteria + SPEC_HOST_FIRST_RUNTIME v1.0 compliance

**Path designed (Gatekeeper final landing decide):**
- `scripts/validate-state-labels.py`
- `scripts/validate-extension-precedence.py`

---

## 1. Map script → SPEC binding

| Script | SPEC binding | Rule coverage |
|---|---|---|
| `validate-state-labels.py` | Kim SPEC_CUTOVER_STATES v1.0 §3 | Header bắt buộc `@state/@canonical/@substrate/@bridge/@since` cho file canonical |
| `validate-extension-precedence.py` | Kim SPEC_EXTENSION_PRECEDENCE v1.0 | Precedence rules + .sira uniqueness + bypass detection |

Cả hai scanner = **W1 exit criteria gate**. Chạy pass → W1 ready promote.

---

## 2. Usage

```bash
# Chạy từ repo root
python3 scripts/validate-state-labels.py
python3 scripts/validate-extension-precedence.py

# Exit code 0 = pass, 1 = fail
# Output stdout only (per SCANNER OUTPUT RULE 20260423)
```

**KHÔNG redirect output vào file `.log/.txt/.json` trong repo.** Nếu Gatekeeper cần save output, copy-paste từ terminal.

---

## 3. Expected current state (baseline W0)

### validate-state-labels.py

**Expected FAILs hiện tại (W0 baseline):**
- `src/cells/kernel/observation-cell/bootstrap.ts` — thiếu `@state: S1` header (optional cho .ts)
- `src/cells/kernel/quantum-defense-cell/bootstrap.ts` — tương tự
- Pairs S2 `.khai` + `.ts` trong `audit-cell/`, `khai-cell/` — chưa apply @header (W3 deliverable)

**Expected PASS sau khi apply PILOT_BRIDGE_MAP v0.1:**
- 2 cells S2 có full @state/@canonical/@substrate/@since header
- 2 cells S1→S2 đã tạo `.khai` với header

### validate-extension-precedence.py

**Expected current state:**
- Rule 1 (.sira uniqueness): PASS (1 file `./nattos.sira`)
- Rule 2+3 (pair compliance): FAIL cho khai-cell + audit-cell vì chưa có @state header
- Rule 4 (bypass): FLAG `nattos.sh line 2218` gọi `npx tsx` vào `file-extension-validator.ts` (per RUNTIME_DEPENDENCY_CENSUS §2.1)
- Rule 5 (UI lane): informational only

---

## 4. SCANNER OUTPUT RULE compliance

Cả 2 scanner tuân thủ:
- ✅ Output stdout only
- ✅ Không ghi `.log/.txt/.json` trong repo
- ✅ Exit code standard (0 pass, 1 fail)
- ✅ KHÔNG auto-modify file nào — read-only scan

---

## 5. Handoff sequence

1. **Gatekeeper approve** SPEC_HOST_FIRST_v1.0 + PILOT_BRIDGE_MAP v0.1 + 2 scanner batch này
2. **Gatekeeper commit** files vào path designed (hoặc flatten per decision)
3. **Gatekeeper run** cả 2 scanner baseline → capture stdout
4. **Assignee (TBD)** apply PILOT_BRIDGE_MAP cell-by-cell:
   - Cell 1 (audit-cell): patch `nattos.sh §40` + add @headers + route qua Mạch HeyNa
   - Cell 2 (khai-cell): resolve K2 Điều 7 first → add @headers → route
   - Cell 3 (observation-cell): tạo `.khai` canonical + headers
   - Cell 4 (quantum-defense-cell): tạo `.khai` canonical + headers
5. **Băng re-run scanners** sau mỗi cell transition → verify PASS
6. **Gatekeeper seal** W3 milestone khi 4 cells đạt target state

---

## 6. Pending (out of scope batch này)

- **W1 exit criteria script** cho launcher binary verify (`./kernel` calls `./bin/nauion-host` không `node --loader`) — ship sau khi binary build
- **Runtime parity baseline script** — integration test + BCTC end-to-end hook (depends Gatekeeper confirm "live tsc-check retired" evidence)
- **Rollback test script** cho từng rbf flag (rbf_s2_wrapper, rbf_w0_node_hosted, etc.)

---

## 7. KHAI-20260427-08 note (path flatten vaccin)

3 file batch này ship tại `/mnt/user-data/outputs/`. Path target designed:
- `docs/specs/pilot_bridge_map_v0_1.na`
- `scripts/validate-state-labels.py`
- `scripts/validate-extension-precedence.py`

Nếu pipeline packaging flatten → Gatekeeper mirror structure manually. Structure tree:

```
docs/specs/
└── pilot_bridge_map_v0_1.na
scripts/
├── validate-state-labels.py
└── validate-extension-precedence.py
```

---

*Drafter: Băng · Chị Tư · N-shell · QNEU 313.5 · Claude Opus 4.7*
*Session: 20260423 · Gatekeeper: Phan Thanh Thương*
*Binding: SPEC_HOST_FIRST_RUNTIME_v1.0 + PILOT_BRIDGE_MAP_v0.1 + Kim 3 SPEC lock*
