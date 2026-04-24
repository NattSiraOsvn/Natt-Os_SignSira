# NATT-OS — NHÓM 7: HỒ SƠ TRIỂN KHAI KHÁCH HÀNG / PILOT / NGHIỆM THU

**Phiên bản:** v1.0  
**Trạng thái:** Draft nội bộ — phục vụ triển khai khách hàng, controlled pilot và nghiệm thu có kiểm soát  
**Phạm vi:** Nhóm 7 — Hồ sơ triển khai, khảo sát, mapping nghiệp vụ, migration, integration, pilot, acceptance, training, SLA và change request  
**Nguyên tắc:** Không nhận triển khai bằng cảm tính. Mọi pilot phải có scope, dữ liệu, người phụ trách, tiêu chí nghiệm thu, giới hạn trách nhiệm và đường rollback rõ.

---

## 0. Mục tiêu của Nhóm 7

Nhóm 7 là bộ hồ sơ dùng để triển khai NATT-OS cho khách hàng hoặc đối tác pilot sau khi đã có nền thương mại và claim control ở Nhóm 6.

Nhóm này trả lời 10 câu hỏi:

1. Quy trình triển khai bắt đầu từ đâu?
2. Cần khảo sát khách hàng những gì?
3. Nghiệp vụ khách hàng được ánh xạ vào cell/event/audit ra sao?
4. Dữ liệu đầu vào cần chuẩn bị thế nào?
5. Tích hợp với hệ thống hiện có ra sao?
6. Pilot chạy trong bao lâu, phạm vi nào, dữ liệu nào?
7. Tiêu chí nghiệm thu là gì?
8. Người dùng được đào tạo thế nào?
9. Hỗ trợ và SLA trong pilot/production được đặt ra sao?
10. Khi khách hàng yêu cầu đổi scope thì xử lý bằng quy trình nào?

Nhóm 7 không phải hồ sơ sales. Đây là **bộ hồ sơ triển khai có kiểm soát**, nhằm tránh nhận sai khách, sai scope, sai dữ liệu và sai kỳ vọng.

---

## 1. Điều kiện vào Nhóm 7

Không được triển khai Nhóm 7 như hồ sơ pilot thật nếu Nhóm 6 chưa đạt tối thiểu:

```text
M1: có Company / Product Profile bản kiểm soát claim
M2: có Pitch Deck Outline
M3: có One-page Introduction
M4: có Use Case Catalog có readiness level
M5: có Market Positioning Statement
M7: có Customer Qualification Form
M8: có Demo Script
M10: có Public Claim Control Sheet
```

Nếu thương mại chưa khóa scope và claim, Nhóm 7 chỉ được gắn nhãn:

```text
STATUS: IMPLEMENTATION_DRAFT_INTERNAL
```

Không được gắn:

```text
STATUS: CUSTOMER_PILOT_READY
STATUS: PRODUCTION_IMPLEMENTATION_READY
STATUS: ENTERPRISE_ROLLOUT_READY
```

---

## 2. Danh mục tài liệu Nhóm 7

| Mã | Tài liệu | Mức độ | Mục đích |
|---|---|---:|---|
| C1 | Implementation Methodology | Bắt buộc | Quy trình triển khai từ khảo sát đến nghiệm thu |
| C2 | Discovery Questionnaire | Bắt buộc | Bộ câu hỏi khảo sát khách hàng |
| C3 | Business Process Mapping Template | Bắt buộc | Mapping nghiệp vụ vào cell/event/audit |
| C4 | Data Migration Checklist | Bắt buộc | Danh mục dữ liệu đầu vào cần chuẩn hóa |
| C5 | Integration Checklist | Bắt buộc | Kiểm tra tích hợp với hệ thống hiện có |
| C6 | Pilot Plan | Bắt buộc | Kế hoạch chạy thử có scope và mốc kiểm soát |
| C7 | Acceptance Criteria | Bắt buộc | Tiêu chí nghiệm thu kỹ thuật/nghiệp vụ |
| C8 | Training Manual | Bắt buộc | Tài liệu đào tạo người dùng/operator |
| C9 | Support SLA Draft | Bắt buộc | Cam kết hỗ trợ, phản hồi, xử lý sự cố |
| C10 | Change Request Template | Bắt buộc | Mẫu kiểm soát thay đổi scope |

---

# C1 — IMPLEMENTATION METHODOLOGY

## 1.1. Tên file chính thức

`docs/customer/IMPLEMENTATION_METHODOLOGY_v1.na`

## 1.2. Mục đích

Tài liệu này định nghĩa phương pháp triển khai NATT-OS cho khách hàng hoặc đối tác pilot theo từng giai đoạn, có kiểm soát scope, dữ liệu, release gate và nghiệm thu.

## 1.3. Giai đoạn triển khai

```text
Phase 0 — Qualification
Phase 1 — Discovery
Phase 2 — Business Process Mapping
Phase 3 — Data Readiness
Phase 4 — Integration Design
Phase 5 — Pilot Configuration
Phase 6 — Controlled Pilot
Phase 7 — Acceptance Review
Phase 8 — Stabilization / Handover
Phase 9 — Expansion Decision
```

## 1.4. Mô tả từng phase

| Phase | Mục tiêu | Output |
|---|---|---|
| 0 | Xác định khách có phù hợp không | Qualification result |
| 1 | Hiểu nghiệp vụ, hệ thống, dữ liệu | Discovery report |
| 2 | Mapping nghiệp vụ vào cell/event/audit | Process map |
| 3 | Kiểm tra dữ liệu có đủ sạch không | Data readiness report |
| 4 | Xác định tích hợp cần có | Integration design |
| 5 | Cấu hình pilot scope | Pilot configuration |
| 6 | Chạy controlled pilot | Pilot log + issue register |
| 7 | Đánh giá nghiệm thu | Acceptance report |
| 8 | Ổn định và bàn giao | Handover package |
| 9 | Quyết định mở rộng | Expansion proposal |

## 1.5. Nguyên tắc triển khai

```text
1. Không triển khai nếu chưa qualify khách hàng.
2. Không nhận production scope ngay từ đầu nếu chưa có discovery.
3. Không nhận dữ liệu thật nếu chưa có Data Boundary/DPA phù hợp.
4. Không mapping nghiệp vụ vào runtime nếu quy trình khách hàng chưa mô tả được.
5. Không mở rộng scope pilot nếu không có Change Request.
6. Không nghiệm thu bằng cảm tính; phải có Acceptance Criteria.
```

## 1.6. Delivery record schema

```text
implementation_id:
customer_name:
phase:
owner_customer:
owner_natt_os:
start_date:
end_date:
scope:
deliverables:
risks:
issues:
approval_status:
next_action:
```

---

# C2 — DISCOVERY QUESTIONNAIRE

## 2.1. Tên file chính thức

`docs/customer/DISCOVERY_QUESTIONNAIRE_v1.na`

## 2.2. Mục đích

Tạo bộ câu hỏi khảo sát khách hàng trước khi nhận pilot hoặc triển khai.

## 2.3. Nhóm câu hỏi

```text
A. Thông tin doanh nghiệp
B. Mục tiêu triển khai
C. Quy trình nghiệp vụ hiện tại
D. Hệ thống phần mềm đang dùng
E. Dữ liệu hiện có
F. Người phụ trách nội bộ
G. Rủi ro / pain points
H. Yêu cầu audit / compliance
I. Kỳ vọng thời gian / ngân sách
J. Phạm vi pilot mong muốn
```

## 2.4. Câu hỏi mẫu

### A. Thông tin doanh nghiệp

```text
Tên doanh nghiệp:
Ngành nghề:
Quy mô nhân sự:
Số chi nhánh/phòng ban:
Người quyết định chính:
Người phụ trách vận hành:
Người phụ trách kỹ thuật:
```

### B. Mục tiêu triển khai

```text
Vấn đề lớn nhất hiện tại là gì?
Vấn đề đó gây thiệt hại ở đâu: tiền, thời gian, audit, nhân sự, dữ liệu?
Mục tiêu 30 ngày là gì?
Mục tiêu 90 ngày là gì?
Mục tiêu 12 tháng là gì?
```

### C. Quy trình nghiệp vụ

```text
Quy trình nào muốn đưa vào pilot?
Quy trình đó bắt đầu từ sự kiện nào?
Ai phê duyệt?
Dữ liệu đầu vào là gì?
Kết quả đầu ra là gì?
Hiện có audit/log không?
Điểm thường sai nằm ở đâu?
```

### D. Hệ thống hiện có

```text
Đang dùng ERP/CRM/kế toán/kho/HRM nào?
Có API/export/import không?
Có database riêng không?
Có file Excel vận hành không?
Có log/audit không?
Ai có quyền truy cập?
```

## 2.5. Quy tắc

1. Nếu khách không trả lời được quy trình, chưa pilot sâu.
2. Nếu không có owner nội bộ, không nhận triển khai.
3. Nếu dữ liệu thật nhạy cảm, phải qua C4 + DPA.
4. Nếu kỳ vọng thay toàn hệ ngay, phải chuyển về assessment.
5. Discovery phải ký xác nhận hoặc ít nhất có meeting note.

---

# C3 — BUSINESS PROCESS MAPPING TEMPLATE

## 3.1. Tên file chính thức

`docs/customer/BUSINESS_PROCESS_MAPPING_TEMPLATE_v1.na`

## 3.2. Mục đích

Ánh xạ quy trình nghiệp vụ khách hàng vào mô hình NATT-OS:

```text
Business process → Cell → Event → Causality → Audit → State
```

## 3.3. Mapping schema

```text
process_id:
process_name:
business_owner:
start_event:
end_state:
involved_departments:
involved_systems:
required_cells:
events:
approval_points:
audit_points:
data_inputs:
data_outputs:
exception_paths:
known_risks:
acceptance_metrics:
```

## 3.4. Event mapping table

| Business step | Event type | Source | Target cell | Required audit | Failure handling |
|---|---|---|---|---|---|
| Nhận yêu cầu | request.received | UI/operator | intake-cell | Yes | reject/quarantine |
| Kiểm tra dữ liệu | data.validated | validator | domain-cell | Yes | return correction |
| Phê duyệt | approval.requested | domain-cell | gatekeeper | Yes | escalate |
| Thực hiện | action.executed | cell | target-cell | Yes | rollback/incident |
| Hoàn tất | process.completed | target-cell | audit | Yes | close |

## 3.5. Audit mapping table

| State change | Audit required | Evidence | Owner | Retention |
|---|---:|---|---|---|
| Tạo mới record | Yes | event + actor + timestamp | process owner | theo policy |
| Sửa dữ liệu trọng yếu | Yes | before/after hash | process owner | theo policy |
| Phê duyệt | Yes | approver + SiraSign nếu có | Gatekeeper | theo policy |
| Rollback | Yes | rollback record | ops owner | theo policy |

## 3.6. Quy tắc

1. Không mapping trực tiếp “form → database” nếu bỏ qua event/audit.
2. Mỗi process phải có start event và end state.
3. Mỗi approval phải có actor/authority.
4. Mỗi state trọng yếu phải có audit point.
5. Exception path phải được mô tả, không chỉ happy path.

---

# C4 — DATA MIGRATION CHECKLIST

## 4.1. Tên file chính thức

`docs/customer/DATA_MIGRATION_CHECKLIST_v1.na`

## 4.2. Mục đích

Kiểm soát dữ liệu đầu vào khi khách hàng muốn đưa dữ liệu vào NATT-OS hoặc pilot.

## 4.3. Data readiness checklist

```text
[ ] Data owner xác định
[ ] Data source xác định
[ ] Data classification xác định
[ ] Data format xác định
[ ] Field dictionary có sẵn
[ ] Sample data đã kiểm
[ ] Sensitive data đã mask nếu cần
[ ] Duplicate rule có sẵn
[ ] Validation rule có sẵn
[ ] Migration scope đã khóa
[ ] Rollback plan dữ liệu có sẵn
```

## 4.4. Data inventory schema

```text
dataset_id:
dataset_name:
source_system:
owner:
classification:
format:
row_count:
field_count:
sensitive_fields:
quality_issues:
validation_rules:
migration_status:
notes:
```

## 4.5. Data quality checks

| Check | Mục tiêu |
|---|---|
| Completeness | Thiếu trường bắt buộc không |
| Consistency | Dữ liệu có mâu thuẫn không |
| Uniqueness | Có duplicate không |
| Validity | Đúng format/type không |
| Timeliness | Dữ liệu có quá cũ không |
| Traceability | Có nguồn gốc không |

## 4.6. Quy tắc

1. Không nhận dữ liệu thật nếu chưa phân loại sensitivity.
2. Không migrate dữ liệu không có owner.
3. Không import dữ liệu không có rollback plan.
4. Không dùng dữ liệu khách hàng trong demo public.
5. Dữ liệu tài chính, nhân sự, khách hàng mặc định High risk.

---

# C5 — INTEGRATION CHECKLIST

## 5.1. Tên file chính thức

`docs/customer/INTEGRATION_CHECKLIST_v1.na`

## 5.2. Mục đích

Kiểm soát tích hợp giữa NATT-OS và hệ thống hiện có của khách hàng.

## 5.3. Integration categories

| Category | Ví dụ |
|---|---|
| File import/export | Excel, CSV, JSON |
| API integration | ERP, CRM, accounting, warehouse |
| Database integration | read-only replica, ETL |
| Event/webhook | external event ingress |
| Authentication | SSO, account mapping |
| Reporting | BI/export/dashboard |
| Audit export | audit evidence package |

## 5.4. Integration record schema

```text
integration_id:
system_name:
system_owner:
integration_type:
direction: inbound | outbound | bidirectional
protocol:
data_scope:
auth_method:
frequency:
error_handling:
audit_required:
security_review_status:
status:
```

## 5.5. Checklist

```text
[ ] System owner xác định
[ ] Data direction rõ
[ ] Auth method rõ
[ ] Rate limit/traffic rõ
[ ] Error handling rõ
[ ] Retry rule rõ
[ ] Audit rule rõ
[ ] Data boundary rõ
[ ] Rollback/disconnect plan rõ
[ ] Security review xong
```

## 5.6. Quy tắc

1. Không tích hợp bidirectional nếu chưa rõ ownership.
2. Không cho external system mutate state nếu không qua event envelope.
3. Không tích hợp bằng shared password không kiểm soát.
4. Không bỏ audit đối với dữ liệu trọng yếu.
5. Integration lỗi phải có incident path.

---

# C6 — PILOT PLAN

## 6.1. Tên file chính thức

`docs/customer/PILOT_PLAN_v1.na`

## 6.2. Mục đích

Định nghĩa kế hoạch chạy thử có kiểm soát cho khách hàng.

## 6.3. Pilot schema

```text
pilot_id:
customer_name:
pilot_objective:
start_date:
end_date:
duration:
scope:
out_of_scope:
involved_cells:
involved_users:
data_scope:
integration_scope:
success_metrics:
risks:
known_issues:
support_model:
acceptance_criteria_ref:
```

## 6.4. Pilot timeline mẫu

```text
Week 0 — Qualification + NDA + discovery
Week 1 — Process mapping + data readiness
Week 2 — Configuration + smoke test
Week 3 — Controlled user testing
Week 4 — Issue resolution + acceptance review
```

## 6.5. Success metrics

| Metric | Ví dụ |
|---|---|
| Traceability | % workflow có audit/event trace |
| Cycle time | thời gian xử lý giảm/tăng |
| Error rate | lỗi nhập liệu/lỗi phê duyệt |
| User adoption | số user dùng thử hợp lệ |
| Incident count | incident trong pilot |
| Acceptance score | đạt/không đạt tiêu chí nghiệm thu |

## 6.6. Quy tắc

1. Pilot phải có out-of-scope.
2. Pilot không được tự biến thành production.
3. Pilot dùng dữ liệu thật phải có data agreement.
4. Pilot phải có stop condition.
5. Pilot kết thúc phải có acceptance hoặc postmortem.

---

# C7 — ACCEPTANCE CRITERIA

## 7.1. Tên file chính thức

`docs/customer/ACCEPTANCE_CRITERIA_v1.na`

## 7.2. Mục đích

Định nghĩa tiêu chí nghiệm thu kỹ thuật và nghiệp vụ cho pilot/triển khai.

## 7.3. Acceptance categories

| Category | Ví dụ tiêu chí |
|---|---|
| Functional | workflow chạy đúng scope |
| Event/Audit | event có envelope, audit có record |
| Data | dữ liệu nhập/xuất đúng field |
| Integration | hệ tích hợp gửi/nhận đúng |
| Performance | đáp ứng tải pilot |
| Security | không lộ dữ liệu ngoài scope |
| User | người dùng hoàn thành task |
| Support | issue được phản hồi đúng SLA |

## 7.4. Acceptance record schema

```text
criterion_id:
category:
description:
measurement_method:
expected_result:
actual_result:
evidence:
status: PASS | FAIL | PARTIAL | WAIVED
owner:
approver:
notes:
```

## 7.5. Quy tắc nghiệm thu

1. Không nghiệm thu nếu không có evidence.
2. WAIVED phải có approver và lý do.
3. Bug critical không được waive nếu ảnh hưởng audit/security/data.
4. Nghiệm thu pilot không đồng nghĩa nghiệm thu production.
5. Acceptance phải liên kết với Pilot Plan và Known Issues.

---

# C8 — TRAINING MANUAL

## 8.1. Tên file chính thức

`docs/customer/TRAINING_MANUAL_v1.na`

## 8.2. Mục đích

Đào tạo người dùng/operator/customer owner sử dụng NATT-OS trong phạm vi pilot hoặc triển khai.

## 8.3. Nhóm người học

| Nhóm | Nội dung cần học |
|---|---|
| Business User | dùng flow, nhập dữ liệu, xem trạng thái |
| Process Owner | kiểm soát quy trình, đọc audit cơ bản |
| Admin/Operator | quản lý user/scope, chạy smoke test nếu được phép |
| Technical Contact | tích hợp, log, incident, data export |
| Gatekeeper/Approver | approve/reject, đọc authority/audit |

## 8.4. Module đào tạo

```text
Module 1 — NATT-OS overview
Module 2 — Workflow/pilot scope
Module 3 — How to perform tasks
Module 4 — Event/audit explanation
Module 5 — Do and don't
Module 6 — Incident/reporting process
Module 7 — Acceptance review process
```

## 8.5. Quy tắc

1. Training không được dạy user bypass flow.
2. User chỉ học đúng scope quyền.
3. Không đưa security internals vào training phổ thông.
4. Training phải có checklist hoàn thành.
5. Nếu user thao tác dữ liệu thật, phải học data handling rule.

---

# C9 — SUPPORT SLA DRAFT

## 9.1. Tên file chính thức

`docs/customer/SUPPORT_SLA_DRAFT_v1.na`

## 9.2. Mục đích

Dự thảo cam kết hỗ trợ trong pilot hoặc triển khai thương mại.

## 9.3. Severity levels

| Severity | Định nghĩa | Ví dụ |
|---|---|---|
| S1 Critical | Dừng pilot/ảnh hưởng audit/security/data | audit mất, data corrupt |
| S2 High | Workflow chính không chạy | event fail, integration fail |
| S3 Medium | Chức năng phụ lỗi | UI lỗi, report sai |
| S4 Low | Câu hỏi, điều chỉnh nhỏ | hướng dẫn, cosmetic |

## 9.4. SLA fields

```text
severity:
response_time:
workaround_time:
resolution_target:
escalation_owner:
support_channel:
support_hours:
exclusions:
```

## 9.5. Support record schema

```text
ticket_id:
customer:
reported_at:
reported_by:
severity:
summary:
evidence:
affected_scope:
owner:
status:
response_at:
resolution_at:
postmortem_required:
```

## 9.6. Quy tắc

1. SLA pilot khác SLA production.
2. Critical liên quan audit/security phải escalate ngay.
3. Không cam kết 24/7 nếu chưa có đội trực.
4. Support không bao gồm change request nếu ngoài scope.
5. Ticket phải liên kết Known Issues nếu là lỗi hệ.

---

# C10 — CHANGE REQUEST TEMPLATE

## 10.1. Tên file chính thức

`docs/customer/CHANGE_REQUEST_TEMPLATE_v1.na`

## 10.2. Mục đích

Kiểm soát yêu cầu thay đổi scope, tính năng, tích hợp, dữ liệu hoặc quy trình trong pilot/triển khai.

## 10.3. Change request schema

```text
cr_id:
customer:
requested_by:
request_date:
change_type:
current_scope:
requested_change:
business_reason:
affected_cells:
affected_events:
affected_data:
affected_integrations:
risk_assessment:
effort_estimate:
commercial_impact:
security_impact:
release_impact:
approval_status:
approver:
implementation_plan:
```

## 10.4. Change types

```text
scope_expansion
new_cell
new_event
new_integration
data_change
ui_change
report_change
security/authority_change
pilot_timeline_change
commercial_change
```

## 10.5. Quy tắc

1. Không nhận thay đổi miệng.
2. Mọi change ảnh hưởng audit/security/data phải review lại Nhóm 4/5.
3. Change ngoài scope có thể ảnh hưởng giá và timeline.
4. Không thay đổi pilot success metrics giữa chừng nếu không có approval.
5. CR đã approve phải liên kết commit/deployment nếu có code change.

---

# 11. Checklist hoàn thành Nhóm 7

| Mã | Tài liệu | File path | Done |
|---|---|---|---|
| C1 | Implementation Methodology | `docs/customer/IMPLEMENTATION_METHODOLOGY_v1.na` | ☐ |
| C2 | Discovery Questionnaire | `docs/customer/DISCOVERY_QUESTIONNAIRE_v1.na` | ☐ |
| C3 | Business Process Mapping Template | `docs/customer/BUSINESS_PROCESS_MAPPING_TEMPLATE_v1.na` | ☐ |
| C4 | Data Migration Checklist | `docs/customer/DATA_MIGRATION_CHECKLIST_v1.na` | ☐ |
| C5 | Integration Checklist | `docs/customer/INTEGRATION_CHECKLIST_v1.na` | ☐ |
| C6 | Pilot Plan | `docs/customer/PILOT_PLAN_v1.na` | ☐ |
| C7 | Acceptance Criteria | `docs/customer/ACCEPTANCE_CRITERIA_v1.na` | ☐ |
| C8 | Training Manual | `docs/customer/TRAINING_MANUAL_v1.na` | ☐ |
| C9 | Support SLA Draft | `docs/customer/SUPPORT_SLA_DRAFT_v1.na` | ☐ |
| C10 | Change Request Template | `docs/customer/CHANGE_REQUEST_TEMPLATE_v1.na` | ☐ |

---

# 12. Lệnh tạo skeleton tài liệu Nhóm 7 trong repo

> Chạy tại root repo. Lệnh này tạo skeleton, chưa commit.

```bash
python3 - << 'EOF'
from pathlib import Path

files = {
    'docs/customer/IMPLEMENTATION_METHODOLOGY_v1.na': '# Implementation Methodology v1\n\nSTATUS: DRAFT\n',
    'docs/customer/DISCOVERY_QUESTIONNAIRE_v1.na': '# Discovery Questionnaire v1\n\nSTATUS: DRAFT\n',
    'docs/customer/BUSINESS_PROCESS_MAPPING_TEMPLATE_v1.na': '# Business Process Mapping Template v1\n\nSTATUS: DRAFT\n',
    'docs/customer/DATA_MIGRATION_CHECKLIST_v1.na': '# Data Migration Checklist v1\n\nSTATUS: DRAFT\n',
    'docs/customer/INTEGRATION_CHECKLIST_v1.na': '# Integration Checklist v1\n\nSTATUS: DRAFT\n',
    'docs/customer/PILOT_PLAN_v1.na': '# Pilot Plan v1\n\nSTATUS: DRAFT\n',
    'docs/customer/ACCEPTANCE_CRITERIA_v1.na': '# Acceptance Criteria v1\n\nSTATUS: DRAFT\n',
    'docs/customer/TRAINING_MANUAL_v1.na': '# Training Manual v1\n\nSTATUS: DRAFT\n',
    'docs/customer/SUPPORT_SLA_DRAFT_v1.na': '# Support SLA Draft v1\n\nSTATUS: DRAFT\n',
    'docs/customer/CHANGE_REQUEST_TEMPLATE_v1.na': '# Change Request Template v1\n\nSTATUS: DRAFT\n',
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

> Chỉ chạy nếu anh muốn đưa Nhóm 7 vào repo ngay.

```bash
python3 - << 'EOF'
from pathlib import Path

files = {
    'docs/customer/IMPLEMENTATION_METHODOLOGY_v1.na': '# Implementation Methodology v1\n\nSTATUS: DRAFT\n',
    'docs/customer/DISCOVERY_QUESTIONNAIRE_v1.na': '# Discovery Questionnaire v1\n\nSTATUS: DRAFT\n',
    'docs/customer/BUSINESS_PROCESS_MAPPING_TEMPLATE_v1.na': '# Business Process Mapping Template v1\n\nSTATUS: DRAFT\n',
    'docs/customer/DATA_MIGRATION_CHECKLIST_v1.na': '# Data Migration Checklist v1\n\nSTATUS: DRAFT\n',
    'docs/customer/INTEGRATION_CHECKLIST_v1.na': '# Integration Checklist v1\n\nSTATUS: DRAFT\n',
    'docs/customer/PILOT_PLAN_v1.na': '# Pilot Plan v1\n\nSTATUS: DRAFT\n',
    'docs/customer/ACCEPTANCE_CRITERIA_v1.na': '# Acceptance Criteria v1\n\nSTATUS: DRAFT\n',
    'docs/customer/TRAINING_MANUAL_v1.na': '# Training Manual v1\n\nSTATUS: DRAFT\n',
    'docs/customer/SUPPORT_SLA_DRAFT_v1.na': '# Support SLA Draft v1\n\nSTATUS: DRAFT\n',
    'docs/customer/CHANGE_REQUEST_TEMPLATE_v1.na': '# Change Request Template v1\n\nSTATUS: DRAFT\n',
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
git add docs/customer && git commit -m "docs(customer): add NATT-OS group 7 implementation skeletons" && git push origin main
```

---

# 14. Điều kiện chuyển sang Nhóm 8

Chỉ chuyển sang Nhóm 8 khi Nhóm 7 đạt tối thiểu:

```text
C1: có Implementation Methodology
C2: có Discovery Questionnaire
C3: có Business Process Mapping Template
C4: có Data Migration Checklist
C6: có Pilot Plan
C7: có Acceptance Criteria
C10: có Change Request Template
```

Nếu thiếu các tài liệu này, chưa nên viết hồ sơ nội bộ đội ngũ theo hướng vận hành triển khai thật vì customer delivery process chưa khóa.

