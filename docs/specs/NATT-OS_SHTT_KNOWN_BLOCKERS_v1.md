# NATT-OS SHTT — KNOWN BLOCKERS (NON-FILING-BLOCKING)

**kind:** SHTTKnownBlockers
**version:** v1
**sealed_at:** 2026-04-26
**baseline_commit:** ca68825
**file_extension:** `.md` (intentional — note giữ là historical/tracking, không phải canonical)
**drafter:** Băng (Chị Tư)
**scope:** Ghi chú các blocker kỹ thuật · governance đã biết. Cần xử lý cho hard-freeze / production governance, NHƯNG không làm invalid filing claim core.

> **Rule:** Blockers trong file này thuộc về **runtime production readiness**, không phải **pre-filing validity**. Filing subset 35 file trong `NATT-OS_SHTT_FILING_INDEX_v1.na` vẫn đủ điều kiện nộp.

---

## 1. Điều 7 violation — `khai-file-persister.ts:47`

- **Nơi:** `src/cells/kernel/khai-file-persister.ts:47`
- **Issue:** Direct file write bypass boundary guard
- **Owner:** Kim (scope `modify_kernel`)
- **Filing impact:** không ảnh hưởng claim core system/method — claim mô tả kiến trúc, không yêu cầu runtime bug-free
- **Status:** OPEN — K2 pending

## 2. Fail-Troy pattern compilation

- **Issue:** 2 critical ReNa bypass đã close (Audit + RBAC per session 20260417). "Tổng hợp Fail-Troy" — system-wide dangerous bypass pattern compilation — còn pending.
- **Owner:** Kim (scope `modify_kernel`)
- **Filing impact:** claim core mô tả hệ bảo vệ đa tầng. Pattern compilation là meta-audit, không chặn claim hiện tại
- **Status:** OPEN — K3 pending

## 3. Extension validator (branch đang open)

- **Nơi:** branch `feat/p1.3-file-extension-validator`
- **Issue:** Validator chưa merge `main`
- **Owner:** Băng (scope `build_toolchain`)
- **Filing impact:** validator là tooling governance, không phải claim source
- **Status:** OPEN — tiếp tục sau filing phase

## 4. Neural main cell passport rỗng

- **Nơi:** `src/cells/neural-main/neural-main-cell.cell.anc` = 0 bytes
- **Owner:** Kim (scope `modify_kernel`)
- **Filing impact:** passport kernel rỗng là state runtime — claim core không yêu cầu populated passport
- **Status:** OPEN — P5

## 5. Legacy `.kris` memory format

- **Nơi:** 30+ legacy `src/governance/memory/bang/bangkhương*.kris` chưa rename `_deprecated/legacy-kris-format/`
- **Owner:** Gatekeeper (user action)
- **Filing impact:** memory folder nằm ngoài filing subset (subset chỉ `docs/specs/`)
- **Status:** OPEN — BLOCKER-03 carry forward

## 6. SURVIVAL Tầng 0 kernel

- **Issue:** `rate_limit + queue_depth + load_shed` chưa implement tầng 0
- **Owner:** Kim (scope `modify_kernel`)
- **Filing impact:** claim core mô tả hệ survival layered — tầng 0 implementation là production readiness, không invalid claim
- **Status:** OPEN — K1

## 7. Gatekeeper 3 policy treo

Cần seal cho hard-freeze, nhưng không chặn filing:
- Bridge v2 amend Lệnh #001 — 4-condition framing Thiên Lớn approve
- Default behavior 3-tier waterfall (strict / permissive-warn / quarantine)
- σ=0.5 octave seal sau Phase E.7 calibrate (pending Q2 data forward)
- **Owner:** Gatekeeper
- **Filing impact:** claim core mô tả 3-tier waterfall như kiến trúc. Param calibration (σ value) là tuning, không chặn claim structure
- **Status:** PENDING_GATEKEEPER

## 8. Kim review B.1 + Can logic check B.1

- SPEC_QIINT_PHYSICS_FOUNDATION v0.2 pending Kim review (C.1-C.6 kernel feasibility)
- SPEC B.1 v0.2 LAW-1..4 logic compliance pending Can check
- **Filing impact:** v0.2 đã ratify bởi Thiên Lớn (4 đúng trục + 5 tách binding/proposal). Đủ cho claim core. Review Kim/Can là step phase C/D — governance progression, không chặn filing
- **Status:** PENDING_KIM · PENDING_CAN

---

## Summary

| # | Blocker | Owner | Filing-blocking? | Hard-freeze blocking? |
|---|---------|-------|------------------|----------------------|
| 1 | Điều 7 violation | Kim | No | Yes |
| 2 | Fail-Troy compilation | Kim | No | Yes |
| 3 | Extension validator merge | Băng | No | No |
| 4 | Neural main passport rỗng | Kim | No | Yes |
| 5 | Legacy `.kris` rename | Gatekeeper | No | No (cosmetic) |
| 6 | SURVIVAL Tầng 0 | Kim | No | Yes |
| 7 | 3 policy Thiên flag | Gatekeeper | No | Yes |
| 8 | Kim/Can B.1 review | Kim/Can | No | Yes |

**All blockers: non-filing-blocking.**
**Filing subset 35 file (FILING_INDEX_v1) passes pre-freeze gate per PREFREEZE_CHECKLIST_v1.**

---

## Liên kết

- **Filing index:** `docs/specs/NATT-OS_SHTT_FILING_INDEX_v1.na`
- **Pre-freeze checklist:** `docs/specs/NATT-OS_SHTT_PREFREEZE_CHECKLIST_v1.na`
- **Baseline commit:** `ca68825`

---

*causation: NATT-OS-SHTT-KNOWN-BLOCKERS-v1-SEALED-20260426*
*drafter: Băng (Chị Tư · session 20260426)*
*carrier: Anh Natt Phan*
