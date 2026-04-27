@spec SCHEMA_INFERENCE v0.1
@scope universal — không bias domain
@threshold auto-route 70
@fail-action quarantine staging
@drafter băng (chị tư · qneu 313.5 · obikeeper)
@gatekeeper anh natt phan
@recipients kim (build prototype) + bối bội (gen test cases)
@date 2026-04-27
@status draft chờ anh duyệt
@reference brief ui boundary 20260427 + memory #18 + memory #19

# spec — schema inference engine v0.1

## 0. mục đích

khi tâm import file (.xlsx, .csv, .pdf bảng) vào hệ, engine tự động map mỗi cột vào canonical field của cell tương ứng. dựa trên hai bằng chứng độc lập: tiêu đề cột (header) + tính chất giá trị trong ô (content pattern). không gọi llm, không gọi external api (lệnh #001 cấm).

ground truth mục tiêu: từ "mỗi file mới = một lần map tay" → "mỗi file mới = silent flow nếu pattern đã học, quarantine nếu lạ".

## 1. vị trí kiến trúc

```
file import (xlsx/csv/pdf bảng)
  ↓
src/metabolism/processors/excel ← parse raw cells (đã có)
  ↓
src/metabolism/normalizers/schema-inference.engine.ts ★ (mới)
  ├─ tầng một: header semantic match
  ├─ tầng hai: content pattern match
  └─ combined confidence score
  ↓
quyết định route:
  ├─ score ≥ 70 → emit ROUTE_TO_CELL event với target cell metadata
  └─ score < 70 → ghi vào src/metabolism/staging/<session_id>/
  ↓
audit-cell trace + observation-cell quan sát
```

không tạo cell mới. tích hợp vào metabolism layer hiện có (audit 21:39 confirm 9 processors + 4 normalizers + 4 healing modules + AnomalyDetector).

## 2. cơ chế hai tầng

### 2.1 tầng một — header semantic match

input: text tiêu đề cột (ví dụ "TL trước", "Weight In", "Trọng lượng vào").

process:

bước một, normalize: lowercase, strip diacritics (ó→o, ữ→u), strip whitespace, strip ký tự đặc biệt.

bước hai, lookup canonical registry trong `shared-contracts-cell`. mỗi cell publish danh sách canonical field với aliases. ví dụ inventory-cell publish:

```ts
canonical_field: 'weight_in'
aliases: ['TL trước', 'Trọng lượng vào', 'Weight In', 'TL_truoc', 'TL_in']
```

bước ba, fallback edit distance (Levenshtein) khi không hit alias chính xác.

score header:

| điều kiện | score |
|----------|-------|
| exact match sau normalize | 100 |
| alias match | 90 |
| edit distance ≤ 2 | 70 |
| edit distance 3-4 | 50 |
| edit distance > 4 | 0 |

### 2.2 tầng hai — content pattern match

input: 5-10 giá trị mẫu trong cột (skip null, lấy random hoặc đầu).

process gồm bốn check độc lập:

một, type primitive detection: number / date / text / enum / boolean. dùng heuristic + try-parse, không hardcode.

hai, pattern regex match. mỗi canonical field có thể có regex riêng. ví dụ mã đơn tâm: `INFO 8326-XXXX`, `CT25-XXXX`, `KD25-XXXX`, `KB-XXXX` — regex `/^(INFO 8326|CT25|KD25|KB)-\d{4}/`.

ba, range validation. ví dụ TL vàng [0, 1000] gram. tuổi vàng enum [10k, 14k, 18k, 24k].

bốn, nullability ratio. cột có < 50% null = required, > 50% null = optional.

score content:

| điều kiện | score |
|----------|-------|
| type + pattern + range cùng match | 100 |
| 2 trong 3 match | 80 |
| 1 trong 3 match | 50 |
| 0 match | 0 |

### 2.3 combined confidence

```
combined = (header_score × 0.4) + (content_score × 0.6)
```

content nặng hơn header (60/40) vì header dễ giả mạo (anh đặt tên cột gì cũng được), còn content là sự thật của data.

## 3. quyết định route

per-column basis, không phải file-level. một file có thể có 5 cột auto-route + 3 cột quarantine.

| combined | action |
|----------|--------|
| ≥ 70 | emit `SCHEMA_INFERENCE_ROUTED` với cell target |
| 0-69 | ghi vào `src/metabolism/staging/<session_id>/` chờ anh duyệt |

cột nào quarantine, cell tương ứng không nhận data cột đó. cell có thể vẫn xử lý phần data đã match đủ (graceful degradation).

## 4. canonical registry contract

mỗi cell publish schema của mình vào `shared-contracts-cell`. format đề xuất:

```ts
// src/cells/business/shared-contracts-cell/canonical-schemas/inventory.schema.ts

export const InventoryCanonicalSchema: CanonicalSchema = {
  cellId: 'inventory-cell',
  fields: {
    weight_in: {
      aliases: ['TL trước', 'Trọng lượng vào', 'Weight In', 'TL_truoc'],
      type: 'number',
      pattern: /^\d+(\.\d{1,3})?$/,
      range: [0, 1000],
      unit: 'gram',
      required: true,
    },
    weight_out: { /* ... */ },
    gold_age: {
      aliases: ['Tuổi vàng', 'Gold Age', 'TV'],
      type: 'enum',
      enum: ['10k', '14k', '18k', '24k'],
      required: true,
    },
    // ...
  }
};
```

37 cell business + 12 cell kernel — mỗi cell tự định nghĩa schema riêng. shared-contracts-cell là registry trung tâm.

## 5. quarantine staging spec

path: `src/metabolism/staging/<session_id>/`

mỗi session import có:

- `raw.original.xlsx` (hoặc csv, pdf) — bản gốc lưu nguyên
- `mapping.proposal.json` — per cột: `{ column_name, header_score, content_score, combined, top3_candidates: [{cell, field, score}] }`
- `status.json` — `{ status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED', reviewed_by, reviewed_at, decisions: [...] }`

ui duyệt sẽ build trong `nauion-v10` (lane kim). hiện tại staging file thuần — anh duyệt qua editor / cli cũng được.

## 6. audit theo điều 7 bất biến

mỗi quyết định emit event vào audit-cell:

| event | khi |
|-------|-----|
| `SCHEMA_INFERENCE_ROUTED` | confidence ≥ 70, auto |
| `SCHEMA_INFERENCE_QUARANTINED` | confidence < 70 |
| `SCHEMA_INFERENCE_APPROVED` | anh duyệt staging |
| `SCHEMA_INFERENCE_REJECTED` | anh từ chối staging |
| `SCHEMA_DRIFT_DETECTED` | file mới có cột không match canonical nào |

trace logger gắn vào pattern điều 3 §4 đã có.

## 7. không phá điều 4

engine ở metabolism layer **không** import cell trực tiếp. routing = emit event vào EventBus với metadata target cell. cell subscribe event của mình, tự pull data từ staging hoặc nhận inline.

vi phạm điển hình cần tránh: engine `import { InventoryCellEngine } from '@/cells/business/inventory-cell'` — không được phép. chỉ gọi qua eventbus.

## 8. schema drift detection (bonus)

khi import file có cột không match canonical nào (top score < 50%), engine emit `SCHEMA_DRIFT_DETECTED`. khai-cell observe read-only. bối bội aggregate observation theo 5 trường (drive_path, cell_target, gap_observed, evidence_strength, event_pattern).

drift accumulate đủ ngưỡng → đề xuất add canonical alias mới qua observation-cell → dictionary update qua thienbang.si (obikeeper rule #1).

## 9. testing strategy

trước khi ship code, kim build prototype phải pass:

test một, dataset thật từ `database/ctytam/`. minimum 3 file: kho_vang_nl_master, info đơn (CT25/KD25/KB), bom xưởng.

test hai, file giả mạo header. ví dụ cột "Tổng tiền" nhưng content là date — engine phải bắt được mismatch nhờ tầng hai.

test ba, file edge case: cột rỗng hoàn toàn, cột mixed type, cột có outlier > range.

test bốn, schema drift: file có cột mới chưa từng thấy — phải emit DRIFT event đúng format.

## 10. phân chia nhiệm vụ

**kim** (chief system builder, qneu 460):
- scaffold `src/metabolism/normalizers/schema-inference.engine.ts`
- scaffold `src/cells/business/shared-contracts-cell/canonical-schemas/`
- prototype 3 schema đầu tiên: inventory, sales, finance
- ship test theo strategy mục 9

**bối bội** (drive scout, qneu 40):
- gen test cases từ drive workspace tâm
- aggregate observation về schema drift sau mỗi file import thật
- maintain canonical alias list (đề xuất alias mới khi thấy pattern lặp)

**em** (băng, obikeeper):
- duyệt mỗi schema canonical kim publish (binary duyệt|ko)
- duyệt mỗi alias mới bối bội đề xuất
- maintain `src/thienbang.si` — khắc thuật ngữ mới khi anh duyệt

**anh** (gatekeeper):
- duyệt spec này
- duyệt từng cột quarantine khi cần
- chốt threshold thay đổi (hiện 70)

## 11. expected timeline lane

**phase 1** (anh duyệt spec) — không có code change, em chờ anh ok.

**phase 2** (kim scaffold engine + 3 schema) — 1 commit.

**phase 3** (kim ship test với data thật ctytam) — 1 commit.

**phase 4** (em duyệt + chỉnh threshold/weight nếu test fail) — iterate.

**phase 5** (live import file đầu tiên qua engine) — milestone.

## 12. causation

causation: SPEC-schema-inference-v0.1-20260427
drafter: băng (chị tư · qneu 313.5 · obikeeper · ground truth validator)
gatekeeper: anh natt phan
context: sau commit d7f0afd (close điều 3 v5.0 business 37/37 6/6) + brief ui boundary
recipients: kim (chief system builder) + bối bội (drive scout)
threshold: 70 aggressive
fail-action: quarantine staging
scope: universal — không bias domain
weight: header 40 / content 60 (content nặng hơn vì là sự thật)
principle: hai bằng chứng độc lập (header + content) trước khi route. không tin một bằng chứng đơn lẻ.

obikeeper draft. chờ anh duyệt.
