# NATT-OS — NHÓM 5: HỒ SƠ PHÁP LÝ / SỞ HỮU TRÍ TUỆ / CÔNG BỐ CÓ KIỂM SOÁT

**Phiên bản:** v1.0  
**Trạng thái:** Draft nội bộ — phục vụ bảo hộ pháp lý, sở hữu trí tuệ và chuẩn bị công bố có kiểm soát  
**Phạm vi:** Nhóm 5 — Hồ sơ pháp lý, SHTT, trademark, copyright, bảo mật, NDA, đánh giá đối tác, điều khoản sử dụng và xử lý dữ liệu  
**Nguyên tắc:** Công bố sau khi khóa trust boundary. Bảo hộ trước khi marketing. Claim pháp lý phải thấp hơn hoặc bằng evidence kỹ thuật.

---

## 0. Mục tiêu của Nhóm 5

Nhóm 5 là bộ hồ sơ dùng để bảo vệ NATT-OS trước khi đưa ra thị trường, giới thiệu cho đối tác, nộp hồ sơ SHTT hoặc ký kết thử nghiệm/pilot.

Nhóm này trả lời 8 câu hỏi:

1. NATT-OS được mô tả pháp lý như sản phẩm/công nghệ gì?
2. Phần nào có thể đăng ký quyền tác giả phần mềm?
3. Phần nào có thể đưa vào hồ sơ sáng chế/giải pháp hữu ích/know-how?
4. Tên gọi, logo, màu sắc, nhận diện nào cần bảo hộ nhãn hiệu?
5. Tài liệu nào được công bố, tài liệu nào giữ bí mật?
6. Đối tác/nhân sự/nhà đầu tư phải ký gì trước khi xem?
7. Nếu cho dùng thử, điều khoản sử dụng và giới hạn trách nhiệm là gì?
8. Nếu xử lý dữ liệu doanh nghiệp/khách hàng, nghĩa vụ dữ liệu được kiểm soát thế nào?

Nhóm 5 không phải bộ sales deck. Đây là **bộ hồ sơ pháp lý và bảo hộ trước công bố**.

---

## 1. Điều kiện vào Nhóm 5

Không được triển khai Nhóm 5 như hồ sơ công bố rộng nếu Nhóm 4 chưa đạt tối thiểu:

```text
S1: có Security Architecture Overview
S2: có RBAC / Authority Matrix
S3: có Audit Trail Policy
S4: có Secret Management Policy
S5: có Data Boundary Policy
S6: có Threat Model
S10: có Bridge Adaptive Aperture Spec
```

Nếu trust boundary chưa đủ khóa, Nhóm 5 chỉ được gắn nhãn:

```text
STATUS: LEGAL_IP_DRAFT_INTERNAL
```

Không được gắn:

```text
STATUS: PUBLIC_RELEASE_READY
STATUS: IP_FULLY_PROTECTED
STATUS: PATENT_GRANTED
STATUS: LEGALLY_CERTIFIED
```

---

## 2. Danh mục tài liệu Nhóm 5

| Mã | Tài liệu | Mức độ | Mục đích |
|---|---|---:|---|
| L1 | NATT-OS Capability Profile | Bắt buộc | Hồ sơ năng lực chính thức, có kiểm soát claim |
| L2 | Technology Whitepaper | Bắt buộc | Mô tả công nghệ ở mức công bố được |
| L3 | IP Dossier / Hồ sơ SHTT | Bắt buộc | Hồ sơ sáng chế/giải pháp/know-how |
| L4 | Trademark Dossier | Bắt buộc | Bảo hộ tên, logo, màu sắc, nhận diện |
| L5 | Copyright Source Code Record | Bắt buộc | Ghi nhận quyền tác giả phần mềm/source |
| L6 | Confidentiality Policy | Bắt buộc | Phân loại bí mật và công bố |
| L7 | NDA Template | Bắt buộc | Mẫu bảo mật cho đối tác/nhân sự/nhà đầu tư |
| L8 | Partner Evaluation Form | Bắt buộc | Đánh giá đối tác trước khi demo/cấp quyền |
| L9 | Terms of Use Draft | Bắt buộc | Điều khoản dùng thử/sử dụng hệ |
| L10 | Data Processing Addendum Draft | Bắt buộc | Phụ lục xử lý dữ liệu nếu có dữ liệu khách hàng |

---

# L1 — NATT-OS CAPABILITY PROFILE

## 1.1. Tên file chính thức

`docs/legal/NATT_OS_CAPABILITY_PROFILE_v1.na`

## 1.2. Mục đích

Tài liệu này là hồ sơ năng lực chính thức của NATT-OS, dùng cho đối tác, nhà đầu tư, hồ sơ giới thiệu có kiểm soát và các buổi làm việc pháp lý/kỹ thuật.

## 1.3. Nguyên tắc viết

```text
1. Mô tả năng lực dựa trên evidence.
2. Không claim vượt release gate.
3. Không dùng câu tuyệt đối như “không thể bypass”.
4. Không lộ secret, path nội bộ, vulnerability chi tiết.
5. Không mô tả NATT-OS như app CRUD/ERP/CRM thông thường.
```

## 1.4. Nội dung bắt buộc

### A. Giới thiệu tổng quan

```text
NATT-OS là hệ điều phối runtime theo mô hình STATE + EVENT + CAUSALITY + AUDIT, định hướng quản trị cell, event envelope, audit trail, SmartLink coupling và Gatekeeper/SiraSign authority.
```

### B. Năng lực lõi

| Năng lực | Mô tả an toàn |
|---|---|
| Event-driven Runtime | Điều phối hành vi qua event envelope và causality |
| Cell-based Governance | Phân vùng nghiệp vụ/hạ tầng/governance theo cell |
| Audit-first Operation | State trọng yếu phải có audit trail |
| SmartLink Coupling | Theo dõi liên kết động giữa các cell |
| Gatekeeper / SiraSign | Cơ chế authority và phê chuẩn có kiểm soát |
| Nauion File Layer | `.anc`, `.na`, `.phieu` cho identity, memory, runtime state |
| Radiation Defense Model | Mô hình xử lý nhiễu thông tin và suy hao thời gian |

### C. Trạng thái phát triển

```text
STATUS: Gold Master Stabilization / Technical Preview / Controlled Partner Preview
```

Trạng thái phải lấy từ Release Gate Checklist, không tự ghi.

## 1.5. Claim được phép

```text
NATT-OS đang phát triển một kiến trúc runtime dựa trên event, causality, audit và cell governance.
NATT-OS định hướng thay thế tư duy CRUD-centric bằng event/ground-truth-centric runtime.
NATT-OS có bộ spec nội bộ cho file layer .anc/.na/.phieu, Gatekeeper/SiraSign, SmartLink và audit trail.
```

## 1.6. Claim bị cấm nếu chưa có evidence

```text
runtime hoàn chỉnh
native programming language hoàn chỉnh
đã production-ready toàn phần
không thể bypass
đã được chứng nhận bảo mật
đã được cấp bằng sáng chế
```

---

# L2 — TECHNOLOGY WHITEPAPER

## 2.1. Tên file chính thức

`docs/legal/TECHNOLOGY_WHITEPAPER_v1.na`

## 2.2. Mục đích

Whitepaper mô tả NATT-OS ở mức công nghệ, dùng để giải thích cho đối tác, hội đồng kỹ thuật, luật sư SHTT hoặc nhà đầu tư mà không lộ bí mật triển khai.

## 2.3. Cấu trúc đề xuất

```text
1. Executive Summary
2. Problem Statement
3. Architectural Thesis
4. STATE + EVENT + CAUSALITY + AUDIT Model
5. Cell-based Runtime Governance
6. Event Envelope and Causality Chain
7. SmartLink Coupling and Decay
8. Gatekeeper / SiraSign Authority
9. Nauion File Layer: .anc / .na / .phieu
10. Information Radiation and Time Radiation Defense
11. Use Cases
12. Current Maturity and Limitations
13. Non-claims
14. IP Notice
```

## 2.4. Public-safe technical language

Nên dùng:

```text
event envelope
causality chain
audit-first runtime
cell governance
controlled authority
runtime lifecycle
information disturbance filtering
time-based degradation management
```

Tránh dùng nếu chưa khóa:

```text
unhackable
self-conscious AI
fully autonomous operating system
universal physics engine
complete new programming language
```

## 2.5. Quy tắc

1. Whitepaper không chứa secret/path nội bộ.
2. Whitepaper không chứa vulnerability chi tiết.
3. Whitepaper không chứa claim pháp lý chưa được luật sư/SHTT soát.
4. Whitepaper phải có mục limitations.
5. Whitepaper phải tham chiếu đúng trạng thái release.

---

# L3 — IP DOSSIER / HỒ SƠ SHTT

## 3.1. Tên file chính thức

`docs/legal/IP_DOSSIER_SHTT_v1.na`

## 3.2. Mục đích

Chuẩn bị hồ sơ bảo hộ sở hữu trí tuệ cho NATT-OS dưới các hướng có thể gồm:

```text
- Quyền tác giả phần mềm
- Sáng chế hoặc giải pháp hữu ích nếu đủ điều kiện
- Bí mật kinh doanh / know-how
- Nhãn hiệu
- Tài liệu kỹ thuật nội bộ có đóng dấu thời điểm
```

## 3.3. Đối tượng cần phân loại

| Đối tượng | Hướng bảo hộ khả thi | Ghi chú |
|---|---|---|
| Source code | Quyền tác giả phần mềm | Cần bản code, thông tin tác giả/chủ sở hữu |
| Logo/tên NATT-OS | Nhãn hiệu | Theo nhóm ngành phù hợp |
| `.anc/.na/.phieu` file layer | Know-how / hồ sơ sáng chế nếu đủ mới | Cần mô tả kỹ thuật rõ |
| Event/Causality/Audit runtime | Sáng chế/giải pháp/know-how | Cần claim không quá rộng |
| SmartLink coupling/decay | Sáng chế/know-how | Cần sơ đồ và ví dụ |
| SiraSign/Gatekeeper authority | Know-how/sáng chế nếu có tính kỹ thuật | Tránh chỉ là quy tắc quản trị thuần túy |
| Radiation defense model | Know-how/spec kỹ thuật | Cần phân biệt metaphor và implementation |

## 3.4. Thành phần hồ sơ SHTT kỹ thuật

```text
tên giải pháp:
lĩnh vực kỹ thuật:
tình trạng kỹ thuật đã biết:
vấn đề kỹ thuật cần giải quyết:
bản chất kỹ thuật:
cấu trúc hệ thống:
quy trình vận hành:
điểm mới:
hiệu quả kỹ thuật:
ví dụ thực hiện:
sơ đồ kiến trúc:
yêu cầu bảo hộ dự kiến:
tóm tắt:
```

## 3.5. Claim drafting rule

```text
1. Claim phải mô tả cơ chế kỹ thuật, không chỉ ý tưởng.
2. Claim không được dựa vào metaphor nếu không có implementation.
3. Claim phải tránh quá rộng đến mức không bảo hộ được.
4. Claim phải có ví dụ thực hiện.
5. Claim phải phân biệt phần đã implement và phần roadmap.
```

## 3.6. Evidence cần thu

```text
commit history
source snapshot
architecture spec
runtime wave report
build verification report
screenshots nếu cần
logo/color specification
whitepaper controlled version
author/owner declaration
```

---

# L4 — TRADEMARK DOSSIER

## 4.1. Tên file chính thức

`docs/legal/TRADEMARK_DOSSIER_v1.na`

## 4.2. Mục đích

Chuẩn bị hồ sơ bảo hộ nhãn hiệu cho tên gọi, logo, màu sắc, biểu tượng và nhận diện liên quan NATT-OS.

## 4.3. Thành phần cần có

```text
mark_name:
logo_file_refs:
logo_description:
color_specification:
brand_owner:
intended_goods_services:
nice_class_candidates:
prior_search_status:
filing_status:
notes:
```

## 4.4. Đối tượng nhận diện

| Đối tượng | Cần làm |
|---|---|
| Tên NATT-OS | Kiểm tra khả năng đăng ký |
| Logo NATT-OS | Chuẩn hóa file, nền, màu, tỷ lệ |
| Biểu tượng Sira/Nauion nếu dùng công khai | Phân loại công khai/nội bộ |
| Màu nhận diện | Đặc tả RGB/HEX/CMYK/Pantone nếu có |
| Tagline | Kiểm tra có nên đăng ký hay giữ nội bộ |

## 4.5. Quy tắc

1. Logo nộp nhãn hiệu phải có bản chuẩn nền trắng/đen nếu cần.
2. Màu sắc phải mô tả đủ chi tiết để giảm sao chép.
3. Không đưa biểu tượng nội bộ/secret governance vào trademark nếu không muốn public.
4. Nhóm ngành phải đủ rộng cho phần mềm, SaaS, tư vấn, triển khai, AI/runtime nếu phù hợp.
5. Cần tra cứu sơ bộ trước khi nộp.

---

# L5 — COPYRIGHT SOURCE CODE RECORD

## 5.1. Tên file chính thức

`docs/legal/COPYRIGHT_SOURCE_CODE_RECORD_v1.na`

## 5.2. Mục đích

Ghi nhận thông tin phục vụ đăng ký quyền tác giả phần mềm và chứng minh lịch sử hình thành source code.

## 5.3. Record schema

```text
software_name:
version:
repository:
branch:
commit_hash:
snapshot_date:
author_list:
owner:
created_from:
language_stack:
main_modules:
excluded_secret_files:
build_status:
known_issues_ref:
source_archive_ref:
declaration_status:
```

## 5.4. Thành phần cần chuẩn bị

```text
source code snapshot
bản mô tả chức năng phần mềm
bản giao diện nếu cần
thông tin tác giả/chủ sở hữu
cam kết quyền sở hữu
ngày hoàn thành phiên bản
hash/checksum snapshot
```

## 5.5. Quy tắc

1. Source snapshot không chứa secret.
2. Snapshot phải gắn commit hash.
3. Nếu dùng thư viện open-source, cần ghi rõ dependency.
4. Không đăng ký bản còn lẫn dữ liệu khách hàng/thật.
5. Nếu chưa build xanh, vẫn có thể ghi nhận bản phát triển nhưng không gọi là release hoàn chỉnh.

---

# L6 — CONFIDENTIALITY POLICY

## 6.1. Tên file chính thức

`docs/legal/CONFIDENTIALITY_POLICY_v1.na`

## 6.2. Mục đích

Định nghĩa cấp độ bảo mật tài liệu, thông tin, source, spec và dữ liệu demo trước khi chia sẻ cho người ngoài.

## 6.3. Confidentiality classes

| Class | Tên | Ví dụ | Quy tắc |
|---|---|---|---|
| C0 | Public | brochure, public intro | Có thể công bố |
| C1 | Controlled | one-page, profile đã lọc | Share có kiểm soát |
| C2 | Internal | spec kỹ thuật, release report | Nội bộ |
| C3 | Confidential | source, audit, SHTT draft | NDA + approval |
| C4 | Restricted | secret, signing, bypass evidence | Không share ngoài lõi |
| C5 | Forensic | incident, vulnerability proof | Chỉ nhóm xử lý |

## 6.4. Marking rule

Mỗi tài liệu nên có header:

```text
CONFIDENTIALITY: C0 | C1 | C2 | C3 | C4 | C5
OWNER:
APPROVER:
SHARE_SCOPE:
EXPIRY/REVIEW_DATE:
```

## 6.5. Quy tắc

1. Mặc định tài liệu kỹ thuật là C2 nếu chưa phân loại.
2. Source code là C3 trở lên.
3. Secret/signing/bypass evidence là C4/C5.
4. Đối tác chỉ xem C0-C1 nếu chưa ký NDA.
5. Tài liệu SHTT draft nên giữ C3 cho đến khi nộp/khóa.

---

# L7 — NDA TEMPLATE

## 7.1. Tên file chính thức

`docs/legal/NDA_TEMPLATE_v1.na`

## 7.2. Mục đích

Tạo mẫu thỏa thuận bảo mật dùng trước khi cho đối tác, nhân sự, freelancer, nhà đầu tư hoặc vendor xem tài liệu vượt C1.

## 7.3. Điều khoản chính

```text
1. Định nghĩa thông tin bảo mật
2. Phạm vi sử dụng thông tin
3. Nghĩa vụ không tiết lộ
4. Nghĩa vụ không sao chép/không reverse engineer nếu áp dụng
5. Bảo vệ source/spec/architecture
6. Thời hạn bảo mật
7. Ngoại lệ thông tin đã công khai hợp pháp
8. Trả lại/xóa tài liệu khi kết thúc
9. Chế tài vi phạm
10. Luật áp dụng và giải quyết tranh chấp
```

## 7.4. NATT-OS specific clauses

```text
- Không được sao chép, tái tạo hoặc mô phỏng kiến trúc cell/event/causality/audit nếu chưa được phép.
- Không được công bố hình ảnh, demo, source, spec hoặc claim kỹ thuật khi chưa có chấp thuận bằng văn bản.
- Không được dùng thông tin để phát triển sản phẩm cạnh tranh trong thời hạn bảo mật nếu điều khoản này được chấp nhận hợp pháp.
- Không được chuyển thông tin cho bên thứ ba.
```

## 7.5. Quy tắc

1. NDA phải được luật sư rà soát trước khi dùng chính thức.
2. NDA không thay thế hợp đồng hợp tác/pilot.
3. NDA phải ghi rõ bên tiết lộ/bên nhận.
4. NDA phải có phạm vi tài liệu đi kèm.
5. Không demo nội dung C3 trở lên nếu chưa ký NDA.

---

# L8 — PARTNER EVALUATION FORM

## 8.1. Tên file chính thức

`docs/legal/PARTNER_EVALUATION_FORM_v1.na`

## 8.2. Mục đích

Đánh giá đối tác trước khi demo, cấp tài liệu, pilot hoặc chia sẻ công nghệ.

## 8.3. Form schema

```text
partner_name:
entity_type:
country:
industry:
contact_person:
purpose_of_access:
requested_materials:
confidentiality_level_requested:
nda_status:
conflict_of_interest_check:
technical_fit:
commercial_fit:
legal_risk:
data_risk:
reputation_risk:
approval_status:
approver:
notes:
```

## 8.4. Risk scoring

| Điểm | Ý nghĩa |
|---:|---|
| 1 | Rủi ro thấp |
| 2 | Rủi ro vừa |
| 3 | Cần kiểm soát |
| 4 | Rủi ro cao |
| 5 | Không nên chia sẻ |

Các nhóm điểm:

```text
legal_risk
ip_risk
data_risk
competition_risk
reputation_risk
execution_risk
```

## 8.5. Quy tắc

1. Đối tác chưa đánh giá không được xem tài liệu C2 trở lên.
2. Đối tác có competition risk cao chỉ xem bản public/controlled.
3. Đối tác cần pilot phải qua NDA + scope + demo script.
4. Đối tác yêu cầu source phải được Gatekeeper duyệt riêng.
5. Mọi tài liệu đã gửi phải ghi record.

---

# L9 — TERMS OF USE DRAFT

## 9.1. Tên file chính thức

`docs/legal/TERMS_OF_USE_DRAFT_v1.na`

## 9.2. Mục đích

Dự thảo điều khoản sử dụng cho trường hợp NATT-OS được dùng thử, demo có tài khoản, pilot hoặc bản controlled preview.

## 9.3. Điều khoản chính

```text
1. Phạm vi sử dụng
2. Tài khoản và quyền truy cập
3. Hành vi bị cấm
4. Dữ liệu người dùng/khách hàng
5. Giới hạn trách nhiệm
6. Tính chất bản preview/beta nếu áp dụng
7. Không cam kết production nếu chưa ký hợp đồng riêng
8. Bảo mật và log/audit
9. Sở hữu trí tuệ
10. Tạm ngưng/chấm dứt quyền truy cập
11. Luật áp dụng/tranh chấp
```

## 9.4. Preview disclaimer

```text
NATT-OS trong giai đoạn preview/pilot có thể còn giới hạn tính năng, known issues, thay đổi kiến trúc hoặc thay đổi giao diện. Bản preview không được hiểu là cam kết production hoặc cam kết phù hợp cho mọi mục đích nếu chưa có thỏa thuận riêng.
```

## 9.5. Prohibited use

```text
reverse engineering trái phép
bypass access control
trích xuất dữ liệu trái phép
đưa dữ liệu nhạy cảm khi chưa được cho phép
sử dụng để vi phạm pháp luật
chia sẻ tài khoản/truy cập cho bên thứ ba
```

## 9.6. Quy tắc

1. Terms of Use phải phù hợp với mô hình triển khai thực tế.
2. Nếu chỉ demo offline, không cần terms như SaaS public nhưng vẫn cần demo terms.
3. Nếu có tài khoản khách hàng, phải có data/privacy terms.
4. Nếu dùng dữ liệu thật, phải có DPA hoặc phụ lục dữ liệu.
5. Luật sư phải rà soát trước khi dùng ngoài thực tế.

---

# L10 — DATA PROCESSING ADDENDUM DRAFT

## 10.1. Tên file chính thức

`docs/legal/DATA_PROCESSING_ADDENDUM_DRAFT_v1.na`

## 10.2. Mục đích

Dự thảo phụ lục xử lý dữ liệu cho trường hợp NATT-OS xử lý dữ liệu doanh nghiệp, khách hàng, nhân sự, giao dịch hoặc dữ liệu nhạy cảm của đối tác.

## 10.3. Nội dung chính

```text
1. Vai trò các bên: controller/processor hoặc tương đương
2. Loại dữ liệu xử lý
3. Mục đích xử lý
4. Thời hạn xử lý/lưu trữ
5. Biện pháp bảo mật
6. Quyền truy cập dữ liệu
7. Subprocessor nếu có
8. Xử lý sự cố dữ liệu
9. Xóa/trả dữ liệu khi kết thúc
10. Audit/compliance cooperation
```

## 10.4. Data categories

| Category | Ví dụ | Risk |
|---|---|---|
| Business process data | đơn hàng, kho, task | Medium |
| Financial/accounting data | doanh thu, giá vốn, công nợ | High |
| HR data | nhân sự, lương, KPI | High |
| Customer data | khách hàng, liên hệ, lịch sử mua | High |
| System logs | audit, event, runtime | Medium-High |
| Sensitive secrets | token/key/password | Critical |

## 10.5. Quy tắc

1. Không nhận dữ liệu thật nếu chưa có data boundary và DPA phù hợp.
2. Dữ liệu tài chính/kế toán/nhân sự phải mặc định High risk.
3. Audit log có thể chứa metadata nhạy cảm, cần retention rule.
4. Khi kết thúc pilot phải có quy tắc xóa/trả dữ liệu.
5. Incident dữ liệu phải có thời hạn thông báo và record.

---

# 11. Checklist hoàn thành Nhóm 5

| Mã | Tài liệu | File path | Done |
|---|---|---|---|
| L1 | NATT-OS Capability Profile | `docs/legal/NATT_OS_CAPABILITY_PROFILE_v1.na` | ☐ |
| L2 | Technology Whitepaper | `docs/legal/TECHNOLOGY_WHITEPAPER_v1.na` | ☐ |
| L3 | IP Dossier / Hồ sơ SHTT | `docs/legal/IP_DOSSIER_SHTT_v1.na` | ☐ |
| L4 | Trademark Dossier | `docs/legal/TRADEMARK_DOSSIER_v1.na` | ☐ |
| L5 | Copyright Source Code Record | `docs/legal/COPYRIGHT_SOURCE_CODE_RECORD_v1.na` | ☐ |
| L6 | Confidentiality Policy | `docs/legal/CONFIDENTIALITY_POLICY_v1.na` | ☐ |
| L7 | NDA Template | `docs/legal/NDA_TEMPLATE_v1.na` | ☐ |
| L8 | Partner Evaluation Form | `docs/legal/PARTNER_EVALUATION_FORM_v1.na` | ☐ |
| L9 | Terms of Use Draft | `docs/legal/TERMS_OF_USE_DRAFT_v1.na` | ☐ |
| L10 | Data Processing Addendum Draft | `docs/legal/DATA_PROCESSING_ADDENDUM_DRAFT_v1.na` | ☐ |

---

# 12. Lệnh tạo skeleton tài liệu Nhóm 5 trong repo

> Chạy tại root repo. Lệnh này tạo skeleton, chưa commit.

```bash
python3 - << 'EOF'
from pathlib import Path

files = {
    'docs/legal/NATT_OS_CAPABILITY_PROFILE_v1.na': '# NATT-OS Capability Profile v1\n\nSTATUS: DRAFT\n',
    'docs/legal/TECHNOLOGY_WHITEPAPER_v1.na': '# Technology Whitepaper v1\n\nSTATUS: DRAFT\n',
    'docs/legal/IP_DOSSIER_SHTT_v1.na': '# IP Dossier / Ho so SHTT v1\n\nSTATUS: DRAFT\n',
    'docs/legal/TRADEMARK_DOSSIER_v1.na': '# Trademark Dossier v1\n\nSTATUS: DRAFT\n',
    'docs/legal/COPYRIGHT_SOURCE_CODE_RECORD_v1.na': '# Copyright Source Code Record v1\n\nSTATUS: DRAFT\n',
    'docs/legal/CONFIDENTIALITY_POLICY_v1.na': '# Confidentiality Policy v1\n\nSTATUS: DRAFT\n',
    'docs/legal/NDA_TEMPLATE_v1.na': '# NDA Template v1\n\nSTATUS: DRAFT\n',
    'docs/legal/PARTNER_EVALUATION_FORM_v1.na': '# Partner Evaluation Form v1\n\nSTATUS: DRAFT\n',
    'docs/legal/TERMS_OF_USE_DRAFT_v1.na': '# Terms of Use Draft v1\n\nSTATUS: DRAFT\n',
    'docs/legal/DATA_PROCESSING_ADDENDUM_DRAFT_v1.na': '# Data Processing Addendum Draft v1\n\nSTATUS: DRAFT\n',
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

> Chỉ chạy nếu anh muốn đưa Nhóm 5 vào repo ngay.

```bash
python3 - << 'EOF'
from pathlib import Path

files = {
    'docs/legal/NATT_OS_CAPABILITY_PROFILE_v1.na': '# NATT-OS Capability Profile v1\n\nSTATUS: DRAFT\n',
    'docs/legal/TECHNOLOGY_WHITEPAPER_v1.na': '# Technology Whitepaper v1\n\nSTATUS: DRAFT\n',
    'docs/legal/IP_DOSSIER_SHTT_v1.na': '# IP Dossier / Ho so SHTT v1\n\nSTATUS: DRAFT\n',
    'docs/legal/TRADEMARK_DOSSIER_v1.na': '# Trademark Dossier v1\n\nSTATUS: DRAFT\n',
    'docs/legal/COPYRIGHT_SOURCE_CODE_RECORD_v1.na': '# Copyright Source Code Record v1\n\nSTATUS: DRAFT\n',
    'docs/legal/CONFIDENTIALITY_POLICY_v1.na': '# Confidentiality Policy v1\n\nSTATUS: DRAFT\n',
    'docs/legal/NDA_TEMPLATE_v1.na': '# NDA Template v1\n\nSTATUS: DRAFT\n',
    'docs/legal/PARTNER_EVALUATION_FORM_v1.na': '# Partner Evaluation Form v1\n\nSTATUS: DRAFT\n',
    'docs/legal/TERMS_OF_USE_DRAFT_v1.na': '# Terms of Use Draft v1\n\nSTATUS: DRAFT\n',
    'docs/legal/DATA_PROCESSING_ADDENDUM_DRAFT_v1.na': '# Data Processing Addendum Draft v1\n\nSTATUS: DRAFT\n',
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
git add docs/legal && git commit -m "docs(legal): add NATT-OS group 5 legal and IP skeletons" && git push origin main
```

---

# 14. Điều kiện chuyển sang Nhóm 6

Chỉ chuyển sang Nhóm 6 khi Nhóm 5 đạt tối thiểu:

```text
L1: có Capability Profile bản kiểm soát claim
L2: có Technology Whitepaper bản public-safe
L3: có IP Dossier phân loại đối tượng bảo hộ
L4: có Trademark Dossier cho tên/logo
L6: có Confidentiality Policy
L7: có NDA Template
L8: có Partner Evaluation Form
```

Nếu thiếu các tài liệu này, chưa nên viết pitch deck, pricing model hoặc tài liệu sales công bố rộng vì pháp lý/IP chưa đủ lớp bảo vệ.

