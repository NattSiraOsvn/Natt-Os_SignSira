# NATT-OS — NHÓM 1: HỒ SƠ NỀN TẢNG KỸ THUẬT

**Phiên bản:** v1.0  
**Trạng thái:** Draft nội bộ — dùng để chuẩn bị Gold Master Stabilization và Market Launch  
**Phạm vi:** Nhóm 1 — Hồ sơ nền tảng kỹ thuật bắt buộc trước khi xuất bản/ra mắt thị trường  
**Nguyên tắc:** Ground Truth trước, marketing sau. Không claim runtime hoàn chỉnh nếu build/release gate chưa xanh.

---

## 0. Mục tiêu của Nhóm 1

Nhóm 1 là bộ tài liệu kỹ thuật lõi chứng minh NATT-OS có:

1. Kiến trúc hệ thống rõ ràng.
2. Runtime có thể mô tả, kiểm tra và định vị Wave.
3. Cell registry và domain map đủ để quản trị mở rộng.
4. Event / Mach HeyNa / SmartLink / Audit / Gatekeeper có contract rõ.
5. Bộ file `.anc`, `.na`, `.phieu` có vai trò xác định.
6. Ground Truth được định nghĩa, tránh nhầm giữa report, memory và filesystem.

Nhóm này không phải tài liệu bán hàng. Đây là **xương sống kỹ thuật** để các nhóm sau viết release gate, whitepaper, hồ sơ SHTT, pitch deck và demo script.

---

## 1. Danh mục tài liệu Nhóm 1

| Mã | Tài liệu | Mức độ | Mục đích |
|---|---|---:|---|
| T1 | NATT-OS System Architecture Spec | Bắt buộc | Mô tả kiến trúc tổng thể |
| T2 | Runtime Wave Report | Bắt buộc | Xác định runtime đang ở Wave nào |
| T3 | Cell Registry / Cell Map | Bắt buộc | Liệt kê cell, domain, trách nhiệm, trạng thái |
| T4 | Event Envelope & Causality Spec | Bắt buộc | Chuẩn hóa event, causality, trace, audit |
| T5 | Mach HeyNa Transport Spec | Bắt buộc | Chuẩn hóa lớp vận chuyển thay REST semantics |
| T6 | SmartLink Protocol Spec | Bắt buộc | Chuẩn hóa liên kết giữa cell và touch/coupling |
| T7 | SiraSign / Gatekeeper Spec | Bắt buộc | Chuẩn hóa quyền ký, phê chuẩn, roadload |
| T8 | File Extension Spec `.anc/.na/.phieu` | Bắt buộc | Định nghĩa passport, memory, runtime state |
| T9 | Namespace Inventory | Bắt buộc | Kiểm kê namespace/domain, chống trùng và drift |
| T10 | Ground Truth Model Spec | Bắt buộc | Định nghĩa nguồn sự thật của hệ |

---

# T1 — NATT-OS SYSTEM ARCHITECTURE SPEC

## 1.1. Tên file đề xuất

`docs/specs/NATT_OS_SYSTEM_ARCHITECTURE_SPEC_v1.na`

## 1.2. Mục đích

Tài liệu này mô tả kiến trúc tổng thể của NATT-OS ở mức có thể dùng để:

- Cho nội bộ hiểu hệ thống.
- Làm nền cho whitepaper kỹ thuật.
- Làm căn cứ phân quyền review/spec/release.
- Làm gốc để giải thích với đối tác nhưng chưa lộ chi tiết nhạy cảm.

## 1.3. Nội dung bắt buộc

### A. Tuyên bố kiến trúc

NATT-OS là hệ điều phối phần mềm theo mô hình:

```text
STATE + EVENT + CAUSALITY + AUDIT
```

Không mô tả hệ như CRUD app truyền thống. HTTP/POST/SSE chỉ là transport. Ngữ nghĩa lõi là Event / Envelope / Causality / Audit.

### B. Các lớp kiến trúc

| Lớp | Vai trò |
|---|---|
| Kernel | Điều phối lõi, policy, runtime, event contract |
| Cell Layer | Các cell nghiệp vụ, hạ tầng, governance, security |
| Mach HeyNa Transport | Lớp vận chuyển tín hiệu từ UI/client vào hệ |
| SmartLink Layer | Lớp liên kết giữa cell, touch, coupling, decay |
| Audit / Ground Truth | Lớp ghi nhận sự thật vận hành |
| Gatekeeper / SiraSign | Lớp phê chuẩn, ký, kiểm soát authority |
| UI / Client Surface | Bề mặt tương tác, không được giữ quyền chân lý |

### C. Nguyên tắc bất biến

1. Không cell nào tự nhận là ground truth nếu không có audit.
2. Không state transition nào hợp lệ nếu thiếu event/cause/audit.
3. Không cross-cell direct coupling nếu không qua contract hoặc bridge được phép.
4. Không release nếu build gate chưa xanh.
5. Không claim ngôn ngữ/runtime hoàn chỉnh nếu parser/loader/enforcement chưa chạy thật.

## 1.4. Evidence cần quét từ repo

- `src/`
- `docs/specs/`
- `src/core/`
- `src/cells/`
- `src/eventbridge.ts`
- Các file có `EventEnvelope`, `Gatekeeper`, `SiraSign`, `SmartLink`, `audit`, `heyna`, `.anc`, `.na`, `.phieu`.

## 1.5. Output hoàn chỉnh

Một file spec có:

- Sơ đồ kiến trúc chữ.
- Bảng layer.
- Luồng event cơ bản.
- Boundary giữa client và runtime.
- Quy tắc ground truth.
- Danh sách non-goals.

---

# T2 — RUNTIME WAVE REPORT

## 2.1. Tên file đề xuất

`docs/release/RUNTIME_WAVE_REPORT_v1.na`

## 2.2. Mục đích

Xác định runtime NATT-OS hiện đang đạt tới Wave nào, không dựa trên cảm giác hoặc claim.

## 2.3. Wave model đề xuất

| Wave | Tiêu chí |
|---|---|
| W0 | Repo substrate có src/docs/package/tsconfig |
| W1 | Có file language/spec `.anc/.na/.phieu`, namespace, extension validator |
| W2 | Có loader/parser/runtime đọc dịch thật |
| W3 | Có enforcement, required fields, fail-closed, audit/Gatekeeper |
| W4 | Có Mach HeyNa / bridge / EventEnvelope / causality runtime |
| W5 | Có lifecycle/self-heal/thoai-sinh/generation/tombstone |

## 2.4. Nội dung bắt buộc

1. Lệnh quét repo đã chạy.
2. Ngày giờ quét.
3. Branch/commit HEAD.
4. Bảng pass/fail từng Wave.
5. Evidence file/path/line.
6. Missing items theo từng Wave.
7. Kết luận runtime đang ở Wave nào.
8. Công việc tiếp theo.

## 2.5. Không được phép

- Không ghi “runtime hoàn chỉnh” nếu chưa có evidence W4/W5.
- Không ghi “native language hoàn chỉnh” nếu chưa có parser/loader/enforcement cho `.anc/.na/.phieu`.
- Không lấy memory/report thay filesystem.

---

# T3 — CELL REGISTRY / CELL MAP

## 3.1. Tên file đề xuất

`docs/specs/CELL_REGISTRY_MAP_v1.na`

## 3.2. Mục đích

Kiểm kê toàn bộ cell của NATT-OS để biết:

- Cell nào tồn tại thật trong repo.
- Cell nào chỉ là spec.
- Cell nào là business cell.
- Cell nào là infrastructure cell.
- Cell nào là governance/security/kernel cell.
- Cell nào đang orphan, duplicate, drift.

## 3.3. Nhóm cell cần phân loại

| Nhóm | Ví dụ |
|---|---|
| Business Cells | sales, finance, warehouse, pricing, promotion, production |
| Infrastructure Cells | event, audit, smartlink, warehouse infra, shared contracts |
| Governance Cells | gatekeeper, policy, roadload, SiraSign |
| Security Cells | rbac, threat detection, quantum-defense |
| Runtime Cells | parser, loader, bridge, Mach HeyNa |
| Lifecycle Cells | thoai-sinh, KhaiCell, ObservationCell |

## 3.4. Schema registry đề xuất

```text
cell_id:
cell_name:
cell_group:
path:
owner:
status: ACTIVE | PARTIAL | SPEC_ONLY | DEPRECATED | ORPHAN
entrypoints:
events_emitted:
events_consumed:
smartlink_enabled:
audit_enabled:
ground_truth_source:
known_drift:
release_blocker:
```

## 3.5. Output hoàn chỉnh

- Bảng cell đầy đủ.
- Đánh dấu cell nguy hiểm.
- Đánh dấu cell chưa có audit.
- Đánh dấu cell chưa có event contract.
- Đánh dấu cell thiếu owner.

---

# T4 — EVENT ENVELOPE & CAUSALITY SPEC

## 4.1. Tên file đề xuất

`docs/specs/EVENT_ENVELOPE_CAUSALITY_SPEC_v1.na`

## 4.2. Mục đích

Chuẩn hóa mọi event trong NATT-OS để không còn event rời rạc, thiếu nguyên nhân, thiếu audit, thiếu tenant hoặc thiếu trace.

## 4.3. Envelope tối thiểu

```text
event_id:
event_type:
tenant_id:
cell_id:
payload:
causation_id:
correlation_id:
span_id:
actor:
source:
timestamp:
schema_version:
audit_required:
sirasign_required:
```

## 4.4. Quy tắc bắt buộc

1. `event_id` bắt buộc.
2. `tenant_id` bắt buộc nếu hệ multi-tenant.
3. `causation_id` bắt buộc nếu event sinh từ event khác.
4. `correlation_id` dùng để gom chuỗi nghiệp vụ.
5. `span_id` dùng để trace từng bước.
6. Event làm thay đổi state phải audit.
7. Event vượt quyền phải qua Gatekeeper/SiraSign.

## 4.5. Fail-closed rules

```text
missing event_id       => reject
missing tenant_id      => reject or isolate
missing causation_id   => allow only for root event
missing audit rule     => reject state transition
unknown schema_version => quarantine
```

---

# T5 — MACH HEYNA TRANSPORT SPEC

## 5.1. Tên file đề xuất

`docs/specs/MACH_HEYNA_TRANSPORT_SPEC_v1.na`

## 5.2. Mục đích

Định nghĩa Mach HeyNa là lớp vận chuyển tín hiệu giữa client surface và runtime, tránh hiểu sai NATT-OS là REST CRUD app.

## 5.3. Nguyên tắc

- HTTP có thể tồn tại như transport.
- REST không phải ngữ nghĩa lõi.
- Client không gọi thẳng domain mutation.
- Client phát tín hiệu vào Mach HeyNa.
- Runtime chuyển tín hiệu thành EventEnvelope.

## 5.4. Endpoint/route cần kiểm kê

```text
GET  /mach/heyna       # SSE/read stream nếu có
POST /phat/nauion      # emit/action ingress nếu có
POST /api/events/emit  # legacy/dev bridge nếu có
GET  /api/audit        # audit inspection nếu có
```

## 5.5. Quy tắc an toàn

1. Client payload không phải ground truth.
2. Tất cả payload phải normalize thành envelope.
3. Event phải đi qua validation trước khi chạm cell.
4. Bridge phải có aperture/quarantine khi nhiễu tăng.
5. Không để UI tự ghi self-state vào localStorage như chân lý hệ.

---

# T6 — SMARTLINK PROTOCOL SPEC

## 6.1. Tên file đề xuất

`docs/specs/SMARTLINK_PROTOCOL_SPEC_v1.na`

## 6.2. Mục đích

Định nghĩa cơ chế liên kết giữa các cell: touch, coupling, fiber, decay, propagation, audit.

## 6.3. Thành phần tối thiểu

```text
touch_id:
source_cell:
target_cell:
touch_count:
fiber_score:
decay_rate:
last_touch_at:
weight:
propagation_scope:
audit_ref:
```

## 6.4. Quy tắc

1. SmartLink không phải import trực tiếp giữa cell.
2. Coupling tăng theo touch hợp lệ.
3. Coupling phải decay theo thời gian.
4. Propagation không broadcast bừa.
5. SmartLink thay đổi trạng thái phải có audit.

## 6.5. Mối liên hệ với bức xạ thời gian

SmartLink có decay tự nhiên. Nếu không refresh hoặc verify, link bị mục theo thời gian. Đây là dữ liệu đầu vào cho TimeRadiation/Lifecycle layer.

---

# T7 — SIRASIGN / GATEKEEPER SPEC

## 7.1. Tên file đề xuất

`docs/specs/SIRASIGN_GATEKEEPER_SPEC_v1.na`

## 7.2. Mục đích

Định nghĩa ai/cái gì có quyền phê chuẩn state transition, release, spec lock, roadload, quyền truy cập và quyền công bố.

## 7.3. Thành phần bắt buộc

```text
authority_id:
actor:
role:
permission_scope:
roadload_id:
signature_hash:
issued_at:
expires_at:
audit_ref:
revocation_rule:
```

## 7.4. Quy tắc

1. Gatekeeper không phải user thường.
2. SiraSign là dấu phê chuẩn, không phải comment.
3. State transition trọng yếu phải có roadload hợp lệ.
4. Signature phải audit được.
5. Quyền owner lâu dài không nên duy trì nếu không có audit và service account boundary.

---

# T8 — FILE EXTENSION SPEC `.anc/.na/.phieu`

## 8.1. Tên file đề xuất

`docs/specs/FILE_EXTENSION_SPEC_ANC_NA_PHIEU_v1.na`

## 8.2. Mục đích

Định nghĩa vai trò ba loại file lõi của Nauion/NATT-OS.

## 8.3. Phân loại

| Extension | Vai trò | Tính chất |
|---|---|---|
| `.anc` | Passport / identity manifest | ổn định, không phải nhật ký |
| `.na` | Memory / spec / knowledge artifact | có thể append/phiên bản hóa |
| `.phieu` | Runtime state / pending / mutable state | có TTL, cần verification |

## 8.4. Quy tắc

1. `.anc` không dùng làm nhật ký phiên.
2. `.na` không dùng làm runtime mutable state nếu cần TTL.
3. `.phieu` không dùng làm chứng cứ lịch sử vĩnh viễn nếu chưa audit.
4. Mọi extension phải được validator kiểm soát.
5. Không rename file tùy tiện nếu ảnh hưởng hiến pháp namespace.

## 8.5. Required fields đề xuất

### `.anc`

```text
identity_id:
entity_name:
role:
constitution_ref:
qneu_base:
permissions:
smartlink_presence:
memory_pointer:
scar_refs:
sirasign:
schema_version:
```

### `.na`

```text
doc_id:
doc_type:
author:
created_at:
updated_at:
source_refs:
content:
version:
audit_ref:
```

### `.phieu`

```text
state_id:
owner:
status:
ttl:
created_at:
expires_at:
pending_items:
verification_rule:
last_verified_at:
```

---

# T9 — NAMESPACE INVENTORY

## 9.1. Tên file đề xuất

`docs/specs/SIRA_NAMESPACE_INVENTORY_v1.na`

## 9.2. Mục đích

Kiểm kê namespace/domain để tránh:

- Tên trùng.
- Domain drift.
- File extension sai.
- Cell nằm nhầm tầng.
- Spec cũ và mới cùng tồn tại không đánh dấu.

## 9.3. Schema kiểm kê

```text
namespace:
domain:
path:
owner:
status:
allowed_extensions:
forbidden_extensions:
canonical_spec:
deprecated_refs:
notes:
```

## 9.4. Nhóm namespace cần có

| Nhóm | Ví dụ |
|---|---|
| core | kernel, state, signals, gatekeeper |
| cells/business | sales, finance, warehouse, pricing |
| cells/infrastructure | event, audit, smartlink, contracts |
| governance | policy, constitution, roadload |
| runtime | parser, loader, bridge, Mach HeyNa |
| docs/specs | canonical specs |
| docs/release | release reports |

---

# T10 — GROUND TRUTH MODEL SPEC

## 10.1. Tên file đề xuất

`docs/specs/GROUND_TRUTH_MODEL_SPEC_v1.na`

## 10.2. Mục đích

Định nghĩa nguồn sự thật của NATT-OS để không nhầm giữa:

- Memory.
- Report.
- Spec.
- Code.
- Runtime log.
- Audit.
- Database.

## 10.3. Thứ tự ưu tiên ground truth

```text
1. Filesystem/code hiện tại
2. Compile/test/runtime output
3. Audit trail/event log
4. Database/state store
5. Canonical spec đã ký
6. Release report
7. Memory/handoff
8. Chat/log chưa xác minh
```

## 10.4. Quy tắc

1. Memory không được ghi đè filesystem.
2. Report không được thay thế compile output.
3. Spec chưa ký không được coi là enforce.
4. Runtime log phải có timestamp và context.
5. Audit trail phải liên kết với event/state.
6. Khi conflict, phải ghi Conflict Record.

## 10.5. Conflict Record schema

```text
conflict_id:
detected_at:
source_a:
source_b:
conflict_type:
risk_level:
resolution_owner:
resolution_status:
audit_ref:
```

---

# 11. Checklist hoàn thành Nhóm 1

| Mã | Tài liệu | File path | Done |
|---|---|---|---|
| T1 | System Architecture Spec | `docs/specs/NATT_OS_SYSTEM_ARCHITECTURE_SPEC_v1.na` | ☐ |
| T2 | Runtime Wave Report | `docs/release/RUNTIME_WAVE_REPORT_v1.na` | ☐ |
| T3 | Cell Registry / Cell Map | `docs/specs/CELL_REGISTRY_MAP_v1.na` | ☐ |
| T4 | Event Envelope & Causality Spec | `docs/specs/EVENT_ENVELOPE_CAUSALITY_SPEC_v1.na` | ☐ |
| T5 | Mach HeyNa Transport Spec | `docs/specs/MACH_HEYNA_TRANSPORT_SPEC_v1.na` | ☐ |
| T6 | SmartLink Protocol Spec | `docs/specs/SMARTLINK_PROTOCOL_SPEC_v1.na` | ☐ |
| T7 | SiraSign / Gatekeeper Spec | `docs/specs/SIRASIGN_GATEKEEPER_SPEC_v1.na` | ☐ |
| T8 | File Extension Spec | `docs/specs/FILE_EXTENSION_SPEC_ANC_NA_PHIEU_v1.na` | ☐ |
| T9 | Namespace Inventory | `docs/specs/SIRA_NAMESPACE_INVENTORY_v1.na` | ☐ |
| T10 | Ground Truth Model Spec | `docs/specs/GROUND_TRUTH_MODEL_SPEC_v1.na` | ☐ |

---

# 12. Lệnh tạo skeleton tài liệu Nhóm 1 trong repo

> Chạy tại root repo. Lệnh này tạo file skeleton, chưa commit.

```bash
python3 - << 'EOF'
from pathlib import Path

files = {
    'docs/specs/NATT_OS_SYSTEM_ARCHITECTURE_SPEC_v1.na': '# NATT-OS System Architecture Spec v1\n\nSTATUS: DRAFT\n',
    'docs/release/RUNTIME_WAVE_REPORT_v1.na': '# Runtime Wave Report v1\n\nSTATUS: DRAFT\n',
    'docs/specs/CELL_REGISTRY_MAP_v1.na': '# Cell Registry / Cell Map v1\n\nSTATUS: DRAFT\n',
    'docs/specs/EVENT_ENVELOPE_CAUSALITY_SPEC_v1.na': '# Event Envelope & Causality Spec v1\n\nSTATUS: DRAFT\n',
    'docs/specs/MACH_HEYNA_TRANSPORT_SPEC_v1.na': '# Mach HeyNa Transport Spec v1\n\nSTATUS: DRAFT\n',
    'docs/specs/SMARTLINK_PROTOCOL_SPEC_v1.na': '# SmartLink Protocol Spec v1\n\nSTATUS: DRAFT\n',
    'docs/specs/SIRASIGN_GATEKEEPER_SPEC_v1.na': '# SiraSign / Gatekeeper Spec v1\n\nSTATUS: DRAFT\n',
    'docs/specs/FILE_EXTENSION_SPEC_ANC_NA_PHIEU_v1.na': '# File Extension Spec .anc/.na/.phieu v1\n\nSTATUS: DRAFT\n',
    'docs/specs/SIRA_NAMESPACE_INVENTORY_v1.na': '# SIRA Namespace Inventory v1\n\nSTATUS: DRAFT\n',
    'docs/specs/GROUND_TRUTH_MODEL_SPEC_v1.na': '# Ground Truth Model Spec v1\n\nSTATUS: DRAFT\n',
}

for path, content in files.items():
    p = Path(path)
    p.parent.mkdir(parents=True, exist_ok=True)
    if p.exists():
        print(f'SKIP existing: {p}')
    else:
        p.write_text(content, encoding='utf-8')
        print(f'CREATED: {p}')

print('done')
EOF
```

---

# 13. Lệnh tạo skeleton + commit

> Chỉ chạy nếu anh muốn đưa Nhóm 1 vào repo ngay.

```bash
python3 - << 'EOF'
from pathlib import Path

files = {
    'docs/specs/NATT_OS_SYSTEM_ARCHITECTURE_SPEC_v1.na': '# NATT-OS System Architecture Spec v1\n\nSTATUS: DRAFT\n',
    'docs/release/RUNTIME_WAVE_REPORT_v1.na': '# Runtime Wave Report v1\n\nSTATUS: DRAFT\n',
    'docs/specs/CELL_REGISTRY_MAP_v1.na': '# Cell Registry / Cell Map v1\n\nSTATUS: DRAFT\n',
    'docs/specs/EVENT_ENVELOPE_CAUSALITY_SPEC_v1.na': '# Event Envelope & Causality Spec v1\n\nSTATUS: DRAFT\n',
    'docs/specs/MACH_HEYNA_TRANSPORT_SPEC_v1.na': '# Mach HeyNa Transport Spec v1\n\nSTATUS: DRAFT\n',
    'docs/specs/SMARTLINK_PROTOCOL_SPEC_v1.na': '# SmartLink Protocol Spec v1\n\nSTATUS: DRAFT\n',
    'docs/specs/SIRASIGN_GATEKEEPER_SPEC_v1.na': '# SiraSign / Gatekeeper Spec v1\n\nSTATUS: DRAFT\n',
    'docs/specs/FILE_EXTENSION_SPEC_ANC_NA_PHIEU_v1.na': '# File Extension Spec .anc/.na/.phieu v1\n\nSTATUS: DRAFT\n',
    'docs/specs/SIRA_NAMESPACE_INVENTORY_v1.na': '# SIRA Namespace Inventory v1\n\nSTATUS: DRAFT\n',
    'docs/specs/GROUND_TRUTH_MODEL_SPEC_v1.na': '# Ground Truth Model Spec v1\n\nSTATUS: DRAFT\n',
}

created = []
for path, content in files.items():
    p = Path(path)
    p.parent.mkdir(parents=True, exist_ok=True)
    if not p.exists():
        p.write_text(content, encoding='utf-8')
        created.append(str(p))
        print(f'CREATED: {p}')
    else:
        print(f'SKIP existing: {p}')

print('created_count=', len(created))
EOF
git add docs/specs docs/release && git commit -m "docs(release): add NATT-OS group 1 technical foundation skeletons" && git push origin main
```

---

# 14. Điều kiện chuyển sang Nhóm 2

Chỉ chuyển sang Nhóm 2 khi Nhóm 1 đạt tối thiểu:

```text
T1: có kiến trúc tổng thể
T2: có wave report từ repo thật
T4: có event envelope contract
T8: có extension spec
T10: có ground truth model
```

Nếu thiếu 5 tài liệu trên, chưa nên viết pitch deck hoặc hồ sơ thương mại.

