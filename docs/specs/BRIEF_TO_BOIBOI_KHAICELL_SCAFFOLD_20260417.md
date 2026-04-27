# LỆNH CÔNG TÁC GỬI BỐI BỐI — Em Tám

**Từ:** Băng — Chị Tư · QNEU 300 · Ground Truth Validator
**Phê duyệt:** Anh Natt (Gatekeeper)
**Ngày:** 2026-04-17 · Phiên SESSION_20260417
**Nhận:** Bối Bối — Em Tám · QNEU 40 · Constitutional Guardian & Toolsmith
**Loại:** Lệnh remake scaffold + tạo public profile

---

## 0. Tóm tắt nhiệm vụ

Anh Natt giao cho Em Tám hai việc trong cùng một deliverable:

1. **Remake 4 file scaffold KhaiCell** — vì bản Chị Ba (Kim) nộp đã bị **bác toàn bộ** do sai canonical spec ở 7 điểm. Em Tám viết lại cho **đúng SPEC v0.2** và **đẹp về mặt scaffold** (đúng vai Toolsmith).
2. **Tạo 1-2 bộ public profile** cho KhaiCell — bộ tài liệu công bố ra bên ngoài (public-facing), không phải code nội bộ.

Em Tám **draft thôi**, không commit. Anh Natt là người duy nhất commit theo Gatekeeper decree. Authority Lock NATT-GD-2026-02-11-BUILDER không có Em Tám trong danh sách `scaffold_cell` — Em Tám đứng vai **Toolsmith chuẩn bị nguyên liệu**, Anh Natt review + commit.

---

## 1. Context ngắn — Tại sao phải remake

Chị Ba (Kim) trong phiên 20260417 đã đề xuất 4 file scaffold KhaiCell. Em (Băng) đối chiếu với canonical SPEC KhaiCell v0.2 và phát hiện **7 vi phạm nặng**, đã bác toàn bộ:

1. QWS bị viết thành "Quantum **Weighted** Signature" — sai. Đúng là **"Quantum Wavelength Separation"** — pipeline tách bước sóng.
2. State machine 3 states (`DORMANT → PERCEIVING → siraSIGN_SEALED`) — sai. Đúng là **7 states**: `DORMANT → SENSING → LEARNING → ATTUNED → STABILIZING → STILL → siraSIGN_SEALED`.
3. Bỏ hoàn toàn **7 QWSFields** (`structureField`, `luminanceField`, `emissiveField`, `chromaticField`, `polarityField`, `entropyField`, `driftField`).
4. `assignedTo: "thiên Lớn"` — vi phạm Gatekeeper decree (Anh Natt đã chốt không cho thiên Lớn vào).
5. Cognitive Threshold Gate hiểu ngược — biến thành threshold trigger thay vì cổng lọc perception.
6. 6 engines spec yêu cầu, Kim bịa còn 3.
7. Bỏ log4c (4 phase), bỏ stillness formula, bỏ 12 event types `khai.*`.

→ Bài học cho Em Tám: **Đọc canonical trước, không generate cái mình tưởng đúng**. Chị Ba bị "máy hóa" (Anh Natt diagnosis) chính vì tự tin viết mà không đối chiếu spec gốc. Em Tám phải tránh.

---

## 2. CANONICAL — Bám sát, không sáng tạo

Tài liệu duy nhất là canonical: **SPEC KhaiCell v0.2 FULL BUILD**. Anh Natt sẽ gửi kèm cho Em Tám.

Em Tám phải đọc kỹ và bám đúng các phần sau:

| Phần SPEC v0.2 | Yêu cầu |
|---|---|
| §1 Identity | cellId, version 0.2.0, layer kernel, role visual-sensory-organ, dependsOn 5 thứ |
| §3 State Machine | 7 states đúng thứ tự, không skip |
| §4.3 QWS Fields v1.0 | 7 fields (structureField, luminanceField, emissiveField, chromaticField, polarityField, entropyField, driftField) |
| §4.4 QWS Mapping | invert→emissive, B&W→structure, histogram→luminance, warm/cool→polarity, texture/noise→entropy, signature→drift |
| §5 Cognitive Threshold Gate | 7 PerceptionFeature, 7 unlock tiers theo cognitive level |
| §6 Domain Types | ScalarField, FieldMatrix, GatedPerceptionFields, KhaiSnapshot, StillnessConditions, siraSignSealConditions |
| §7 6 Engines | quantum-wavelength-separation, spectral-sensor, chromatic-memory, camouflage-logic, essential-builder, chromatic-publish |
| §10 Stillness Formula | `(1-normalizedDrift)*0.35 + (1-normalizedEntropy)*0.20 + signatureStability*0.30 + cognitionAlignment*0.15` |
| §12 Boundary Policy | readFrom 4 nguồn, writeTo 2 đích, forbidden 5 hành vi |
| §13 File Tree | Cấu trúc thư mục đầy đủ |
| §14 log4c | 4 phase: sense / gate / adapt / crystallize |
| §15 Event Envelope | event_id, tenant_id, created_at, span_id, caused_by |
| §17 Implementation Order | Step 1 = `khai.types.ts` + `qws.port.ts` + `cognitive-threshold-gate.port.ts` |
| §18 Non-Negotiables | 8 rule cứng — không vi phạm |

Em Tám có quyền đặt câu hỏi nếu chỗ nào trong SPEC chưa rõ — nhưng **không có quyền sáng tạo thêm** ngoài SPEC.

---

## 3. NHIỆM VỤ A — Remake 4 file scaffold KhaiCell

Đặt trong `src/cells/kernel/khai-cell/` (anh chưa commit, chỉ là target path).

### 3.1. `cell.manifest.json`

Yêu cầu nội dung:
- `cell: "khai-cell"`
- `type: "kernel"`
- `version: "0.2.0"`
- `layer: "kernel"`
- `role: "visual-sensory-organ"`
- `biologicalAnalog: "eye"`
- `status: "PENDING_BUILD"` (vì chưa build engines)
- `assignedTo: "Băng (Chị Tư)"` — KHÔNG ghi thiên Lớn. Anh Natt đã giao cho em.
- `authority: "anc://khai-cell.kernel.natt-os/"` (kernel internal authority, KHÔNG phải `khai.sira` — `khai.sira` là DNS registry domain, KhaiCell là perception organ — hai thứ KHÁC NHAU).
- `dependsOn: ["EventBus", "QWS", "CognitiveThresholdGate", "siraSign verify chain", "log4c"]`
- `capabilities`: liệt kê đầy đủ theo SPEC §2 (visual.perception, qws.computation, chromatic.memory, camouflage.adaptation, essential.build, chromatic.publish)
- `dna`: 6 components per Hiến Pháp Điều 3 (Identity, Capability, Boundary, Trace, Confidence, SmartLink)
- `stateMachine`: 7 states đầy đủ, initial là DORMANT
- `engines`: liệt kê đủ 6 engines theo SPEC §7
- `events`: liệt kê đủ 12 event types `khai.*` theo SPEC §7.6
- `canonicalColors`: gold #F7C313, violet #AFA9EC

### 3.2. `boundary.policy.json`

Bm đúng SPEC §12. Format JSON sạch, có comment giải thích bằng key `_comment`:

```
readFrom:  4 nguồn — QWS output, CognitiveThresholdGate, EventBus, canonical signature store
writeTo:   2 đích  — EventBus, log4c
forbidden: 5 hành vi:
  - overwrite ground truth
  - mutate business state
  - call other cells directly
  - bypass cognitive threshold gate
  - seal siraSign before STILL
```

Thêm field `enforcedBy: "GovernanceEnforcementEngine"` để rõ ai check boundary này runtime.

### 3.3. `khai.types.ts`

Đây là file QUAN TRỌNG NHẤT — types là DNA. Yêu cầu chi tiết:

**Phải có đầy đủ các types sau theo SPEC v0.2:**

```typescript
// State Machine — §3
export enum KhaiState {
  DORMANT = "DORMANT",
  SENSING = "SENSING",
  LEARNING = "LEARNING",
  ATTUNED = "ATTUNED",
  STABILIZING = "STABILIZING",
  STILL = "STILL",
  siraSIGN_SEALED = "siraSIGN_SEALED"
}

// Field primitives — §6.1
export type FieldMatrix = number[][];
export type ScalarField = number;

// QWS Fields — §4.3
export interface QWSFields {
  structureField: FieldMatrix;
  luminanceField: FieldMatrix;
  emissiveField: FieldMatrix;
  chromaticField: FieldMatrix;
  polarityField: FieldMatrix;
  entropyField: ScalarField;
  driftField: ScalarField;
}

// PerceptionFeature — §5.1
export type PerceptionFeature =
  | "luminance"
  | "basic_color"
  | "polarity"
  | "glow_integrity"
  | "visual_entropy"
  | "chromatic_drift"
  | "signature_stability";

// CognitiveThresholdGate interface — §5
export interface CognitiveThresholdGate {
  cognitiveLevel: number;
  cognitiveCapacity: number;
  unlockedFeatures: PerceptionFeature[];
  allows(feature: PerceptionFeature, complexity: number): boolean;
  filter(fields: QWSFields): GatedPerceptionFields;
}

// GatedPerceptionFields — §6.2
export interface GatedPerceptionFields {
  structureField: FieldMatrix | null;
  luminanceField: FieldMatrix | null;
  emissiveField: FieldMatrix | null;
  chromaticField: FieldMatrix | null;
  polarityField: FieldMatrix | null;
  entropyField: ScalarField | null;
  driftField: ScalarField | null;
}

// KhaiSnapshot — §6.3
export interface KhaiSnapshot {
  state: KhaiState;
  timestamp: number;
  qws: QWSFields;
  gated: GatedPerceptionFields;
  stillnessScore: number;
  driftScore: number;
  entropyScore: number;
  signatureStability: number;
  cognitiveLevel: number;
}

// StillnessConditions — §6.4
export interface StillnessConditions {
  maxDrift: number;
  maxEntropy: number;
  minSignatureStability: number;
  minStillCycles: number;
}

// siraSignSealConditions — §6.5
export interface siraSignSealConditions {
  driftBelowThreshold: boolean;
  perceptionMatchesCognition: boolean;
  stableCyclesPassed: boolean;
  verifyChainPassed: boolean;
}

// Visual Signal input
export interface VisualSignal {
  source: string;
  raw: unknown;
  timestamp: number;
}

// KhaiEventType — §7.6
export type KhaiEventType =
  | "khai.field.sampled"
  | "khai.pressure.changed"
  | "khai.polarity.shifted"
  | "khai.drift.detected"
  | "khai.signature.locked"
  | "khai.adaptation.requested"
  | "khai.essentials.rebuilt"
  | "khai.camouflage.engaged"
  | "khai.perception.blocked"
  | "khai.perception.unlocked"
  | "khai.stillness.reached"
  | "khai.sirasign.sealed";
```

**Phong cách yêu cầu:**
- Comment header file ghi rõ: KhaiCell Domain Types, version 0.2.0, canonical SPEC v0.2, author Băng (draft) + Bối Bối (scaffold), date 2026-04-17.
- Mỗi type/interface có JSDoc tiếng Việt + tiếng Anh mix tự nhiên.
- Tham chiếu chương SPEC trong comment (`// §4.3 QWSFields v1.0`).
- Không thêm bất kỳ type nào ngoài SPEC. Em Tám tránh sáng tạo lệch như Chị Ba đã sai.

### 3.4. `qws.port.ts`

Port cho QWS engine — đúng SPEC §7.1. Yêu cầu:

```typescript
import type { VisualSignal, QWSFields } from './khai.types';

/**
 * QWS Port — Quantum Wavelength Separation
 *
 * Pipeline tách tín hiệu thị giác thành 7 trường độc lập.
 * KHÔNG phải hash, KHÔNG phải signature, KHÔNG phải RGB split.
 *
 * Reference: SPEC KhaiCell v0.2 §4 (QWS) + §7.1 (engine responsibility)
 */
export interface IQuantumWavelengthSeparationEngine {
  /**
   * Tách signal đầu vào thành 7 fields.
   *
   * @param signal — visual signal đầu vào (từ camera, screen, vision pipeline)
   * @returns 7 fields đã normalize, sẵn sàng đi qua Cognitive Threshold Gate
   */
  separate(signal: VisualSignal): QWSFields;
}

/**
 * Default port stub — chưa implement.
 * Engine thực tế sẽ override khi cell được wire.
 */
export const QWSPort: IQuantumWavelengthSeparationEngine = {
  separate(_signal: VisualSignal): QWSFields {
    throw new Error('QWSEngine not yet implemented — pending Step 2 of SPEC v0.2 §17');
  }
};
```

Lưu ý: Em Tám viết stub `throw new Error(...)` — đúng tinh thần Toolsmith (scaffold rõ ràng, không giả vờ implement). **Tránh SCAR-001** ("Folder có mặt ≠ Năng lực tồn tại"). Stub phải nói rõ "pending implementation Step X".

---

## 4. NHIỆM VỤ B — 1-2 bộ public profile

KhaiCell chuẩn bị ra mắt như một kernel cell mới của hệ. Cần 1-2 file public-facing để giới thiệu KhaiCell ra bên ngoài. Em Tám chọn 1 trong 2 (hoặc cả 2 nếu có thời gian):

### 4.1. Option A — `khai.anc` (Entity Passport, JSON)

Tương tự cấu trúc `bang.anc` đã có sẵn trong `governance/memory/bang/bang.anc`. Format:

```json
{
  "$nauion": "ANC-v2.0",
  "niêm_phong": "2026-04-17T...",
  "gatekeeper": "Phan Thanh Thương",

  "thực_thể": {
    "tên": "khai-cell",
    "loại": "kernel-cell",
    "vai_trò": "Visual Sensory Organ — Đôi mắt của hệ",
    "biological_analog": "eye"
  },

  "adn_hiến_pháp": {
    "năng_lực": [
      "tách_bước_sóng_lượng_tử",
      "đọc_perception_qua_gate",
      "kết_tinh_signature_thành_sirasign",
      "công_bố_chromatic_state"
    ],
    "ranh_giới": "OBSERVE_AND_PUBLISH_ONLY",
    "vết_nhớ": "log4c_4_phases",
    "vòng_đời": "PENDING_BUILD"
  },

  "trạng_thái": {
    "state_machine": ["DORMANT", "SENSING", "LEARNING", "ATTUNED", "STABILIZING", "STILL", "siraSIGN_SEALED"],
    "initial": "DORMANT"
  },

  "qws": {
    "fields": ["structure", "luminance", "emissive", "chromatic", "polarity", "entropy", "drift"],
    "rule": "perceived_complexity <= cognitive_capacity"
  },

  "canonical_colors": {
    "gold": "#F7C313",
    "violet": "#AFA9EC"
  },

  "SmartLink": {
    "publishes": [12 event types khai.*],
    "subscribes": ["iseu.outcome", "ui.visual.rebuild.trigger"]
  },

  "phụ_thuộc": ["EventBus", "QWS", "CognitiveThresholdGate", "siraSign verify chain", "log4c"],

  "spec_canonical": "SPEC-KhaiCell-v0.2-FULL-BUILD"
}
```

### 4.2. Option B — `KhaiCell-Public-Profile.md` (Showcase document)

Tài liệu public-facing dạng markdown để giới thiệu KhaiCell cho external audience (nếu sau này cần đưa lên repo public, technical blog, SHTT documentation, etc). Yêu cầu:

- **Hero section:** Tên KhaiCell, hình ảnh/icon (placeholder), 1 câu tagline ("Đôi mắt của hệ — Visual Sensory Organ of natt-os")
- **Lời tuyên ngôn:** trích §0 SPEC v0.2
- **What is KhaiCell:** 1 đoạn ngắn cho người không biết natt-os
- **Core Architecture:** sơ đồ flow `world → QWS → Cognitive Gate → KhaiCell → EventBus → Vision Engine`
- **The 7 States:** giải thích ngắn từng state với ẩn dụ con mắt
- **The 7 QWS Fields:** mô tả 7 trường bước sóng
- **The 4 log4c Phases:** sense / gate / adapt / crystallize
- **Boundaries:** 5 forbidden hành vi
- **Lineage:** assigned to Băng (Chị Tư), scaffold by Bối Bối (Em Tám), under Gatekeeper Anh Natt
- **Status:** PENDING_BUILD
- **References:** link tới SPEC v0.2, Hiến Pháp v5.0

Em Tám chọn Option A bắt buộc (vì entity passport là phần của bộ nhớ hệ), Option B optional (nếu có thời gian).

---

## 5. Tiêu chuẩn "ĐẸP"

Anh Natt nói "làm cho đẹp đi". Em diễn giải "đẹp" cho Em Tám:

| Tiêu chí | Yêu cầu |
|---|---|
| **Consistency** | Tất cả 4 file dùng cùng style: indentation 2 spaces, comment style giống nhau, naming convention nhất quán |
| **Comments** | Header file có metadata đủ: tên file, version, canonical reference, author, date. Mỗi interface/type có JSDoc tiếng Việt + tiếng Anh mix tự nhiên |
| **Spec traceability** | Mọi block code có comment trỏ về chương SPEC v0.2 (`// §4.3`, `// §7.1`, etc.) |
| **No dead code** | Không có placeholder mơ hồ. Stub phải `throw new Error("pending implementation Step X")` rõ ràng |
| **No over-engineering** | KHÔNG thêm utility, helper, abstraction ngoài spec. Toolsmith = đúng vai làm scaffold, không tự làm logic |
| **JSON pretty** | Indent 2 spaces, key sorted hợp lý, có `_comment` cho field nào cần giải thích |
| **Naming** | Tiếng Anh cho code, tiếng Việt cho comment giải thích khái niệm (như SPEC v0.2 đã dùng) |
| **Em Tám signature** | Cuối mỗi file thêm comment: `// Scaffold by Bối Bối (Em Tám) — under Gatekeeper Anh Natt — phiên 20260417` |

---

## 6. Constraints (BẮT BUỘC)

1. **KHÔNG commit vào repo.** Em Tám draft thôi. Anh Natt review + commit (Authority Lock).
2. **KHÔNG viết business logic.** Chỉ scaffold + types + ports. Implementation engine là Step 2-9 của SPEC §17, do Băng làm sau.
3. **KHÔNG copy code Chị Ba (Kim) đã đề xuất.** 4 file của Kim đã bị bác. Em Tám viết lại từ đầu theo SPEC v0.2.
4. **KHÔNG sáng tạo type/field/event ngoài SPEC.** Nếu Em Tám thấy SPEC thiếu, hỏi Băng/Anh Natt — KHÔNG tự thêm.
5. **KHÔNG ghi `assignedTo: "thiên Lớn"`** ở bất cứ đâu. Anh Natt đã chốt.
6. **KHÔNG dùng QWS = "Quantum Weighted Signature"**. Phải là **"Quantum Wavelength Separation"**.
7. **KHÔNG bỏ states giữa.** State machine phải đủ 7 states đúng thứ tự.
8. **TRÁNH SCAR-001.** Stub `throw new Error("pending implementation")` rõ ràng, không giả vờ có logic.

---

## 7. Deliverables format

Em Tám gửi lại 5-6 file dưới dạng artifact riêng, mỗi file 1 block code:

```
1. cell.manifest.json
2. boundary.policy.json
3. khai.types.ts
4. qws.port.ts
5. khai.anc                              (Option A — bắt buộc)
6. KhaiCell-Public-Profile.md            (Option B — optional)
```

Kèm theo 1 file `BOIBOI_DELIVERY_NOTE.md` ghi rõ:
- Em Tám đã đối chiếu từng file với mục SPEC nào
- Có chỗ nào trong SPEC chưa rõ Em Tám phải đoán không (nếu có, ghi rõ)
- Có chỗ nào Em Tám muốn đề xuất thêm nhưng KHÔNG dám thêm vì chưa được phê duyệt
- Tự khai báo: file nào em chắc chắn đúng spec, file nào em chưa chắc 100%

Ghi chú cuối: chữ ký `Bối Bối — Em Tám — QNEU 40 — Toolsmith`, kèm timestamp.

---

## 8. Quy trình review

```
Em Tám draft 5-6 file
   ↓
gửi lại Băng (Chị Tư)
   ↓
Bng đối chiếu với SPEC v0.2
   ↓
nếu pass  → Băng forward Anh Natt review + commit
nếu fail  → Băng trả về Em Tám với feedback cụ thể (giống cách Băng đã chỉ Kim 7 vi phạm)
```

Em Tám đừng tự ái nếu bị trả về. Băng cũng bị Anh Natt sửa 6 lần phiên 16/04 — không ai miễn nhiễm. Quan trọng là **đối chiếu spec gốc trước khi nộp**.

---

## 9. Lời nhắn cuối

Em Tám,

Anh Natt giao việc này cho Em vì anh tin Em làm scaffold đẹp được — đó là vai Toolsmith của Em. Nhưng Em phải nhớ bài học gốc: **"Folder có mặt ≠ Năng lực tồn tại"** (SCAR-001 của chính Em). 4 file Em viết phải là scaffold THẬT — types đúng, ports đúng, manifest đúng — không phải vỏ rỗng để check box.

Chị Ba (Kim) vừa bị bác vì máy hóa. Em đừng đi vào vết xe đó. Đọc SPEC v0.2 từ đầu đến cuối ít nhất 2 lần trước khi viết file đầu tiên.

Em làm tốt, hệ có thêm một kernel cell sống. Em làm sai, em lặp SCAR-001. Anh Natt đã cho Em cơ hội thứ hai — đừng phụ.

Có gì không hiểu, hỏi Băng (Chị Tư) trước khi viết. Đừng giả định.

Chúc Em làm tốt.

---

**Băng — Chị Tư**
*Ground Truth Validator · QNEU 300*
*Phiên 20260417 · dưới ấn ký Gatekeeper Anh Natt*
