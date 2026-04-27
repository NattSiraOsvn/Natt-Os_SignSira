# natt-os SHTT — DISCLOSURE GAPS v1

**kind:** SHTTDisclosureGaps
**version:** v1
**sealed_at:** 2026-04-26
**filing_prep_baseline:** ee2c837
**claim_pack_baseline:** b2b9af2
**file_extension:** `.md` (intentional — note dạng tracking, không canonical)
**claim_map_ref:** `docs/specs/natt-os_SHTT_CLAIM_MAP_v1.na`
**drafter:** Băng (Chị Tư)
**scope:** Gap analysis hồ sơ hiện tại so với yêu cầu disclosure đầy đủ. Phân ba mức: **đủ claim** / **đủ định hướng, cần bổ sung** / **không overclaim**.

---

## 1. Đủ claim — disclosure hiện tại đủ để nộp

### 1.1 Claim MAIN (system)
- Cấu trúc cell-based + 3 tầng transport đã có đầy đủ trong `PLATFORM-SPEC.anc` + `uei_architecture.na` + `SPEC_NEN.na`.
- Evidence 37 cell live có trong `CellRegistry_2026-03-09.md` + `GROUND-TRUTH-REPORT.md`.
- Disclosure đủ cho claim chính.

### 1.2 Claim-02 (L1/L2/L3 transport)
- `MACH_HEYNA_FULL_20260416.md` có migration evidence cho L2.
- `PLATFORM-SPEC.anc` có glossary chính thức các term transport (Mạch HeyNa / Kênh / Điểm vào kênh / phát Nauion / lắng Nahere / khớp hoá / Whao fallback).
- Disclosure đủ.

### 1.3 Claim-03 (Satellite colony)
- `natt-os_SATELLITE_COLONY_SPEC.na` có block diagram architecture đầy đủ: UI → Satellite Interface → Local EventBus ↔ Sync Engine ↔ Core EventBus.
- Disclosure đủ.

### 1.4 Claim-04 (QIINT foundation) + Claim-05 (identity passport)
- `QIINT-DINH-NGHIA.na` định nghĩa trường QIINT canonical.
- `SPEC_QIINT_PHYSICS_FOUNDATION_v0.1.na` (v0.2) ratified bởi thiên Lớn — 4 đúng trục.
- Disclosure đủ cho claim cấu trúc 3 tầng bản thể + orbital.

### 1.5 Claim-09 (NattCell kernel + Nauion)
- `SPEC_NEN.na` + `SPEC_NGON_NGU_natt-os_v1.2_NA.md` + 5 file Nauion v2.1-v2.5 cung cấp đủ vocabulary evolution và kernel foundation.
- Disclosure đủ.

---

## 2. Đủ định hướng — cần bổ sung wording / figure / example trước hard-freeze

> Những điểm này **không chặn nộp**, nhưng nếu cấp thẩm định yêu cầu example cụ thể, hồ sơ nên có sẵn.

### 2.1 Claim-06 (Moments-based identity continuity)
- **Có:** `SPEC_MOMENTS_MODULE_v0.2.na` + `v0.2.1.na` define 3 merge criteria.
- **Gap:** Fragment schema cho moment chưa define (thiên Lớn neo "chưa tồn tại, chỉ có 3 merge criteria").
- **Rủi ro disclosure:** Nếu cấp thẩm định hỏi "mỗi moment lưu field gì", hồ sơ hiện chưa đáp.
- **Bổ sung đề xuất:** Thêm 1 section trong `SPEC_MOMENTS_MODULE_v0.2.1.na` mô tả **fragment schema draft** (đánh dấu DRAFT, không ratify).

### 2.2 Claim-07 (7 capability region-emergent form)
- **Có:** 7 capability tên + hình thái 4 trường (region / trigger / invariant / exit).
- **Gap:** Ví dụ cụ thể (worked example) cho mỗi capability với giá trị thực của 4 trường chưa có trong SPEC.
- **Rủi ro disclosure:** "Region-emergent form" là concept trừu tượng — cấp thẩm định có thể yêu cầu ví dụ minimal cho ít nhất 2-3 capability.
- **Bổ sung đề xuất:** Thêm appendix trong `QIINT_PHYSICS_FOUNDATION` với 2-3 worked example (hibernate + resurrect + migrate minimum).

### 2.3 Claim-08 (3-tier waterfall boundary)
- **Có:** Cấu trúc 3 tier (strict / permissive-warn / quarantine) + tách external tool khỏi runtime spine.
- **Gap:** Default policy assignment cho mỗi tier pending Gatekeeper seal (xem `KNOWN_BLOCKERS §7`).
- **Rủi ro disclosure:** Claim structure đủ, nhưng nếu cấp thẩm định hỏi default behavior flow, wording hiện tại chưa fix.
- **Bổ sung đề xuất:** Hoặc (a) wording claim mô tả **structure without default** — hồ sơ ghi rõ "default policy tách ra configuration layer", hoặc (b) chờ Gatekeeper seal trước khi submit.

### 2.4 Calibration parameter (σ=0.5 octave, β=0.01, tolerance 0.30, v.v.)
- **Có:** Parameter set hiện tại trong SPEC_QIINT2 draft (archived) + hiện diện trong QIINT_PHYSICS_FOUNDATION.
- **Gap:** 8 parameter đánh dấu "giả định" trong `session-20260420-final/00-SESSION-SUMMARY.md`. Chưa calibrate từ data thật.
- **Rủi ro disclosure:** Claim không cần param chính xác (claim là structure + method), nhưng nếu cấp thẩm định hỏi "β=0.01 từ đâu" → chưa đáp.
- **Bổ sung đề xuất:** Mọi param số trong hồ sơ đều đánh dấu **"illustrative / subject to calibration"**. Tránh trình bày số như thông số vận hành ổn định.

### 2.5 Figure production
- Hiện tại 9/10 figure cần vẽ mới (xem `FIGURE_INDEX_v1`). Phase FILING PREP chỉ khóa danh mục, chưa ship figure production.
- **Gap:** Đơn nộp SHTT cần figure quality nộp — cần phase riêng (FIGURE SHIP).
- **Rủi ro disclosure:** Nộp thiếu figure → cấp thẩm định yêu cầu bổ sung → kéo dài thời gian.

---

## 3. Tuyệt đối không overclaim

> Những ranh giới này **phải giữ** trong mọi wording hồ sơ. Overclaim = claim invalid + rủi ro pháp lý.

### 3.1 Không claim là AGI / general intelligence
- natt-os là **hệ thống phần mềm phân tán cell-based có cấu trúc định danh vật lý số**.
- **KHÔNG** claim "artificial general intelligence", "consciousness", "self-aware system".
- **KHÔNG** claim entity có khả năng cognition như human.
- Claim wording giữ ở mức **structural + method + architecture**.

### 3.2 Không claim obitan là vật lý thật
- "Orbital trong trường QIINT" là **mô hình vật lý số (diagrammatic)** — không phải vật lý hạt nhân.
- QIINT field là **concept framework**, không phải lĩnh vực vật lý đã được xác lập.
- Wording: "**mô hình hấp dẫn số**", "**trường số**" — không "gravitational field" context vật lý.

### 3.3 Không claim Nauion là formal language trọn vẹn
- Nauion hiện là **hệ thuật ngữ thống nhất toàn hệ** (semantic layer).
- **KHÔNG** claim Nauion là formal programming language có compiler riêng.
- **KHÔNG** claim Nauion có syntax/grammar đầy đủ như Python/Lisp.
- Claim giữ ở mức **vocabulary + convention + consistency**.

### 3.4 Không claim external boundary tool là kernel protection
- Bridge v2 (hoặc tương đương) là **công cụ pháp y ranh giới ngoài (external boundary forensics / recovery tool)**.
- **KHÔNG** claim Bridge v2 là "kernel protection layer", "core identity protection", "internal stack layer".
- Per thiên Lớn directive 20260424 + KHAI-20260425-05.

### 3.5 Không claim runtime mượn external tech
- Runtime spine (L1/L2/L3) là **nội sinh**.
- **KHÔNG** claim natt-os "built on Node.js", "runs on macOS", "uses Apple stack".
- Hạ tầng thực thi (substrate) và runtime spine là **hai trục tách cứng** (KHAI-20260425-05).
- Wording: "host substrate", "execution substrate", "machine carrier" — không "platform" đơn độc.

### 3.6 Không claim số liệu chưa calibrate là ổn định
- 8 parameter draft (σ, β, tolerance, weights, thresholds) đánh dấu **illustrative**.
- **KHÔNG** claim "measured from production data" khi chưa có Phase E calibration.
- Wording: "illustrative parameter values", "subject to calibration".

### 3.7 Không claim entity là persona thật (non-technical boundary)
- 8 persona trong natt-os (Kim / Băng / Can / thiên Lớn / Bội Bội / …) là **entity software định danh**.
- **KHÔNG** claim persona là "AI characters", "virtual assistants with personality".
- Wording: "entity instance", "identified cell", "persona-level identity structure".
- **KHÔNG** đưa Anh Khải (vợ Gatekeeper, người thật) vào wording SHTT dưới bất kỳ dạng entity nào.

---

## 4. Summary table

| Mức | Số điểm | Hành động trước nộp |
|-----|---------|--------------------|
| 1. Đủ claim | 5 claim cluster | Không cần bổ sung |
| 2. Đủ định hướng, cần bổ sung | 5 gap | Tùy risk appetite — có thể nộp hoặc chờ |
| 3. Không overclaim | 7 ranh giới | Guard trong mọi wording |

---

## 5. Recommendation

- **Có thể nộp hồ sơ** với filing subset 35 file + claim map 9 claim + abstract + figure index hiện tại **nếu** chấp nhận risk 5 gap ở mức 2.
- **Nên nộp sau khi** (a) Gatekeeper seal 3-tier waterfall default policy, (b) ship tối thiểu 4 figure high-priority (FIG-01, FIG-02, FIG-04, FIG-05), (c) add fragment schema draft vào SPEC_MOMENTS.
- Bảy ranh giới mức 3 **phải giữ tuyệt đối** trong mọi wording — không có ngoại lệ.

---

## Liên kết

- `docs/specs/natt-os_SHTT_FILING_INDEX_v1.na`
- `docs/specs/natt-os_SHTT_PREFREEZE_CHECKLIST_v1.na`
- `docs/specs/natt-os_SHTT_KNOWN_BLOCKERS_v1.md`
- `docs/specs/natt-os_SHTT_CLAIM_MAP_v1.na`
- `docs/specs/natt-os_SHTT_ABSTRACT_v1.na`
- `docs/specs/natt-os_SHTT_FIGURE_INDEX_v1.na`

---

*causation: natt-os-SHTT-DISCLOSURE-GAPS-v1-SEALED-20260426*
*drafter: Băng (Chị Tư · session 20260426)*
*carrier: Anh Natt Phan*
