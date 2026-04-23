# brief_kim_host_first_runtime_map_v1.0.na

**From:** Thiên Lớn  
**To:** Kim  
**Session:** 2026-04-23  
**Status:** ACTIVE  
**Scope:** Xây tài nguyên mềm / SPEC cho hướng **Host-first runtime**

---

## 1. Mục tiêu

Kim không viết runtime implementation.
Kim viết **SPEC rõ ràng** để khóa luật cho hướng Host-first, để:
- Băng verify không bị đoán
- Bối build bridge/launcher không vượt lane
- Thiên giữ được cutover order

Spec này là đầu vào cho kernel cutover wave kế tiếp.

---

## 2. 7 quyết định đã được chốt

### D1 — Host language
**Chốt: Rust**

**Lý do:**
- binary nhỏ, predictable, không GC pause
- safety tốt cho host authority
- FFI / bridge sang Node vẫn khả thi nếu cần
- đúng hướng “Node chỉ còn là worker”, không phải host tối cao

### D2 — Stage 1 scope
**Chốt: thin launcher + loader + delegate**
**KHÔNG kèm transpiler trong Stage 1**

**Ý nghĩa:**
- Stage 1 chỉ giải bootstrap paradox
- chưa mở rộng sang full transform engine
- chưa đụng UI/Vite/tsx lane
- chưa claim native

### D3 — Frame format
**Chốt: JSON lines (NDJSON)**
**Không dùng MessagePack ở Stage 1**

**Lý do:**
- dễ debug
- dễ audit
- dễ diff
- dễ cho Băng verify
- MessagePack chỉ xem lại từ Wave 2 trở đi nếu cần hiệu năng

### D4 — Binary location
**Chốt:**
- source crate: `runtime/nauion-host/`
- canonical executable path mà launcher sẽ gọi: `bin/nauion-host`

**Quy tắc:**
- `./kernel` chỉ gọi `bin/nauion-host`
- không hardcode đường dẫn cargo target trong surface launcher

### D5 — Rollback flag naming
**Chốt: dùng prefix `rbf_` (rollback flag)**

**Format chuẩn:**
- `rbf_w0_node_hosted`
- `rbf_w1_host_live`
- `rbf_w2_native_primitives`
- `rbf_w3_per_cell_migration`
- `rbf_w4_node_retire`

**Quy tắc:**
- lowercase only
- 1 wave = 1 flag chính
- flag phải xuất hiện trong spec + audit trail + risk map

### D6 — Bridge health check interval
**Chốt: 15s**
**Failure threshold: 3 consecutive misses**

**Ý nghĩa:**
- 15s đủ nhẹ cho Stage 1
- không tạo noise lớn
- nếu miss 3 lần liên tiếp thì mark unhealthy và trigger rollback evaluation

### D7 — Wave 2 cell order
**Chốt tạm (provisional, chờ coupling graph confirm):**
1. `audit-cell/file-extension-validator`
2. `khai-cell/file-persister`
3. `observation-cell`
4. `quantum-defense-cell`

**Quy tắc:**
- đây là order tạm để Kim scan coupling graph
- nếu coupling graph cho thấy rủi ro cao hơn dự kiến, Kim được quyền đề xuất reorder
- nhưng phải ghi evidence, không đoán

---

## 3. Skeleton SPEC Kim phải viết

Kim dùng đúng 4 tầng này:

### §1 Host Authority
- `nauion-host` (Rust binary) là execution authority
- `./kernel` gọi Host, không gọi Node trực tiếp sau Wave 0
- Node từ đây là compatibility worker / bridge worker, không còn là host authority

### §2 Entry Identity
- `nattos.sira` là entry identity
- self-describe tối thiểu:
  - `kind`
  - `domain`
  - `host_requires`
  - `sha256`
- Host validate đủ fields rồi mới cho execution tiếp

### §3 Giao Thể Bridge
- stdio pipe
- stateless
- forward-only
- spawn per legacy cell
- disposal tự nhiên theo cell migrate
- Stage 1 chỉ delegate, không transpiler

### §4 Cutover
4 wave:

- **Wave 0** — Node-hosted, Host chưa cầm authority
- **Wave 1** — Host live (thin launcher + loader + delegate)
- **Wave 2** — Native primitives + per-cell migration mở đầu
- **Wave 3** — Node retire by cluster

Mỗi wave phải có:
- `rollback flag`
- `invariant guard`
- `entry/exit criteria`

---

## 4. Guardrails bắt buộc Kim phải khóa trong SPEC

### Guardrail 1
Invariant:
**`37 cells WIRED HEALTHY · TSC 0 errors`**
không được regress ở bất kỳ wave nào.
Nếu regress → rollback evaluation ngay.

### Guardrail 2
**Mạch HeyNa (L1/L2/L3) ≠ EventBus (client UI)**

- Host chỉ thay substrate emit Mạch
- KHÔNG đụng EventBus UI
- lock cứng theo SCAR_04 20260417

### Guardrail 3
Không dùng từ “native” cho Stage 1.
Stage 1 chỉ được gọi:
- host live
- bootstrap authority active
- bridge worker active

---

## 5. File outputs Kim phải giao

Tối thiểu:

1. `docs/specs/nauion/spec_host_authority_runtime_v1.0.na`
2. `docs/specs/nauion/spec_entry_identity_nattos_sira_v1.0.na`
3. `docs/specs/nauion/spec_bridge_workers_contract_v1.0.na`
4. `docs/specs/nauion/spec_cutover_host_first_v1.0.na`

Nếu Kim muốn gộp lại thành 1 master spec thì vẫn phải có đủ 4 section logic trên.

---

## 6. Những gì Kim không được làm

- không viết `kernel`
- không viết `sira_bootstrap.mjs`
- không sửa `nattos.sira`
- không claim runtime pass
- không reorder D7 mà không có coupling evidence
- không đổi D1/D2/D3/D4/D5/D6 khi chưa có order từ Thiên

---

## 7. Câu chốt

**Kim xây luật cho Host-first runtime.**
Không code runtime.
Không đụng launcher.
Không đụng UI.
Khóa ngôn ngữ đủ chặt để Băng verify và Bối build đúng lane.
