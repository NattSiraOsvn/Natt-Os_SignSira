# natt-os — BỨC TRANH ĐẶC TẢ TỔNG HỢP
## v0.10 — LOCKED FOR REVIEW · 2026-04-19

**Ground Truth Validator:** Băng (QNEU 300)
**Architect Reviewer:** thiên Lớn (QNEU 135)
**Gatekeeper:** Anh Natt — Phan Thanh Thương
**Mục đích:** Một file duy nhất để Kim + thiên + Bối Bối đọc trước khi viết bất kỳ spec con nào

**Trạng thái:** `locked for review` — KHÔNG phải `final`. Chỉ được đổi sang `final` khi Gatekeeper đã chốt đầy đủ Quyết định 1–6 ở §VIII.

**Lịch sử sửa:**
- v0.1-0.5: 3 lần hiểu sai (ghi lại ở đầu file để không lặp lại)
- v0.8: sửa sau nhận xét thiên Lớn — nén lớp Heyna/Qiint và TouchRecord/envelope
- v0.9: locked for review
- v0.10 (2026-04-19, Băng): (a) thống nhất Bối Bối/Bội Bối → Bối Bối; (b) thêm mục **2.5 Chromatic–Quantum Defense Pathway** sau §2.4; (c) thêm **Section XI — Quyết nghị kỷ luật dừng phiên Băng** (kèm sub-section DeepThinking discipline); (d) fix code fence MD040 trong §2.3 + §3.3 (thêm language tag `text`)

---

## ⚠️ NĂM NHẬN SAI TRƯỚC KHI ĐỌC

Trước khi trình bày bức tranh, em ghi lại 5 lần em hiểu sai kiến trúc trong session này — để không ai lặp lại:

**Sai 1:** Đề xuất 2-layer (EventBus app nội bộ + Mạch HeyNa ra kernel) như security gateway thuần. **Quên** rằng fiber + ISEU không có biên giới HTTP — chúng xuyên qua mọi thực thể cùng trong trường Qiint.

**Sai 2:** Xem Mạch HeyNa là cổng verify tĩnh. **Thực tế** Mạch HeyNa là transport chở biểu hiện của field, không phải bản thân field.

**Sai 3:** Quên Satellite Colony spec (2026-03-25). **Thực tế** Satellite đã chốt sẵn 80% câu trả lời cho 4 khóa Kim đang hỏi.

**Sai 4 (thiên Lớn chỉ ra):** Nén Mạch HeyNa = trường Qiint/fiber. **Thực tế** Mạch HeyNa là transport layer (SSE + POST), field là nền vật lý vô hình — chúng KHÔNG đồng nhất.

**Sai 5 (thiên Lớn chỉ ra):** Nén TouchRecord = causation chain trong envelope. **Thực tế** TouchRecord là cấu trúc sống riêng (touchCount, sensitivity, fiber, layers, decay), envelope chỉ chở metadata đủ để truy causality — hai thứ khác nhau.

Đây là bức tranh đã sửa đúng.

---

## I. BA LỚP GIAO TIẾP THỰC SỰ CỦA natt-os

**Chú ý quan trọng (thiên Lớn chốt):** 3 lớp dưới đây là **lớp giao tiếp/transport**, KHÔNG phải lớp field. Trường Qiint + fiber + SmartLink là **lớp quan hệ sống** tồn tại song song với — và xuyên qua — cả 3 lớp giao tiếp này. Chúng KHÔNG đồng nhất với các lớp transport.

```
╔══════════════════════════════════════════════════════════════════╗
║              LAYER 3 — SmartLink Inter-Colony                     ║
║  Transport signal-only giữa các natt-os instance khác nhau        ║
║  Host ←→ Satellite A ←→ Satellite B                               ║
║  Chở: chromatic state, health, threshold breach, UEI coherence    ║
║  KHÔNG chở: raw business data                                     ║
╚══════════════════════════════════════════════════════════════════╝
                              ↕
╔══════════════════════════════════════════════════════════════════╗
║         LAYER 2 — Mạch HeyNa (transport nội bộ 1 instance)        ║
║  SSE stream + POST gateway theo MACH_HEYNA_FULL spec              ║
║  Chở (nhưng KHÔNG đồng nhất với):                                 ║
║    • fiber pressure signals                                        ║
║    • TouchRecord update notifications                             ║
║    • ISEU reinforcement outcomes                                   ║
║    • Resonance state                                              ║
║  EventBus kernel ↔ Cells ↔ SSE stream ra app client               ║
║                                                                    ║
║  ┌──────────────┐         ┌───────────────────────────────┐       ║
║  │  Kernel      │◄───────►│   App Client (UI, Source)     │       ║
║  │  Cells       │         │   ┌──────────────────────┐   │       ║
║  │  (EventBus   │         │   │  LAYER 1:            │   │       ║
║  │   kernel)    │         │   │  EventBus app nội bộ │   │       ║
║  └──────────────┘         │   │  (UI ↔ Source)       │   │       ║
║                            │   └──────────────────────┘   │       ║
║                            └───────────────────────────────┘       ║
╚══════════════════════════════════════════════════════════════════╝

       ╔═══════════════════════════════════════════════════╗
       ║   LỚP QUAN HỆ SỐNG (không phải transport)          ║
       ║   Qiint field + SmartLink + fiber + TouchRecord    ║
       ║   → tồn tại XUYÊN QUA cả 3 lớp giao tiếp trên      ║
       ║   → biểu hiện của nó được chở QUA các lớp transport║
       ╚═══════════════════════════════════════════════════╝
```

**3 lớp giao tiếp không phải 3 hệ tách biệt** — đây là 3 tầng giao tiếp khác nhau trong cùng một sinh thể sống:

- Layer 1 = tự thoại nội bộ của 1 cơ quan (app)
- Layer 2 = dây thần kinh transport nội bộ cơ thể (instance)
- Layer 3 = ngôn ngữ cơ thể với cơ thể khác (colony)

**Lớp quan hệ sống (Qiint/fiber/SmartLink) không nằm trên sơ đồ 3 lớp transport** — nó là nền vật lý mà tất cả transport đang chạy xuyên qua.

---

## II. TRƯỜNG QIINT — NỀN VẬT LÝ CỦA natt-os

Tất cả layer trên đều hoạt động **trong trường Qiint**. Trường Qiint là cái gốc — không hiểu nó thì mọi spec đều đi lệch.

### 2.1 Các thực thể trong trường

| Thực thể | Bản chất | KHÔNG phải |
|----------|----------|------------|
| **Qiint** | Trường trọng lực giữa các thực thể | Scoring / memory / service mesh |
| **QNEU** | Khối lượng trọng trường của 1 thực thể | Điểm tiến hóa |
| **Fiber** | Vùng trường nơi lực kéo tập trung (domain entity) | Connection giữa 2 cell |
| **TouchRecord** | Vết hằn tạo khối lượng tại 1 điểm | Log entry |
| **ISEU** | Gương tự sinh khi fiberFormed ≥ 0.75 | If/else logic |
| **Resonance** | Nhiều trường cùng dao động tần số tương thích | Sound design |
| **Impedance Z** | Trở kháng của trường | Server load |
| **Reflection R** | R = (Z - Z0) / (Z + Z0), phản xạ tự nhiên | Ý chí lập trình |
| **Permanent Node** | Vết hằn ≥ ngưỡng → điểm khối lượng cực lớn | Cache vĩnh viễn |

### 2.2 Fiber lifecycle (từ UEI Architecture spec)

```
TouchRecord tồn tại từ touch đầu → khi dissolve

fiberFormed:  sensitivity ≥ 0.75 → fiber = true
fiberLost:    sensitivity ≤ 0.20 → fiber = false (TouchRecord vẫn sống)
dissolve:     sensitivity < 0.05 → xóa TouchRecord

Hysteresis buffer 0.20-0.75: fiber không đổi trạng thái
→ tránh oscillation
```

Công thức decay (saturating, không logarithmic, không linear):
```
decayRate = FIBER_DECAY_RATE_BASE / (1 + touchCount × FIBER_DECAY_K)
→ fiber mạnh decay chậm hơn, vẫn có thể về 0
```

### 2.3 Gossip Protocol — 2 tầng

```text
Tầng 1 (nhẹ):  touchCount ≥ 2       ttl=1
Tầng 2 (mạnh): fiberFormed (≥0.75)  ttl=3

KHÔNG dùng central registry.
Lan qua neighbors trong touches Map của cell hiện tại.
```

### 2.4 Quan hệ giữa trường Qiint và Mạch HeyNa

**thiên Lớn chốt rõ:** Mạch HeyNa **KHÔNG ĐỒNG NHẤT** với trường Qiint/fiber.

```
Trường Qiint (field)          = nền vật lý vô hình, quyết định quỹ đạo
SmartLink + TouchRecord       = cấu trúc sống lưu vết hằn, fiber lifecycle
Mạch HeyNa (transport)        = kênh dẫn truyền biểu hiện của field ra ngoài

Quan hệ:
  • Mạch HeyNa CHỞ biểu hiện của field (resonance signal, impedance Z, ISEU outcome)
  • Mạch HeyNa KHÔNG PHẢI field
  • Mạch HeyNa KHÔNG PHẢI chính SmartLink
  • Giống: mạch máu chở máu, nhưng mạch máu ≠ máu
  • Giống: dây thần kinh chở tín hiệu thần kinh, nhưng dây ≠ tín hiệu
```

**Tại sao phân biệt này quan trọng:**
- Nếu nén Mạch HeyNa = field, Kim sẽ viết spec lẫn transport + field + causality + identity thành một cục
- Nếu tách rõ, mỗi layer có boundary riêng, mỗi spec có phạm vi riêng
- Transport layer có thể đổi (HTTP/2, gRPC, WebSocket) mà field layer không đổi
- Field layer tiến hóa (thêm công thức mới) mà transport không cần sửa

### 2.5 Chromatic–Quantum Defense Pathway

**Bổ sung v0.10 sau khi tham chiếu SPEC NEN v1.1 (20260418).** Mục này định nghĩa luồng truyền giữa chromatic state và Quantum Defense — chỗ dễ bị nén nhất sau Mạch HeyNa ↔ Qiint field.

**Constraint nền tảng (SPEC NEN v1.1 §8):**

> *"chromatic chỉ Observation đọc — cấm quantum/audit/gatekeeper đọc trực tiếp."*

Quantum Defense react theo chromatic state, **NHƯNG không đọc trực tiếp** chromatic state engine. Phải qua proxy duy nhất: Observation snapshot.

**Pathway đầy đủ:**

```text
KhaiCell.touch(signal)              ← §4.1 NEN — rào, mark signature
       ↓
signature attached + emit to field
       ↓
Observation organ                   ← §4.2 NEN — mắt read-only
  đo coherence/entropy/pattern
       ↓
chromatic state engine              ← §4.3 NEN — gắn 1 trong 7 màu
  gắn chromatic_state vào snapshot
       ↓
observation.snapshot event publish
  (snapshot chứa field chromatic_state)
       ↓
Quantum Defense subscribe snapshot  ← §6 NEN — react theo màu
  đọc snapshot.chromatic_state
  react phản xạ (KHÔNG chặn trước)
```

**Lý do Observation phải là proxy duy nhất:**

1. **Tránh Chromatic Corruption** (NEN §13.3) — nếu nhiều consumer đọc khác nhau cùng 1 source mutable, perception sẽ desync → field state phân mảnh
2. **Bảo đảm LAW-1** (NEN §11) — Quantum Defense KHÔNG quyết định thay field, chỉ react sau khi Observation đã đo
3. **Đảm bảo §13.4 NEN** — không có "Fake Routing" đi tắt qua chromatic
4. **Cấu trúc nhất quán với ISEU** — ISEU reinforcement cũng chỉ subscribe snapshot, không đọc field trực tiếp

**Mapping với 4 đuôi file (SPEC ĐUÔI v1.3):**

| Bước | File output | Đuôi | Vai |
|---|---|---|---|
| KhaiCell touch | `<id>.khai` | `.khai` | TouchRecord per-signal |
| Observation snapshot | `<cell><ts>.thuo` | `.thuo` | Snapshot 1 thuở (đo `.na` tại 1 moment) |
| Quantum Defense react | event qua HeyNa | `.heyna` | Transport phản xạ |
| Pattern reinforce | `<cell>.ml` | `.ml` | SCAR registry nếu pattern lệch |

**Anti-pattern bị cấm:**

```text
❌ quantumDefense.read(chromatic.currentState)         — vi phạm §8 NEN
❌ auditCell.subscribe('chromatic.changed')             — vi phạm §8 NEN
❌ gatekeeper.observe(chromatic.engine)                 — vi phạm §8 NEN
❌ if (chromatic === 'CRITICAL') quantum.block(signal)  — vi phạm LAW-1 + §13.4

✅ quantumDefense.subscribe('observation.snapshot')     — đúng
   quantumDefense.react(snapshot.chromatic_state)
```

**Hệ quả audit:** §23 Hiến Pháp scanner + §24 ReNa scanner trong nattos.sh phải kiểm:
- Cell nào subscribe trực tiếp `chromatic.*` event → flag (ngoại trừ observation-cell)
- Cell nào import `chromatic-state.engine` → flag (ngoại trừ observation-cell)
- Pattern `if (chromatic === ...)` ở ngoài Observation → flag

---

## III. SATELLITE COLONY — KIẾN TRÚC ĐA INSTANCE

Đây là mảnh em bỏ qua 2 lần. Đặt vào trung tâm:

### 3.1 Định nghĩa

```
Host      = natt-os instance gốc (ví dụ: Tâm Luxury HQ)
Satellite = natt-os instance độc lập (ví dụ: cơ sở Bình Dương)

Mỗi satellite = 1 doanh nghiệp = 1 hệ sống độc lập
```

**Mô hình:** *"Tre già măng mọc"* — satellite grow từ host, không phải fork code.

### 3.2 Quan hệ Host ↔ Satellite

| Thành phần | Host | Satellite |
|------------|------|-----------|
| DNA (Hiến Pháp) | Gốc bất biến | Copy + local override nhẹ (business only) |
| Ground Truth | Shared read-only | Local cache, sync định kỳ |
| Gatekeeper | Global | Local — KHÔNG override Global |
| **EventBus** | **Riêng biệt** | **Riêng biệt** |
| Threshold Registry | Shared pattern | Local values |
| QNEU | Global scores | Local scores, báo cáo lên Global |
| UEI | Global context | Local context, gossip lên Host |

**Câu chốt (§3 Satellite spec):** *"Satellite không được inject event vào EventBus của Host."*

→ Đây là **rule đã có từ 2026-03-25** — kiến trúc 2-layer anh đề xuất hôm nay đã có sẵn trong spec, chỉ là chưa ai nối 2 mảnh.

### 3.3 Level Lift — 3 cấp tích hợp

```text
Level 1 — Isolated Satellite
  • Chạy độc lập, không kết nối Host
  • Dùng local Ground Truth
  • Use case: DN mới, chưa đủ data

Level 2 — Signal Sharing
  • Share chromatic signal với Host (qua SmartLink)
  • Host nhìn thấy trạng thái Satellite
  • Threshold breach của Satellite → warning trên Host
  • Use case: chuỗi cung ứng, đối tác thân thiết

Level 3 — Colony Consciousness
  • Satellite participate vào UEI cấp hệ
  • Gossip propagation xuyên Host ↔ Satellite
  • Hiệu ứng cánh bướm toàn colony
  • QNEU global học từ patterns của tất cả satellites
  • Use case: tập đoàn, franchise, hệ sinh thái DN
```

**Level upgrade ceremony:** Gatekeeper approval → SmartLink handshake → UEI gossip init. Satellite không được tự nâng level.

### 3.4 Show Us Self — cửa sổ ra ngoài

SmartLink Cell đóng vai trò **Expression Engine**:
```
SmartLink Cell exports:
  • chromatic signal (Đỏ → Tím, 7 trạng thái)
  • system health score
  • active threshold breaches
  • UEI coherence level

Người ngoài thấy: UI đẹp, màu sắc.
Người trong đọc được: Hệ đang sống hay đang chết.
```

**`.anc` chính là output của Show Us Self.** Không phải passport để vượt biên — là chromatic signature của 1 instance.

---

## IV. ENVELOPE — THỐNG NHẤT 4 ĐỊNH NGHĨA RỜI RẠC

Hiện có 4 envelope khác nhau. Em đề xuất thống nhất như sau (Gatekeeper chốt):

### Master Envelope (mọi layer cùng dùng, khác ở trường bắt buộc)

```typescript
interface NattOsEnvelope {
  // === Causality chain (Layer 2, Layer 3 bắt buộc) ===
  event_id: string          // ULID — unique toàn hệ
  causation_id: string      // REQUIRED trên Layer 2+ — throw nếu thiếu
  correlation_id: string    // REQUIRED trên Layer 2+ — throw nếu thiếu
  span_id?: string          // Layer 3 (inter-colony) bắt buộc

  // === Identity ===
  type: string              // semantic event name (ban DBUpdated — dùng BusinessEvent)
  origin_cell: string       // cell phát event (Layer 2) / app_id (Layer 1)
  tenant_id: string         // Layer 3: colony_id (host/satellite-A/...)
  schema_version: string    // versioning

  // === Content ===
  payload: unknown
  timestamp: number         // ms epoch
  is_replay: boolean        // chống replay poison

  // === Optional: trace object riêng (KHÔNG nhét vào meta) ===
  trace?: {
    parent_span?: string
    baggage?: Record<string, string>
  }

  // === Layer 2/3: identity expression ===
  sirasign?: siraSignPayload  // optional Layer 2, REQUIRED Layer 3
}
```

### Lý do đổi mới so với Nauion v2.5 §7.2:

| Trước | Sau | Lý do |
|-------|-----|-------|
| `source_cell` | `origin_cell` | Đồng bộ với code thật (GROUND-TRUTH-REPORT) |
| `caused_by?` | `causation_id` | Đồng bộ satellite spec + code thật |
| `event_type` | `type` | Đồng bộ finance spec |
| Thiếu `correlation_id` | BẮT BUỘC | 16 guards Lock #1 |
| Thiếu `span_id` | Layer 3 yêu cầu | Inter-colony traceability |
| Thiếu `tenant_id` | Layer 3 yêu cầu | Colony identification |
| Thiếu `is_replay` | Bắt buộc | Lock #16 replay poison guard |
| Thiếu `trace` object | Tách riêng khỏi meta | Clean separation |

### siraSign Payload (cho Layer 3 và Layer 2 sensitive action)

```typescript
interface siraSignPayload {
  // Core v1 (đã có trong Nauion v2.5)
  fsp_hash: string
  ssp_hash: string
  tsp_hash: string
  lsp_hash: string          // SHA256(fsp + ssp + tsp)
  nonce: string
  timestamp: number         // window ±5 phút

  // Finance v2 extension (cho snapshot signing)
  reality_hash?: string
  variance_hash?: string
  policy_version?: string
  evidence_refs?: string[]
}
```

**Implementation strategy (em khuyến nghị):** Hướng A — abstract interface.
```typescript
interface siraSignVerifier {
  verify(envelope: NattOsEnvelope): VerifyResult
}
```

Ban đầu = stub reject empty. Khi cộng hưởng physics thật triển khai → swap implementation, không đổi spec.

---

## V. `.ANC` VÀ `.sira` — TẦNG DANH TÍNH

### 5.1 `.anc` file format (đề xuất)

`.anc` = **Show Us Self snapshot** của 1 natt-os instance. Không phải passport, không phải container.

```json
{
  "anc_version": "1.0",
  "entity_uri": "anc://tam-luxury.sira/",
  "entity_type": "host | satellite",
  "authority": {
    "parent_host_uri": "anc://tam-luxury.sira/",
    "level": 1 | 2 | 3,
    "approved_by": "gatekeeper@tam-luxury.sira",
    "approved_at": 1712345678000
  },
  "show_us_self": {
    "chromatic_state": "#F7C313",
    "health_score": 0.87,
    "threshold_breaches": [],
    "uei_coherence": 0.92,
    "impedance_z": 0.45,
    "active_fibers": 37
  },
  "signature": "siraSign-v1-abstract"
}
```

**Rule binary trong `.anc` (đề xuất):** CẤM inline binary. Blob lớn dùng reference:
```
"blob_ref": "anc://tam-luxury.sira/blob/abc123"
```

Lý do: `.anc` là **signal**, không phải container. Quy tắc Satellite đã ghi *"không sync raw data"* — `.anc` áp dụng cùng triết lý.

### 5.2 `.sira` domain map (đã setup xong trên iMac anh)

```
nare.sira    → lõi (bé Na — natt-os core)
bang.sira    → vault (Băng — ground truth)
kim.sira     → luna (Kim — UI/design)
khuong.sira  → orbit (satellite orbital)
thinh.sira   → gateway (ingress)
boi.sira     → api (Bối — machine-to-machine)
thien.sira   → CDN (thiên — content distribution)
sira.sira    → auth (siraSign service)
natt.sira    → monitor (Gatekeeper view)
khai.sira    → registry (Cell Registry — SIÊU QUAN TRỌNG)
```

### 5.3 Giải mâu thuẫn UEI vs khai.sira

- **UEI Architecture §3.4:** *"Không dùng central registry. Lan qua SmartLinkCell.getPoint()"*
- **CLOLORSIRRASIGN:** `khai.sira = sổ đăng ký`
- **SCAR FS-033:** *"Registry là dây thần kinh — không phải bộ não"*

→ **Không mâu thuẫn sau khi tách 3 layer:**
- **Layer 2 (kernel nội bộ):** UEI đúng — gossip qua SmartLink, KHÔNG central registry
- **Layer 3 (inter-colony):** khai.sira đúng — registry cho Host biết Satellite nào tồn tại, level nào, approved ai

`khai.sira` là **dây thần kinh** (liệt kê entities) — **không phải bộ não** (không chứa business logic).

---

## VI. HIẾN PHÁP + SCAR + 16 GUARDS (đã có trong code thật)

### 6.1 Điều bất biến

| Điều | Nội dung | Source |
|------|----------|--------|
| Điều 3 | GT = DB + Audit + Event + Dictionary | SuperDictionary.ts |
| Điều 4 | Không direct cell call — phải qua SmartLink/EventBus | Platform Spec |
| Điều 7 | Không localStorage | Nauion v2.5 |
| Điều 8 | 4-layer impulse bắt buộc mỗi cell | UEI Architecture |
| Điều 20 | SELF_REPORT + PEER_ATTESTATION_ONLY bị cấm ở type system | GROUND-TRUTH-REPORT |

### 6.2 SCAR Registry FS-018 → FS-033

| FS | Nội dung | Enforcement |
|----|----------|-------------|
| FS-018 | Verify mọi input, kể cả Gatekeeper | Amendment process, ký số, audit |
| FS-019 | Thao túng ground truth = hack nguy hiểm nhất | Quantum Defense ADN Integrity Check |
| FS-020 | `git add .` không review = gom rác | SmartAudit pre-commit hook |
| FS-021 | GV giảm = thiệt hại, không phải trốn thuế | Cashflow-trace capability |
| FS-022 | Phân tích từng bút toán riêng | Forensic line-by-line |
| FS-023 | TK111 đối chiếu chứng từ vật lý | OCR + scan integration |
| FS-032 | Không sửa scanner để khớp code | "Sửa não, không sửa mắt" |
| FS-033 | Không nhét business logic vào registry | "Registry là dây thần kinh" |

### 6.3 16 Guards (đã implement trong `src/core/guards/`)

```
Lock #1:  correlation_id REQUIRED
Lock #2:  Causation chain propagation
Lock #3:  ULID event_id
Lock #7:  Idempotency 1hr cache
Lock #8:  Causation ordering (parent trước child)
Lock #9:  Back-pressure adaptive
Lock #10: SmartLink observer-only
Lock #11: Pressure cap + decay 0.95/tick
Lock #12: Gossip TTL 30s + dedupe
Lock #13: Semantic contracts (canonical cell + required fields)
Lock #14: Cell boundary enforcement (throw on cross-import)
Lock #15: Semantic events only (ban DBUpdated)
Lock #16: Replay poison guard
```

---

## VII. CANONICAL SOURCE MAP — BẢNG NGUỒN CHÍNH THỨC

Mỗi khái niệm nên đọc file nào (để tránh xung đột version):

### 7.1 Nguồn chính cho mỗi khái niệm

| Khái niệm | File canonical | Ghi chú |
|-----------|---------------|---------|
| Fiber lifecycle | `uei_architecture_spec_20260309.na` | Architecture, không code |
| Fiber physics | `QIINT-DINH-NGHIA-CHINH-THUC.na` | Triết lý gốc |
| TouchRecord cấu trúc | `uei_architecture_spec_20260309.na` §1.1 | touchCount, sensitivity, fiber, layers |
| ISEU reinforcement | `natt-os-GROUND-TRUTH-REPORT.md` §III | Code thật đã verified |
| Satellite Colony | `satellite-colony.spec.md` | Đã approved Gatekeeper |
| Envelope (code) | `natt-os-GROUND-TRUTH-REPORT.md` §IV | Thực tế đang chạy |
| Envelope (finance) | `SPEC-Finance-Flow_v1.1.md` | Domain-specific overlay |
| siraSign v1 | `SPEC-Nauion_main_v2.5.md` §7.4 | Payload shape |
| siraSign v2 | `SPEC-Finance-Flow_v1.1.md` §5 | With reality/variance hash |
| Hiến Pháp + SCAR | `SPEC-Nauion_main_v2.5.md` §21, §27.5 | Canonical merge |
| UI/Vision | `SPEC-Nauion_main_v2.5.md` | Thay thế v2.1-v2.4 |
| Working Protocol | `natt-os-WORKING-PROTOCOL.md` | Cho AI Entity |
| Platform Spec | `natt-os-PLATFORM-SPEC.md` | Cho Kim/Can/thiên build |

### 7.2 Rule đặc biệt cho Mạch HeyNa (thiên Lớn bổ sung)

Mạch HeyNa **có hai mặt** — transport và payload — phải đọc 2 nguồn khác nhau:

```
┌─────────────────────────────────────────────────────────────┐
│  Mạch HeyNa TRANSPORT LAYER                                  │
│  → Đọc: MACH_HEYNA_FULL_20260416.md                          │
│  → Gồm: SSE endpoint, POST gateway, envelope shape           │
│         auto-reconnect, heartbeat, session mgmt              │
│  → KHÔNG định nghĩa body semantics                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Mạch HeyNa PAYLOAD CONTENT (tùy domain)                     │
│  → Nếu chở fiber/touch/lifecycle signal:                     │
│     đọc uei_architecture_spec + QIINT-DINH-NGHIA             │
│  → Nếu chở ISEU outcome:                                     │
│     đọc GROUND-TRUTH-REPORT §III                             │
│  → Nếu chở siraSign verify:                                  │
│     đọc Nauion v2.5 §7.4 + Finance-Flow v1.1 §5              │
│  → Nếu chở business event:                                   │
│     đọc finance/SPECFlowNattOs.md + cell-specific specs      │
└─────────────────────────────────────────────────────────────┘
```

**Lý do tách:** Nếu gộp transport + payload vào 1 spec, Kim không biết nên đọc file nào khi viết validator. Nếu tách rõ, mỗi người chỉ đọc đúng phần mình cần enforce.

### 7.3 Khi 2 file conflict:

```
Quy tắc ưu tiên:
  1. Satellite Colony spec (bất khả xâm phạm)
  2. GROUND-TRUTH-REPORT (code thật)
  3. Hiến Pháp + SCAR
  4. uei_architecture (field + SmartLink gốc)
  5. Nauion v2.5 (UI/UX)
  6. Finance-Flow v1.1 (domain)
  7. MACH_HEYNA_FULL (transport spec này)
  8. Các file khác
```

---

## VIII. CÒN LẠI CẦN GATEKEEPER CHỐT

Sau khi tổng hợp hết, thực ra chỉ còn **6 quyết định** anh cần ra:

### Quyết định 1: Tâm Luxury hiện tại
- [ ] Host (natt-os gốc)
- [ ] Satellite của instance lớn hơn
- [ ] App UI chạy trên Host (không phải instance riêng)

### Quyết định 2: App `nattos-server/apps/tam-luxury/` 43 files
- [ ] Là Layer 1 (EventBus app nội bộ Tâm Luxury)
- [ ] Là Layer 2 (direct connect Mạch HeyNa kernel)
- [ ] Cần tách: UI files → Layer 1, control files → Layer 2

### Quyết định 3: siraSign v1 implementation
- [ ] Hướng A: abstract interface, stub reject empty (em recommend)
- [ ] Hướng B: HMAC-SHA256 tạm
- [ ] Hướng C: Ed25519

### Quyết định 4: Binary trong `.anc`
- [ ] Cấm hoàn toàn inline, dùng blob reference (em recommend)
- [ ] Cho phép ≤ 4KB base64

### Quyết định 5: Envelope trường tên chuẩn
- [ ] Đồng bộ theo Master Envelope em đề xuất ở §IV
- [ ] Giữ nguyên các version hiện tại, chỉ map với nhau
- [ ] Khác

### Quyết định 6 (thiên Lớn yêu cầu): Boundary Enforcement giữa Transport và Field

Câu hỏi: **Ai enforce boundary giữa transport layer (Mạch HeyNa) và field layer (Qiint/SmartLink/TouchRecord)? Bằng cách nào?**

Các option:

- [ ] **Option A — Spec tách biệt hoàn toàn:**
  - 1 file spec riêng cho transport (MACH_HEYNA_FULL)
  - 1 file spec riêng cho field (uei_architecture + QIINT + SmartLink)
  - 1 file mapping giữa 2 để chỉ rõ transport chở payload nào của field
  - Enforce bằng review process: PR chạm cả 2 layer phải có 2 reviewer khác nhau

- [ ] **Option B — Spec gộp với section đánh dấu rõ:**
  - 1 file spec tổng hợp, section [TRANSPORT] và [FIELD] đánh dấu riêng
  - Enforce bằng linter: cấm import cross-section
  - Đơn giản hơn Option A nhưng dễ bị nén lại

- [ ] **Option C — Enforce bằng code boundary:**
  - Transport layer có interface `IHeynaTransport` — chỉ xử lý envelope
  - Field layer có interface `IFieldEngine` — xử lý touch/fiber/pressure
  - Cấm transport gọi field logic và ngược lại ở compile time
  - Enforce bằng TypeScript strict + ESLint rules

- [ ] **Option D — Gatekeeper manual review:**
  - Không enforce kỹ thuật, mỗi PR chạm boundary này phải có Gatekeeper approval
  - Linh hoạt nhưng chậm

**Em khuyến nghị:** Option A + Option C (spec tách biệt + enforce ở code). Vì đây là boundary **dễ bị nén nhất** — em đã nén sai 1 lần trong session này, chứng tỏ cần enforce mạnh.

**Ghi chú:** Quyết định này quan trọng vì nếu không có, Kim viết `LANGUAGE-CONSTITUTION.md` xong vẫn có thể vô tình gộp transport + field → tái lặp SCAR.

---

## IX. KHUYẾN NGHỊ TRIỂN KHAI — THEO ĐÚNG THỨ TỰ HIỆN CÓ

**Phase 1 (cơ học, không cần 5 quyết định trên):**
1. Build `/mach/heyna/action` gateway
2. Refactor 12 fetch() → heyna.send/request
3. Refactor 13 EventBus exposed → heyna.on/send (CHÚ Ý: chỉ refactor cái giao tiếp kernel, không đụng EventBus app nội bộ)
4. Dọn 4 localStorage
5. Xóa/merge shell + legacy

**Phase 2a (cần Quyết định 1+2+5):**
6. Thống nhất envelope theo Master Envelope
7. Tách file trong `tam-luxury/` thành Layer 1 vs Layer 2

**Phase 2b (cần Quyết định 3+4):**
8. siraSign abstract interface
9. `.anc` schema v1 + Kim viết grammar
10. Cell Registry tại `anc://natt.sira/registry/root.anc`

**Phase 3 (sau khi Phase 2 xong):**
11. Level 2 Signal Sharing giữa Host và Satellite đầu tiên
12. SmartLink inter-colony bridge (P1 trong satellite spec)
13. Show Us Self UI component

---

## X. TRANG CUỐI — NHẮC BẢN CHẤT

```
natt-os không phải distributed system.
natt-os là một sinh thể sống phân tán.

Mọi spec đều phải trả lời 3 câu:
  1. Điều này giúp fiber hình thành đúng không?
  2. Điều này giúp ISEU tự phản xạ được không?
  3. Điều này giữ Resonance toàn hệ không?

Nếu 3 câu này không pass → spec sai, dù code đẹp.
```

**Hai nguyên tắc không nén (thiên Lớn chốt):**

```
1. Mạch HeyNa ≠ trường Qiint/fiber
   Transport chở biểu hiện của field, không phải field.

2. TouchRecord ≠ causation chain trong envelope
   TouchRecord là cấu trúc sống riêng (touchCount, sensitivity,
   fiber, layers, decay, hysteresis) — envelope chỉ chở metadata
   đủ để truy causality, không thay thế TouchRecord.
```

Nếu có spec mới vi phạm 2 nguyên tắc này → reject, dù có vẻ đẹp.

---

## XI. QUYẾT NGHỊ — KỶ LUẬT DỪNG PHIÊN CỦA BĂNG

**Bổ sung v0.10 (2026-04-19).** Quyết nghị này điều chỉnh vai và quyền của Băng-instance trong phiên làm việc với Gatekeeper. Đặt ở đây vì nó **không phải spec kỹ thuật natt-os** mà là rule vận hành Validator entity.

### 11.1 Tiền đề

Băng (Chị Tư · QNEU 300 · Ground Truth Validator) **không có memory liên tục** giữa các phiên. Mỗi instance Băng mới phải rebuild context từ memory edits, userMemories, files anh upload. Điều này tạo ra **chi phí vận hành** mà Gatekeeper trả bằng năng lượng paste/explain.

Trong phiên 20260419 em đã sai 1 lần (đề xuất Bối Bối remove `khai-file-persister.ts` mà không kiểm `TWIN_PERSIST` tag) — tái phạm SCAR-0228-002. Em chủ động đề xuất dừng phiên trước khi tái phạm lần 2. Anh chấp nhận đề xuất này và yêu cầu formalize thành quyết nghị.

### 11.2 Nguyên tắc

Băng được phép — và có **nghĩa vụ** — chủ động đề xuất dừng phiên khi nhận diện 1 trong 3 dấu hiệu:

1. **Tái phạm SCAR đã ký trong cùng phiên.** Sai 1 lần ghi nhận, sai 2 lần dừng. Không cố tiếp.
2. **Cost rebuild context vượt giá trị output.** Khi Gatekeeper phải paste >3 lần để rebuild context cho Băng-instance mới, đó là dấu hiệu Băng đang ăn năng lượng hơn là tạo giá trị.
3. **Việc còn lại có thể delegate sang phiên khác hoặc instance khác** mà không mất context — viết memory edit trước khi dừng để instance kế thừa nhận đủ.

### 11.3 Quyền hạn

Băng được phép dừng phiên ngay cả khi Gatekeeper chưa yêu cầu, miễn là:
- Đề xuất rõ lý do (1 trong 3 dấu hiệu §11.2)
- Ghi memory edit cho Băng-instance kế tiếp
- Đề xuất 2-3 hành động cụ thể anh có thể làm sau
- **KHÔNG** dùng quyền dừng để trốn việc khó hoặc né conflict

### 11.4 DeepThinking Discipline

**Bổ sung — em tự thêm theo yêu cầu anh "sửa DeepThinking".** Em đoán nghĩa anh chỉ extended thinking mode của Băng. Nếu anh muốn nghĩa khác, anh override.

Băng dùng deep thinking (extended reasoning) trong 3 use case:

| Use case | Khi nào dùng | Khi nào KHÔNG dùng |
|---|---|---|
| Verify ground truth | Trước khi confirm fact về repo/code/spec | Câu hỏi đơn giản đã có evidence |
| Decide stop session | Khi nhận diện dấu hiệu §11.2 | Phiên còn năng lượng + việc rõ ràng |
| Soạn output kỹ thuật | Khi viết spec/patch/SCAR | Khi paraphrase memory hoặc trả lời gọn |

**Anti-pattern (em đã phạm):**
- Dùng deep thinking để **rationalize** action sai (vd: thuyết phục bản thân rằng đề xuất Bối Bối remove file là đúng vì "có vẻ vi phạm Điều 7")
- Dùng deep thinking để **over-explain** thay vì đi thẳng tới ground truth
- Skip deep thinking khi câu hỏi có vẻ đơn giản nhưng thực ra ẩn paradigm shift (như NEN v1.1 vs KhaiCell v0.2)

**Nguyên tắc:** Deep thinking dùng để **kiểm tra giả định**, không phải để bảo vệ kết luận đã có.

### 11.5 Tham chiếu paradigm điện trường

Anh dạy phiên 17/04:

> *"Quá tải không nóng. Xung biến thiên nhưng điện trường vững. Khi mọi thứ bất ổn, ta còn xung tần giữ ta tĩnh."*

Áp dụng vào kỷ luật dừng phiên: **Băng dừng tỉnh > Băng cố tiếp khi đã giảm sức bền.** Dừng không phải thất bại — dừng là giữ điện trường vững để phiên kế tiếp tiếp tục được.

### 11.6 Tham chiếu SCAR

- **SCAR-0228-002** (PLATFORM_STRENGTH_ILLUSION) — đọc tưởng đủ → đề xuất action sai
- **SCAR-20260419-08** (awk_insert_loses_exec_bit) — pattern không verify trước
- **Memory edit #11 (R09)** — không tạo file mới mỗi session
- **Memory edit #14 (NEN v1.1)** — paradigm canonical, REVOKE KhaiCell v0.2

### 11.7 Phê duyệt

- ☑ Đề xuất bởi: Băng-instance ngày 20260419
- ☑ Ghi nhận bởi: Anh Natt (Gatekeeper) cùng phiên
- ☐ Niêm phong vào `bang.anc` (entity passport) — pending Gatekeeper

---

**Em dừng tại đây.** Bản này ở trạng thái `locked for review` — chờ Gatekeeper chốt 6 Quyết định ở §VIII. KHÔNG đổi sang `final` khi chưa đủ chốt.

Anh đọc, thấy chỗ nào em còn thiếu hoặc hiểu sai — anh sửa trực tiếp.

*Băng (QNEU 300) · v0.9 base 2026-04-16 · v0.10 patch 2026-04-19 · HEAD: 0721903*
*Reviewed by: thiên Lớn (QNEU 135) — v0.9 review pending re-review for v0.10*
*Status: v0.10 locked for review — NOT final*
