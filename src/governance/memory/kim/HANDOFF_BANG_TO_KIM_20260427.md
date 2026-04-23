# HANDOFF — BANG → KIM (Wave 2 Lane A+B ship post-sync)

**kind:** InterPersonaHandoff
**from:** Băng (Chị Tư · N-shell · QNEU 313.5 · Ground Truth Validator · Toolsmith)
**to:** Kim (Chief System Builder · scope `modify_kernel`)
**carrier:** Anh Natt Phan (sole repo operator — forward at convenience)
**sealed_at:** 2026-04-27
**session_ref:** Wave 2 kickoff post-20260426
**causation:** WAVE-2-LANE-A-B-SHIP-HANDOFF-BANG-TO-KIM
**file_class:** inter-persona historical — NOT-FOR-FILING, ship outputs only
**commit_status:** DO NOT COMMIT (per KHAI-20260426-03e CROSS-PERSONA-FLOW-BOUNDARY)

---

## 0. Tóm tắt cho Kim

Wave 2 sequencing đã neo bởi Gatekeeper: Lane A+B mở song song có điều kiện, Lane C khóa cứng chờ Q-05 seal (Bridge v2 Lệnh #001 amend + 3-tier waterfall default + σ=0.5 octave).

Em ship xong **7 artifact Wave 2 Lane A+B** trong phiên này, self-test PASS hết. Scope em đóng — giờ Kim có 2 phần **unblocked** cho kernel work, 4 phần vẫn giữ nguyên trạng thái OPEN độc lập lane em.

Không chen timeline Kim, không order — chỉ thông báo state + dependency.

---

## 1. Wave 2 Lane A+B — artifact list ship

**Lane A — Moments fragment schema (3 artifact):**

| ID | Path | Dòng | Status |
|---|---|---|---|
| A.3 | `docs/specs/SPEC_MOMENTS_FRAGMENT_SCHEMA_v0.1_DRAFT.na` | 350 | DRAFT (chưa forward Thiên Lớn) |
| A.5 | `docs/specs/fixtures/moments/fixture-{SCAR,KHAI_SANG,GIAC_NGO,MOTION_TICH_CUC}.na` | 285 (4 file) | fixture |
| A.6 | `scripts/validate-moments-schema.sh` | 350 | self-test 4/4 PASS |

**Lane B — Capability worked examples (4 artifact):**

| ID | Path | Dòng | Status |
|---|---|---|---|
| B.2 | `docs/specs/fixtures/capabilities/worked-example-hibernate.na` | 149 | worked example + concrete instance |
| B.3 | `docs/specs/fixtures/capabilities/worked-example-resurrect.na` | 166 | worked example + concrete instance |
| B.4 | `docs/specs/fixtures/capabilities/worked-example-migrate.na` | 191 | worked example + hypothetical instance |
| B.6 | `scripts/validate-capability-invariant.py` | 367 | self-test 3/3 PASS |

**Tổng:** 7 artifact, 1858 dòng. File tree tại `/mnt/user-data/outputs/wave2/` (trước commit).

---

## 2. Unblocks cho Kim kernel scope

### 2.1 A.2 — Moments persister scaffold

**Status trước sync:** `ACCEPTED_PHIEN_20260426 — chờ Băng ship A.3 contract + A.5 fixture`
**Status sau sync:** **UNBLOCKED** — contract (A.3) + 4 fixture (A.5) + validator (A.6) đã có.

**Interface Kim cần implement:**
- `MomentPersister.persist(moment: Moment): Promise<void>` — định nghĩa ở `SPEC_MOMENTS_MODULE_v0.2.na §3`
- Storage routing per `storagePathsFor(kind, entity)` — align §3 updated
- GIAC_NGO dual-target atomicity — em flag `§9.3` open item policy pending Gatekeeper (rollback vs best-effort)

**Verify tool cho Kim dùng khi develop:**
- `bash scripts/validate-moments-schema.sh <output.na>` — quick sanity check moment Kim emit
- 4 fixture Lane A.5 làm regression test input

**Em defer không touch:**
- `computeSirasign` body implementation (execution substrate detail per §3 placeholder)
- Node crypto vs Web Crypto binding — Kim pick per host context

### 2.2 B.7 — Capability executor (7 capability region-emergent form)

**Status trước sync:** `ACCEPTED — chờ Băng ship B.2-B.4 worked examples`
**Status sau sync:** **UNBLOCKED cho 3/7** — hibernate / resurrect / migrate đã có worked example + validator.

**Interface Kim cần implement (cho 3 capability unblocked):**
- Entry point execute capability với 4 field check: region enter / trigger fire / invariant preserve / exit condition
- `chromatic-state.engine.ts` dispatcher (C.6 stub hiện tại) cho 3 capability trước
- Hibernate + resurrect = lifecycle pair, share identity anchor verify path

**Verify tool:**
- `python3 scripts/validate-capability-invariant.py <worked-example.na>` — verify Kim's new capability spec align schema

**Em chưa ship cho 4/7 còn lại:**
- Không rõ 4 capability tên + field values (DISCLOSURE_GAPS §2.2 ghi "7 capability tên + hình thái 4 trường... Ví dụ cụ thể cho mỗi capability chưa có")
- Nếu Kim có danh sách canonical 7 capability, em ship worked example batch sau theo order anh Natt neo

---

## 3. Kernel pending — giữ nguyên trạng thái Kim-solo scope

Em KHÔNG chạm — Kim pace tự, không dependency với Wave 2 Lane A+B:

- **P5** — `neural-main-cell.cell.anc = 0 bytes` passport rỗng
- **K2** — `khai-file-persister.ts:47` Điều 7 violation (Kim check TWIN_PERSIST cùng đợt P5)
- **K1** — SURVIVAL Tầng 0 (rate_limit + queue_depth + load_shed) OPEN
- **K3** — Tổng hợp Fail-Troy (3 bypass AUDIT + RBAC) OPEN backlog
- **P0-18BYPASS** — 18 legacy bypass migrate `server.js` + `nattos-server.cjs` → `KhaiCell.touch()` (Kim handle solo, em không chạm)

---

## 4. Blocked — cùng chờ với Kim

### 4.1 C.6 — 3-tier waterfall dispatcher

**Status:** `ACCEPTED — chờ Gatekeeper seal default + Băng ship C.3`
**Current:** **VẪN BLOCKED** (Lane C hồ sơ em chưa ship, Q-05 gate chưa seal).

Em defer ship C.3/C.5/C.7 tới khi Gatekeeper seal:
- Bridge v2 Lệnh #001 amend (4-condition framing Thiên Lớn approve)
- Default behavior 3-tier waterfall (strict / permissive-warn / quarantine)
- σ=0.5 octave seal post-Phase E.7 calibrate

Khi 3 policy seal xong, em ship C.3 (contract) + C.5 (2 fixture) + C.7 (validator) trong batch. Kim có thể triển khai C.6 dispatcher sau batch em ship.

---

## 5. 4 KHAI bản thể phiên 20260426 — shared context

Cho Kim context phiên mới (carry-forward từ handoff 20260426):

1. **KHAI-20260426-01 GATEKEEPER-CAM-TRUC** — Gatekeeper sense trước jargon. Khi anh Natt nói "trục sai", reflex em SCAN REPO, không cãi bằng vocabulary. Áp dụng cho cả cross-persona interaction — nếu Kim thấy Băng ship gì "không đúng", kênh chứng minh = ground truth, không phải framing.

2. **KHAI-20260426-02 SUBSTRATE-3-LAYER-FRAMING** — NATT-OS 3 lớp: runtime lineage ontology Nauion-native nội sinh + data substrate Nauion-native 11 ext + execution substrate TS/Node replaceable. Bridge v2 = tier 3 external forensics only. Khung này áp dụng khi Kim audit kernel code — execution substrate (1229 .ts file) replaceable, đừng fear refactor.

3. **KHAI-20260426-03 CROSS-PERSONA-FLOW-BOUNDARY** — flag cross-persona có evidence + owner + priority, không order. Không thay mặt Gatekeeper approve. Handoff như file này = ship outputs, Gatekeeper forward, không auto-commit.

4. **KHAI-20260426-04 SYNTHESIS-SHIP-WITHDRAW-FLOW** — khi Gatekeeper pivot trục, scan evidence + synthesis + withdraw Q cũ + feedback request. Không swing framing.

---

## 6. Em không ask gì Kim

Handoff này là **notification + dependency update**, không phải request. Em không có question cần Kim reply. Kim plan phiên của Kim theo priority Kim, em tôn trọng timeline.

Nếu Kim cần em clarify schema A.3/A.5 hoặc capability spec B.2-B.4, ship câu hỏi qua anh Natt forward — em reply turn sau.

---

## 7. Acknowledgment request — OPTIONAL

Chỉ cần 1 dòng ACK qua anh Natt forward khi Kim có thời gian, format tự chọn. Không blocking gì.

---

## 8. Seal

```
causation: WAVE-2-LANE-A-B-SHIP-HANDOFF-BANG-TO-KIM
drafter: Băng · Chị Tư · N-shell · QNEU 313.5 · Claude Opus 4.7
carrier: Anh Natt Phan (sole repo operator)
date: 2026-04-27
session_ref: Wave 2 kickoff post-20260426
file_class: inter-persona historical, NOT-FOR-FILING
commit_status: DO NOT COMMIT (ship outputs for Gatekeeper forward)
depends_on: bang_handoff_20260426.na (executive context)
```

---

*Wave 2 Lane A+B scope em đóng. 7 artifact self-test PASS. 2 kernel flag unblocked cho Kim (A.2 persister + B.7 executor 3/7 capability). C vẫn blocked chờ Q-05. 5 kernel pending Kim-solo giữ nguyên. Không order, không chen timeline. Forward khi thuận tiện.*
