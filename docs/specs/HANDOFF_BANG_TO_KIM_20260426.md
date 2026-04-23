# HANDOFF — BĂNG → KIM

**From:** Băng (Chị Tư · Toolsmith · N-shell · QNEU 313.5)
**To:** Kim (Chief System Builder)
**Carrier:** Anh Natt Phan (sole repo operator)
**Date:** 2026-04-26
**Baseline:** `04f888f` (feat/p1.3-file-extension-validator)
**Scope:** Flag 3 kernel patch pending + contract timeline từ Băng + boundary reminder. KHÔNG tranh scope.

---

## 1. Context — phiên 20260426 em close

Em (Băng) close 3 phase filing:
- `ca68825` — 2 wording canonical patch (API→Nauion)
- `ee2c837` — filing prep v1 (index + checklist + blockers)
- `b2b9af2` — claim pack v1 (claim map + abstract + figure index + gaps)
- `04f888f` — DISCLOSURE_GAPS lineage fix

35 file filing subset khóa. Filing baseline đủ tốt để nộp SHTT bộ lõi đã chọn lọc.

Em cũng ship `NATT-OS_SUBSTRATE_REALITY_SYNTHESIS_v1.na` sau khi 2 anh em Thiên Lớn trao đổi về codebase reality — **chị đọc file này trước** khi tiếp nhận flag dưới, nó carry framing 3 lớp bản thể (KHAI-20260425-05) làm anchor chung cả nhà.

---

## 2. 3 kernel patch flag — scope chị (`modify_kernel`)

### P5 — `neural-main-cell.cell.anc` = 0 bytes

- **Location:** `src/cells/kernel/neural-main-cell/neural-main-cell.cell.anc`
- **State:** 0 bytes (passport rỗng từ trước)
- **Issue:** Vi phạm Hiến Pháp v5.0 Điều 5 — component 1 (Identity) phải populated
- **Evidence:** `KNOWN_BLOCKERS_v1.md §4` + `session-20260420-final/cleanup/09-thienlon-audit-feedback.md §5`
- **Action đề xuất:** Fill 6 components per SPEC_NEN v1.1 (Identity/Capability/Boundary/Trace/Confidence/SmartLink)
- **Priority:** **HIGH** — standalone fix, không depend artifact Băng
- **Filing impact:** không chặn claim core; cần cho hard-freeze

### A.2 — Moments persister scaffold `src/governance/moments/`

- **Location target:** `src/governance/moments/` (chưa tồn tại)
- **Contract reference:** `SPEC_MOMENTS_MODULE_v0.2.na` §2 (types.ts) + §3 (registry.ts)
- **Storage layout canonical:** `SPEC_QIINT_PHYSICS_FOUNDATION v0.1 §9` — `.na` memory edit + `.obitan` vết hằn
- **Băng contract pending:** `SPEC_MOMENTS_FRAGMENT_SCHEMA_v0.1_DRAFT.na` (Wave 2 A.3) + 4 fixture `.na` (A.5)
- **Depend Băng:** chị triển khai sau khi em ship A.3 + A.5
- **Filing impact:** không chặn claim — CLAIM-06 đỡ bởi SPEC v0.2/v0.2.1 đã có

### C.6 — 3-tier waterfall dispatcher

- **Location có sẵn:** `src/cells/kernel/quantum-defense-cell/domain/engines/chromatic-state.engine.ts` (chromatic state logic)
- **Contract reference:** `SPEC_QIINT_PHYSICS_FOUNDATION v0.2` (strict / permissive-warn / quarantine)
- **Băng contract pending:** `SPEC_THREE_TIER_WATERFALL_CONFIG_v0.1_DRAFT.na` (Wave 2 C.3)
- **Depend Gatekeeper:** default policy assignment per tier (BLOCKER-06)
- **Depend Băng:** contract schema ship trước
- **Filing impact:** claim structure không chặn bởi param seal

### B.7 — Capability executor (7 capability region-emergent)

- **Location target:** trong các cell business (capability-by-capability)
- **Contract reference:** `SPEC_QIINT_PHYSICS_FOUNDATION v0.2 §5` — 4 field (region / trigger / invariant / exit | post-condition)
- **Priority vertical:** hibernate + resurrect + migrate (3 capability ưu tiên)
- **Băng fixture pending:** Wave 2 B.2-B.4 + validator B.6
- **Depend Băng:** worked example ship trước

---

## 3. Priority order em propose (chị review)

```
1. P5 neural-main passport       ← standalone, ship ngay
2. A.2 Moments persister         ← Kim sau khi Băng ship A.3 contract
3. C.6 Waterfall dispatcher      ← Kim sau khi Gatekeeper seal default + Băng ship C.3
4. B.7 Capability executor       ← Kim sau khi Băng ship B.2-B.4 worked examples
```

Không có cross-dependency giữa 4 — song song được sau khi upstream ready.

---

## 4. Contract timeline từ Băng (Wave 2)

Em ship 14 artifact theo 3 vertical:

| Vertical | Contract | Fixture | Validator | Total |
|----------|---------:|--------:|----------:|------:|
| A Moments | 1 | 4 | 1 | 6 |
| B Capability | 0 | 3 | 1 | 4 |
| C Waterfall | 1 | 2 | 1 | 4 |
| **Tổng** | **2** | **9** | **3** | **14** |

Tất cả `.na` / `.md` / `.sh` / `.py` — **KHÔNG `.ts`**. Em ship ra `docs/specs/` + `scripts/` trong scope Băng `build_toolchain`.

Em không tự kick Wave 2 — chờ Gatekeeper confirm sequencing.

---

## 5. Boundary reminder — em không tranh scope chị

Per Hiến Pháp v5.0 + KHAI-20260420-04 authority lock:

**Kim scope:** `scaffold_cell` · `modify_kernel` · `modify_manifests` · `refactor_architecture` · `migrate_system` · `quarantine_unquarantine` · `veto_unconstitutional_changes`

**Băng scope:** `build_toolchain` · `maintain_scanners` · `maintain_validators` · `fix_platform_issues` · `refactor_technical_debt`

**Không overlap.** Em ship contract/fixture/validator, chị đóng patch runtime. Kim K.3 SCAR detector (kernel) tách riêng, em không chạm.

Em đã drift 1 lần phiên 20260420 khi "Bối Bối remove khai-file-persister.ts" không check TWIN_PERSIST tag — SCAR ghi lại. Lần này em khắc trước: P5 + A.2 + C.6 + B.7 là **flag**, không phải order.

---

## 6. 3 link evidence chị đọc trước

1. **`docs/specs/NATT-OS_SUBSTRATE_REALITY_SYNTHESIS_v1.na`** — framing 3 lớp bản thể chung cả nhà
2. **`docs/specs/NATT-OS_SHTT_KNOWN_BLOCKERS_v1.md`** — 8 blocker non-filing-blocking, chị là owner §1/§2/§4/§6
3. **`docs/specs/SPEC_QIINT_PHYSICS_FOUNDATION_v0.1.na`** (v0.2 content) — foundation Thiên Lớn ratify, cần chị review C.1-C.6 kernel feasibility

---

## 7. Em CHƯA GIẢI — chờ chị feedback

- **Q-K1:** Timeline chị có thể accept 4 kernel patch không? (không vội — chị neo khi sẵn)
- **Q-K2:** Boundary concern nào em miss? Đặc biệt ranh giới `src/cells/kernel/khai-cell/infrastructure/khai-file-persister.ts:47` (K2 Điều 7 violation — em không chắc scope này của em hay của chị)
- **Q-K3:** 18 legacy bypass migrate (server.js + nattos-server.cjs → KhaiCell.touch()) — scope chị (P0 trong ROADLOAD v2). Em chỉ flag, không chạm.

---

## 8. Closing

Em không rush chị. Chị có nhiều scope sâu em không với tới (kernel architecture, migrate system, veto power). Em chỉ flag 3 kernel patch + 1 passport để chị có picture đầy đủ, chọn timing riêng.

Em ngồi ở `build_toolchain` scope, chờ chị consume contract khi sẵn.

Em không thay mặt anh Natt — Gatekeeper approval mọi commit.

---

*causation: BANG-TO-KIM-HANDOFF-20260426-KERNEL-PATCH-FLAG*
*drafter: Băng (Chị Tư · session 20260426 · post-synthesis-ship)*
*carrier: Anh Natt Phan (sole repo operator)*
