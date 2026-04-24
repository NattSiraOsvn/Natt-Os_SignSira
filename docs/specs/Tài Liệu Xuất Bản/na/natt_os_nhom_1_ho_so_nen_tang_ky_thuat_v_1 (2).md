# Natt-OS — NHÓM 3: HỒ SƠ RUNTIME / VẬN HÀNH THỰC TẾ

**Phiên bản:** v1.0  
**Trạng thái:** Draft nội bộ — phục vụ vận hành runtime, kiểm soát triển khai và demo có kiểm soát  
**Phạm vi:** Nhóm 3 — Hồ sơ runtime, boot, environment, deployment, monitoring, incident, backup, rollback, versioning, smoke test, known issues  
**Nguyên tắc:** Runtime không được chứng minh bằng lời nói. Runtime phải boot được, kiểm tra được, quan sát được, rollback được và có log/audit đi kèm.

---

## 0. Mục tiêu của Nhóm 3

Nhóm 3 là bộ tài liệu dùng để vận hành Natt-OS trong môi trường thực tế sau khi Nhóm 2 đã khóa được release gate tối thiểu.

Nhóm này trả lời 7 câu hỏi:

1. Runtime khởi động như thế nào?
2. Môi trường nào là hợp lệ?
3. Deploy staging/production ra sao?
4. Quan sát runtime, event, audit, health bằng cách nào?
5. Khi lỗi xảy ra thì xử lý theo playbook nào?
6. Backup, restore và rollback ra sao?
7. Phiên bản nào được phép demo, pilot hoặc release?

Nhóm 3 không phải tài liệu marketing. Nhóm 3 là **bộ hồ sơ vận hành runtime có kiểm chứng**.

---

## 1. Điều kiện vào Nhóm 3

Không được triển khai Nhóm 3 như tài liệu production nếu Nhóm 2 chưa đạt các điều kiện tối thiểu:

```text
R1: có Gold Master Stabilization Report
R2: có Compile Error Resolution Log baseline
R7: Infra missing methods đã xử lý hoặc ghi release blocker
R9: có Build Verification Report
R10: có Release Gate Checklist
```

Nếu build vẫn đỏ, Nhóm 3 chỉ được gắn nhãn:

```text
STATUS: OPERATIONAL_DRAFT_FOR_TECHNICAL_PREVIEW
```

Không được gắn:

```text
STATUS: PRODUCTION_READY
```

---

## 2. Danh mục tài liệu Nhóm 3

| Mã | Tài liệu | Mức độ | Mục đích |
|---|---|---:|---|
| O1 | Runtime Boot Manual | Bắt buộc | Hướng dẫn khởi động runtime |
| O2 | Environment Setup Guide | Bắt buộc | Chuẩn hóa môi trường dev/staging/prod |
| O3 | Deployment Guide | Bắt buộc | Quy trình deploy có kiểm soát |
| O4 | Monitoring & Audit Guide | Bắt buộc | Theo dõi health, event, audit, runtime output |
| O5 | Incident Response Playbook | Bắt buộc | Xử lý lỗi runtime, event, audit, drift |
| O6 | Backup & Recovery Plan | Bắt buộc | Backup/restore code, state, DB, audit, memory |
| O7 | Rollback Plan | Bắt buộc | Quay lại bản ổn định khi release lỗi |
| O8 | Versioning Policy | Bắt buộc | Quy tắc version kernel/cell/spec/runtime |
| O9 | Runtime Smoke Test Script | Bắt buộc | Bộ test nhanh sau boot/deploy |
| O10 | Known Issues Register | Bắt buộc | Danh sách lỗi còn tồn tại, mức rủi ro, scope demo |

---

# O1 — RUNTIME BOOT MANUAL

## 1.1. Tên file chính thức

`docs/operations/RUNTIME_BOOT_MANUAL_v1.na`

## 1.2. Mục đích

Tài liệu này mô tả cách khởi động Natt-OS runtime từ trạng thái repo lạnh đến trạng thái có thể kiểm tra health, event, audit và UI/client surface.

## 1.3. Nội dung bắt buộc

### A. Boot context

```text
repo_path:
branch:
commit_head:
node_version:
package_manager:
os:
boot_profile: dev | staging | production | technical_preview
```

### B. Boot sequence chuẩn

```text
[1] Kiểm tra branch/commit
[2] Kiểm tra working tree sạch hoặc ghi nhận dirty state
[3] Cài dependency nếu cần
[4] Kiểm tra env file
[5] Chạy type/build gate tối thiểu
[6] Khởi động runtime/server
[7] Kiểm tra health endpoint
[8] Gửi event test
[9] Đọc audit output
[10] Mở UI/client surface nếu có
```

### C. Lệnh boot mẫu

> Lệnh phải được điều chỉnh theo repo thật sau khi chạy ground truth scan.

```bash
pwd
git branch --show-current
git rev-parse --short HEAD
git status --short
node -v
npm -v
npm install
npx tsc --noEmit
npm run dev
```

### D. Health check tối thiểu

```bash
curl -s http://localhost:3001/api/health
curl -s http://localhost:3001/api/audit
```

Nếu runtime dùng Mach HeyNa:

```bash
curl -N http://localhost:3001/mach/heyna
```

### E. Event smoke test mẫu

```bash
curl -s -X POST http://localhost:3001/api/events/emit \
  -H "Content-Type: application/json" \
  -d '{"type":"runtime.smoke_test","payload":{"source":"O1"},"cell":"runtime-cell"}'
```

## 1.4. Quy tắc

1. Không gọi runtime boot thành công nếu không có health output.
2. Không gọi event flow thành công nếu không đọc được audit hoặc event log.
3. Không bỏ qua `git status --short` trước boot.
4. Nếu repo dirty, phải ghi rõ file dirty.
5. Boot manual phải tách rõ dev/staging/production.

## 1.5. Acceptance Criteria

```text
[ ] Có lệnh boot đầy đủ
[ ] Có yêu cầu branch/commit
[ ] Có health check
[ ] Có event smoke test
[ ] Có audit check
[ ] Có cách xác định boot fail
```

---

# O2 — ENVIRONMENT SETUP GUIDE

## 2.1. Tên file chính thức

`docs/operations/ENVIRONMENT_SETUP_GUIDE_v1.na`

## 2.2. Mục đích

Chuẩn hóa môi trường chạy Natt-OS để tránh lỗi do Node version, dependency, env, path, domain local hoặc cấu hình máy.

## 2.3. Matrix môi trường

| Environment | Mục đích | Quyền deploy | Dữ liệu |
|---|---|---|---|
| local_dev | dev/test cá nhân | developer/operator | mock hoặc local |
| technical_preview | demo kỹ thuật nội bộ | Gatekeeper approved | dữ liệu giả hoặc đã kiểm soát |
| staging | test trước release | release owner | dữ liệu test có cấu trúc |
| production | vận hành thật | Gatekeeper/SiraSign | dữ liệu thật, audit bắt buộc |

## 2.4. Thông số bắt buộc

```text
OS:
CPU architecture:
Node version:
npm/pnpm/yarn version:
TypeScript version:
Vite/React version nếu có:
Database engine nếu có:
Default ports:
Local domains:
Environment variables required:
Secret policy reference:
```

## 2.5. Env vars cần phân loại

```text
PUBLIC_*       → có thể expose cho client nếu thật sự public
SERVER_*       → chỉ server đọc
SECRET_*       → tuyệt đối không đưa vào client/log
AUDIT_*        → cấu hình audit
GATEKEEPER_*   → authority/signing boundary
SMARTLINK_*    → coupling/bridge settings
```

## 2.6. Quy tắc

1. Không hard-code secret trong source.
2. Không commit `.env` thật.
3. `.env.example` phải có placeholder an toàn.
4. Env production phải có owner và rotation rule.
5. Local domain chỉ là convenience, không phải security boundary.

## 2.7. Acceptance Criteria

```text
[ ] Có Node/package manager version
[ ] Có env var inventory
[ ] Có .env.example rule
[ ] Có port/domain mapping
[ ] Có phân biệt local/staging/prod
[ ] Có secret policy reference
```

---

# O3 — DEPLOYMENT GUIDE

## 3.1. Tên file chính thức

`docs/operations/DEPLOYMENT_GUIDE_v1.na`

## 3.2. Mục đích

Định nghĩa quy trình deploy Natt-OS có kiểm soát, có gate, có rollback và có audit.

## 3.3. Deployment stages

```text
[1] Pre-deploy freeze
[2] Pull latest approved commit
[3] Verify branch/commit
[4] Install dependencies
[5] Run compile/build/test gate
[6] Apply env config
[7] Start runtime
[8] Run smoke test
[9] Verify audit/monitoring
[10] Mark deployment status
```

## 3.4. Pre-deploy checklist

```text
[ ] Release Gate Checklist đạt yêu cầu tương ứng
[ ] Build Verification Report PASS hoặc PARTIAL có phê duyệt
[ ] Known Issues Register đã cập nhật
[ ] Backup point đã tạo
[ ] Rollback target đã xác định
[ ] Người deploy có quyền
[ ] Gatekeeper/SiraSign nếu cần
```

## 3.5. Deployment record schema

```text
deployment_id:
date:
environment:
branch:
commit:
operator:
approver:
commands_run:
build_result:
smoke_test_result:
audit_check_result:
rollback_target:
status: SUCCESS | PARTIAL | FAILED | ROLLED_BACK
notes:
```

## 3.6. Quy tắc

1. Không deploy từ dirty working tree.
2. Không deploy commit chưa xác định.
3. Không deploy nếu không có rollback target.
4. Không deploy production nếu smoke test fail.
5. Không deploy bằng tay mà không ghi deployment record.

---

# O4 — MONITORING & AUDIT GUIDE

## 4.1. Tên file chính thức

`docs/operations/MONITORING_AUDIT_GUIDE_v1.na`

## 4.2. Mục đích

Định nghĩa cách quan sát runtime và xác minh hệ đang vận hành đúng.

## 4.3. Các lớp cần monitor

| Lớp | Chỉ số cần theo dõi |
|---|---|
| Runtime health | uptime, status, memory, CPU nếu có |
| Event flow | event count, failed event, unknown event |
| Audit trail | audit append, audit gap, hash/chain nếu có |
| SmartLink | touch count, coupling, decay, orphan link |
| Bridge/Mach HeyNa | ingress count, rejected payload, aperture |
| Gatekeeper | approval, rejection, invalid signature |
| Cell runtime | cell error, timeout, missing handler |
| Build/version | running commit, runtime version, spec version |

## 4.4. Health check mẫu

```bash
curl -s http://localhost:3001/api/health
curl -s http://localhost:3001/api/audit?limit=20
```

## 4.5. Audit event tối thiểu

```text
audit_id:
event_id:
action:
actor:
cell_id:
state_before_hash:
state_after_hash:
timestamp:
causation_id:
correlation_id:
span_id:
result:
```

## 4.6. Cảnh báo cần có

```text
runtime.health.failed
event.envelope.invalid
audit.append.failed
audit.gap.detected
bridge.aperture.closed
gatekeeper.signature.invalid
cell.handler.missing
smartlink.decay.threshold_exceeded
```

## 4.7. Quy tắc

1. Không coi UI chạy là runtime khỏe.
2. Runtime khỏe phải có health + event + audit.
3. Audit gap là lỗi nghiêm trọng.
4. Unknown event không được bỏ qua im lặng.
5. Monitoring phải gắn với commit/runtime version.

---

# O5 — INCIDENT RESPONSE PLAYBOOK

## 5.1. Tên file chính thức

`docs/operations/INCIDENT_RESPONSE_PLAYBOOK_v1.na`

## 5.2. Mục đích

Đưa ra quy trình xử lý khi Natt-OS gặp lỗi runtime, event, audit, build, drift hoặc security/trust incident.

## 5.3. Phân loại incident

| Mã | Loại incident | Mức rủi ro |
|---|---|---|
| I1 | Runtime không boot | High |
| I2 | Build/compile regression | High |
| I3 | Event không vào audit | Critical |
| I4 | Audit gap hoặc audit corrupt | Critical |
| I5 | Gatekeeper/SiraSign bypass | Critical |
| I6 | Cell state mismatch | High |
| I7 | Import/type drift tái phát | Medium |
| I8 | UI hiển thị sai state | Medium |
| I9 | Secret/env leak nghi vấn | Critical |
| I10 | Demo chạm module release-blocker | High |

## 5.4. Quy trình xử lý chuẩn

```text
[1] Freeze runtime hoặc freeze feature tùy mức độ
[2] Ghi incident record
[3] Xác định branch/commit/runtime version
[4] Thu log/audit/event evidence
[5] Phân loại mức độ
[6] Quyết định rollback/isolate/hotfix
[7] Thực hiện fix hoặc rollback
[8] Chạy smoke test/build verification
[9] Ghi postmortem
[10] Cập nhật Known Issues Register
```

## 5.5. Incident record schema

```text
incident_id:
detected_at:
detected_by:
environment:
branch:
commit:
incident_type:
severity:
summary:
evidence:
affected_cells:
affected_events:
audit_refs:
action_taken:
rollback_required:
status:
postmortem_ref:
```

## 5.6. Quy tắc

1. Critical incident phải ưu tiên audit preservation.
2. Không hotfix production nếu không có rollback target.
3. Không xóa log để “làm sạch”.
4. Không demo tiếp khi incident liên quan trust/audit/Gatekeeper.
5. Mọi incident phải có postmortem nếu ảnh hưởng release.

---

# O6 — BACKUP & RECOVERY PLAN

## 6.1. Tên file chính thức

`docs/operations/BACKUP_RECOVERY_PLAN_v1.na`

## 6.2. Mục đích

Định nghĩa những thành phần phải backup, tần suất, cách restore và cách kiểm tra restore.

## 6.3. Backup scope

| Thành phần | Bắt buộc backup | Ghi chú |
|---|---:|---|
| Source code | Có | Git remote không thay thế backup release artifact |
| Config/env template | Có | Không backup secret plaintext nếu không có vault |
| Database/state store | Có nếu dùng | Phải có restore test |
| Audit trail | Có | Ưu tiên immutable/append-only |
| Event log | Có | Dùng cho causality reconstruction |
| `.anc` | Có | Identity/passport manifest |
| `.na` | Có | Memory/spec/knowledge artifacts |
| `.phieu` | Có chọn lọc | Runtime mutable state, cần TTL |
| Build artifacts | Có nếu release | Gắn commit/version |
| Deployment records | Có | Chứng cứ vận hành |

## 6.4. Recovery tiers

| Tier | Mục tiêu | Ví dụ |
|---|---|---|
| R0 | Restore code only | checkout commit ổn định |
| R1 | Restore runtime config | env/config/template |
| R2 | Restore state/audit | DB + audit/event log |
| R3 | Full system recovery | code + config + state + audit + docs |

## 6.5. Quy tắc

1. Backup chưa test restore thì chưa được coi là backup hợp lệ.
2. Audit trail phải ưu tiên bảo toàn hơn UI cache.
3. `.phieu` hết TTL không được restore như state thật nếu không verify.
4. Recovery phải ghi record.
5. Secret recovery phải theo secret policy, không ghi vào tài liệu công khai.

---

# O7 — ROLLBACK PLAN

## 7.1. Tên file chính thức

`docs/operations/ROLLBACK_PLAN_v1.na`

## 7.2. Mục đích

Định nghĩa cách quay lại bản ổn định khi deployment hoặc runtime phát sinh lỗi.

## 7.3. Rollback trigger

```text
build regression
runtime boot fail
health check fail
event/audit flow fail
critical incident
Gatekeeper/SiraSign bypass nghi vấn
data/state corruption
smoke test fail after deploy
```

## 7.4. Rollback record schema

```text
rollback_id:
trigger_incident_id:
from_commit:
to_commit:
environment:
operator:
approver:
backup_point:
commands_run:
verification_result:
status:
notes:
```

## 7.5. Quy trình rollback

```text
[1] Freeze deploy
[2] Xác nhận rollback target
[3] Backup trạng thái hiện tại nếu cần forensic
[4] Checkout/deploy commit ổn định
[5] Restore config/state nếu cần
[6] Boot runtime
[7] Chạy smoke test
[8] Kiểm tra audit/event
[9] Ghi rollback record
[10] Mở postmortem
```

## 7.6. Quy tắc

1. Rollback không được xóa evidence lỗi.
2. Rollback target phải biết trước trước khi deploy.
3. Nếu audit corrupt, ưu tiên forensic hơn resume nhanh.
4. Nếu rollback state làm mất causality, phải ghi rõ.
5. Rollback xong vẫn phải cập nhật Known Issues.

---

# O8 — VERSIONING POLICY

## 8.1. Tên file chính thức

`docs/operations/VERSIONING_POLICY_v1.na`

## 8.2. Mục đích

Định nghĩa cách đặt version cho runtime, kernel, cell, spec, file extension và release package.

## 8.3. Version domains

| Domain | Ví dụ version | Ghi chú |
|---|---|---|
| Runtime | `runtime-v0.3.0` | Gắn boot/deploy |
| Kernel | `kernel-v0.2.1` | Gắn core logic |
| Cell | `warehouse-cell-v0.1.4` | Gắn domain cell |
| Spec | `SPEC_xxx_v1.na` | Gắn canonical docs |
| Extension | `ANC-v1`, `NA-v1`, `PHIEU-v1` | Gắn parser/validator |
| Release | `gold-master-rc.1` | Gắn build artifact |

## 8.4. Quy tắc version

```text
major: thay đổi contract không tương thích
minor: thêm capability tương thích
patch: sửa lỗi không đổi contract
rc: release candidate
preview: technical/partner preview
```

## 8.5. Release label

```text
internal-preview
technical-preview
controlled-partner-preview
release-candidate
market-release
hotfix
rollback-build
```

## 8.6. Quy tắc

1. Không dùng “v1.0” cho runtime nếu chưa qua Release Candidate gate.
2. Spec version không đồng nghĩa runtime version.
3. Cell version phải ghi contract thay đổi.
4. Release note phải ghi commit hash.
5. File extension version phải gắn validator/parser version.

---

# O9 — RUNTIME SMOKE TEST SCRIPT

## 9.1. Tên file chính thức

`docs/operations/RUNTIME_SMOKE_TEST_SCRIPT_v1.na`

## 9.2. Mục đích

Định nghĩa bộ kiểm tra nhanh sau boot hoặc deploy để xác nhận runtime còn sống, event đi được, audit ghi được và UI không chạm module lỗi.

## 9.3. Smoke test checklist

```text
[ ] git branch/commit xác định
[ ] dependency installed
[ ] tsc/build gate đạt yêu cầu môi trường
[ ] runtime boot thành công
[ ] health endpoint trả OK
[ ] event test gửi được
[ ] audit ghi nhận event test
[ ] UI/client surface mở được nếu có
[ ] no critical error in console/log
[ ] Known Issues không bị trigger bởi demo path
```

## 9.4. Script mẫu

```bash
set -e

echo "== branch =="
git branch --show-current

echo "== commit =="
git rev-parse --short HEAD

echo "== status =="
git status --short

echo "== node =="
node -v

echo "== typecheck =="
npx tsc --noEmit

echo "== health =="
curl -s http://localhost:3001/api/health

echo "== emit smoke event =="
curl -s -X POST http://localhost:3001/api/events/emit \
  -H "Content-Type: application/json" \
  -d '{"type":"runtime.smoke_test","payload":{"ok":true},"cell":"runtime-cell"}'

echo "== audit =="
curl -s http://localhost:3001/api/audit?limit=10
```

## 9.5. Quy tắc

1. Smoke test không thay thế full test.
2. Smoke test fail thì không demo.
3. Smoke test phải ghi commit.
4. Nếu endpoint khác, phải cập nhật script theo ground truth.
5. Không bỏ qua typecheck nếu release gate yêu cầu.

---

# O10 — KNOWN ISSUES REGISTER

## 10.1. Tên file chính thức

`docs/operations/KNOWN_ISSUES_REGISTER_v1.na`

## 10.2. Mục đích

Ghi nhận lỗi còn tồn tại, mức rủi ro, scope ảnh hưởng và có được phép demo/release hay không.

## 10.3. Schema

```text
issue_id:
title:
detected_at:
source:
branch:
commit:
category:
severity: LOW | MEDIUM | HIGH | CRITICAL
affected_files:
affected_cells:
affected_demo_paths:
release_blocker: YES | NO
workaround:
owner:
status: OPEN | MITIGATED | FIXED | ACCEPTED_RISK
reviewer:
notes:
```

## 10.4. Severity guide

| Severity | Định nghĩa | Release |
|---|---|---|
| LOW | Không ảnh hưởng runtime/demo chính | Có thể preview |
| MEDIUM | Ảnh hưởng module phụ hoặc UI phụ | Cần workaround |
| HIGH | Ảnh hưởng cell/domain/runtime chính | Không RC nếu chưa xử lý |
| CRITICAL | Ảnh hưởng audit, Gatekeeper, state, secret, data | Dừng release/demo |

## 10.5. Quy tắc

1. Known issue không phải nơi chôn lỗi.
2. Accepted risk phải có approver.
3. Release blocker không được demo chạm vào.
4. Issue fixed phải có commit và verification.
5. Nếu lỗi liên quan trust/audit, mặc định CRITICAL cho đến khi chứng minh ngược.

---

# 11. Checklist hoàn thành Nhóm 3

| Mã | Tài liệu | File path | Done |
|---|---|---|---|
| O1 | Runtime Boot Manual | `docs/operations/RUNTIME_BOOT_MANUAL_v1.na` | ☐ |
| O2 | Environment Setup Guide | `docs/operations/ENVIRONMENT_SETUP_GUIDE_v1.na` | ☐ |
| O3 | Deployment Guide | `docs/operations/DEPLOYMENT_GUIDE_v1.na` | ☐ |
| O4 | Monitoring & Audit Guide | `docs/operations/MONITORING_AUDIT_GUIDE_v1.na` | ☐ |
| O5 | Incident Response Playbook | `docs/operations/INCIDENT_RESPONSE_PLAYBOOK_v1.na` | ☐ |
| O6 | Backup & Recovery Plan | `docs/operations/BACKUP_RECOVERY_PLAN_v1.na` | ☐ |
| O7 | Rollback Plan | `docs/operations/ROLLBACK_PLAN_v1.na` | ☐ |
| O8 | Versioning Policy | `docs/operations/VERSIONING_POLICY_v1.na` | ☐ |
| O9 | Runtime Smoke Test Script | `docs/operations/RUNTIME_SMOKE_TEST_SCRIPT_v1.na` | ☐ |
| O10 | Known Issues Register | `docs/operations/KNOWN_ISSUES_REGISTER_v1.na` | ☐ |

---

# 12. Lệnh tạo skeleton tài liệu Nhóm 3 trong repo

> Chạy tại root repo. Lệnh này tạo skeleton, chưa commit.

```bash
python3 - << 'EOF'
from pathlib import Path

files = {
    'docs/operations/RUNTIME_BOOT_MANUAL_v1.na': '# Runtime Boot Manual v1\n\nSTATUS: DRAFT\n',
    'docs/operations/ENVIRONMENT_SETUP_GUIDE_v1.na': '# Environment Setup Guide v1\n\nSTATUS: DRAFT\n',
    'docs/operations/DEPLOYMENT_GUIDE_v1.na': '# Deployment Guide v1\n\nSTATUS: DRAFT\n',
    'docs/operations/MONITORING_AUDIT_GUIDE_v1.na': '# Monitoring & Audit Guide v1\n\nSTATUS: DRAFT\n',
    'docs/operations/INCIDENT_RESPONSE_PLAYBOOK_v1.na': '# Incident Response Playbook v1\n\nSTATUS: DRAFT\n',
    'docs/operations/BACKUP_RECOVERY_PLAN_v1.na': '# Backup & Recovery Plan v1\n\nSTATUS: DRAFT\n',
    'docs/operations/ROLLBACK_PLAN_v1.na': '# Rollback Plan v1\n\nSTATUS: DRAFT\n',
    'docs/operations/VERSIONING_POLICY_v1.na': '# Versioning Policy v1\n\nSTATUS: DRAFT\n',
    'docs/operations/RUNTIME_SMOKE_TEST_SCRIPT_v1.na': '# Runtime Smoke Test Script v1\n\nSTATUS: DRAFT\n',
    'docs/operations/KNOWN_ISSUES_REGISTER_v1.na': '# Known Issues Register v1\n\nSTATUS: DRAFT\n',
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

> Chỉ chạy nếu anh muốn đưa Nhóm 3 vào repo ngay.

```bash
python3 - << 'EOF'
from pathlib import Path

files = {
    'docs/operations/RUNTIME_BOOT_MANUAL_v1.na': '# Runtime Boot Manual v1\n\nSTATUS: DRAFT\n',
    'docs/operations/ENVIRONMENT_SETUP_GUIDE_v1.na': '# Environment Setup Guide v1\n\nSTATUS: DRAFT\n',
    'docs/operations/DEPLOYMENT_GUIDE_v1.na': '# Deployment Guide v1\n\nSTATUS: DRAFT\n',
    'docs/operations/MONITORING_AUDIT_GUIDE_v1.na': '# Monitoring & Audit Guide v1\n\nSTATUS: DRAFT\n',
    'docs/operations/INCIDENT_RESPONSE_PLAYBOOK_v1.na': '# Incident Response Playbook v1\n\nSTATUS: DRAFT\n',
    'docs/operations/BACKUP_RECOVERY_PLAN_v1.na': '# Backup & Recovery Plan v1\n\nSTATUS: DRAFT\n',
    'docs/operations/ROLLBACK_PLAN_v1.na': '# Rollback Plan v1\n\nSTATUS: DRAFT\n',
    'docs/operations/VERSIONING_POLICY_v1.na': '# Versioning Policy v1\n\nSTATUS: DRAFT\n',
    'docs/operations/RUNTIME_SMOKE_TEST_SCRIPT_v1.na': '# Runtime Smoke Test Script v1\n\nSTATUS: DRAFT\n',
    'docs/operations/KNOWN_ISSUES_REGISTER_v1.na': '# Known Issues Register v1\n\nSTATUS: DRAFT\n',
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
git add docs/operations && git commit -m "docs(operations): add Natt-OS group 3 runtime operations skeletons" && git push origin main
```

---

# 14. Điều kiện chuyển sang Nhóm 4

Chỉ chuyển sang Nhóm 4 khi Nhóm 3 đạt tối thiểu:

```text
O1: có Runtime Boot Manual
O2: có Environment Setup Guide
O4: có Monitoring & Audit Guide
O5: có Incident Response Playbook
O7: có Rollback Plan
O9: có Runtime Smoke Test Script
O10: có Known Issues Register
```

Nếu thiếu các tài liệu này, chưa nên viết Security/Trust docs theo hướng market-facing vì vận hành thật chưa có bằng chứng kiểm soát.

