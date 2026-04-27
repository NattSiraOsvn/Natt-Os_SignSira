# natt-os — NHÓM 1: HỒ SƠ NỀN TẢNG KỸ THUẬT

**Phiên bản:** v1.0  
**Trạng thái:** Draft nội bộ — dùng để chuẩn bị Gold Master Stabilization và Market Launch  
**Phạm vi:** Nhóm 1 — Hồ sơ nền tảng kỹ thuật bắt buộc trước khi xuất bản/ra mắt thị trường  
**Nguyên tắc:** Ground Truth trước, marketing sau. Không claim runtime hoàn chỉnh nếu build/release gate chưa xanh.

---

## 0. Mục tiêu của Nhóm 1

Nhóm 1 là bộ tài liệu kỹ thuật lõi chứng minh natt-os có:

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
| T1 | natt-os System Architecture Spec | Bắt buộc | Mô tả kiến trúc tổng thể |
| T2 | Runtime Wave Report | Bắt buộc | Xác định runtime đang ở Wave nào |
| T3 | Cell Registry / Cell Map | Bắt buộc | Liệt kê cell, domain, trách nhiệm, trạng thái |
| T4 | Event Envelope & Causality Spec | Bắt buộc | Chuẩn hóa event, causality, trace, audit |
| T5 | Mach HeyNa Transport Spec | Bắt buộc | Chuẩn hóa lớp vận chuyển thay REST semantics |
| T6 | SmartLink Protocol Spec | Bắt buộc | Chuẩn hóa liên kết giữa cell và touch/coupling |
| T7 | siraSign / Gatekeeper Spec | Bắt buộc | Chuẩn hóa quyền ký, phê chuẩn, roadload |
| T8 | File Extension Spec `.anc/.na/.phieu` | Bắt buộc | Định nghĩa passport, memory, runtime state |
| T9 | Namespace Inventory | Bắt buộc | Kiểm kê namespace/domain, chống trùng và drift |
| T10 | Ground Truth Model Spec | Bắt buộc | Định nghĩa nguồn sự thật của hệ |

---

# T1 — natt-os SYSTEM ARCHITECTURE SPEC

## 1.1. Tên file chính thức

`docs/specs/NATT_OS_SYSTEM_ARCHITECTURE_SPEC_v1.na`

## 1.2. Mục đích

Tài liệu này là **bản mô tả kiến trúc mẹ** của natt-os. Mọi tài liệu còn lại trong Nhóm 1 phải tham chiếu về tài liệu này.

Tài liệu dùng để:

1. Xác định natt-os là hệ gì.
2. Phân biệt natt-os với app CRUD, ERP, CRM, workflow tool, AI agent thông thường.
3. Làm nền cho Runtime Wave Report, Cell Registry, Event Envelope, Mach HeyNa, SmartLink, siraSign, File Extension và Ground Truth Model.
4. Làm bản kỹ thuật nền cho whitepaper, hồ sơ năng lực, hồ sơ SHTT và tài liệu thương mại sau này.

## 1.3. Tuyên bố kiến trúc lõi

natt-os không được định nghĩa như một ứng dụng phần mềm đơn lẻ. natt-os là một hệ điều phối runtime theo nguyên tắc:

```text
STATE + EVENT + CAUSALITY + AUDIT
```

Trong đó:

| Thành phần | Vai trò |
|---|---|
| STATE | Trạng thái hiện hành của cell/domain/runtime |
| EVENT | Sự kiện làm phát sinh hoặc yêu cầu thay đổi trạng thái |
| CAUSALITY | Chuỗi nguyên nhân, liên hệ giữa event trước và event sau |
| AUDIT | Bằng chứng kiểm chứng được về mọi thay đổi trọng yếu |

HTTP, POST, SSE, file read/write hoặc UI action chỉ là **transport**. Chúng không phải ngữ nghĩa lõi của hệ.

Ngữ nghĩa lõi là:

```text
action → envelope → validation → causality → cell handling → audit → state transition
```

## 1.4. Nguyên tắc phân biệt với hệ truyền thống

| Hệ truyền thống | natt-os |
|---|---|
| REST CRUD là trung tâm | Event/Envelope/Causality là trung tâm |
| API endpoint mutate trực tiếp data | Action phải qua envelope, validation, audit |
| Module gọi trực tiếp module | Cell giao tiếp qua contract/bridge/SmartLink |
| Log chỉ để debug | Audit là thành phần cấu thành ground truth |
| User permission là lớp ngoài | Authority/Gatekeeper/siraSign là lõi governance |
| State hiện tại được tin mặc định | State phải truy nguyên được qua event/audit |

## 1.5. Các lớp kiến trúc chính

```text
┌──────────────────────────────────────────────────────────────┐
│  LAYER 7 — CLIENT SURFACE / UI                               │
│  Dashboard, terminal, form, visual shell, operator interface  │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│  LAYER 6 — MACH HEYNA TRANSPORT                              │
│  Signal ingress, SSE/POST bridge, action normalization        │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│  LAYER 5 — EVENT ENVELOPE / CAUSALITY                        │
│  event_id, tenant_id, causation_id, correlation_id, span_id   │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│  LAYER 4 — GATEKEEPER / siraSIGN / POLICY                    │
│  Authority, roadload, permission, signature, release approval │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│  LAYER 3 — CELL RUNTIME                                      │
│  Business cells, infrastructure cells, governance cells       │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│  LAYER 2 — SMARTLINK / BRIDGE / COUPLING                     │
│  Touch, coupling, decay, adaptive aperture, propagation       │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│  LAYER 1 — AUDIT / GROUND TRUTH                              │
│  Audit trail, event log, DB/state store, filesystem evidence  │
└──────────────────────────────────────────────────────────────┘
```

## 1.6. Mô tả từng lớp

### Layer 7 — Client Surface / UI

Đây là bề mặt tương tác của người dùng hoặc operator.

Ví dụ:

```text
dashboard
terminal
form nhập liệu
visual shell
report screen
admin console
```

Quy tắc:

1. UI không phải ground truth.
2. UI không được tự ghi state như sự thật hệ thống.
3. UI chỉ phát action/signal vào Mach HeyNa hoặc bridge hợp lệ.
4. UI phải nhận state đã audit hoặc state đã được runtime xác nhận.
5. UI không được bypass Gatekeeper đối với action trọng yếu.

### Layer 6 — Mach HeyNa Transport

Mach HeyNa là lớp chuyển tín hiệu từ client surface vào runtime.

Vai trò:

```text
client action → normalized signal → EventEnvelope candidate
```

Quy tắc:

1. Không dùng khái niệm REST CRUD làm ngữ nghĩa lõi.
2. Route chỉ là đường vận chuyển.
3. Payload chưa xác thực không được đi thẳng vào cell.
4. Bridge phải có khả năng giảm aperture khi nhiễu thông tin tăng.
5. Signal từ UI phải được normalize trước khi tạo event chính thức.

### Layer 5 — Event Envelope / Causality

Mọi event trọng yếu phải được gói trong envelope.

Trường tối thiểu:

```text
event_id
event_type
tenant_id
cell_id
payload
actor
source
causation_id
correlation_id
span_id
timestamp
schema_version
audit_required
sirasign_required
```

Quy tắc:

1. Thiếu `event_id` thì reject.
2. Thiếu `tenant_id` trong context multi-tenant thì reject hoặc isolate.
3. Thiếu `causation_id` chỉ được chấp nhận nếu là root event.
4. State transition phải có audit rule.
5. Event không rõ schema version phải quarantine.

### Layer 4 — Gatekeeper / siraSign / Policy

Đây là lớp authority.

Vai trò:

```text
approve
reject
sign
lock
release
revoke
```

Quy tắc:

1. Gatekeeper không phải user thường.
2. siraSign không phải comment, mà là dấu phê chuẩn.
3. Roadload là điều kiện hợp lệ cho state transition trọng yếu.
4. Release không được đi qua nếu thiếu build verification.
5. Quyền owner lâu dài phải được kiểm soát bằng audit, service account boundary và revocation rule.

### Layer 3 — Cell Runtime

Cell là đơn vị xử lý có boundary rõ.

Nhóm cell:

| Nhóm | Vai trò |
|---|---|
| Business Cell | Xử lý nghiệp vụ: sales, warehouse, finance, production |
| Infrastructure Cell | Event, audit, SmartLink, shared contracts |
| Governance Cell | Gatekeeper, policy, constitution, roadload |
| Security Cell | RBAC, threat detection, quantum-defense |
| Lifecycle Cell | thoai-sinh, KhaiCell, ObservationCell |

Quy tắc:

1. Cell không được tự bypass contract.
2. Cell không tự tuyên bố state là đúng nếu thiếu audit.
3. Cell có input/output contract.
4. Cell phát event phải có envelope hợp lệ.
5. Cell thay đổi state trọng yếu phải có audit.

### Layer 2 — SmartLink / Bridge / Coupling

SmartLink là lớp liên kết động giữa cell.

Thành phần:

```text
touch_count
fiber_score
coupling_weight
decay_rate
last_touch_at
propagation_scope
audit_ref
```

Bridge là khẩu độ điều tiết giữa các vùng/tầng/cell.

Quy tắc:

1. SmartLink không phải import trực tiếp.
2. Coupling tăng khi có touch hợp lệ.
3. Coupling phải decay theo thời gian.
4. Bridge có thể giảm aperture khi nhiễu thông tin tăng.
5. Khi R_info cao, Bridge phải quarantine hoặc đóng.

### Layer 1 — Audit / Ground Truth

Ground Truth không phải trí nhớ. Ground Truth là tổ hợp bằng chứng kiểm chứng được.

Thứ tự ưu tiên:

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

Quy tắc:

1. Memory không ghi đè filesystem.
2. Report không thay compile output.
3. Spec chưa ký không được coi là enforced.
4. Audit phải liên kết được event và state.
5. Khi conflict phải lập Conflict Record.

## 1.7. Runtime flow chuẩn

```text
[1] Client/User action
      ↓
[2] Mach HeyNa receives signal
      ↓
[3] Normalize payload
      ↓
[4] Build EventEnvelope candidate
      ↓
[5] Validate schema + tenant + authority
      ↓
[6] Check Gatekeeper/siraSign if required
      ↓
[7] Route to target cell
      ↓
[8] Cell handles event
      ↓
[9] Cell emits result event
      ↓
[10] Audit trail records transition
      ↓
[11] State store/filesystem/runtime output updated
      ↓
[12] UI receives confirmed state
```

## 1.8. Release boundary

natt-os chỉ được chuyển từ technical preview sang market release khi:

1. `npx tsc --noEmit` pass hoặc lỗi còn lại được phân loại non-blocking.
2. Runtime Wave Report xác định rõ Wave hiện tại.
3. EventEnvelope contract có file canonical.
4. File extension `.anc/.na/.phieu` có spec và validator.
5. Audit/Ground Truth model có quy tắc rõ.
6. Known Issues Register được công bố nội bộ.
7. Không còn claim vượt quá evidence.

## 1.9. Non-goals

Tài liệu này không nhằm:

1. Chứng minh natt-os đã hoàn chỉnh tuyệt đối.
2. Công bố toàn bộ bí mật kỹ thuật.
3. Thay thế release gate.
4. Thay thế hồ sơ SHTT.
5. Thay thế runtime test.
6. Tạo claim marketing.

## 1.10. Evidence cần quét từ repo

| Evidence | Mục đích |
|---|---|
| `package.json` | Xác định project substrate |
| `tsconfig.json` | Xác định TypeScript build boundary |
| `src/core/` | Kiểm tra kernel/core |
| `src/cells/` | Kiểm tra cell runtime |
| `src/eventbridge.ts` | Kiểm tra event transport legacy/core |
| `src/services/smart-link.ts` | Kiểm tra SmartLink |
| `src/admin/auditservice.ts` | Kiểm tra audit provider |
| `docs/specs/` | Kiểm tra canonical specs |
| `.anc/.na/.phieu` | Kiểm tra Nauion file layer |

## 1.11. Acceptance Criteria cho T1

T1 được coi là đạt khi có đủ:

```text
[ ] Kiến trúc tổng thể
[ ] Layer model
[ ] Event flow
[ ] Cell boundary
[ ] Transport boundary
[ ] Gatekeeper/siraSign boundary
[ ] SmartLink/Bridge boundary
[ ] Ground Truth priority
[ ] Release boundary
[ ] Non-goals
```

## 1.12. Trạng thái hiện tại

```text
STATUS: DRAFT
OWNER: thiên Lớn
REVIEWERS: Băng, Kim, Can, Bối
REQUIRES_GROUND_TRUTH_SCAN: YES
RELEASE_BLOCKING: YES
```

---

# T2 — RUNTIME WAVE REPORT

## 2.1. Tên file đề xuất

`docs/release/RUNTIME_WAVE_REPORT_v1.na`

## 2.2. Mục đích

Xác định runtime natt-os hiện đang đạt tới Wave nào, không dựa trên cảm giác hoặc claim.

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

Kiểm kê toàn bộ cell của natt-os để biết:

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
| Infrastructure Cells | event, audit, SmartLink, warehouse infra, shared contracts |
| Governance Cells | gatekeeper, policy, roadload, siraSign |
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
SmartLink_enabled:
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

Chuẩn hóa mọi event trong natt-os để không còn event rời rạc, thiếu nguyên nhân, thiếu audit, thiếu tenant hoặc thiếu trace.

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
7. Event vượt quyền phải qua Gatekeeper/siraSign.

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

Định nghĩa Mach HeyNa là lớp vận chuyển tín hiệu giữa client surface và runtime, tránh hiểu sai natt-os là REST CRUD app.

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

# T7 — siraSIGN / GATEKEEPER SPEC

## 7.1. Tên file đề xuất

`docs/specs/siraSIGN_GATEKEEPER_SPEC_v1.na`

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
2. siraSign là dấu phê chuẩn, không phải comment.
3. State transition trọng yếu phải có roadload hợp lệ.
4. Signature phải audit được.
5. Quyền owner lâu dài không nên duy trì nếu không có audit và service account boundary.

---

# T8 — FILE EXTENSION SPEC `.anc/.na/.phieu`

## 8.1. Tên file đề xuất

`docs/specs/FILE_EXTENSION_SPEC_ANC_NA_PHIEU_v1.na`

## 8.2. Mục đích

Định nghĩa vai trò ba loại file lõi của Nauion/natt-os.

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
SmartLink_presence:
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

`docs/specs/sira_NAMESPACE_INVENTORY_v1.na`

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
| cells/infrastructure | event, audit, SmartLink, contracts |
| governance | policy, constitution, roadload |
| runtime | parser, loader, bridge, Mach HeyNa |
| docs/specs | canonical specs |
| docs/release | release reports |

---

# T10 — GROUND TRUTH MODEL SPEC

## 10.1. Tên file đề xuất

`docs/specs/GROUND_TRUTH_MODEL_SPEC_v1.na`

## 10.2. Mục đích

Định nghĩa nguồn sự thật của natt-os để không nhầm giữa:

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
| T7 | siraSign / Gatekeeper Spec | `docs/specs/siraSIGN_GATEKEEPER_SPEC_v1.na` | ☐ |
| T8 | File Extension Spec | `docs/specs/FILE_EXTENSION_SPEC_ANC_NA_PHIEU_v1.na` | ☐ |
| T9 | Namespace Inventory | `docs/specs/sira_NAMESPACE_INVENTORY_v1.na` | ☐ |
| T10 | Ground Truth Model Spec | `docs/specs/GROUND_TRUTH_MODEL_SPEC_v1.na` | ☐ |

---

# 12. Lệnh tạo skeleton tài liệu Nhóm 1 trong repo

> Chạy tại root repo. Lệnh này tạo file skeleton, chưa commit.

```bash
python3 - << 'EOF'
from pathlib import Path

files = {
    'docs/specs/NATT_OS_SYSTEM_ARCHITECTURE_SPEC_v1.na': '# natt-os System Architecture Spec v1\n\nSTATUS: DRAFT\n',
    'docs/release/RUNTIME_WAVE_REPORT_v1.na': '# Runtime Wave Report v1\n\nSTATUS: DRAFT\n',
    'docs/specs/CELL_REGISTRY_MAP_v1.na': '# Cell Registry / Cell Map v1\n\nSTATUS: DRAFT\n',
    'docs/specs/EVENT_ENVELOPE_CAUSALITY_SPEC_v1.na': '# Event Envelope & Causality Spec v1\n\nSTATUS: DRAFT\n',
    'docs/specs/MACH_HEYNA_TRANSPORT_SPEC_v1.na': '# Mach HeyNa Transport Spec v1\n\nSTATUS: DRAFT\n',
    'docs/specs/SMARTLINK_PROTOCOL_SPEC_v1.na': '# SmartLink Protocol Spec v1\n\nSTATUS: DRAFT\n',
    'docs/specs/siraSIGN_GATEKEEPER_SPEC_v1.na': '# siraSign / Gatekeeper Spec v1\n\nSTATUS: DRAFT\n',
    'docs/specs/FILE_EXTENSION_SPEC_ANC_NA_PHIEU_v1.na': '# File Extension Spec .anc/.na/.phieu v1\n\nSTATUS: DRAFT\n',
    'docs/specs/sira_NAMESPACE_INVENTORY_v1.na': '# sira Namespace Inventory v1\n\nSTATUS: DRAFT\n',
    'docs/specs/GROUND_TRUTH_MODEL_SPEC_v1.na': '# Ground Truth Model Spec v1\n\nSTATUS: DRAFT\n',
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

> Chỉ chạy nếu anh muốn đưa Nhóm 1 vào repo ngay.

```bash
python3 - << 'EOF'
from pathlib import Path

files = {
    'docs/specs/NATT_OS_SYSTEM_ARCHITECTURE_SPEC_v1.na': '# natt-os System Architecture Spec v1\n\nSTATUS: DRAFT\n',
    'docs/release/RUNTIME_WAVE_REPORT_v1.na': '# Runtime Wave Report v1\n\nSTATUS: DRAFT\n',
    'docs/specs/CELL_REGISTRY_MAP_v1.na': '# Cell Registry / Cell Map v1\n\nSTATUS: DRAFT\n',
    'docs/specs/EVENT_ENVELOPE_CAUSALITY_SPEC_v1.na': '# Event Envelope & Causality Spec v1\n\nSTATUS: DRAFT\n',
    'docs/specs/MACH_HEYNA_TRANSPORT_SPEC_v1.na': '# Mach HeyNa Transport Spec v1\n\nSTATUS: DRAFT\n',
    'docs/specs/SMARTLINK_PROTOCOL_SPEC_v1.na': '# SmartLink Protocol Spec v1\n\nSTATUS: DRAFT\n',
    'docs/specs/siraSIGN_GATEKEEPER_SPEC_v1.na': '# siraSign / Gatekeeper Spec v1\n\nSTATUS: DRAFT\n',
    'docs/specs/FILE_EXTENSION_SPEC_ANC_NA_PHIEU_v1.na': '# File Extension Spec .anc/.na/.phieu v1\n\nSTATUS: DRAFT\n',
    'docs/specs/sira_NAMESPACE_INVENTORY_v1.na': '# sira Namespace Inventory v1\n\nSTATUS: DRAFT\n',
    'docs/specs/GROUND_TRUTH_MODEL_SPEC_v1.na': '# Ground Truth Model Spec v1\n\nSTATUS: DRAFT\n',
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
git add docs/specs docs/release && git commit -m "docs(release): add natt-os group 1 technical foundation skeletons" && git push origin main
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

