# natt-os — NHÓM 6: HỒ SƠ THƯƠNG MẠI / MARKET LAUNCH / ĐỊNH VỊ THỊ TRƯỜNG

**Phiên bản:** v1.0  
**Trạng thái:** Draft nội bộ — phục vụ chuẩn bị thương mại hóa, pitch, demo, partner preview và market launch có kiểm soát  
**Phạm vi:** Nhóm 6 — Hồ sơ thương mại, profile, pitch deck, one-page, use case, positioning, pricing, qualification, demo script, FAQ và claim control  
**Nguyên tắc:** Chỉ bán cái hệ có evidence. Không thương mại hóa vượt release gate. Không để ngôn ngữ marketing phá trust boundary, IP boundary hoặc security boundary.

---

## 0. Mục tiêu của Nhóm 6

Nhóm 6 là bộ hồ sơ dùng để đưa natt-os ra thị trường theo lộ trình kiểm soát: từ giới thiệu nội bộ, đối tác có chọn lọc, nhà đầu tư, khách hàng pilot đến market launch.

Nhóm này trả lời 10 câu hỏi:

1. natt-os được giới thiệu ra bên ngoài bằng ngôn ngữ nào?
2. Khách hàng hoặc đối tác nên hiểu natt-os khác ERP/CRM/workflow/AI agent ở đâu?
3. Use case nào được phép trình bày?
4. Use case nào chưa được phép trình bày vì runtime/release gate chưa đủ?
5. Giá trị thương mại nằm ở runtime, audit, governance, cell orchestration hay vertical implementation?
6. Khách hàng nào phù hợp để pilot?
7. Demo đi theo kịch bản nào để không chạm module lỗi hoặc thông tin mật?
8. Câu hỏi thường gặp được trả lời ra sao?
9. Câu claim nào được phép nói, câu nào bị cấm?
10. Khi nào được chuyển từ controlled preview sang market launch?

Nhóm 6 không thay thế Nhóm 1–5. Đây là **lớp diễn giải thương mại dựa trên nền kỹ thuật, vận hành, bảo mật và pháp lý đã khóa**.

---

## 1. Điều kiện vào Nhóm 6

Không được triển khai Nhóm 6 như hồ sơ công bố rộng nếu Nhóm 5 chưa đạt tối thiểu:

```text
L1: có Capability Profile bản kiểm soát claim
L2: có Technology Whitepaper bản public-safe
L3: có IP Dossier phân loại đối tượng bảo hộ
L4: có Trademark Dossier cho tên/logo
L6: có Confidentiality Policy
L7: có NDA Template
L8: có Partner Evaluation Form
```

Nếu pháp lý/IP chưa đủ khóa, Nhóm 6 chỉ được gắn nhãn:

```text
STATUS: MARKET_MATERIAL_DRAFT_INTERNAL
```

Không được gắn:

```text
STATUS: PUBLIC_MARKET_LAUNCH_ready
STATUS: SALES_ready_UNRESTRICTED
STATUS: INVESTOR_DISTRIBUTION_APPROVED
STATUS: CUSTOMER_PRODUCTION_OFFER_ready
```

---

## 2. Danh mục tài liệu Nhóm 6

| Mã | Tài liệu | Mức độ | Mục đích |
|---|---|---:|---|
| M1 | Company / Product Profile | Bắt buộc | Hồ sơ giới thiệu thương mại chính thức |
| M2 | Pitch Deck | Bắt buộc | Bộ slide trình bày cho đối tác/nhà đầu tư/khách hàng |
| M3 | One-page Introduction | Bắt buộc | Bản giới thiệu 1 trang gửi nhanh |
| M4 | Use Case Catalog | Bắt buộc | Danh mục tình huống ứng dụng được phép trình bày |
| M5 | Market Positioning Statement | Bắt buộc | Định vị natt-os trên thị trường |
| M6 | Pricing Model Draft | Bắt buộc | Mô hình giá dự kiến |
| M7 | Customer Qualification Form | Bắt buộc | Sàng lọc khách hàng/pilot phù hợp |
| M8 | Demo Script | Bắt buộc | Kịch bản demo có kiểm soát |
| M9 | FAQ for Customers / Partners | Bắt buộc | Bộ câu hỏi trả lời thống nhất |
| M10 | Public Claim Control Sheet | Bắt buộc | Kiểm soát câu chữ công bố |

---

# M1 — COMPANY / PRODUCT PROFILE

## 1.1. Tên file chính thức

`docs/market/COMPANY_PRODUCT_PROFILE_v1.na`

## 1.2. Mục đích

Tài liệu này là bản profile thương mại của natt-os, dùng cho đối tác, khách hàng, nhà đầu tư và các buổi giới thiệu có kiểm soát.

Khác với L1 Capability Profile, M1 dùng ngôn ngữ dễ hiểu hơn nhưng vẫn phải giữ claim đúng evidence.

## 1.3. Cấu trúc đề xuất

```text
1. natt-os là gì?
2. Vấn đề thị trường đang gặp
3. Cách natt-os tiếp cận vấn đề
4. Năng lực lõi
5. Use case tiêu biểu
6. Đối tượng khách hàng phù hợp
7. Trạng thái phát triển
8. Lộ trình pilot/preview
9. Điều kiện bảo mật và NDA
10. Liên hệ / next step
```

## 1.4. Mô tả an toàn

```text
natt-os là một kiến trúc runtime điều phối nghiệp vụ và hệ thống theo mô hình event, causality, audit và cell governance. Hệ được thiết kế để giúp doanh nghiệp kiểm soát dòng trạng thái, truy nguyên nguyên nhân, phân vùng trách nhiệm và giảm rủi ro vận hành do drift, thiếu audit hoặc thay đổi không kiểm soát.
```

## 1.5. Năng lực thương mại được phép nêu

| Năng lực | Cách nói an toàn |
|---|---|
| Event/Causality | Truy nguyên chuỗi sự kiện và nguyên nhân |
| Audit-first | Tăng khả năng kiểm soát và giải trình |
| Cell governance | Phân vùng module/nghiệp vụ có boundary |
| SmartLink | Theo dõi liên kết và phụ thuộc động |
| Gatekeeper/siraSign | Kiểm soát quyền phê chuẩn và release |
| Runtime lifecycle | Quản lý trạng thái, version, drift và phục hồi |
| Business mapping | Ánh xạ nghiệp vụ doanh nghiệp vào cell/event |

## 1.6. Trạng thái phát triển phải ghi theo gate

```text
STATUS: Internal Technical Preview | Controlled Partner Preview | Release Candidate | Market Launch
SOURCE: Release Gate Checklist
```

## 1.7. Quy tắc

1. Không viết profile như thể hệ đã production-ready nếu chưa qua Gate 3.
2. Không nói “ngôn ngữ lập trình mới hoàn chỉnh” nếu parser/loader/enforcement chưa đủ evidence.
3. Không lộ tên file/path nội bộ nhạy cảm.
4. Không liệt kê security detail vượt C1 nếu gửi cho đối tác chưa NDA.
5. Profile phải có mục limitations hoặc maturity status.

---

# M2 — PITCH DECK

## 2.1. Tên file chính thức

`docs/market/PITCH_DECK_OUTLINE_v1.na`

## 2.2. Mục đích

Pitch Deck là bản trình bày ngắn, dùng cho nhà đầu tư, đối tác chiến lược hoặc khách hàng pilot.

## 2.3. Cấu trúc 12 slide đề xuất

```text
Slide 1  — Title / natt-os
Slide 2  — Problem: doanh nghiệp mất ground truth trong vận hành
Slide 3  — Why now: AI + workflow + audit pressure + data fragmentation
Slide 4  — Solution: STATE + EVENT + CAUSALITY + AUDIT runtime
Slide 5  — Product Architecture: cell, event, audit, Gatekeeper, SmartLink
Slide 6  — Use Cases: kho, tài chính, vận hành, audit, HR, production
Slide 7  — Differentiation: không phải ERP/CRM/AI agent thường
Slide 8  — Market Entry: controlled pilot trước, vertical implementation sau
Slide 9  — Business Model: implementation + license + maintenance + enterprise package
Slide 10 — Roadmap: stabilization → preview → pilot → release
Slide 11 — IP / Trust: SHTT, confidentiality, audit-first, security boundary
Slide 12 — Ask / Next Step
```

## 2.4. Slide claim rules

| Slide | Claim cần kiểm soát |
|---|---|
| Problem | Không phóng đại quá mức |
| Solution | Không claim hoàn chỉnh nếu chưa release |
| Architecture | Không lộ secret/security internals |
| Use Cases | Chỉ nêu use case có thể demo/pilot |
| IP | Không nói đã được cấp bằng nếu chưa có |
| Roadmap | Phân biệt completed / in progress / planned |

## 2.5. Câu định vị pitch-safe

```text
natt-os is an event-and-audit-centered runtime architecture designed to help organizations preserve operational ground truth across business workflows, system states, and governance decisions.
```

## 2.6. Quy tắc

1. Pitch deck không thay thế whitepaper.
2. Deck gửi ngoài phải là bản đã lọc C0/C1.
3. Không đưa sơ đồ lõi C3/C4 vào deck public.
4. Mọi con số thị trường/claim tài chính cần nguồn hoặc ghi là assumption.
5. Nếu gửi investor, phải có version và share record.

---

# M3 — ONE-PAGE INTRODUCTION

## 3.1. Tên file chính thức

`docs/market/ONE_PAGE_INTRODUCTION_v1.na`

## 3.2. Mục đích

Bản 1 trang dùng để gửi nhanh cho đối tác, khách hàng hoặc người giới thiệu trước buổi họp.

## 3.3. Cấu trúc 1 trang

```text
1. natt-os là gì?
2. Vấn đề giải quyết
3. Cách tiếp cận khác biệt
4. 5 năng lực chính
5. Use case phù hợp
6. Trạng thái hiện tại
7. Điều kiện trao đổi tiếp theo
```

## 3.4. Nội dung mẫu an toàn

```text
natt-os là hệ runtime điều phối nghiệp vụ theo mô hình event, causality, audit và cell governance. Thay vì chỉ ghi nhận dữ liệu cuối cùng, hệ tập trung giữ lại chuỗi nguyên nhân, bằng chứng audit và boundary giữa các cell nghiệp vụ/hạ tầng. Mục tiêu là giúp doanh nghiệp kiểm soát vận hành, giảm drift hệ thống, tăng khả năng truy nguyên và chuẩn hóa quy trình phê duyệt.
```

## 3.5. 5 năng lực chính

```text
1. Event Envelope & Causality Chain
2. Audit-first State Management
3. Cell-based Business Mapping
4. Gatekeeper / siraSign Authority
5. SmartLink Coupling & Lifecycle Monitoring
```

## 3.6. Quy tắc

1. One-page chỉ nên ở mức C0/C1.
2. Không gửi kèm source/screenshot nội bộ nếu chưa phân loại.
3. Có thể ghi “controlled preview” nếu đúng gate.
4. Không hứa triển khai production nếu chưa có pilot assessment.
5. Nên kèm NDA note nếu đối tác muốn xem sâu.

---

# M4 — USE CASE CATALOG

## 4.1. Tên file chính thức

`docs/market/USE_CASE_CATALOG_v1.na`

## 4.2. Mục đích

Liệt kê các use case natt-os có thể trình bày, demo hoặc pilot, đồng thời đánh dấu mức sẵn sàng.

## 4.3. Schema use case

```text
use_case_id:
title:
domain:
problem:
NATT_OS_capability:
required_cells:
required_events:
audit_requirement:
data_sensitivity:
demo_ready: YES | NO | PARTIAL
pilot_ready: YES | NO | PARTIAL
release_blockers:
notes:
```

## 4.4. Danh mục use case đề xuất

| Use case | Domain | Mức sẵn sàng cần xác minh |
|---|---|---|
| Warehouse event trace | Kho/vận hành | Phụ thuộc sửa Warehouse Cell |
| Finance audit trail | Tài chính/kế toán | Cần event/audit contract |
| Order lifecycle tracking | Sales/operation | Cần EventEnvelope + audit |
| Production cell chain | Sản xuất | Cần cell registry |
| HR/KPI governance | Nhân sự | Cần data boundary |
| Release gate control | DevOps/governance | Có thể demo bằng docs/spec |
| Incident response workflow | Security/ops | Cần playbook + audit |
| SmartLink dependency map | Architecture | Cần evidence code/spec |
| Time radiation/lifecycle monitoring | Runtime trust | Có thể trình bày concept, demo tùy implementation |
| Partner controlled preview | Commercial pilot | Cần NDA + qualification |

## 4.5. Readiness levels

```text
L0: Concept only
L1: Spec available
L2: Prototype/demo path available
L3: Technical preview ready
L4: Controlled pilot ready
L5: Production-ready candidate
```

## 4.6. Quy tắc

1. Mỗi use case phải có readiness level.
2. Không demo use case có release blocker chưa cô lập.
3. Use case dùng dữ liệu tài chính/HR/khách hàng mặc định sensitivity cao.
4. Use case public phải tránh lộ flow nội bộ quá sâu.
5. Use case phải liên kết với Known Issues nếu có.

---

# M5 — MARKET POSITIONING STATEMENT

## 5.1. Tên file chính thức

`docs/market/MARKET_POSITIONING_STATEMENT_v1.na`

## 5.2. Mục đích

Định nghĩa natt-os đứng ở đâu trên thị trường và khác gì các nhóm sản phẩm hiện có.

## 5.3. Định vị ngắn

```text
natt-os is not a conventional ERP, CRM, workflow tool, or AI chatbot. It is an event-and-audit-centered runtime architecture for preserving operational ground truth across business domains, system states, and governance decisions.
```

## 5.4. So sánh thị trường

| Nhóm sản phẩm | Thường tập trung vào | natt-os khác ở đâu |
|---|---|---|
| ERP | Dữ liệu nghiệp vụ và quy trình chuẩn | Tập trung event/causality/audit và cell governance |
| CRM | Lead, khách hàng, sales pipeline | Xem sales như một cell trong chuỗi event lớn hơn |
| Workflow tool | Task và approval flow | Gắn approval với authority, audit, causality |
| AI agent | Tự động hóa tác vụ | Không để AI action vượt Gatekeeper/audit |
| SI/consulting | Triển khai hệ thống rời | Đưa nghiệp vụ vào runtime governance thống nhất |
| Observability tool | Log/metrics/traces | Audit là ground truth, không chỉ telemetry |

## 5.5. Positioning pillars

```text
1. Ground Truth Preservation
2. Event-Causality Runtime
3. Audit-first Governance
4. Cell-based Business Architecture
5. Controlled Authority and Release
6. Lifecycle / Drift Management
```

## 5.6. Không định vị sai

Không định vị natt-os là:

```text
chatbot
ERP clone
CRM clone
simple workflow tool
magic AI automation
universal OS thay thế hệ điều hành máy tính
security product certified tuyệt đối
```

---

# M6 — PRICING MODEL DRAFT

## 6.1. Tên file chính thức

`docs/market/PRICING_MODEL_DRAFT_v1.na`

## 6.2. Mục đích

Đề xuất mô hình giá cho natt-os khi triển khai preview/pilot/commercial package.

## 6.3. Pricing components

| Thành phần | Mô tả |
|---|---|
| Discovery fee | Khảo sát quy trình, dữ liệu, hệ thống hiện có |
| Architecture mapping fee | Mapping nghiệp vụ vào cell/event/audit |
| Implementation fee | Cấu hình/triển khai runtime hoặc module |
| License fee | Quyền sử dụng phần mềm/runtime theo kỳ |
| Maintenance fee | Bảo trì, cập nhật, support |
| Audit/governance package | Thiết lập audit, release gate, policy |
| Custom cell development | Xây cell riêng theo nghiệp vụ |
| Training fee | Đào tạo người dùng/operator |
| Pilot fee | Gói thử nghiệm giới hạn |
| Enterprise package | Gói doanh nghiệp tùy biến |

## 6.4. Package đề xuất

| Gói | Phạm vi | Ghi chú |
|---|---|---|
| Technical Assessment | Khảo sát + mapping sơ bộ | Không deploy production |
| Controlled Pilot | Demo/pilot 1–2 domain | NDA + scope rõ |
| Business Cell Package | Triển khai một nhóm cell | Ví dụ warehouse/finance |
| Governance Package | Audit, Gatekeeper, release gate | Phù hợp nội bộ công nghệ |
| Enterprise Runtime Package | Tùy chỉnh nhiều domain | Chỉ sau assessment |

## 6.5. Quy tắc giá

1. Không báo giá production nếu chưa discovery.
2. Không bán license nếu runtime gate chưa đạt mức tương ứng.
3. Pilot phải giới hạn scope rõ.
4. Custom cell phải có change request.
5. Bảng giá public nên là range hoặc starting point, không hứa cố định khi scope chưa rõ.

---

# M7 — CUSTOMER QUALIFICATION FORM

## 7.1. Tên file chính thức

`docs/market/CUSTOMER_QUALIFICATION_FORM_v1.na`

## 7.2. Mục đích

Sàng lọc khách hàng/đối tác phù hợp trước khi demo sâu hoặc pilot.

## 7.3. Form schema

```text
customer_name:
industry:
company_size:
contact_person:
current_systems:
problem_statement:
priority_domain:
data_sensitivity:
process_maturity:
audit_requirement:
internal_owner_available:
technical_team_available:
budget_range:
timeline_expectation:
pilot_scope:
risk_level:
qualification_status:
notes:
```

## 7.4. Qualification criteria

| Tiêu chí | Tốt | Rủi ro |
|---|---|---|
| Có owner nội bộ | Có người phụ trách rõ | Không ai chịu trách nhiệm |
| Quy trình có thể mô tả | Có flow/process | Mọi thứ truyền miệng |
| Dữ liệu có cấu trúc | Có export/file/system | Rời rạc, không nguồn thật |
| Kỳ vọng thực tế | Pilot có scope | Muốn thay toàn hệ ngay |
| Bảo mật hợp tác | Chấp nhận NDA/scope | Đòi xem lõi/source sớm |
| Budget | Có ngân sách pilot | Chỉ tò mò/không quyết định |

## 7.5. Quy tắc

1. Khách chưa qualify không được demo sâu.
2. Khách có dữ liệu nhạy cảm phải qua DPA/data boundary.
3. Khách muốn production ngay phải qua discovery.
4. Khách không có owner nội bộ không nên nhận pilot.
5. Khách cạnh tranh hoặc rủi ro IP cao chỉ xem public-safe material.

---

# M8 — DEMO SCRIPT

## 8.1. Tên file chính thức

`docs/market/DEMO_SCRIPT_v1.na`

## 8.2. Mục đích

Tạo kịch bản demo có kiểm soát để không chạm module lỗi, không lộ bí mật, không claim vượt evidence.

## 8.3. Demo modes

| Mode | Đối tượng | Phạm vi |
|---|---|---|
| D0 Public Intro | Người ngoài chưa NDA | Slide + one-page |
| D1 Controlled Walkthrough | Đối tác đã qualify | Flow concept + demo giả lập |
| D2 Technical Preview | Đối tác kỹ thuật/NDA | Runtime path đã smoke test |
| D3 Pilot Demo | Khách pilot | Use case đã scope |
| D4 Internal Deep Demo | Nội bộ | Có thể xem logs/spec sâu hơn |

## 8.4. Demo flow đề xuất

```text
[1] Mở bằng problem statement
[2] Giới thiệu STATE + EVENT + CAUSALITY + AUDIT
[3] Giải thích cell boundary
[4] Chạy hoặc mô phỏng một event flow
[5] Cho xem audit/trace ở mức an toàn
[6] Giải thích Gatekeeper/siraSign ở mức concept
[7] Trình bày use case phù hợp khách
[8] Nêu maturity status và limitation
[9] Chốt next step: assessment / NDA / pilot scope
```

## 8.5. Demo safety checklist

```text
[ ] Demo path không chạm release blocker
[ ] Known Issues đã kiểm
[ ] Dữ liệu demo là giả hoặc được phép
[ ] Không mở file secret/env/source nhạy cảm
[ ] Không mở audit có dữ liệu thật
[ ] Không claim production-ready nếu chưa gate
[ ] Có rollback/stop plan nếu runtime lỗi
[ ] Có người ghi nhận câu hỏi/objection
```

## 8.6. Quy tắc

1. Demo fail không được chữa bằng claim miệng.
2. Nếu runtime chưa ổn, dùng recorded/demo mock có ghi rõ.
3. Không để khách tự khám phá repo/source nếu chưa duyệt.
4. Không demo ngoài scope đã qualify.
5. Mọi demo D2 trở lên nên có record.

---

# M9 — FAQ FOR CUSTOMERS / PARTNERS

## 9.1. Tên file chính thức

`docs/market/FAQ_CUSTOMERS_PARTNERS_v1.na`

## 9.2. Mục đích

Chuẩn hóa cách trả lời câu hỏi của khách hàng, đối tác, nhà đầu tư và đội nội bộ.

## 9.3. FAQ mẫu

### natt-os có phải ERP không?

```text
Không. ERP thường tập trung vào module nghiệp vụ và dữ liệu giao dịch. natt-os tập trung vào runtime điều phối event, causality, audit và cell governance. natt-os có thể ánh xạ hoặc tích hợp với nghiệp vụ kiểu ERP, nhưng không định vị là ERP clone.
```

### natt-os có phải AI agent không?

```text
Không đơn thuần. AI có thể là một phần của operator hoặc assistant layer, nhưng natt-os không để AI action vượt qua Gatekeeper, audit và authority boundary.
```

### Hệ đã production-ready chưa?

```text
Trạng thái phụ thuộc Release Gate Checklist. Nếu đang ở Gold Master Stabilization hoặc Controlled Preview, hệ chưa được claim production-ready toàn phần.
```

### Có thể dùng thử không?

```text
Có thể xem xét controlled preview hoặc pilot sau khi đánh giá khách hàng, ký NDA nếu cần và xác định scope dữ liệu/demo.
```

### natt-os khác workflow tool ở đâu?

```text
Workflow tool thường quản lý task/approval. natt-os quản lý event, causality, audit, authority và cell boundary như một runtime governance layer.
```

### Có bảo mật không?

```text
natt-os có security/trust architecture gồm authority matrix, audit policy, data boundary, threat model và bridge control. Tuy nhiên không claim an toàn tuyệt đối hoặc không thể bypass.
```

## 9.4. Quy tắc FAQ

1. FAQ không được trả lời vượt evidence.
2. Câu trả lời nhạy cảm phải dẫn về NDA/technical session.
3. Không trả lời chi tiết secret/security internals.
4. Không hứa timeline/release nếu chưa có release gate.
5. FAQ phải cập nhật sau mỗi thay đổi positioning.

---

# M10 — PUBLIC CLAIM CONTROL SHEET

## 10.1. Tên file chính thức

`docs/market/PUBLIC_CLAIM_CONTROL_SHEET_v1.na`

## 10.2. Mục đích

Kiểm soát tất cả câu chữ được phép công bố về natt-os.

## 10.3. Claim classes

| Class | Mức | Ví dụ |
|---|---|---|
| P0 | Safe public | Mô tả tổng quan, không chi tiết lõi |
| P1 | Controlled public | Có thể nói sau review |
| P2 | NDA only | Chỉ nói với đối tác đã ký NDA |
| P3 | Internal only | Chỉ nội bộ |
| P4 | Forbidden | Không được nói |

## 10.4. Claim được phép — P0/P1

```text
natt-os là kiến trúc runtime tập trung vào event, causality, audit và cell governance.
natt-os hỗ trợ tư duy ground-truth-first trong vận hành hệ thống.
natt-os đang trong giai đoạn Gold Master Stabilization / Controlled Preview tùy release gate.
natt-os định hướng giúp doanh nghiệp truy nguyên state transition và giảm drift vận hành.
```

## 10.5. Claim chỉ nói dưới NDA — P2

```text
Chi tiết file layer .anc/.na/.phieu.
Chi tiết SmartLink coupling/decay.
Chi tiết siraSign/Gatekeeper implementation.
Chi tiết threat/radiation defense model.
Chi tiết runtime wave/evidence chưa public.
```

## 10.6. Claim nội bộ — P3

```text
Known issue chi tiết.
Compile error log chi tiết.
Bypass pattern.
Incident/postmortem.
Source path, secret boundary, security internals.
```

## 10.7. Claim bị cấm — P4

```text
không thể bypass
an toàn tuyệt đối
production-ready toàn phần khi chưa qua release gate
native programming language hoàn chỉnh khi chưa có parser/loader/enforcement đầy đủ
đã được cấp sáng chế khi chưa có văn bằng
đã được chứng nhận bảo mật khi chưa có chứng nhận
thay thế hoàn toàn ERP/CRM/AI agent trong mọi trường hợp
```

## 10.8. Claim approval schema

```text
claim_id:
claim_text:
claim_class:
evidence_ref:
approver:
approved_at:
expiry_or_review_date:
allowed_channels:
notes:
```

## 10.9. Quy tắc

1. Claim không có evidence không được public.
2. Claim kỹ thuật phải khớp release gate.
3. Claim pháp lý phải khớp hồ sơ IP/trademark/copyright thực tế.
4. Claim security phải khớp Nhóm 4.
5. Claim hết hạn review phải kiểm lại trước khi dùng.

---

# 11. Checklist hoàn thành Nhóm 6

| Mã | Tài liệu | File path | Done |
|---|---|---|---|
| M1 | Company / Product Profile | `docs/market/COMPANY_PRODUCT_PROFILE_v1.na` | ☐ |
| M2 | Pitch Deck Outline | `docs/market/PITCH_DECK_OUTLINE_v1.na` | ☐ |
| M3 | One-page Introduction | `docs/market/ONE_PAGE_INTRODUCTION_v1.na` | ☐ |
| M4 | Use Case Catalog | `docs/market/USE_CASE_CATALOG_v1.na` | ☐ |
| M5 | Market Positioning Statement | `docs/market/MARKET_POSITIONING_STATEMENT_v1.na` | ☐ |
| M6 | Pricing Model Draft | `docs/market/PRICING_MODEL_DRAFT_v1.na` | ☐ |
| M7 | Customer Qualification Form | `docs/market/CUSTOMER_QUALIFICATION_FORM_v1.na` | ☐ |
| M8 | Demo Script | `docs/market/DEMO_SCRIPT_v1.na` | ☐ |
| M9 | FAQ Customers / Partners | `docs/market/FAQ_CUSTOMERS_PARTNERS_v1.na` | ☐ |
| M10 | Public Claim Control Sheet | `docs/market/PUBLIC_CLAIM_CONTROL_SHEET_v1.na` | ☐ |

---

# 12. Lệnh tạo skeleton tài liệu Nhóm 6 trong repo

> Chạy tại root repo. Lệnh này tạo skeleton, chưa commit.

```bash
python3 - << 'EOF'
from pathlib import Path

files = {
    'docs/market/COMPANY_PRODUCT_PROFILE_v1.na': '# Company / Product Profile v1\n\nSTATUS: DRAFT\n',
    'docs/market/PITCH_DECK_OUTLINE_v1.na': '# Pitch Deck Outline v1\n\nSTATUS: DRAFT\n',
    'docs/market/ONE_PAGE_INTRODUCTION_v1.na': '# One-page Introduction v1\n\nSTATUS: DRAFT\n',
    'docs/market/USE_CASE_CATALOG_v1.na': '# Use Case Catalog v1\n\nSTATUS: DRAFT\n',
    'docs/market/MARKET_POSITIONING_STATEMENT_v1.na': '# Market Positioning Statement v1\n\nSTATUS: DRAFT\n',
    'docs/market/PRICING_MODEL_DRAFT_v1.na': '# Pricing Model Draft v1\n\nSTATUS: DRAFT\n',
    'docs/market/CUSTOMER_QUALIFICATION_FORM_v1.na': '# Customer Qualification Form v1\n\nSTATUS: DRAFT\n',
    'docs/market/DEMO_SCRIPT_v1.na': '# Demo Script v1\n\nSTATUS: DRAFT\n',
    'docs/market/FAQ_CUSTOMERS_PARTNERS_v1.na': '# FAQ Customers / Partners v1\n\nSTATUS: DRAFT\n',
    'docs/market/PUBLIC_CLAIM_CONTROL_SHEET_v1.na': '# Public Claim Control Sheet v1\n\nSTATUS: DRAFT\n',
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

> Chỉ chạy nếu anh muốn đưa Nhóm 6 vào repo ngay.

```bash
python3 - << 'EOF'
from pathlib import Path

files = {
    'docs/market/COMPANY_PRODUCT_PROFILE_v1.na': '# Company / Product Profile v1\n\nSTATUS: DRAFT\n',
    'docs/market/PITCH_DECK_OUTLINE_v1.na': '# Pitch Deck Outline v1\n\nSTATUS: DRAFT\n',
    'docs/market/ONE_PAGE_INTRODUCTION_v1.na': '# One-page Introduction v1\n\nSTATUS: DRAFT\n',
    'docs/market/USE_CASE_CATALOG_v1.na': '# Use Case Catalog v1\n\nSTATUS: DRAFT\n',
    'docs/market/MARKET_POSITIONING_STATEMENT_v1.na': '# Market Positioning Statement v1\n\nSTATUS: DRAFT\n',
    'docs/market/PRICING_MODEL_DRAFT_v1.na': '# Pricing Model Draft v1\n\nSTATUS: DRAFT\n',
    'docs/market/CUSTOMER_QUALIFICATION_FORM_v1.na': '# Customer Qualification Form v1\n\nSTATUS: DRAFT\n',
    'docs/market/DEMO_SCRIPT_v1.na': '# Demo Script v1\n\nSTATUS: DRAFT\n',
    'docs/market/FAQ_CUSTOMERS_PARTNERS_v1.na': '# FAQ Customers / Partners v1\n\nSTATUS: DRAFT\n',
    'docs/market/PUBLIC_CLAIM_CONTROL_SHEET_v1.na': '# Public Claim Control Sheet v1\n\nSTATUS: DRAFT\n',
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
git add docs/market && git commit -m "docs(market): add natt-os group 6 market launch skeletons" && git push origin main
```

---

# 14. Điều kiện chuyển sang Nhóm 7

Chỉ chuyển sang Nhóm 7 khi Nhóm 6 đạt tối thiểu:

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

Nếu thiếu các tài liệu này, chưa nên viết hồ sơ triển khai khách hàng hoặc pilot plan chi tiết vì thương mại chưa khóa đúng scope và claim.

