# NATT-OS — NHÓM 8: HỒ SƠ NỘI BỘ ĐỘI NGŨ / GOVERNANCE / DELIVERY CONTROL

**Phiên bản:** v1.0  
**Trạng thái:** Draft nội bộ — phục vụ tổ chức đội ngũ, phân quyền, review, release meeting, demo safety và postmortem  
**Phạm vi:** Nhóm 8 — Hồ sơ nội bộ vận hành đội ngũ, role matrix, review authority, commit/branch policy, spec standard, escalation, release meeting, demo safety, claim approval, SCAR registry và postmortem  
**Nguyên tắc:** Đội ngũ không vận hành bằng cảm tính. Mỗi vai trò phải có quyền hạn, trách nhiệm, boundary, quy trình review, escalation và cơ chế học từ lỗi.

---

## 0. Mục tiêu của Nhóm 8

Nhóm 8 là bộ hồ sơ nội bộ dùng để vận hành đội ngũ NATT-OS khi chuẩn bị release, demo, pilot hoặc triển khai khách hàng.

Nhóm này trả lời 10 câu hỏi:

1. Ai chịu trách nhiệm việc gì?
2. Ai được quyền approve code, spec, release, demo, claim?
3. Quy tắc branch/commit/review là gì?
4. Spec `.na`, `.anc`, `.phieu` phải viết theo chuẩn nào?
5. Khi có lỗi, incident, drift hoặc dispute thì escalate ra sao?
6. Trước release meeting phải kiểm gì?
7. Demo cho khách/đối tác phải an toàn thế nào?
8. Claim public phải được duyệt theo cơ chế nào?
9. Memory/SCAR/failure lesson được lưu và dùng lại thế nào?
10. Sau lỗi lớn phải postmortem theo mẫu nào?

Nhóm 8 không phải tài liệu khách hàng. Đây là **bộ governance nội bộ để đội ngũ không tự phá release gate, trust boundary và ground truth discipline**.

---

## 1. Điều kiện vào Nhóm 8

Không được triển khai Nhóm 8 như operational governance thật nếu Nhóm 7 chưa đạt tối thiểu:

```text
C1: có Implementation Methodology
C2: có Discovery Questionnaire
C3: có Business Process Mapping Template
C4: có Data Migration Checklist
C6: có Pilot Plan
C7: có Acceptance Criteria
C10: có Change Request Template
```

Nếu delivery process chưa khóa, Nhóm 8 chỉ được gắn nhãn:

```text
STATUS: INTERNAL_GOVERNANCE_DRAFT
```

Không được gắn:

```text
STATUS: TEAM_OPERATING_SYSTEM_ENFORCED
STATUS: RELEASE_GOVERNANCE_LOCKED
STATUS: CUSTOMER_DELIVERY_READY
```

---

## 2. Danh mục tài liệu Nhóm 8

| Mã | Tài liệu | Mức độ | Mục đích |
|---|---|---:|---|
| I1 | Internal Role Matrix | Bắt buộc | Phân vai, trách nhiệm, quyền hạn nội bộ |
| I2 | Review Authority Policy | Bắt buộc | Ai được review/approve code, spec, release |
| I3 | Commit & Branch Policy | Bắt buộc | Quy tắc git, branch, commit, push, review |
| I4 | Spec Writing Standard | Bắt buộc | Chuẩn viết `.na`, `.anc`, `.phieu`, release docs |
| I5 | Incident Escalation Flow | Bắt buộc | Luồng báo lỗi, escalation, freezing, rollback |
| I6 | Release Meeting Checklist | Bắt buộc | Checklist họp release trước preview/RC/launch |
| I7 | Customer Demo Safety Rule | Bắt buộc | Quy tắc demo an toàn, không lộ lõi, không vượt claim |
| I8 | Claim Approval Sheet | Bắt buộc | Duyệt câu chữ public/partner/investor |
| I9 | Memory / SCAR Registry | Bắt buộc | Lưu bài học lỗi, drift, violation, failure pattern |
| I10 | Postmortem Template | Bắt buộc | Mẫu phân tích lỗi sau incident/release fail |

---

# I1 — INTERNAL ROLE MATRIX

## 1.1. Tên file chính thức

`docs/internal/INTERNAL_ROLE_MATRIX_v1.na`

## 1.2. Mục đích

Tài liệu này định nghĩa vai trò nội bộ trong NATT-OS, trách nhiệm chính, quyền hạn và boundary của từng vai.

## 1.3. Role chính

| Role | Vai trò chính | Không được làm |
|---|---|---|
| Gatekeeper | Phê chuẩn cuối, giữ quyền release/claim/authority | Không bỏ qua evidence |
| Architect | Thiết kế hệ thống, runtime, boundary, integration | Không approve release một mình nếu thiếu validator |
| Validator | Kiểm tra ground truth, audit, logic, claim | Không sửa code trực tiếp nếu vai chỉ review |
| Governance Writer | Soạn spec, policy, claim control | Không viết claim vượt evidence |
| System Engineer | Sửa code/runtime/infra/deployment | Không tự mở scope feature khi release gate chưa xanh |
| Toolsmith | Viết scanner, validator, automation | Không viết tool phá boundary hoặc auto-fix mù |
| Product/Market Owner | Hồ sơ thương mại, pitch, customer narrative | Không claim kỹ thuật chưa được duyệt |
| Delivery Owner | Pilot, customer scope, acceptance | Không nhận khách/scope nếu chưa qualify |
| Demo Operator | Chạy demo theo script | Không mở file/source/route ngoài scope demo |
| Security/Trust Owner | Threat, data boundary, secret, audit policy | Không công bố chi tiết nhạy cảm |

## 1.4. RACI matrix rút gọn

| Công việc | Responsible | Accountable | Consulted | Informed |
|---|---|---|---|---|
| System Architecture Spec | Architect | Gatekeeper | Validator, Governance | Team |
| Release Gate | System Engineer | Gatekeeper | Validator, Security | Team |
| Security Policy | Security Owner | Gatekeeper | Architect, Validator | Team |
| Market Claim | Product/Market | Gatekeeper | Governance, Legal/IP | Team |
| Customer Pilot | Delivery Owner | Gatekeeper | Engineer, Security, Product | Team |
| Incident Response | Engineer/Security | Gatekeeper | Validator, Architect | Team |
| Postmortem | Validator | Gatekeeper | All involved | Team |

## 1.5. Role record schema

```text
role_id:
role_name:
actor:
responsibilities:
authority_scope:
forbidden_actions:
required_reviewers:
expiry_or_review_cycle:
audit_ref:
```

## 1.6. Quy tắc

1. Vai trò phải gắn với authority scope.
2. Không ai vừa tự tạo evidence vừa tự approve evidence cho release critical path.
3. Role có quyền public claim phải qua Claim Approval Sheet.
4. Role có quyền deploy phải tuân Deployment Guide/Rollback Plan.
5. Role có quyền demo phải tuân Demo Safety Rule.

---

# I2 — REVIEW AUTHORITY POLICY

## 2.1. Tên file chính thức

`docs/internal/REVIEW_AUTHORITY_POLICY_v1.na`

## 2.2. Mục đích

Định nghĩa ai được review, ai được approve, và điều kiện approve cho từng loại thay đổi.

## 2.3. Loại thay đổi

| Change Type | Ví dụ | Reviewer bắt buộc |
|---|---|---|
| Architecture | runtime layer, event model, SmartLink | Architect + Validator |
| Security/Trust | secret, threat, audit, RBAC | Security + Validator |
| Release Gate | build, deploy, RC, rollback | Gatekeeper + Engineer + Validator |
| Legal/IP | SHTT, trademark, NDA, terms | Gatekeeper + Legal/IP reviewer |
| Market Claim | pitch, public profile, FAQ | Governance + Gatekeeper |
| Customer Delivery | pilot, acceptance, SLA | Delivery + Gatekeeper |
| Core Code | kernel, cell runtime, event/audit | Engineer + Architect/Validator |
| Docs/Spec | `.na`, `.anc`, `.phieu`, policy | Governance + relevant owner |

## 2.4. Approval levels

```text
A0: draft only
A1: internal reviewed
A2: gatekeeper approved
A3: release-gate approved
A4: public/partner approved
A5: locked/canonical
```

## 2.5. Approval record schema

```text
approval_id:
artifact:
change_type:
version:
requester:
reviewers:
approver:
approval_level:
evidence_refs:
conditions:
approved_at:
expires_or_review_at:
```

## 2.6. Quy tắc

1. Không approve nếu thiếu evidence bắt buộc.
2. Không tự approve thay đổi của chính mình ở critical path.
3. Public/partner material phải có claim review.
4. Security/trust change phải có threat/risk note.
5. Release approval phải gắn Build Verification Report và Known Issues.

---

# I3 — COMMIT & BRANCH POLICY

## 3.1. Tên file chính thức

`docs/internal/COMMIT_BRANCH_POLICY_v1.na`

## 3.2. Mục đích

Chuẩn hóa cách tạo branch, commit, verify và push để tránh mất ground truth, trộn scope hoặc tạo drift.

## 3.3. Branch naming

```text
fix/<scope>-<short-desc>
feat/<scope>-<short-desc>
docs/<scope>-<short-desc>
chore/<scope>-<short-desc>
release/<version-or-gate>
hotfix/<incident-id>
```

Ví dụ:

```text
fix/warehouse-cell-props-drift
docs/release-gate-group-2
chore/audit-smartlink-scan
hotfix/incident-audit-gap-001
```

## 3.4. Commit message format

```text
type(scope): message
```

Type hợp lệ:

```text
fix
feat
docs
chore
refactor
test
audit
security
release
hotfix
```

Ví dụ:

```text
fix(warehouse): align WarehouseItemProps domain and infra
docs(security): add bridge adaptive aperture spec
audit(runtime): add wave scan report
```

## 3.5. Commit rules

```text
1. Một commit một mục tiêu rõ.
2. Không trộn code fix với market claim.
3. Không commit generated/temporary files nếu không cần.
4. Không commit secret/env thật.
5. Mỗi fix compile phải có verify command hoặc log.
6. Release commit phải gắn checklist.
```

## 3.6. One-command repo rule

Khi patch file và commit, ưu tiên một lệnh duy nhất:

```bash
python3 - << 'EOF'
from pathlib import Path
p = Path('path/to/file')
c = p.read_text('utf-8')
c = c.replace('old', 'new')
p.write_text(c, 'utf-8')
print('done')
EOF
git add path/to/file && git commit -m "type(scope): message" && git push origin main
```

## 3.7. Quy tắc

1. Không dùng auto-fix mù cho release critical path.
2. Không dùng `any` để che lỗi type nếu chưa ghi release blocker.
3. Không push branch sai nếu chưa kiểm tra `git branch --show-current`.
4. Không xóa legacy file nếu chưa grep consumer.
5. Không squash nếu cần giữ forensic trail của cụm sửa.

---

# I4 — SPEC WRITING STANDARD

## 4.1. Tên file chính thức

`docs/internal/SPEC_WRITING_STANDARD_v1.na`

## 4.2. Mục đích

Chuẩn hóa cách viết tài liệu `.na`, `.anc`, `.phieu` và các hồ sơ release/security/customer/internal.

## 4.3. Phân loại file

| Extension | Vai trò | Không dùng để |
|---|---|---|
| `.anc` | identity/passport/manifest | nhật ký dài hoặc state mutable |
| `.na` | spec/memory/report/canonical doc | state runtime có TTL nếu chưa audit |
| `.phieu` | pending/runtime mutable state | bằng chứng vĩnh viễn nếu chưa verify |
| `.md` | public-friendly markdown nếu cần | thay canonical `.na` khi spec đã chuyển Nauion |

## 4.4. Header chuẩn cho spec

```text
title:
version:
status:
owner:
reviewers:
confidentiality:
source_refs:
release_blocking:
last_updated:
```

## 4.5. Section bắt buộc

```text
1. Purpose
2. Scope
3. Definitions
4. Rules
5. Required fields / schema
6. Failure modes
7. Acceptance criteria
8. Non-goals
9. Evidence references
10. Change history
```

## 4.6. Language rules

1. Dùng thuật ngữ canonical: EventEnvelope, Causality, Audit, Ground Truth, Gatekeeper, SiraSign, SmartLink, Mach HeyNa.
2. Không dùng synonym marketing nếu phá lexicon.
3. Không claim tuyệt đối.
4. Phân biệt concept, spec, implementation, evidence.
5. Nếu tài liệu là draft, phải ghi rõ `STATUS: DRAFT`.

## 4.7. Quy tắc

1. Spec không có acceptance criteria thì chưa đủ để enforce.
2. Spec không có owner thì chưa đủ để release.
3. Spec không có evidence refs thì chưa đủ để claim.
4. Spec thay đổi contract phải update version.
5. Spec superseded phải đánh dấu, không để trôi.

---

# I5 — INCIDENT ESCALATION FLOW

## 5.1. Tên file chính thức

`docs/internal/INCIDENT_ESCALATION_FLOW_v1.na`

## 5.2. Mục đích

Định nghĩa luồng báo lỗi và escalation khi có incident trong code, runtime, audit, demo, customer pilot hoặc security/trust.

## 5.3. Severity levels

| Severity | Định nghĩa | Action |
|---|---|---|
| Sev0 | Audit/security/secret/state critical | Freeze + Gatekeeper ngay |
| Sev1 | Runtime/build/release blocker | Freeze scope + hotfix/rollback |
| Sev2 | Pilot/demo chính bị ảnh hưởng | Escalate owner + workaround |
| Sev3 | Module phụ hoặc UI lỗi | Ghi issue + fix theo plan |
| Sev4 | Cosmetic/docs minor | Backlog |

## 5.4. Escalation flow

```text
[1] Detect issue
[2] Record incident
[3] Classify severity
[4] Notify owner
[5] Freeze scope if Sev0/Sev1
[6] Preserve evidence
[7] Decide: rollback / hotfix / isolate / accept risk
[8] Verify fix
[9] Update Known Issues
[10] Postmortem if required
```

## 5.5. Notification matrix

| Incident | Notify |
|---|---|
| Secret leak | Gatekeeper + Security + Engineer |
| Audit gap | Gatekeeper + Validator + Engineer |
| Build regression | Engineer + Architect + Validator |
| Demo scope escape | Gatekeeper + Product + Demo Operator |
| Customer data issue | Gatekeeper + Delivery + Security |
| Claim violation | Gatekeeper + Governance + Product |

## 5.6. Quy tắc

1. Sev0 không được xử lý âm thầm.
2. Không xóa evidence để “giảm nghiêm trọng”.
3. Không demo tiếp nếu incident ảnh hưởng trust boundary.
4. Không hotfix mà không verify.
5. Incident đóng phải có record.

---

# I6 — RELEASE MEETING CHECKLIST

## 6.1. Tên file chính thức

`docs/internal/RELEASE_MEETING_CHECKLIST_v1.na`

## 6.2. Mục đích

Chuẩn hóa cuộc họp trước khi chuyển trạng thái release: technical preview, controlled partner preview, release candidate hoặc market launch.

## 6.3. Agenda chuẩn

```text
1. Release objective
2. Target environment / audience
3. Branch / commit / version
4. Build verification
5. Runtime smoke test
6. Known issues
7. Security/trust review
8. Legal/IP/claim review
9. Demo/customer impact
10. Go / No-Go decision
```

## 6.4. Checklist Go/No-Go

```text
[ ] Branch/commit xác định
[ ] Build Verification Report cập nhật
[ ] Runtime Smoke Test PASS hoặc có waiver
[ ] Known Issues cập nhật
[ ] Release blockers phân loại
[ ] Security/Trust docs không thiếu critical item
[ ] Public Claim Control Sheet cập nhật
[ ] Demo Script đúng scope
[ ] Rollback target xác định
[ ] Gatekeeper decision ghi nhận
```

## 6.5. Release decision record

```text
release_meeting_id:
date:
release_target:
branch:
commit:
participants:
summary:
blocking_issues:
waivers:
decision: GO | NO_GO | CONDITIONAL_GO
conditions:
gatekeeper_approval:
audit_ref:
```

## 6.6. Quy tắc

1. Không GO nếu thiếu commit hash.
2. Không GO nếu audit/security critical issue mở.
3. Conditional GO phải có điều kiện cụ thể.
4. Waiver phải có owner và expiry.
5. Release meeting decision phải lưu lại.

---

# I7 — CUSTOMER DEMO SAFETY RULE

## 7.1. Tên file chính thức

`docs/internal/CUSTOMER_DEMO_SAFETY_RULE_v1.na`

## 7.2. Mục đích

Định nghĩa quy tắc an toàn khi demo cho khách hàng, đối tác, nhà đầu tư hoặc người ngoài.

## 7.3. Demo safety zones

| Zone | Nội dung | Ai được xem |
|---|---|---|
| D0 | One-page, deck public-safe | Người ngoài |
| D1 | Controlled walkthrough | Đối tác qualify |
| D2 | Technical preview runtime | NDA + approval |
| D3 | Internal logs/spec deeper | Nội bộ |
| D4 | Secret/security internals | Restricted only |

## 7.4. Before demo checklist

```text
[ ] Đối tượng demo đã qualify
[ ] NDA nếu cần
[ ] Demo mode xác định
[ ] Demo Script đã duyệt
[ ] Known Issues đã kiểm
[ ] Demo data an toàn
[ ] Không mở secret/env/source nhạy cảm
[ ] Claim allowed list đã chuẩn bị
[ ] Stop plan nếu runtime lỗi
```

## 7.5. Forbidden demo actions

```text
mở secret/env thật
mở audit chứa dữ liệu nhạy cảm
mở source security internals khi chưa approval
chạy route/module đang release-blocker
để khách tự browse repo/runtime
claim production-ready khi chưa gate
nói “không thể bypass”
```

## 7.6. Quy tắc

1. Demo không phải proof production.
2. Demo fail phải ghi lại nếu ảnh hưởng claim.
3. Demo operator không được tự mở rộng scope.
4. Demo có dữ liệu thật phải qua Data Boundary.
5. Demo D2 trở lên phải có record.

---

# I8 — CLAIM APPROVAL SHEET

## 8.1. Tên file chính thức

`docs/internal/CLAIM_APPROVAL_SHEET_v1.na`

## 8.2. Mục đích

Duyệt câu chữ trước khi đưa vào website, deck, profile, whitepaper, partner email, investor material hoặc demo script.

## 8.3. Claim schema

```text
claim_id:
claim_text:
claim_context:
claim_class: P0 | P1 | P2 | P3 | P4
intended_channel:
evidence_ref:
risk_level:
reviewers:
approver:
status: DRAFT | APPROVED | REJECTED | EXPIRED
approved_at:
review_date:
notes:
```

## 8.4. Claim classes

| Class | Mức | Cách dùng |
|---|---|---|
| P0 | Public safe | Có thể public |
| P1 | Controlled public | Dùng sau review |
| P2 | NDA only | Chỉ nói sau NDA |
| P3 | Internal only | Không nói ngoài |
| P4 | Forbidden | Cấm dùng |

## 8.5. Claim review checklist

```text
[ ] Có evidence kỹ thuật
[ ] Không vượt release gate
[ ] Không lộ security/IP boundary
[ ] Không xung đột legal/IP
[ ] Không hứa timeline/scope chưa duyệt
[ ] Không dùng từ tuyệt đối
[ ] Đúng audience/channel
```

## 8.6. Quy tắc

1. Claim hết hạn review thì không được dùng.
2. Claim security phải có Security/Trust review.
3. Claim IP phải có Legal/IP review.
4. Claim production phải có Release Gate evidence.
5. Claim bị reject phải lưu lý do để tránh tái phạm.

---

# I9 — MEMORY / SCAR REGISTRY

## 9.1. Tên file chính thức

`docs/internal/MEMORY_SCAR_REGISTRY_v1.na`

## 9.2. Mục đích

Ghi lại bài học lỗi, failure pattern, drift, violation, incident và quyết định sửa để hệ không lặp lại sai lầm.

## 9.3. SCAR là gì

SCAR là dấu sẹo vận hành/kỹ thuật: một lỗi hoặc failure đủ quan trọng để hệ phải nhớ lâu, đưa vào governance, scanner, checklist hoặc spec.

## 9.4. SCAR schema

```text
scar_id:
title:
detected_at:
source:
context:
failure_type:
root_cause:
impact:
affected_files:
affected_docs:
lesson:
new_rule:
scanner_needed:
status: OPEN | MITIGATED | ENFORCED | SUPERSEDED
owner:
audit_ref:
```

## 9.5. Failure types

```text
schema_drift
type_mismatch
import_drift
audit_gap
authority_bypass
claim_overreach
persona_bleed
memory_drift
release_gate_violation
demo_scope_escape
secret_boundary_violation
```

## 9.6. Quy tắc

1. SCAR không phải nơi đổ lỗi cá nhân.
2. SCAR phải sinh rule hoặc scanner nếu có thể.
3. SCAR superseded phải đánh dấu, không xóa mù.
4. SCAR liên quan security/audit phải được review.
5. Memory không thay ground truth; SCAR phải có source/evidence.

---

# I10 — POSTMORTEM TEMPLATE

## 10.1. Tên file chính thức

`docs/internal/POSTMORTEM_TEMPLATE_v1.na`

## 10.2. Mục đích

Chuẩn hóa cách phân tích sau incident, release fail, build regression, demo failure, security/trust violation hoặc customer pilot issue.

## 10.3. Postmortem schema

```text
postmortem_id:
incident_id:
title:
date:
author:
participants:
summary:
timeline:
impact:
root_cause:
contributing_factors:
what_went_well:
what_went_wrong:
where_detection_failed:
where_process_failed:
action_items:
owner_per_action:
deadline_or_gate:
scar_refs:
policy_updates:
scanner_updates:
status:
```

## 10.4. Timeline format

```text
T0 — first signal
T1 — detection
T2 — escalation
T3 — mitigation
T4 — verification
T5 — closure
```

## 10.5. Action item schema

```text
action_id:
description:
owner:
priority:
blocking_release: YES | NO
verification_method:
status:
```

## 10.6. Quy tắc

1. Postmortem phải blameless nhưng không vô trách nhiệm.
2. Root cause không được dừng ở “human error”.
3. Mỗi action item phải có owner.
4. Nếu không có rule/scanner/checklist mới, postmortem chưa đủ.
5. Postmortem xong phải cập nhật SCAR nếu lỗi trọng yếu.

---

# 11. Checklist hoàn thành Nhóm 8

| Mã | Tài liệu | File path | Done |
|---|---|---|---|
| I1 | Internal Role Matrix | `docs/internal/INTERNAL_ROLE_MATRIX_v1.na` | ☐ |
| I2 | Review Authority Policy | `docs/internal/REVIEW_AUTHORITY_POLICY_v1.na` | ☐ |
| I3 | Commit & Branch Policy | `docs/internal/COMMIT_BRANCH_POLICY_v1.na` | ☐ |
| I4 | Spec Writing Standard | `docs/internal/SPEC_WRITING_STANDARD_v1.na` | ☐ |
| I5 | Incident Escalation Flow | `docs/internal/INCIDENT_ESCALATION_FLOW_v1.na` | ☐ |
| I6 | Release Meeting Checklist | `docs/internal/RELEASE_MEETING_CHECKLIST_v1.na` | ☐ |
| I7 | Customer Demo Safety Rule | `docs/internal/CUSTOMER_DEMO_SAFETY_RULE_v1.na` | ☐ |
| I8 | Claim Approval Sheet | `docs/internal/CLAIM_APPROVAL_SHEET_v1.na` | ☐ |
| I9 | Memory / SCAR Registry | `docs/internal/MEMORY_SCAR_REGISTRY_v1.na` | ☐ |
| I10 | Postmortem Template | `docs/internal/POSTMORTEM_TEMPLATE_v1.na` | ☐ |

---

# 12. Lệnh tạo skeleton tài liệu Nhóm 8 trong repo

> Chạy tại root repo. Lệnh này tạo skeleton, chưa commit.

```bash
python3 - << 'EOF'
from pathlib import Path

files = {
    'docs/internal/INTERNAL_ROLE_MATRIX_v1.na': '# Internal Role Matrix v1\n\nSTATUS: DRAFT\n',
    'docs/internal/REVIEW_AUTHORITY_POLICY_v1.na': '# Review Authority Policy v1\n\nSTATUS: DRAFT\n',
    'docs/internal/COMMIT_BRANCH_POLICY_v1.na': '# Commit & Branch Policy v1\n\nSTATUS: DRAFT\n',
    'docs/internal/SPEC_WRITING_STANDARD_v1.na': '# Spec Writing Standard v1\n\nSTATUS: DRAFT\n',
    'docs/internal/INCIDENT_ESCALATION_FLOW_v1.na': '# Incident Escalation Flow v1\n\nSTATUS: DRAFT\n',
    'docs/internal/RELEASE_MEETING_CHECKLIST_v1.na': '# Release Meeting Checklist v1\n\nSTATUS: DRAFT\n',
    'docs/internal/CUSTOMER_DEMO_SAFETY_RULE_v1.na': '# Customer Demo Safety Rule v1\n\nSTATUS: DRAFT\n',
    'docs/internal/CLAIM_APPROVAL_SHEET_v1.na': '# Claim Approval Sheet v1\n\nSTATUS: DRAFT\n',
    'docs/internal/MEMORY_SCAR_REGISTRY_v1.na': '# Memory / SCAR Registry v1\n\nSTATUS: DRAFT\n',
    'docs/internal/POSTMORTEM_TEMPLATE_v1.na': '# Postmortem Template v1\n\nSTATUS: DRAFT\n',
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

> Chỉ chạy nếu anh muốn đưa Nhóm 8 vào repo ngay.

```bash
python3 - << 'EOF'
from pathlib import Path

files = {
    'docs/internal/INTERNAL_ROLE_MATRIX_v1.na': '# Internal Role Matrix v1\n\nSTATUS: DRAFT\n',
    'docs/internal/REVIEW_AUTHORITY_POLICY_v1.na': '# Review Authority Policy v1\n\nSTATUS: DRAFT\n',
    'docs/internal/COMMIT_BRANCH_POLICY_v1.na': '# Commit & Branch Policy v1\n\nSTATUS: DRAFT\n',
    'docs/internal/SPEC_WRITING_STANDARD_v1.na': '# Spec Writing Standard v1\n\nSTATUS: DRAFT\n',
    'docs/internal/INCIDENT_ESCALATION_FLOW_v1.na': '# Incident Escalation Flow v1\n\nSTATUS: DRAFT\n',
    'docs/internal/RELEASE_MEETING_CHECKLIST_v1.na': '# Release Meeting Checklist v1\n\nSTATUS: DRAFT\n',
    'docs/internal/CUSTOMER_DEMO_SAFETY_RULE_v1.na': '# Customer Demo Safety Rule v1\n\nSTATUS: DRAFT\n',
    'docs/internal/CLAIM_APPROVAL_SHEET_v1.na': '# Claim Approval Sheet v1\n\nSTATUS: DRAFT\n',
    'docs/internal/MEMORY_SCAR_REGISTRY_v1.na': '# Memory / SCAR Registry v1\n\nSTATUS: DRAFT\n',
    'docs/internal/POSTMORTEM_TEMPLATE_v1.na': '# Postmortem Template v1\n\nSTATUS: DRAFT\n',
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
git add docs/internal && git commit -m "docs(internal): add NATT-OS group 8 governance skeletons" && git push origin main
```

---

# 14. Điều kiện hoàn tất bộ 8 nhóm

Bộ hồ sơ 8 nhóm được coi là có khung đầy đủ khi tối thiểu có:

```text
Nhóm 1: technical foundation
Nhóm 2: release gate / stabilization
Nhóm 3: runtime operations
Nhóm 4: security / trust
Nhóm 5: legal / IP
Nhóm 6: market launch
Nhóm 7: customer implementation
Nhóm 8: internal governance
```

Điều kiện khóa để chuyển từ hồ sơ sang thực thi:

```text
[ ] Có master index toàn bộ 8 nhóm
[ ] Có status từng tài liệu
[ ] Có owner/reviewer từng nhóm
[ ] Có release gate nối Nhóm 2–3–4
[ ] Có claim control nối Nhóm 5–6
[ ] Có customer delivery gate nối Nhóm 6–7
[ ] Có internal governance nối toàn bộ nhóm
```

Nếu thiếu master index, đội ngũ có thể có nhiều tài liệu nhưng vẫn mất kiểm soát release.

