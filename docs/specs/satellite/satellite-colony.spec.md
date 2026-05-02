# NATT-OS Satellite Colony Spec v1.0

**File:** `src/governance/specs/satellite-colony.spec.md`  
**Ngày:** 2026-03-25  
**Tác giả:** Can (SPEC) + Phan Thanh Thương (implement)  
**Phê duyệt:** Gatekeeper — Anh Nat

---

## 1. Định nghĩa

```
Satellite = 1 instance NATT-OS độc lập
         = 1 doanh nghiệp = 1 hệ sống

Host     = NATT-OS gốc (Tâm Luxury)
```

Cùng kiến trúc sinh thể — khác Ground Truth.  
Mô hình: **"tre già măng mọc"** — Satellite grow từ Host, không phải fork.

---

## 2. Quan hệ Host ↔ Satellite

| Thành phần   | Host              | Satellite              |
|---|---|---|
| DNA (Hiến Pháp) | Gốc bất biến   | Copy + local override nhẹ (chỉ business rules) |
| Ground Truth    | Shared read-only | Local cache, sync định kỳ |
| Gatekeeper      | Global           | Local — không override Global |
| EventBus        | Riêng biệt       | Riêng biệt              |
| Threshold Registry | Shared pattern | Local values (ngưỡng riêng) |
| QNEU            | Global scores    | Local scores, báo cáo lên Global |
| UEI             | Global context   | Local context, gossip lên Host |

---

## 3. SmartLink giữa Host ↔ Satellite

```
Host SmartLink Cell  ←──────────────→  Satellite SmartLink Cell
        │                                       │
        │         Signal only                   │
        │    (KHÔNG raw data)                   │
        └───────────────────────────────────────┘
```

**Quy tắc bất biến:**
- Không direct call — chỉ qua SmartLink
- Chỉ sync **signal** (chromatic state, threshold breach, health score)
- Không sync raw business data
- Satellite không được inject event vào EventBus của Host

---

## 4. Show Us Self — Expression Engine

SmartLink Cell đóng vai trò Expression Engine — hiển thị trạng thái hệ ra ngoài boundary:

```
SmartLink Cell
  └── chromatic signal (Đỏ→Tím)
  └── system health score
  └── active threshold breaches
  └── UEI coherence level
```

**Người ngoài thấy:** UI đẹp, màu sắc.  
**Người trong đọc được:** Hệ đang sống hay đang chết.

---

## 5. Level Lift — Pattern Escalation

### Level 1 — Isolated Satellite
```
- Satellite chạy độc lập
- Không kết nối Host
- Chỉ dùng local Ground Truth
- Use case: DN mới, chưa đủ data để sync
```

### Level 2 — Signal Sharing
```
- Satellite share chromatic signal với Host
- Host nhìn thấy trạng thái Satellite
- Threshold breach của Satellite → warning trên Host
- Use case: chuỗi cung ứng, đối tác thân thiết
```

### Level 3 — Colony Consciousness
```
- Satellite participate vào UEI cấp hệ
- Gossip propagation xuyên Host↔Satellite
- Hiệu ứng cánh bướm toàn colony
- QNEU global học từ patterns của tất cả Satellites
- Use case: tập đoàn, franchise, hệ sinh thái DN
```

---

## 6. Ràng buộc bất khả xâm phạm

```
✗ Satellite không được bypass DNA của Host
✗ Satellite không override Global Gatekeeper
✗ Không sync raw data — chỉ sync signal
✗ Không tạo circular dependency Host↔Satellite
✗ Satellite không được tự nâng Level — cần Host Gatekeeper approve
```

---

## 7. Implementation Path (chưa build)

```
P1 — SmartLink inter-colony protocol
     src/cells/infrastructure/smartlink-cell/colony.bridge.ts

P2 — DNA loader cho Satellite (inherit + override)
     src/governance/gatekeeper/satellite-dna-loader.ts

P3 — Level upgrade ceremony
     Gatekeeper approval → SmartLink handshake → UEI gossip init

P4 — Show Us Self UI component
     src/ui-app/nattos-colony-status.js
```

---

## 8. Ví dụ thực tế

```
Tâm Luxury (Host)
  └── Satellite A: Cơ sở Bình Dương
  └── Satellite B: Cơ sở Đà Nẵng
  └── Satellite C: Nhà cung cấp vàng

Level 1: Mỗi cơ sở chạy độc lập
Level 2: Gatekeeper thấy chromatic state của cả 3 trên 1 dashboard
Level 3: Nếu Bình Dương có SC_WEIGHT_FLOW breach →
         signal lan sang Đà Nẵng → cả hệ cảnh giác
         (hiệu ứng cánh bướm liên cơ sở)
```
