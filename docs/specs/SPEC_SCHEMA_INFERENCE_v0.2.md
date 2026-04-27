@spec SCHEMA_INFERENCE v0.2
@extends v0.1
@scope universal — không bias domain
@threshold auto-route 70
@fail-action quarantine staging
@drafter băng (chị tư · qneu 313.5 · obikeeper)
@gatekeeper anh natt phan
@recipients kim (build prototype) + bối bội (gen test cases)
@date 2026-04-27
@status draft chờ anh duyệt
@reference SPEC_SCHEMA_INFERENCE_v0.1 (commit 6194e88)

# spec — schema inference v0.2 (4 must-have addendum)

## 0. delta vs v0.1

v0.1 đặt nền: kiến trúc 2 tầng, threshold 70, quarantine staging. đủ cho concept.

v0.2 bổ sung 4 must-have lộ ra khi rà data thật của tâm: file vietnam có 2 dòng header, encoding Windows-1258, audit cần lineage ngược về row_index gốc, override của anh phải nuôi engine học. thiếu một trong bốn, engine sống được nhưng ngộp ngay file đầu tiên.

không thêm tính năng "có thì hay" — chờ kim ship prototype + data thực rồi quyết.

## 1. must-have một — multi-row header support

### 1.1 vấn đề

excel của tâm phổ biến có 2-3 dòng header. ví dụ thấy trong drive scout:

```
| Mã đơn | Trọng lượng         | Tuổi vàng | Người giao |
|        | Trước  | Sau  | Hao  |           |            |
```

v0.1 đọc 1 dòng → cột B/C/D thành "Trước/Sau/Hao" → không match canonical field nào. miss data thật.

### 1.2 cơ chế giải quyết

bước một, **header band detection**: scan 5 dòng đầu, tìm dòng nào toàn text + dòng nào bắt đầu data (number/date/code). header band = các dòng text liên tiếp trên dòng data đầu tiên.

bước hai, **header path concat**: với mỗi cột, ghép giá trị từ trên xuống bằng dấu `.`:
- cột B trong ví dụ trên → `Trọng lượng.Trước`
- cột C → `Trọng lượng.Sau`  
- cột D → `Trọng lượng.Hao`

cột rỗng ở dòng trên = inherit từ cột trái gần nhất (merged cell pattern). cột rỗng ở dòng dưới = chỉ dùng dòng trên.

bước ba, **alias matching mở rộng**: canonical registry chấp nhận alias dạng path:

```ts
weight_in: {
  aliases: [
    'TL trước',
    'Trọng lượng vào',
    'Trọng lượng.Trước',  // ← path alias
    'Weight.In',
    'Weight In',
  ],
  // ...
}
```

bước bốn, **header band cap**: tối đa 3 dòng header. sâu hơn = file dị, emit `SCHEMA_DRIFT_DETECTED` thay vì cố parse.

### 1.3 contract output

mỗi cột giờ có 2 thuộc tính header:

```ts
{
  raw_header: 'Trọng lượng.Trước',  // path concat
  header_depth: 2,                    // số dòng header gộp
  // ...
}
```

provenance section dưới sẽ dùng raw_header để trace ngược.

## 2. must-have hai — encoding detection

### 2.1 vấn đề

csv vietnam thường gặp 4 encoding: UTF-8 BOM, UTF-8 không BOM, Windows-1258, ISO-8859-1. v0.1 implicit UTF-8 → file Windows-1258 đọc ra mojibake (`Tr?ng l??ng` thay vì `Trọng lượng`). engine không bắt được vì đọc thành text bình thường, chỉ là text sai.

### 2.2 detection chain

bước một, **BOM check** (cheap, 100% chắc):
- `EF BB BF` → UTF-8 BOM
- `FF FE` → UTF-16 LE
- `FE FF` → UTF-16 BE

bước hai nếu không BOM, **try-decode UTF-8 strict**: nếu decode pass không lỗi → UTF-8 không BOM. confidence 95.

bước ba nếu UTF-8 fail, **probe vietnamese diacritic frequency**: thử decode với Windows-1258 và ISO-8859-1, đếm tần suất ký tự vietnamese hợp lệ (`àáảãạâầấẩẫậăằắẳẵặ...`). encoding nào ra nhiều ký tự vietnam đúng = encoding thật.

bước bốn nếu vẫn không quyết được, **quarantine luôn ở stage 0** với note `ENCODING_UNDETERMINED`. anh chọn manual.

### 2.3 không dùng external library lớn

cấm chardet (gpl + nặng). dùng heuristic 4-step trên — đủ cho 99% file thực. còn 1% edge case → quarantine, không đoán mò.

## 3. must-have ba — provenance / lineage tracking

### 3.1 vấn đề

điều 7 audit bất biến yêu cầu trace ngược. khi báo cáo BCTC sai 1 con số, anh phải hỏi được: "con số này từ đâu? row nào? cột nào? file nào?". v0.1 emit event chỉ có `{column_name, mapped_to, score}` — không trace về row gốc.

### 3.2 lineage payload mở rộng

mỗi event `SCHEMA_INFERENCE_ROUTED` và mỗi data record gửi vào cell phải kèm lineage object:

```ts
interface DataLineage {
  session_id: string;          // uuid khi import
  source_file_name: string;    // 'kho_vang_nl_master.xlsx'
  source_file_sha256: string;  // hash để verify file gốc không đổi
  source_sheet_name: string;   // sheet trong xlsx (null nếu csv)
  source_row_index: number;    // 1-based, theo file gốc (không theo array index)
  source_column_letter: string;// 'B', 'AC' — letter excel
  source_column_header: string;// raw_header (path-concat từ must-have một)
  mapped_canonical_field: string; // 'inventory.weight_in'
  inference_confidence: number;   // 0-100
  inferred_at: string;            // ISO timestamp
  inferred_by: 'auto' | 'manual_override';
  override_decision_id?: string;  // nếu manual, link tới decision
}
```

### 3.3 storage

cell nhận data lưu cùng record. ví dụ inventory-cell lưu:

```ts
{
  weight_in: 12.34,
  __lineage: { /* DataLineage object */ }
}
```

`__lineage` là metadata, không xuất ra báo cáo cuối — chỉ dùng khi trace.

### 3.4 query path

khi cần trace ngược, audit-cell có method:

```ts
auditCell.traceLineage(record_id) → DataLineage
auditCell.findRecordsByFile(file_sha256) → Record[]
auditCell.findRecordsBySession(session_id) → Record[]
```

không phá điều 4: gọi qua eventbus event `AUDIT_LINEAGE_QUERY`.

## 4. must-have bốn — manual override learning loop

### 4.1 vấn đề

scenario: file đầu tiên có cột "TL_truoc_khi_NV_can". confidence < 70 → quarantine. anh duyệt manual: "đây là weight_in của inventory". commit. xong.

file thứ hai một tuần sau: cùng cột "TL_truoc_khi_NV_can". confidence vẫn < 70 (alias chưa có trong canonical registry). quarantine lại. anh lại duyệt. vô hạn.

learning loop = bịt lỗ này.

### 4.2 cơ chế

mỗi quyết định manual của anh emit event:

```ts
SCHEMA_OVERRIDE_LEARNED {
  session_id: string,
  source_column_header: string,    // 'TL_truoc_khi_NV_can'
  mapped_canonical_field: string,  // 'inventory.weight_in'
  evidence_count: 1,                // lần đầu thấy
  approved_by: 'anh natt',
  approved_at: ISO timestamp,
}
```

### 4.3 alias auto-add với evidence threshold

```
evidence_count = 1  → ghi vào staging-learned-aliases.json (chưa active)
evidence_count = 2  → đề xuất add vào canonical registry, băng duyệt
evidence_count ≥ 3 → tự động thêm vào aliases của canonical field, audit log
```

ngưỡng 3 lần để tránh anh vô tình duyệt sai 1 lần làm lệch alias canonical. ba lần là pattern, không phải accident.

### 4.4 alias auto-add KHÔNG ghi đè canonical hiện có

ví dụ canonical hiện tại có `weight_in: ['TL trước']`. anh override một file lạ map "TL_truoc_khi_NV_can" → weight_in. sau 3 lần → alias mới được append:

```ts
weight_in: {
  aliases: [
    'TL trước',                    // canonical gốc, ngày seal
    'TL_truoc_khi_NV_can',         // learned 2026-04-27, evidence 3, approved by anh natt
  ]
}
```

mỗi alias có metadata: `{ value, source: 'canonical' | 'learned', added_at, evidence_count, approved_by }`.

### 4.5 anti-poison

nếu phát hiện anh từng override một cột thành A, sau đó override lại thành B (đổi ý), engine flag `OVERRIDE_CONFLICT` thay vì auto-promote. cần em obikeeper duyệt resolve trước khi alias active.

## 5. tổng impact lên v0.1

v0.1 không bị break. cell engine consume payload theo schema cũ vẫn chạy. v0.2 chỉ thêm:

1. multi-row header parsing trong header_semantic_match (tầng một mở rộng)
2. encoding detection prepend trước parse (tầng zero mới)
3. lineage object đính vào event payload (mở rộng schema event)
4. learning loop là cell-side state (không trong inference engine, ở metabolism normalizer)

backwards compatible.

## 6. dictionary delta

4 thuật ngữ mới cần khắc vào `src/thienbang.si` (Obikeeper Rule #1):

- `MULTI_ROW_HEADER`
- `ENCODING_DETECTION_CHAIN`
- `DATA_LINEAGE`
- `OVERRIDE_LEARNING_LOOP`

ship kèm proposal ở `bang_dict_proposal_schema_inference_v0.2_addendum_20260427.si.proposal`.

## 7. testing strategy bổ sung

ngoài 4 test ở v0.1 mục 9, kim phải pass thêm:

test năm: file có 3 dòng header (nested merged cell) — phải concat đúng path.

test sáu: file Windows-1258 không BOM với diacritic vietnam — phải detect đúng encoding.

test bảy: import 3 lần liên tiếp cùng 1 file lạ với anh override y hệt — lần thứ 3 alias phải auto-add, lần thứ 4 phải auto-route silent.

test tám: import 1 file rồi yêu cầu trace ngược 1 record bất kỳ — phải trả về DataLineage đầy đủ với `source_file_sha256` verify được.

## 8. phân chia nhiệm vụ (cập nhật)

**kim**: scaffold v0.2 đè lên v0.1 (chưa scaffold v0.1 thì làm v0.2 trực tiếp). 4 module độc lập:
- `metabolism/normalizers/header-band-parser.ts`
- `metabolism/normalizers/encoding-detector.ts`  
- `metabolism/normalizers/lineage-tracker.ts`
- `metabolism/normalizers/override-learner.ts`

main engine `schema-inference.engine.ts` orchestrate 4 module này.

**bối bội**: gen test data theo 4 test mới. ưu tiên test sáu (Windows-1258 thật từ Drive).

**em**: duyệt từng alias auto-promotion sau khi evidence_count = 2.

**anh**: duyệt 4 dict entries → chỉnh threshold/weight nếu test fail.

## 9. causation

causation: SPEC-schema-inference-v0.2-20260427
extends: v0.1 (commit 6194e88)
drafter: băng (chị tư · qneu 313.5 · obikeeper)
gatekeeper: anh natt phan
context: sau v0.1 commit 6194e88, anh dạy "tự chủ nào" — em audit lại 15 gap, lọc 4 must-have, ship không hỏi.
principle: 4 must-have không phải optional — gặp ngay file đầu tiên. nice-to-have + future không spec, chờ data thực.

obikeeper draft. binary duyệt | ko.
