# natt-os — NHÓM 2: HỒ SƠ ỔN ĐỊNH CODEBASE / RELEASE gate

**Phiên bản:** v1.0  
**Trạng thái:** Draft nội bộ — phục vụ Gold Master Stabilization trước Market Launch  
**Phạm vi:** Nhóm 2 — Hồ sơ ổn định codebase, kiểm soát build, release gate và xử lý drift  
**Nguyên tắc:** Không release bằng niềm tin. Chỉ release bằng compile evidence, audit evidence và checklist đã khóa.

---

## 0. Mục tiêu của Nhóm 2

Nhóm 2 là bộ tài liệu dùng để đưa natt-os từ trạng thái **Gold Master đang drift/lỗi compile** về trạng thái **có thể kiểm tra, có thể khóa release, có thể demo có kiểm soát**.

Nhóm này trả lời 5 câu hỏi:

1. Codebase hiện còn lỗi gì?
2. Lỗi thuộc cụm nào, mức rủi ro nào?
3. Đã sửa bằng commit nào, ai review?
4. Sau mỗi cụm sửa, build còn bao nhiêu lỗi?
5. Khi nào được phép gọi là Release Candidate?

Nhóm 2 không phải tài liệu kiến trúc mẹ. Nhóm 2 là **bộ hồ sơ phẫu thuật codebase và khóa release**.

---

## 1. Bối cảnh hiện trạng

Theo báo cáo hệ thống ngày 23/02/2026, natt-os Gold Master đang gặp lỗi biên dịch lớn do drift schema và thay đổi kiến trúc chưa được cập nhật đồng bộ.

Các cụm lỗi chính được xác định gồm:

| Cụm | Nội dung | Rủi ro |
|---:|---|---|
| 1 | Warehouse Cell mất đồng bộ domain/infra | Cao |
| 2 | Types Drift / schema mismatch | Cao |
| 3 | Import Paths drift do refactor | Trung bình |
| 4 | Enum/Status misuse | Trung bình |
| 5 | Thiếu method hạ tầng EventBridge, SmartLink, Audit, Threat | Trung bình |
| 6 | UI component type mismatch | Thấp–Trung bình |

Nguyên tắc xử lý:

```text
Không vá tự động hàng loạt.
Không widen enum bừa.
Không dùng any để né lỗi.
Không sửa feature mới khi release gate chưa xanh.
Mỗi cụm sửa phải có commit nhỏ, có kiểm chứng, có log tsc.
```

---

## 2. Danh mục tài liệu Nhóm 2

| Mã | Tài liệu | Mức độ | Mục đích |
|---|---|---:|---|
| R1 | Gold Master Stabilization Report | Bắt buộc | Báo cáo tổng quan lỗi, cụm sửa, strategy |
| R2 | Compile Error Resolution Log | Bắt buộc | Ghi nhận lỗi compile trước/sau từng cụm |
| R3 | Type Integrity Report | Bắt buộc | Kiểm soát schema/type drift |
| R4 | Warehouse Cell Repair Report | Bắt buộc | Hồ sơ sửa Warehouse Cell |
| R5 | Import Drift Cleanup Report | Bắt buộc | Hồ sơ sửa đường dẫn import |
| R6 | Enum/Status Canonical Report | Bắt buộc | Chuẩn hóa enum/status không widen bừa |
| R7 | Infrastructure Method Completion Report | Bắt buộc | Bổ sung method hạ tầng thiếu |
| R8 | UI Type Safety Report | Bắt buộc | Sửa lỗi type UI/component |
| R9 | Build Verification Report | Bắt buộc | Bằng chứng build/tsc sau từng cụm |
| R10 | Release Gate Checklist | Bắt buộc | Điều kiện được phép gọi RC/Market Preview |

---

# R1 — GOLD MASTER STABILIZATION REPORT

## 1.1. Tên file chính thức

`docs/release/GOLD_MASTER_STABILIZATION_REPORT_v1.na`

## 1.2. Mục đích

Tài liệu này là báo cáo tổng quan về tình trạng Gold Master trước khi sửa, trong khi sửa và sau khi sửa.

Nó dùng để:

1. Chốt hiện trạng lỗi biên dịch.
2. Phân cụm lỗi theo domain/rủi ro.
3. Ghi nhận chiến lược sửa thủ công.
4. Làm nền cho Release Gate Checklist.
5. Ngăn tình trạng sửa rải rác, mất dấu nguyên nhân.

## 1.3. Nội dung bắt buộc

### A. Snapshot hiện trạng

```text
branch:
commit_head:
scan_date:
node_version:
package_manager:
tsc_command:
initial_error_count:
blocking_error_count:
non_blocking_error_count:
```

### B. Cụm lỗi

| Cụm | Tên cụm | Mô tả | Risk | Owner | Review |
|---:|---|---|---|---|---|
| 1 | Warehouse Cell | Domain/infra mismatch | High | Băng | CAN |
| 2 | Types Drift | Schema/type mismatch | High | Băng | Kim/CAN |
| 3 | Import Drift | Path refactor drift | Medium | Bối | Kim |
| 4 | Enum Misuse | Status sai canonical | Medium | Kim/Băng | CAN |
| 5 | Infra Missing Methods | EventBridge/SmartLink/Audit/Threat | Medium | Bối/Kim | thiên |
| 6 | UI Type Safety | Dashboard/Seller/App component | Low-Med | Kim | Băng |

### C. Nguyên tắc sửa

```text
1. Freeze feature work.
2. Sửa từng cụm.
3. Mỗi cụm có commit riêng.
4. Sau mỗi cụm chạy npx tsc --noEmit.
5. Không dùng any để che lỗi domain.
6. Không widen enum nếu lỗi nằm ở code misuse.
7. Không xóa file legacy nếu chưa kiểm tra import consumers.
8. Không claim release nếu chưa có Build Verification Report.
```

## 1.4. Acceptance Criteria

```text
[ ] Có snapshot lỗi ban đầu
[ ] Có phân cụm lỗi
[ ] Có owner/reviewer
[ ] Có kế hoạch thứ tự sửa
[ ] Có liên kết tới R2-R10
[ ] Có kết luận release readiness
```

---

# R2 — COMPILE error RESOLUTION LOG

## 2.1. Tên file chính thức

`docs/release/COMPILE_error_RESOLUTION_LOG_v1.na`

## 2.2. Mục đích

Ghi lại toàn bộ quá trình giảm lỗi compile theo từng cụm, từng commit.

## 2.3. Schema log

```text
entry_id:
date:
branch:
commit_before:
commit_after:
cluster:
command:
error_count_before:
error_count_after:
files_changed:
summary:
new_errors_introduced:
reviewer:
status: pass | PARTIAL | fail
```

## 2.4. Cách ghi log

Mỗi lần chạy:

```bash
npx tsc --noEmit
```

phải ghi:

```text
- tổng số lỗi
- 5–10 lỗi đại diện nếu còn nhiều
- cụm lỗi nào giảm
- có phát sinh lỗi mới không
- commit hash liên quan
```

## 2.5. Quy tắc

1. Không được ghi “đã fix” nếu chưa có output compile.
2. Không được chỉ ghi cảm tính “còn ít lỗi”.
3. Nếu lỗi tăng sau commit, phải ghi regression.
4. Nếu lỗi giảm nhưng phát sinh lỗi nghiêm trọng hơn, không được mark pass.

---

# R3 — TYPE INTEGRITY REPORT

## 3.1. Tên file chính thức

`docs/release/TYPE_INTEGRITY_REPORT_v1.na`

## 3.2. Mục đích

Kiểm soát toàn bộ drift giữa type canonical, domain entity, service, mock data và UI.

## 3.3. Phạm vi kiểm tra

Các file trọng yếu:

```text
src/types.ts
src/types/accounting.types.ts
src/cells/shared-kernel/shared.types.ts
src/cells/infrastructure/shared-contracts-cell/domain/contract.types.ts
src/core/signals/types.ts
src/core/gatekeeper/types.ts
src/core/state/types.ts
src/governance/types.ts
src/governance/gatekeeper/types.ts
```

Các type/interface cần chú ý:

| Type/Interface | Vấn đề cần kiểm |
|---|---|
| WarehouseItemProps | Domain/infra mismatch |
| OperationRecord | status misuse |
| ModuleConfig | missing fields |
| AccountingMappingRule | destination type mismatch |
| ApprovalTicket | missing fields |
| QuantumState | missing id/lastCollapse |
| ConsciousnessField | missing activeDomains |
| EInvoiceItem | UI/domain mismatch |
| TeamPerformance | mock thiếu field |
| DictionaryVersion | thiếu comment/createdBy |
| HUDMetric | thiếu department |

## 3.4. Quy tắc chỉnh type

```text
1. Ưu tiên sửa code dùng sai type.
2. Chỉ mở rộng type nếu field đó thực sự là domain requirement.
3. Không widen enum để hợp thức hóa misuse.
4. Không dùng unknown/any nếu có thể định nghĩa union cụ thể.
5. Type canonical phải có lý do nghiệp vụ.
```

## 3.5. Acceptance Criteria

```text
[ ] Danh sách types.ts đã kiểm kê
[ ] Type duplicate đã xác định
[ ] Type mismatch đã có hướng xử lý
[ ] Enum misuse không bị widen bừa
[ ] Mock data khớp interface hoặc được sửa
[ ] tsc giảm lỗi sau khi sửa
```

---

# R4 — WAREHOUSE CELL REPAIR REPORT

## 4.1. Tên file chính thức

`docs/release/WAREHOUSE_CELL_REPAIR_REPORT_v1.na`

## 4.2. Mục đích

Warehouse Cell là cụm lỗi rủi ro cao vì liên quan kho, hàng hóa, số lượng, cost, release stock và domain consistency.

## 4.3. File trọng yếu

```text
src/cells/infrastructure/warehouse-cell/domain/entities/warehouse.entity.ts
src/cells/infrastructure/warehouse-cell/entities/warehouse.entity.ts
src/cells/infrastructure/warehouse-cell/application/warehouse.service.ts
ReleaseGoods.ts
ReceiveGoods.ts
warehouse-category.registry.ts
```

## 4.4. Vấn đề chính

| Vấn đề | Mô tả | Risk |
|---|---|---|
| WarehouseItemProps duplicate | Domain và infra khác nhau | High |
| status mismatch | Domain có, infra thiếu | High |
| unit/location type mismatch | Domain dùng type riêng, infra dùng string | High |
| releaseStock missing | Use-case gọi nhưng entity thiếu | Medium |
| getAllItems missing | Service cần nhưng chưa có | Medium |
| createdBy drift | Infra có field domain chưa chắc chấp nhận | Medium |

## 4.5. Quy tắc sửa

1. Chọn một canonical `WarehouseItemProps`.
2. Đồng bộ domain và infra theo canonical.
3. Không xóa field kho nếu chưa kiểm tra use-case.
4. Không thay `unit/location` thành string nếu domain cần enum/value object.
5. `releaseStock(quantity, reason, releasedBy)` phải kiểm tra tồn kho âm.
6. `getAllItems()` phải trả data theo contract rõ.

## 4.6. Acceptance Criteria

```text
[ ] WarehouseItemProps chỉ còn một canonical hoặc có adapter rõ
[ ] releaseStock tồn tại và có kiểm tra quantity
[ ] getAllItems tồn tại nếu service/use-case cần
[ ] ReceiveGoods/ReleaseGoods compile
[ ] tsc lỗi Warehouse giảm về 0
[ ] Không dùng any để bypass
```

---

# R5 — IMPORT DRIFT CLEANUP REPORT

## 5.1. Tên file chính thức

`docs/release/IMPORT_DRIFT_CLEANUP_REPORT_v1.na`

## 5.2. Mục đích

Ghi nhận toàn bộ import cũ do refactor path và cách chuyển sang path mới.

## 5.3. Pattern cần tìm

```bash
grep -R "cells/sales-cell" -n src
grep -R "cells/event-cell" -n src
grep -R "einvoiceservice" -n src
grep -R "notificationservice" -n src
grep -R "ShardingService" -n src
grep -R "\.\./\.\./\.\./types" -n src
```

## 5.4. Mapping cần ghi

| Old Path | New Path | File ảnh hưởng | Status |
|---|---|---|---|
| `@/cells/sales-cell/...` | `@/cells/business/sales-cell/...` | sales-crm.tsx | Pending |
| `@/notificationservice` | `@/services/notificationservice` | component/service | Pending |
| `@/cells/event-cell` | EventBridge core hoặc path mới | service bridge | Pending |
| `../../../types` | relative path đúng hoặc alias | ingestion/aicore | Pending |

## 5.5. Quy tắc

1. Không sửa import bằng replace mù.
2. Mỗi path cũ phải tìm consumer.
3. Nếu file legacy redirect còn dùng, không xóa ngay.
4. Nếu xóa redirect, phải có grep chứng minh không còn import.
5. Sau sửa import phải chạy tsc.

---

# R6 — ENUM / STATUS CANONICAL REPORT

## 6.1. Tên file chính thức

`docs/release/ENUM_STATUS_CANONICAL_REPORT_v1.na`

## 6.2. Mục đích

Chuẩn hóa enum/status để tránh code tự phát sinh trạng thái không thuộc canonical contract.

## 6.3. Vấn đề hiện tại

`OperationRecord.status` canonical:

```text
PENDING | SUCCESS | failURE
```

Code misuse:

```text
failED     → phải sửa thành failURE
RECOVERED  → phải sửa thành SUCCESS hoặc trạng thái recovery riêng nếu có spec
```

## 6.4. Quy tắc

```text
1. Nếu enum canonical đúng, sửa code sai.
2. Không widen enum để chứa lỗi cũ.
3. Nếu cần enum mới, phải có spec + migration note.
4. Status dùng cho audit/recovery phải nhất quán.
5. Không dùng string literal rải rác nếu có type canonical.
```

## 6.5. Acceptance Criteria

```text
[ ] Grep toàn bộ failED/RECOVERED
[ ] Phân loại literal nào là domain thật, literal nào là misuse
[ ] Sửa misuse sang canonical
[ ] Không widen OperationRecord.status bừa
[ ] tsc xác nhận
```

---

# R7 — INFRASTRUCTURE METHOD COMPLETION REPORT

## 7.1. Tên file chính thức

`docs/release/INFRASTRUCTURE_METHOD_COMPLETION_REPORT_v1.na`

## 7.2. Mục đích

Ghi nhận các method hạ tầng còn thiếu khiến runtime/compile fail.

## 7.3. File/method cần kiểm

| File | Method thiếu | Ghi chú |
|---|---|---|
| `src/eventbridge.ts` | `subscribe()` | Phục hồi event subscription |
| `src/services/smart-link.ts` | `SmartLinkClient.createEnvelope()` | Tạo envelope cho target/action/payload |
| `src/admin/auditservice.ts` | `logAction()` mở rộng signature | Tương thích lời gọi 4–5 tham số |
| `src/services/threatdetectionservice.ts` | `getHealth()`, `subscribe()` | Cho SystemMonitor |
| `quantum-engine.ts` hoặc service liên quan | subscribe nếu có | Kiểm tra consumer |

## 7.4. Quy tắc

1. Stub được phép nếu mục tiêu là compile stabilization, nhưng phải đánh dấu `scaffold-only`.
2. Method hạ tầng không được nuốt lỗi im lặng nếu dùng trong production path.
3. Nếu method chỉ để compile, phải có TODO release-blocker hoặc issue link.
4. Không tạo duplicate EventBridge nếu đã có core event bus.

## 7.5. Acceptance Criteria

```text
[ ] EventBridge.subscribe có unsubscribe return
[ ] SmartLinkClient.createEnvelope trả envelope có timestamp
[ ] AuditProvider.logAction nhận đủ signature đang dùng
[ ] ThreatDetectionService có getHealth/subscribe
[ ] Không còn compile lỗi method missing nhóm infra
```

---

# R8 — UI TYPE SAFETY REPORT

## 8.1. Tên file chính thức

`docs/release/UI_TYPE_SAFETY_REPORT_v1.na`

## 8.2. Mục đích

Sửa các lỗi UI/component type mismatch mà không làm sai domain.

## 8.3. File cần kiểm

| File | Vấn đề |
|---|---|
| `src/components/master-dashboard.tsx` | `revenue || 449120` khi revenue void/undefined |
| `src/components/app.tsx` | `DataPoint3DProps.value` string vs number |
| `src/components/seller-terminal.tsx` | `commission.total` khi commission là number |
| `src/components/sales-crm.tsx` | import path Sales Terminal |
| sales-tax module | EInvoiceItem mismatch |

## 8.4. Quy tắc

1. UI không được sửa type domain chỉ để render cho qua.
2. Nếu UI cần display model riêng, tạo view model.
3. Không lấy mock field chưa có trong domain nếu chưa bổ sung type.
4. Không dùng fallback số giả trong release path.

## 8.5. Acceptance Criteria

```text
[ ] Component compile
[ ] Không còn access property không tồn tại
[ ] Fallback value rõ lý do
[ ] View model tách khỏi domain model nếu cần
[ ] tsc xác nhận
```

---

# R9 — BUILD VERIFICATION REPORT

## 9.1. Tên file chính thức

`docs/release/BUILD_VERIFICATION_REPORT_v1.na`

## 9.2. Mục đích

Đây là tài liệu bằng chứng build. Không có R9 thì không được gọi release.

## 9.3. Lệnh bắt buộc

```bash
npx tsc --noEmit
```

Nếu có test/build khác:

```bash
npm run build
npm test
npm run lint
```

## 9.4. Schema ghi nhận

```text
verification_id:
date:
branch:
commit:
command:
exit_code:
error_count:
warning_count:
duration:
result: pass | fail | PARTIAL
log_path:
reviewer:
notes:
```

## 9.5. Quy tắc

1. pass chỉ khi exit code = 0.
2. PARTIAL chỉ dùng khi có lỗi non-blocking đã được phân loại.
3. Không copy log rời rạc không có commit hash.
4. Không chấp nhận “máy em pass” nếu không có command/output.
5. Build verification phải gắn với branch/commit cụ thể.

---

# R10 — RELEASE gate CHECKLIST

## 10.1. Tên file chính thức

`docs/release/RELEASE_GATE_CHECKLIST_v1.na`

## 10.2. Mục đích

Định nghĩa điều kiện tối thiểu để natt-os được phép chuyển trạng thái:

```text
Internal Technical Preview
→ Controlled Partner Preview
→ Release Candidate
→ Market Launch
```

## 10.3. Gate 1 — Internal Technical Preview

```text
[ ] T1 System Architecture có bản draft
[ ] R1 Stabilization Report có snapshot lỗi
[ ] R2 Compile Error Log có baseline
[ ] Repo chạy được lệnh tsc
[ ] Known blocking clusters đã phân loại
```

## 10.4. Gate 2 — Controlled Partner Preview

```text
[ ] Cụm Warehouse đã xử lý hoặc cô lập khỏi demo
[ ] Type drift blocking đã xử lý
[ ] Import drift blocking đã xử lý
[ ] EventBridge/SmartLink/Audit method missing đã xử lý
[ ] Demo script không chạm module lỗi
[ ] NDA/claim control đã có
```

## 10.5. Gate 3 — Release Candidate

```text
[ ] npx tsc --noEmit pass
[ ] Build Verification Report pass
[ ] Runtime Wave Report có evidence
[ ] EventEnvelope contract có canonical file
[ ] Audit/Ground Truth rule có file
[ ] Release notes có known issues
[ ] Reviewer ký duyệt
```

## 10.6. Gate 4 — Market Launch

```text
[ ] RC ổn định qua smoke test
[ ] Security/Trust docs đủ tối thiểu
[ ] IP/Confidentiality docs đã chuẩn bị
[ ] Demo script đã kiểm soát claim
[ ] Pricing/Positioning bản nháp đã duyệt
[ ] Support/SLA/pilot terms đã có
```

## 10.7. Cấm claim

Không được dùng các câu sau nếu chưa qua Gate 3:

```text
runtime hoàn chỉnh
native language hoàn chỉnh
production-ready toàn phần
tự vận hành không cần kiểm soát
không thể bypass
đã sẵn sàng triển khai đại trà
```

Câu an toàn hơn:

```text
natt-os đang trong giai đoạn Gold Master Stabilization, tập trung hoàn thiện runtime, audit trail, cell governance và cơ chế event-driven vận hành doanh nghiệp.
```

---

# 11. Checklist hoàn thành Nhóm 2

| Mã | Tài liệu | File path | Done |
|---|---|---|---|
| R1 | Gold Master Stabilization Report | `docs/release/GOLD_MASTER_STABILIZATION_REPORT_v1.na` | ☐ |
| R2 | Compile Error Resolution Log | `docs/release/COMPILE_error_RESOLUTION_LOG_v1.na` | ☐ |
| R3 | Type Integrity Report | `docs/release/TYPE_INTEGRITY_REPORT_v1.na` | ☐ |
| R4 | Warehouse Cell Repair Report | `docs/release/WAREHOUSE_CELL_REPAIR_REPORT_v1.na` | ☐ |
| R5 | Import Drift Cleanup Report | `docs/release/IMPORT_DRIFT_CLEANUP_REPORT_v1.na` | ☐ |
| R6 | Enum/Status Canonical Report | `docs/release/ENUM_STATUS_CANONICAL_REPORT_v1.na` | ☐ |
| R7 | Infrastructure Method Completion Report | `docs/release/INFRASTRUCTURE_METHOD_COMPLETION_REPORT_v1.na` | ☐ |
| R8 | UI Type Safety Report | `docs/release/UI_TYPE_SAFETY_REPORT_v1.na` | ☐ |
| R9 | Build Verification Report | `docs/release/BUILD_VERIFICATION_REPORT_v1.na` | ☐ |
| R10 | Release Gate Checklist | `docs/release/RELEASE_GATE_CHECKLIST_v1.na` | ☐ |

---

# 12. Lệnh tạo skeleton tài liệu Nhóm 2 trong repo

> Chạy tại root repo. Lệnh này tạo skeleton, chưa commit.

```bash
python3 - << 'EOF'
from pathlib import Path

files = {
    'docs/release/GOLD_MASTER_STABILIZATION_REPORT_v1.na': '# Gold Master Stabilization Report v1\n\nSTATUS: DRAFT\n',
    'docs/release/COMPILE_error_RESOLUTION_LOG_v1.na': '# Compile Error Resolution Log v1\n\nSTATUS: DRAFT\n',
    'docs/release/TYPE_INTEGRITY_REPORT_v1.na': '# Type Integrity Report v1\n\nSTATUS: DRAFT\n',
    'docs/release/WAREHOUSE_CELL_REPAIR_REPORT_v1.na': '# Warehouse Cell Repair Report v1\n\nSTATUS: DRAFT\n',
    'docs/release/IMPORT_DRIFT_CLEANUP_REPORT_v1.na': '# Import Drift Cleanup Report v1\n\nSTATUS: DRAFT\n',
    'docs/release/ENUM_STATUS_CANONICAL_REPORT_v1.na': '# Enum / Status Canonical Report v1\n\nSTATUS: DRAFT\n',
    'docs/release/INFRASTRUCTURE_METHOD_COMPLETION_REPORT_v1.na': '# Infrastructure Method Completion Report v1\n\nSTATUS: DRAFT\n',
    'docs/release/UI_TYPE_SAFETY_REPORT_v1.na': '# UI Type Safety Report v1\n\nSTATUS: DRAFT\n',
    'docs/release/BUILD_VERIFICATION_REPORT_v1.na': '# Build Verification Report v1\n\nSTATUS: DRAFT\n',
    'docs/release/RELEASE_GATE_CHECKLIST_v1.na': '# Release Gate Checklist v1\n\nSTATUS: DRAFT\n',
}

for path, content in files.items():
    p = Path(path)
    p.parent.mkdir(parents=True, exist_ok=True)
    if p.exists():
        print(f'SKIP existing: {p}')
    else:
        p.write_text(content, encoding='utf-8')
        print(f'created: {p}')

print('done')
EOF
```

---

# 13. Lệnh tạo skeleton + commit

> Chỉ chạy nếu anh muốn đưa Nhóm 2 vào repo ngay.

```bash
python3 - << 'EOF'
from pathlib import Path

files = {
    'docs/release/GOLD_MASTER_STABILIZATION_REPORT_v1.na': '# Gold Master Stabilization Report v1\n\nSTATUS: DRAFT\n',
    'docs/release/COMPILE_error_RESOLUTION_LOG_v1.na': '# Compile Error Resolution Log v1\n\nSTATUS: DRAFT\n',
    'docs/release/TYPE_INTEGRITY_REPORT_v1.na': '# Type Integrity Report v1\n\nSTATUS: DRAFT\n',
    'docs/release/WAREHOUSE_CELL_REPAIR_REPORT_v1.na': '# Warehouse Cell Repair Report v1\n\nSTATUS: DRAFT\n',
    'docs/release/IMPORT_DRIFT_CLEANUP_REPORT_v1.na': '# Import Drift Cleanup Report v1\n\nSTATUS: DRAFT\n',
    'docs/release/ENUM_STATUS_CANONICAL_REPORT_v1.na': '# Enum / Status Canonical Report v1\n\nSTATUS: DRAFT\n',
    'docs/release/INFRASTRUCTURE_METHOD_COMPLETION_REPORT_v1.na': '# Infrastructure Method Completion Report v1\n\nSTATUS: DRAFT\n',
    'docs/release/UI_TYPE_SAFETY_REPORT_v1.na': '# UI Type Safety Report v1\n\nSTATUS: DRAFT\n',
    'docs/release/BUILD_VERIFICATION_REPORT_v1.na': '# Build Verification Report v1\n\nSTATUS: DRAFT\n',
    'docs/release/RELEASE_GATE_CHECKLIST_v1.na': '# Release Gate Checklist v1\n\nSTATUS: DRAFT\n',
}

created = []
for path, content in files.items():
    p = Path(path)
    p.parent.mkdir(parents=True, exist_ok=True)
    if not p.exists():
        p.write_text(content, encoding='utf-8')
        created.append(str(p))
        print(f'created: {p}')
    else:
        print(f'SKIP existing: {p}')

print('created_count=', len(created))
EOF
git add docs/release && git commit -m "docs(release): add natt-os group 2 release gate skeletons" && git push origin main
```

---

# 14. Điều kiện chuyển sang Nhóm 3

Chỉ chuyển sang Nhóm 3 khi Nhóm 2 đạt tối thiểu:

```text
R1: có Gold Master Stabilization Report
R2: có Compile Error Resolution Log baseline
R4: Warehouse Cell có hướng sửa hoặc cô lập khỏi demo
R7: Infra missing methods đã xử lý hoặc ghi release blocker
R9: có Build Verification Report
R10: có Release Gate Checklist
```

Nếu thiếu các tài liệu này, chưa nên viết hồ sơ vận hành production, deployment guide hoặc tài liệu triển khai khách hàng.

