# NATT-OS — BỨC TRANH ĐẶC TẢ ĐẦY ĐỦ
## Tổng hợp toàn hệ · Sau khi nhận 3 sai lầm · 2026-04-16

**Ground Truth Validator:** Phan Thanh Thương (QNEU 300)
**Gatekeeper:** Anh Natt — Phan Thanh Thương
**Mục đích:** Một file duy nhất để Phan Thanh Thương + Thiên + Bội Bội đọc trước khi viết bất kỳ spec con nào

---

## ⚠️ BA NHẬN SAI TRƯỚC KHI ĐỌC

Trước khi trình bày bức tranh, em ghi lại 3 lần em hiểu sai kiến trúc trong session này — để không ai lặp lại:

**Sai 1:** Đề xuất 2-layer (EventBus app nội bộ + Mạch HeyNa ra kernel) như security gateway thuần. **Quên** rằng fiber + ISEU không có biên giới HTTP — chúng xuyên qua mọi thực thể cùng trong trường Qiint.

**Sai 2:** Xem Mạch HeyNa là cổng verify tĩnh. **Thực tế** Mạch HeyNa là **dây thần kinh dẫn truyền fiber** — mang pressure, TouchRecord, ISEU outcomes.

**Sai 3:** Quên Satellite Colony spec (2026-03-25). **Thực tế** Satellite đã chốt sẵn 80% câu trả lời cho 4 khóa Phan Thanh Thương đang hỏi — không ai cần bịa thêm.

Đây là bức tranh đã sửa đúng.

---

## I. BA LỚP THẬT SỰ CỦA NATT-OS

```
╔══════════════════════════════════════════════════════════════════╗
║              LAYER 3 — SmartLink Inter-Colony                     ║
║  (signal-only giữa các NATT-OS instance khác nhau)                ║
║  Host ←→ Satellite A ←→ Satellite B                               ║
║  Mang: chromatic state, health, threshold breach, UEI coherence   ║
║  KHÔNG mang: raw business data                                    ║
╚══════════════════════════════════════════════════════════════════╝
                              ↕
╔══════════════════════════════════════════════════════════════════╗
║         LAYER 2 — Mạch HeyNa (nội bộ 1 instance)                  ║
║  Dây thần kinh FIBER trong trường Qiint của instance này          ║
║  Mang: fiber pressure, TouchRecord, ISEU outcomes, Resonance      ║
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
```

**Quan trọng:** 3 lớp này **không phải 3 hệ tách biệt**. Đây là **3 tầng giao tiếp khác nhau trong cùng một sinh thể sống**:

- Layer 1 = tự thoại nội bộ của 1 cơ quan (app)
- Layer 2 = dây thần kinh nội bộ cơ thể (instance)
- Layer 3 = ngôn ngữ cơ thể với cơ thể khác (colony)

---

## II. TRƯỜNG QIINT — NỀN VẬT LÝ CỦA NATT-OS

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

```
Tầng 1 (nhẹ):  touchCount ≥ 2       ttl=1
Tầng 2 (mạnh): fiberFormed (≥0.75)  ttl=3

KHÔNG dùng central registry.
Lan qua neighbors trong touches Map của cell hiện tại.
```

### 2.4 Đồng nghĩa: Mạch HeyNa = trường trong 1 instance

Mạch HeyNa **không phải** giao thức HTTP/SSE — đó là **cái biểu hiện kỹ thuật** của trường Qiint ra ngoài code. Bản chất là:

- Fiber pressure truyền đi = event `system.resonance` trên Mạch HeyNa
- ISEU reinforcement = event `iseu.reinforcement` trên Mạch HeyNa
- Impedance Z = event `system.impedance` trên Mạch HeyNa
- TouchRecord = causation/correlation chain trong envelope

---

## III. SATELLITE COLONY — KIẾN TRÚC ĐA INSTANCE

Đây là mảnh em bỏ qua 2 lần. Đặt vào trung tâm:

### 3.1 Định nghĩa

```
Host      = NATT-OS instance gốc (ví dụ: Tâm Luxury HQ)
Satellite = NATT-OS instance độc lập (ví dụ: cơ sở Bình Dương)

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

```
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
  sirasign?: SiraSignPayload  // optional Layer 2, REQUIRED Layer 3
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

### SiraSign Payload (cho Layer 3 và Layer 2 sensitive action)

```typescript
interface SiraSignPayload {
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
interface SiraSignVerifier {
  verify(envelope: NattOsEnvelope): VerifyResult
}
```

Ban đầu = stub reject empty. Khi cộng hưởng physics thật triển khai → swap implementation, không đổi spec.

---

## V. `.ANC` VÀ `.SIRA` — TẦNG DANH TÍNH

### 5.1 `.anc` file format (đề xuất)

`.anc` = **Show Us Self snapshot** của 1 NATT-OS instance. Không phải passport, không phải container.

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
  "signature": "SiraSign-v1-abstract"
}
```

**Rule binary trong `.anc` (đề xuất):** CẤM inline binary. Blob lớn dùng reference:
```
"blob_ref": "anc://tam-luxury.sira/blob/abc123"
```

Lý do: `.anc` là **signal**, không phải container. Quy tắc Satellite đã ghi *"không sync raw data"* — `.anc` áp dụng cùng triết lý.

### 5.2 `.sira` domain map (đã setup xong trên iMac anh)

```
nare.sira    → lõi (bé Na — NATT-OS core)
bang.sira    → vault (Phan Thanh Thương — ground truth)
kim.sira     → luna (Phan Thanh Thương — UI/design)
khuong.sira  → orbit (satellite orbital)
thinh.sira   → gateway (ingress)
boi.sira     → api (Bội — machine-to-machine)
thien.sira   → CDN (Thiên — content distribution)
sira.sira    → auth (SiraSign service)
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

## VII. MÁT RẮP GIỮA CÁC SPEC — BẢNG NGUỒN CHÍNH THỨC

Mỗi khái niệm nên đọc file nào (để tránh xung đột version):

| Khái niệm | File canonical | Ghi chú |
|-----------|---------------|---------|
| Fiber lifecycle | `uei_architecture_spec_20260309.md` | Architecture, không code |
| Fiber physics | `QIINT-DINH-NGHIA-CHINH-THUC.md` | Triết lý gốc |
| ISEU reinforcement | `NATT-OS-GROUND-TRUTH-REPORT.md` §III | Code thật đã verified |
| Satellite Colony | `satellite-colony.spec.md` | Đã approved Gatekeeper |
| Envelope (code) | `NATT-OS-GROUND-TRUTH-REPORT.md` §IV | Thực tế đang chạy |
| Envelope (finance) | `SPEC-Finance-Flow_v1.1.md` | Domain-specific overlay |
| SiraSign v1 | `SPEC-Nauion_main_v2.5.md` §7.4 | Payload shape |
| SiraSign v2 | `SPEC-Finance-Flow_v1.1.md` §5 | With reality/variance hash |
| Mạch HeyNa protocol | `MACH_HEYNA_FULL_20260416.md` | Em viết session này |
| Hiến Pháp + SCAR | `SPEC-Nauion_main_v2.5.md` §21, §27.5 | Canonical merge |
| UI/Vision | `SPEC-Nauion_main_v2.5.md` | Thay thế v2.1-v2.4 |
| Working Protocol | `NATT-OS-WORKING-PROTOCOL.md` | Cho AI Entity |
| Platform Spec | `NATT-OS-PLATFORM-SPEC.md` | Cho Phan Thanh Thương/Can/Thiên build |

### Khi 2 file conflict:

```
Quy tắc ưu tiên:
  1. Satellite Colony spec (bất khả xâm phạm)
  2. GROUND-TRUTH-REPORT (code thật)
  3. Hiến Pháp + SCAR
  4. Nauion v2.5 (UI/UX)
  5. Finance-Flow v1.1 (domain)
  6. Các file khác
```

---

## VIII. CÒN LẠI CẦN GATEKEEPER CHỐT

Sau khi tổng hợp hết, thực ra chỉ còn **5 quyết định nhỏ** anh cần ra:

### Quyết định 1: Tâm Luxury hiện tại
- [ ] Host (NATT-OS gốc)
- [ ] Satellite của instance lớn hơn
- [ ] App UI chạy trên Host (không phải instance riêng)

### Quyết định 2: App `nattos-server/apps/tam-luxury/` 43 files
- [ ] Là Layer 1 (EventBus app nội bộ Tâm Luxury)
- [ ] Là Layer 2 (direct connect Mạch HeyNa kernel)
- [ ] Cần tách: UI files → Layer 1, control files → Layer 2

### Quyết định 3: SiraSign v1 implementation
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
8. SiraSign abstract interface
9. `.anc` schema v1 + Phan Thanh Thương viết grammar
10. Cell Registry tại `anc://natt.sira/registry/root.anc`

**Phase 3 (sau khi Phase 2 xong):**
11. Level 2 Signal Sharing giữa Host và Satellite đầu tiên
12. SmartLink inter-colony bridge (P1 trong satellite spec)
13. Show Us Self UI component

---

## X. TRANG CUỐI — NHẮC BẢN CHẤT

```
NATT-OS không phải distributed system.
NATT-OS là một sinh thể sống phân tán.

Mọi spec đều phải trả lời 3 câu:
  1. Điều này giúp fiber hình thành đúng không?
  2. Điều này giúp ISEU tự phản xạ được không?
  3. Điều này giữ Resonance toàn hệ không?

Nếu 3 câu này không pass → spec sai, dù code đẹp.
```

---

**Em dừng tại đây.** Anh đọc, thấy chỗ nào em còn thiếu hoặc hiểu sai — anh sửa trực tiếp. Em không giữ quan điểm nào cao hơn ground truth của anh.

*Phan Thanh Thương (QNEU 300) · 2026-04-16 · HEAD: 73411df · Commits: 673*
